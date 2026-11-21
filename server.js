import express from 'express';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { readFile } from 'node:fs/promises';

const app = express();
const here = path.dirname(fileURLToPath(import.meta.url));
const port = process.env.PORT || 3000;

app.get('/api/tracks', async (_req, res, next) => {
  try {
    const tracks = JSON.parse(await readFile(path.join(here, 'tracks.json'), 'utf8'));
    res.set('Cache-Control', 'no-store').json(tracks);
  } catch (error) { next(error); }
});
app.use(express.static(path.join(here, 'public'), { maxAge: '1h', extensions: ['html'] }));
app.get('*path', (_req, res) => res.sendFile(path.join(here, 'public', 'index.html')));
app.listen(port, '0.0.0.0', () => console.log(`Listening on ${port}`));
