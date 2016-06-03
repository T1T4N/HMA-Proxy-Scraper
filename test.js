var hma = require('./hma-scraper.js');
var tvpn = require('./torvpn-scraper.js');
var inclk = require('./incloak-scraper.js');
var uspr = require('./usproxy-scraper.js');
var fs = require('fs');

hma.getProxies(function (err,proxies) {
    if(err) {
      throw err
    }
    // console.log(proxies);
    var file = fs.createWriteStream('hma-proxies.txt');
    proxies.forEach(function(v) {
      file.write(
        v.IP + " " + v.Port + " " + v.Type + " " + v.Country + " " + v.ConnectionTime + " " + v.ResponseTime + " " + v.AnonLevel
        + '\n'
      );
    });
    file.end();
}, "search-1687774");

tvpn.getProxies(function (err,proxies) {
    if(err) {
      throw err
    }
    // console.log(proxies);
    var file = fs.createWriteStream('torvpn-proxies.txt');
    proxies.forEach(function(v) {
      file.write(
        v.IP + " " + v.Port + " " + v.Type + " " + v.Country + " " + v.UpTime + '\n'
      );
    });
    file.end();
});

inclk.getProxies(function (err,proxies) {
    if(err) {
      throw err
    }
    // console.log(proxies);
    var file = fs.createWriteStream('incloak-proxies.txt');
    proxies.forEach(function(v) {
      file.write(
        v.IP + " " + v.Port + " " + v.Type + " " + v.Country + " " + v.ResponseTime + " " + v.AnonLevel + '\n'
      );
    });
    file.end();
});

uspr.getProxies(function (err,proxies) {
    if(err) {
      throw err
    }
    // console.log(proxies);
    var file = fs.createWriteStream('usproxy-proxies.txt');
    proxies.forEach(function(v) {
      file.write(
        v.IP + " " + v.Port + " " + v.Type + " " + v.Country + " " + v.AnonLevel + '\n'
      );
    });
    file.end();
});
