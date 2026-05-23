var express = require('express');
var cors = require('cors');
var axios = require('axios');
var app = express();
app.use(cors());

app.get('/', function(req, res) {
  res.json({message: 'Voxa Anime API'});
});

app.get('/popular', function(req, res) {
  axios.get('https://api.jikan.moe/v4/top/anime?limit=12')
  .then(function(r) { res.json(r.data.data); })
  .catch(function(e) { res.json([]); });
});

app.get('/recent', function(req, res) {
  axios.get('https://api.jikan.moe/v4/seasons/now?limit=12')
  .then(function(r) { res.json(r.data.data); })
  .catch(function(e) { res.json([]); });
});

app.get('/search', function(req, res) {
  axios.get('https://api.jikan.moe/v4/anime?q=' + req.query.q + '&limit=12')
  .then(function(r) { res.json(r.data.data); })
  .catch(function(e) { res.json([]); });
});

app.get('/info/:id', function(req, res) {
  axios.get('https://api.jikan.moe/v4/anime/' + req.params.id + '/episodes')
  .then(function(r) { res.json(r.data.data); })
  .catch(function(e) { res.json([]); });
});

app.listen(process.env.PORT || 3000);
