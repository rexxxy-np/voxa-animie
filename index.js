var express = require('express');
var cors    = require('cors');
var axios   = require('axios');
var app     = express();

app.use(cors());
app.use(express.json());

// ── Jikan base ────────────────────────────────────────
const JIKAN = 'https://api.jikan.moe/v4';

// ── Root ─────────────────────────────────────────────
app.get('/', function(req, res) {
  res.json({ message: 'Voxa Anime API v2', endpoints: [
    '/popular', '/recent', '/search?q=', '/info/:malId',
    '/episodes/:malId', '/stream?id=', '/sources?title=&ep='
  ]});
});

// ── Popular anime (Jikan top) ─────────────────────────
app.get('/popular', function(req, res) {
  axios.get(JIKAN + '/top/anime?limit=12')
    .then(r => res.json(r.data.data))
    .catch(() => res.json([]));
});

// ── Currently airing ──────────────────────────────────
app.get('/recent', function(req, res) {
  axios.get(JIKAN + '/seasons/now?limit=12')
    .then(r => res.json(r.data.data))
    .catch(() => res.json([]));
});

// ── Search ────────────────────────────────────────────
app.get('/search', function(req, res) {
  if (!req.query.q) return res.json([]);
  axios.get(JIKAN + '/anime?q=' + encodeURIComponent(req.query.q) + '&limit=12')
    .then(r => res.json(r.data.data))
    .catch(() => res.json([]));
});

// ── Anime info + episode list (Jikan) ────────────────
app.get('/info/:id', function(req, res) {
  axios.get(JIKAN + '/anime/' + req.params.id + '/episodes')
    .then(r => res.json(r.data.data))
    .catch(() => res.json([]));
});

// ── Episode list via Consumet/Gogoanime ──────────────
// Searches Gogoanime for the anime by title, returns episode IDs
app.get('/episodes/:malId', async function(req, res) {
  try {
    // Step 1: get anime title from Jikan
    const info = await axios.get(JIKAN + '/anime/' + req.params.malId);
    const title = info.data.data.title_english || info.data.data.title || '';
    if (!title) return res.json({ episodes: [], animeId: null });

    // Step 2: search Gogoanime via Consumet public instance
    const search = await axios.get(
      'https://consumet-api.vercel.app/anime/gogoanime/' + encodeURIComponent(title),
      { timeout: 10000 }
    );
    const results = search.data.results || [];
    if (!results.length) return res.json({ episodes: [], animeId: null, title });

    // Step 3: get episodes for first result
    const animeId = results[0].id;
    const epRes = await axios.get(
      'https://consumet-api.vercel.app/anime/gogoanime/info/' + encodeURIComponent(animeId),
      { timeout: 10000 }
    );
    const episodes = epRes.data.episodes || [];
    res.json({ episodes, animeId, title });

  } catch(e) {
    console.error('episodes error:', e.message);
    res.json({ episodes: [], animeId: null });
  }
});

// ── Stream sources for an episode ───────────────────
// ?id=one-piece-episode-1  (Gogoanime episode ID)
app.get('/stream', async function(req, res) {
  const id = req.query.id;
  if (!id) return res.json({ sources: [] });

  try {
    const r = await axios.get(
      'https://consumet-api.vercel.app/anime/gogoanime/watch/' + encodeURIComponent(id),
      { timeout: 12000 }
    );
    // Return all sources sorted: prefer m3u8, then mp4
    const sources = (r.data.sources || []).sort((a, b) => {
      const rank = s => s.isM3U8 ? 0 : 1;
      return rank(a) - rank(b);
    });
    res.json({ sources, headers: r.data.headers || {} });
  } catch(e) {
    console.error('stream error:', e.message);
    res.json({ sources: [] });
  }
});

// ── Quick source lookup by title + episode number ───
// ?title=Naruto&ep=1  — searches + fetches in one call
app.get('/sources', async function(req, res) {
  const { title, ep } = req.query;
  if (!title || !ep) return res.json({ sources: [] });

  try {
    // Search
    const search = await axios.get(
      'https://consumet-api.vercel.app/anime/gogoanime/' + encodeURIComponent(title),
      { timeout: 10000 }
    );
    const results = search.data.results || [];
    if (!results.length) return res.json({ sources: [], error: 'not_found' });

    // Try to find sub version first, then any result
    const animeResult = results.find(r =>
      r.id && !r.id.includes('dub')
    ) || results[0];

    // Get episode list
    const info = await axios.get(
      'https://consumet-api.vercel.app/anime/gogoanime/info/' + encodeURIComponent(animeResult.id),
      { timeout: 10000 }
    );
    const episodes = info.data.episodes || [];
    const epNum = parseInt(ep);
    const episode = episodes.find(e => e.number === epNum) || episodes[epNum - 1];

    if (!episode) return res.json({ sources: [], error: 'episode_not_found' });

    // Get stream
    const stream = await axios.get(
      'https://consumet-api.vercel.app/anime/gogoanime/watch/' + encodeURIComponent(episode.id),
      { timeout: 12000 }
    );
    const sources = (stream.data.sources || []).sort((a, b) => {
      const rank = s => s.isM3U8 ? 0 : 1;
      return rank(a) - rank(b);
    });
    res.json({ sources, episodeId: episode.id, headers: stream.data.headers || {} });

  } catch(e) {
    console.error('sources error:', e.message);
    res.json({ sources: [], error: e.message });
  }
});

app.listen(process.env.PORT || 3000, function() {
  console.log('Voxa Anime API v2 running on port', process.env.PORT || 3000);
});
