(function() {
  module.exports = function(app) {
    app.get('/panel', function(req, res) {
      return res.render('index', {
        layout: null
      });
    });
    app.get('/panel/ipaddress', function(req, res, next) {
      var ip;
      ip = require('ip');
      return res.json({
        ipaddress: ip.address(),
        port: 3220
      });
    });
    app.get('/panel/package/:uid', function(req, res, next) {
      var query, repo, uid;
      uid = req.params.uid;
      query = "select uid:" + uid;
      repo = process.REPOSITORY;
      return repo.packages.execQuery(query, function(err, data) {
        var p;
        p = data[0];
        return res.json(p);
      });
    });
    return app;
  };

}).call(this);
