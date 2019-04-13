/*
 This file is part of Flattrackstats bout RSS.

 Foobar is free software: you can redistribute it and/or modify
 it under the terms of the GNU General Public License as published by
 the Free Software Foundation, either version 3 of the License, or
 (at your option) any later version.

 Foobar is distributed in the hope that it will be useful,
 but WITHOUT ANY WARRANTY; without even the implied warranty of
 MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 GNU General Public License for more details.

 You should have received a copy of the GNU General Public License
 along with Foobar.  If not, see <http://www.gnu.org/licenses/>.
 */
var disableStackdriver = (process.env.DISABLE_STACKDRIVER === "true" || false);

if (false === disableStackdriver) {
    require('@google-cloud/trace-agent').start();
}

var express = require('express');
var helmet = require('helmet');
var RSS = require('rss');
var cors = require('cors');
var winston = require('winston');
var expressWinston = require('express-winston');
var loggingTransports = [new winston.transports.Console()];

if (false === disableStackdriver) {
    var {LoggingWinston} = require('@google-cloud/logging-winston');
    loggingTransports.push(new LoggingWinston({logName: "flattrackstats_bout_rss"}))
}

var logger = winston.createLogger({
    level: 'info',
    transports: loggingTransports,
});

var flattrackstats = require("./lib/flattrackstats");

var app = express();

app.use(expressWinston.logger({
    transports: loggingTransports,
}));

app.use(helmet());
app.use(helmet.hsts({
    maxAge: 63072000,
    includeSubDomains: true,
    preload: true
}));
app.use(helmet.contentSecurityPolicy({
    directives: {
        defaultSrc: ["'none'"]
    }
}));
app.use(helmet.referrerPolicy({policy: 'strict-origin-when-cross-origin'}));

var homepageCacheSeconds = 315360000;
app.get('/', cors({maxAge: homepageCacheSeconds}), function (req, res, next) {
    res.set('Cache-Control', 'max-age=' + homepageCacheSeconds + ',public');
    res.send(
        "Visit http://flattrackstats.com/teams and then visit the team page " +
        "http://flattrackstats.com/teams/$teamId, copy the teamId and put it put it at the end of this url e.g. " +
        "https://rollerderbyrss.purplebooth.co.uk/13214"
    )
});

var teamIdCacheDuration = 3600;
app.get('/:teamId', cors({maxAge: teamIdCacheDuration}), function (req, res, next) {
    var teamId = req.params.teamId;
    var boutsForTeam = flattrackstats.getBouts(teamId);

    boutsForTeam.then(
        function (boutsForTeam) {
            var dates = [];

            boutsForTeam.upcoming.forEach(function (element) {
                dates.push(element.date);
            });
            boutsForTeam.previous.forEach(function (element) {
                dates.push(element.date);
            });

            dates.sort(function (lhs, rhs) {
                return lhs < rhs ? -1 : lhs > rhs ? 1 : 0;
            });

            var lastUpdate = new Date();

            if (dates.length > 0) {
                lastUpdate = dates.pop().toDate();
            }

            /* lets create an rss feed */
            var feed = new RSS({
                title: 'title',
                description: 'description',
                feed_url: 'http://rollerderbyrss.purplebooth.co.uk/' + teamId,
                site_url: 'http://flattrackstats.com/teams/' + teamId + '/bouts',
                pubDate: lastUpdate,
                ttl: '60'
            });

            boutsForTeam.upcoming.forEach(function (element) {
                /* loop over data and add to feed */
                feed.item({
                    title: 'Upcoming: ' + element.home_team + " vs " + element.visitor_team,
                    description: element.sanc,
                    url: element.bout_url, // link to the item
                    guid: element.bout_url + "&upcoming=true", // we do this to make the user see the event again when it is played
                    date: element.date
                });
            });
            boutsForTeam.previous.forEach(function (element) {

                var title = element.home_team + " (" + element.home_team_score + ")";
                title += " vs ";
                title += element.visitor_team + " (" + element.home_team_score + ") ";
                title += " [difference " + element.score_diff + "]";

                if (element.tournament !== "") {
                    title += " - " + element.tournament
                }

                feed.item({
                    title: title,
                    description: element.sanc,
                    url: element.bout_url,
                    guid: element.bout_url + "&upcoming=false",
                    date: element.date
                });
            });

            res.type('rss');
            res.set('Cache-Control', 'max-age=' + teamIdCacheDuration + ',public');
            res.send(feed.xml());

        }
    ).catch(function (error) {
        res.sendStatus(404);
    });
});

app.use(expressWinston.errorLogger({
    transports: loggingTransports
}));

var PORT = (process.env.PORT || 8080);

app.listen(PORT);
logger.info('Magic happens on port ' + PORT);
exports = module.exports = app;
