module.exports = (app) ->
  app.get '/panel', (req, res) ->
    res.render 'index', layout: null
  app.get '/panel/ipaddress', (req, res, next) ->
    ip = require 'ip'
    res.json ipaddress: ip.address(), port: 3220
  app.get '/panel/package/:uid', (req, res, next) ->
    {uid} = req.params

    query = "select uid:" + uid
    repo = process.REPOSITORY

    repo.packages.execQuery query, (err, data) ->
      p = data[0]

      res.json p

  app