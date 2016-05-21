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

var request = require('request');
var cheerio = require('cheerio');
var moment = require('moment');
var Promise = require('promise');

var cache = {};
var api = {}

api.updateBouts = function (teamId) {
    url = 'http://flattrackstats.com/teams/' + teamId + '/bouts';

    var promise = new Promise(
        function (fulfill, reject) {
            request(url, function (error, response, html) {
                if (error) {
                    reject(error);
                    return;
                }

                fulfill([response, html]);
            })
        }
    );
    promise = promise.then(
        function (response) {
            var $ = cheerio.load(response[1]);

            var bouts = {
                upcoming: [],
                previous: []
            };
            var boutFound = false;

            $("table:nth-child(1)").find('tbody').children("tr").each(function (i, tr) {
                var $tr = $(tr);

                var bout = {};

                bout['date'] = moment($tr.find("td:nth-child(1)").text(), "M/D/YY");
                bout['sanc'] = $tr.find("td:nth-child(2) div").attr('tooltip').trim();

                if ($tr.find("td:nth-child(3) [title]").length > 0) {
                    bout['home_team'] = $tr.find("td:nth-child(3) [title]").attr('title').trim()
                }
                else {
                    bout['home_team'] = $tr.find("td:nth-child(3)").text().trim()
                }

                bout['home_team_score'] = $tr.find("td:nth-child(4)").text().trim();

                if ($tr.find("td:nth-child(5) [title]").length > 0) {
                    bout['visitor_team'] = $tr.find("td:nth-child(5) [title]").attr('title').trim()
                }
                else {
                    bout['visitor_team'] = $tr.find("td:nth-child(5)").text().trim()
                }

                bout['visitor_team_score'] = $tr.find("td:nth-child(6)").text().trim();

                bout['score_diff'] = $tr.find("td:nth-child(7)").text().trim();
                bout['tournament'] = $tr.find("td:nth-child(8)").text().trim();
                bout['bout_url'] = 'http://flattrackstats.com/bouts/' + $tr.find("td:nth-child(9) a").attr('href');


                if ($tr.hasClass('upcoming')) {
                    bouts.upcoming.push(bout);
                }
                else {
                    bouts.previous.push(bout);
                }

                boutFound = true;
            });

            if (!boutFound) {
                throw "bout " + teamId + " not found";
            }

            return bouts;
        }
    );
    promise = promise.then(
        function (result) {
            cache[teamId] = result;

            return result;
        }
    );

    return promise;
};

api.getBouts = function (teamId) {

    if (!cache.hasOwnProperty(teamId)) {
        return api.updateBouts(teamId);
    }

    return new Promise(function (fulfill, reject) {
        fulfill(cache[teamId]);
    });
};

setInterval(function () {
    for (var teamId in cache) {
        api.updateBouts(teamId)
    }
}, 3.6e+6);

module.exports = api;