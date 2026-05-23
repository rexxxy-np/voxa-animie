const express = require('express');
const cors = require('cors');
const axios = require('axios');

const app = express();
app.use(cors());

const JIKAN = 'https://api.jikan.moe/v4';

app.get('/', (req, res) => res.json({ message: 'Voxa Anime API 🎌' }));

app.get('/search', async (req, res) => {
  try {
    const { q } = req.query;
    const r = await axios.get(`${JIKAN}/anime?q=${encodeURIComponent(q)}&limit=12`);
    res.json(r.data.data);
  } catch(e) { res.status(500).json({ error: e.message }); }
});

app.get('/popular', async (req, res) => {
  try {
    const r = await axios.get(`${JIKAN}/top/anime?filter=bypopularity&limit=12`);
    res.json(r.data.data);
  } catch(e) { res.status(500).json({ error: e.message }); }
});

app.get('/recent', async (req, res) => {
  try {
    const r = await axios.get(`${JIKAN}/seasons/now?limit=12`);
    res.json(r.data.data);
  } catch(e) { res.status(500).json({ error: e.message }); }
});

app.get('/info/:id', async (req, res) => {
  try {
    const r = await axios.get(`${JIKAN}/anime/${req.params.id}/episodes`);
    res.json(r.data.data);
  } catch(e) { res.status(500).json({ error: e.message }); }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Anime API running on port ${PORT}`));    res.json(results);
  } catch(e) { res.status(500).json({ error: e.message }); }
});

app.get('/stream/:episodeId', async (req, res) => {
  try {
    const results = await anigo.getGogoanimeEpisodeSource(req.params.episodeId);
    res.json(results);
  } catch(e) { res.status(500).json({ error: e.message }); }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Anime API running on port ${PORT}`));
