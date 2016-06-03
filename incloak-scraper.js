var request = require('request');
var select = require('soupselect').select;
var htmlparser = require("htmlparser");
var fs = require('fs');
var async = require('async');
var exec = require('child_process').exec;

process.env['NODE_TLS_REJECT_UNAUTHORIZED'] = '0';

var download = function(uri, filename, callback){
  request.head(uri, function(err, res, body){
    request(uri).pipe(fs.createWriteStream(filename)).on('close', callback);
  });
};

var baseUrl = 'https://incloak.com';
var getProxies = function (cb, proxiesScraped) {

  if (!proxiesScraped) {
    proxiesScraped = [];
  }
  exec('casperjs incloak-load.js', function(error, stdout, stderr) {
    if(error) { console.log(error); }
    console.log(stdout);

    fs.readFile('incloak-body.html', function (err,body) {
      if (err) { return console.log(err); }
      var handler = new htmlparser.DefaultHandler(function(err, dom) {
        if (err) {
          cb("Error: " + err);
          return;
        } else {
          var rows = select(dom, 'table tbody tr');

          async.forEachOf(rows, function (row, index, callback) {
            var cols = select(row, 'td');

            var ip = cols[0].children[0].raw;
            var port = cols[1].children[0].raw;
            var country = select(cols[2], 'div')[0].children[1].raw.substring(7);
            var speed = select(cols[3], 'div div p')[0].children[0].raw;
            var type = cols[4].children[0].raw;
            var anon = cols[5].children[0].raw;

            var proxyData = {};
            proxyData.IP = ip;
            proxyData.Port = port;
            proxyData.Country = country;
            proxyData.Type = type;
            proxyData.ResponseTime = speed;
            proxyData.AnonLevel = anon;
            proxiesScraped.push(proxyData);
            callback();
          }, function (err) {
              if (err) { console.error(err.message); }
              cb(null,proxiesScraped);
          });
        }
      });
      var parser = new htmlparser.Parser(handler);
      parser.parseComplete(body);
    });
  });
};

module.exports = {getProxies: getProxies};
