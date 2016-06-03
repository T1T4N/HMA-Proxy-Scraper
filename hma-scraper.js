var request = require('request');
var select = require('soupselect').select;
var htmlparser = require("htmlparser");

var getProxies = function (callback, searchPage, proxiesScraped) {

    if (!proxiesScraped) {
        proxiesScraped = [];
    }

    request('http://proxylist.hidemyass.com/' + searchPage, function (err, res, body) {
        if (!res || res.statusCode != 200) {
            callback("Response code was not 200");
            return;
        }

        fakeNums = {}
        body.replace(/\.(.*?)\{display\:none\}/g, function () {
            //arguments[0] is the entire match
            fakeNums[arguments[1]] = 1
        });
        body = body.replace(/{display:inline}[\S\s]?<\/style>([\S\s]*?)<\/td>/g, function () {
            var temp = arguments[1];
            temp = temp.replace(/<span class\=\"(.*?)\">.*?<\/span>/g, function () {
                if (fakeNums[arguments[1]]) {
                    return ''
                }
                return arguments[0]
            });
            temp = temp.replace(/<span style\=\"display\:none\">(.*?)<\/span>/g, "");
            temp = temp.replace(/<div style\=\"display\:none\">(.*?)<\/div>/g, "");
            temp = temp.replace(/<(.*?)>/g, '');
            // Fix DOM
            temp = "</style>" + temp + "</td>"
            temp = temp.trim();
            return temp;
        });
        body = body.replace(/<span>[\s]*?<style>[\S\s]*?<\/style>/g, "");
        body = body.replace(/<img(.*?)>/g, "");
        // console.log(body);
        var handler = new htmlparser.DefaultHandler(function(err, dom) {
            if (err) {
                callback("Error: " + err);
                return;
            } else {
                var rows = select(dom, '#listable tbody tr');

                rows.forEach(function(row) {
                    var cols = select(row, 'td');
                    var proxyData = {};
                    proxyData.IP = cols[1].children[0].raw.trim();
                    proxyData.Port = cols[2].children[0].raw.trim();
                    proxyData.Country = cols[3].children[1].children[0].raw.trim();
                    proxyData.ResponseTime = cols[4].children[1].attribs.value;
                    proxyData.ConnectionTime = cols[5].children[1].attribs.value;
                    proxyData.Type = cols[6].children[0].raw.trim();
                    proxyData.AnonLevel = cols[7].children[0].raw.trim();
                    proxiesScraped.push(proxyData);
                });
                callback(null,proxiesScraped);
            }
        });

        var parser = new htmlparser.Parser(handler);
        parser.parseComplete(body);
    });
};

module.exports = {getProxies: getProxies};
