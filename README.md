# Flattrackstats bout RSS

Convert Flattrackstats bout status page to an RSS feed to use with IFTTT
or other things. A bunch of my friends play flat track roller derby, I 
wanted to be able to follow their matches. Unfortunately I found that 
there is no RSS feeds or API to get push updates on match results, so I 
created one!
 
Behind the scenes it scrapes 
[Flat Track Stats](http://flattrackstats.com) all credit goes to them 
for maintaining a fantastic service, and who knows, maybe they'll add an
RSS feed to their bout pages some day, and this service won't be needed.

It's currently running at https://rollerderbyrss.purplebooth.co.uk/.

## Usage

Visit [Flat Track Stats](http://flattrackstats.com) and find your teams 
page. In the URL they will be something like 

```
http://flattrackstats.com/teams/13214
``` 

take the number that is after teams and put it at the end of this 
service. In this case that would look like this

```
https://rollerderbyrss.purplebooth.co.uk/13214
```

You can then use this in IFTTT, or whatever other service you want to 
get updates from your service. Data is cached for an hour.


## Getting Started

These instructions will get you a copy of the project up and running on 
your local machine for development and testing purposes. See deployment 
for notes on how to deploy the project on a live system.

### Prerequisities

Firsly, ensure you have [NPM & NodeJS](https://nodejs.org/) installed


### Installing

Then all you need to do is install the libraries we need by running

```
npm install
```

Then run 

```
npm start
```

and it'll run. Optionally you can set the port via environment variable.

```
PORT=9921 npm start
```


## Running the tests

There are no tests, 'cause I wrote this in one afternoon and I'm a 
terrible person

## Deployment

I run this on Kubernetes. You can see the [/k8r directory](/k8r) for the
config I use

## Built With

The fabulous node modules:

* Express
* Cheerio
* Moment
* Promise
* request
* Rss

Thanks to the authors of these for making a really lazy person like be 
able to write something like this.

## Contributing

Please read [CONTRIBUTING.md](CONTRIBUTING.md) for details on our code of conduct, and the process for submitting pull requests to us.

## Versioning

We use [SemVer](http://semver.org/) for versioning. For the versions 
available, see the [tags on this repository](https://github.com/PurpleBooth/FlattrackstatsBoutRSS/tags). 

## Authors

See the list of [contributors](https://github.com/PurpleBooth/FlattrackstatsBoutRSS/contributors) who participated in this project.

## License

This project is licensed under the GPL v3 License - see the [LICENSE.md](LICENSE.md) file for details
