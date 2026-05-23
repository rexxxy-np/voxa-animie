const express = require('express');
const cors = require('cors');
const anigo = require('anigo-anime-api');

const app = express();
app.use(cors());
app.use(express.json());

app.get('/', (req, res) => res.json({ message: 'Voxa Anime API 🎌' }));

app.get('/search', async (req, res) => {
  try {
    const { q } = req.query;
    if (!q) return res.status(400).json({ error: 'Query required' });
    const results = await anigo.searchGogo(q);
    res.json(results);
  } catch(e) { res.status(500).json({ error: e.message }); }
});

app.get('/popular', async (req, res) => {
  try {
    const results = await anigo.getPopular(1);
    res.json(results);
  } catch(e) { res.status(500).json({ error: e.message }); }
});

app.get('/recent', async (req, res) => {
  try {
    const results = await anigo.getGogoRecentEpisodes(1);
    res.json(results);
  } catch(e) { res.status(500).json({ error: e.message }); }
});

app.get('/info/:id', async (req, res) => {
  try {
    const results = await anigo.getGogoAnimeInfo(req.params.id);
    res.json(results);
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
