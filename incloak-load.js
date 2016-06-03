var casper = require("casper").create(),
  viewportSizes = [
  [1280,800],
];
var fs = require('fs');
var baseUrl = "https://incloak.com";
var url = baseUrl + "/proxy-list/?country=US&maxtime=1000&anon=234";

casper.start();
// casper.start().viewport(640, 400).thenOpen(url, function() {
  // this.capture('toto.png');
// });
//

casper.each(viewportSizes, function(self, viewportSize, i) {
  var width = viewportSize[0],
      height = viewportSize[1];

  this.then(function() {
    this.viewport(width, height)
    .thenOpen(url, function(response) {
      console.log(response['status']);
      console.log(this.getTitle());
      console.log(this.getCurrentUrl());
      this.waitForSelector("body");
    });
    this.then(function(){
      this.echo('Saving HTML');
      // this.capture(width + '-' + height + '.png', { top: 0, left: 0, width: width, height: height });
      var js = this.evaluate(function () {
          return document;
      });
      fs.write("incloak-body.html", js.all[0].outerHTML, 'w');
    });
  });
});

casper.run(function() {
    this.echo('Finished captures for ' + url).exit();
});
