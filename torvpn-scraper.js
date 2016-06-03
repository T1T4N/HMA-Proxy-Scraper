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

var baseUrl = 'https://www.torvpn.com';
var getProxies = function (cb, searchPage, proxiesScraped) {

  if (!proxiesScraped) {
      proxiesScraped = [];
  }
  if (!searchPage) {
      searchPage = "";
  }

  request(baseUrl + '/en/proxy-list' + searchPage, function (err, res, body) {
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
        var rows = select(dom, '.table-striped tr');
        rows.splice(0,1);
        async.forEachOf(rows, function (row, index, callback) {
          var cols = select(row, 'td');
          var ipimg = select(cols[1], 'img')[0];
          var typeElem = select(cols[4], 'span')[0];
          var countryElem = select(cols[3], 'abbr')[0];
          var lw = select(cols[3], '.label-warning');
          var ld = select(cols[3], '.label-danger');
          var isValid = (lw.length + ld.length <= 0);
          if (isValid) {
            var imgUrl = baseUrl + ipimg.attribs.src;
            var imgName = 'proxy-' + index + '.png';
            var port = cols[2].children[0].raw;
            var country = countryElem.attribs.title.trim();
            var type = typeElem.children[0].raw;
            var uptime = cols[7].children[0].raw;
            download(imgUrl, imgName, function(){
              im.convert([imgName, '-threshold', '75%', imgName],
              function(err, stdout) {
                if (err) throw err;
                // Magnify picture x2
                exec('xbrz-cli ' + imgName + ' 2 ' + imgName, function(error, stdout, stderr) {
                  var options = {
                    psm: 7
                  };
                  tesseract.process(imgName, options, function(err, text) {
                    if(err) {
                      console.error(err);
                    } else {
                      var ip = text.trim();
                      fs.unlink(imgName);
                      var proxyData = {};
                      proxyData.IP = ip;
                      proxyData.Port = port;
                      proxyData.Country = country;
                      proxyData.Type = type;
                      proxyData.UpTime = uptime;
                      proxiesScraped.push(proxyData);
                      callback();
                    }
                  });
                });
              });
            });
          } else {
            callback();
          }
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
