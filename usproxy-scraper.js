var request = require('request');
var select = require('soupselect').select;
var htmlparser = require("htmlparser");
var fs = require('fs');
var async = require('async');
var tesseract = require('node-tesseract');
var exec = require('child_process').exec;
var im = require('imagemagick');

process.env['NODE_TLS_REJECT_UNAUTHORIZED'] = '0';

var download = function(uri, filename, callback){
  request.head(uri, function(err, res, body){
    request(uri).pipe(fs.createWriteStream(filename)).on('close', callback);
  });
};

var baseUrl = 'http://www.us-proxy.org';
var getProxies = function (cb, searchPage, proxiesScraped) {

  if (!proxiesScraped) {
      proxiesScraped = [];
  }
  if (!searchPage) {
      searchPage = "";
  }

  request(baseUrl + searchPage, function (err, res, body) {
    if (!res || res.statusCode != 200) {
      console.log(res);
      cb("Response code was not 200");
      return;
    }

    var handler = new htmlparser.DefaultHandler(function(err, dom) {
      if (err) {
        cb("Error: " + err);
        return;
      } else {
        var rows = select(dom, '#proxylisttable tbody tr');
        rows.splice(0,1);
        async.forEachOf(rows, function (row, index, callback) {
          var cols = select(row, 'td');

          var ip = cols[0].children[0].raw.trim();
          var port = cols[1].children[0].raw.trim();
          var country = cols[3].children[0].raw.trim();
          var anon = cols[4].children[0].raw.trim();
          var type = cols[6].children[0].raw.trim() == "yes" ? "https" : "http";

          var proxyData = {};
          proxyData.IP = ip;
          proxyData.Port = port;
          proxyData.Country = country;
          proxyData.Type = type;
          proxyData.AnonLevel = anon;
          if (anon != 'transparent') {
            proxiesScraped.push(proxyData);
          }
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
};

module.exports = {getProxies: getProxies};
