const express = require('express');
const axios = require('axios');
const cors = require('cors');
const app = express();
const PORT = 3000;

app.use(cors({ origin: "*" }));

const MB_BASE_URL = 'https://musicbrainz.org/ws/2';
const headers = {
    'User-Agent': 'MiAppMusical/1.0.0 ( johnchm007@gmail.com )',
    'Accept': 'application/json'
};

// ── Buscar artista ──────────────────────────────────────────────────────────
app.get('/buscar-artista', async (req, res) => {
    const { nombre } = req.query;
    if (!nombre) return res.status(400).json({ error: 'Parámetro "nombre" requerido' });

    try {
        const response = await axios.get(`${MB_BASE_URL}/artist`, {
            headers,
            params: { query: `artist:${nombre}`, fmt: 'json', limit: 10 }
        });
        res.json(response.data);
    } catch (error) {
        res.status(error.response?.status || 500).json({ error: 'Error al consultar MusicBrainz' });
    }
});

// ── Detalle de artista — DEBE ir ANTES que /artista/:mbid/albumes ───────────
app.get('/artista/:mbid', async (req, res) => {
    const { mbid } = req.params;
    try {
        const response = await axios.get(`${MB_BASE_URL}/artist/${mbid}`, {
            headers,
            params: { inc: 'tags+aliases', fmt: 'json' }
        });
        res.json(response.data);
    } catch (error) {
        res.status(error.response?.status || 500).json({ error: 'Error al obtener artista' });
    }
});

// ── Álbumes de un artista (browse release-groups) ───────────────────────────
app.get('/artista/:mbid/albumes', async (req, res) => {
    const { mbid } = req.params;
    const { limit = 20, offset = 0 } = req.query;

    try {
        const response = await axios.get(`${MB_BASE_URL}/release-group`, {
            headers,
            params: { artist: mbid, type: 'album', fmt: 'json', limit, offset }
        });
        res.json(response.data);
    } catch (error) {
        res.status(error.response?.status || 500).json({ error: 'Error al obtener álbumes' });
    }
});

// ── Releases de un release-group ────────────────────────────────────────────
app.get('/album/:rgmbid/releases', async (req, res) => {
    const { rgmbid } = req.params;
    const { limit = 10 } = req.query;

    try {
        const response = await axios.get(`${MB_BASE_URL}/release`, {
            headers,
            params: { 'release-group': rgmbid, fmt: 'json', limit }
        });
        res.json(response.data);
    } catch (error) {
        res.status(error.response?.status || 500).json({ error: 'Error al obtener releases' });
    }
});

// ── Portada de un álbum (Cover Art Archive) ─────────────────────────────────
// FIX: CAA necesita MBID de un *release*, no de un *release-group*.
// Primero obtenemos los releases del grupo y probamos cada uno hasta encontrar portada.
app.get('/album/:mbid/portada', async (req, res) => {
    const { mbid } = req.params;
    try {
        // 1. Obtener releases del release-group
        const rgRes = await axios.get(`${MB_BASE_URL}/release`, {
            headers,
            params: { 'release-group': mbid, fmt: 'json', limit: 5 }
        });

        const releases = rgRes.data.releases;
        if (!releases || releases.length === 0) {
            return res.status(404).json({ error: 'No hay releases para este álbum' });
        }

        // 2. Probar cada release hasta encontrar uno con portada
        for (const release of releases) {
            try {
                const coverRes = await axios.get(
                    `https://coverartarchive.org/release/${release.id}`,
                    { headers: { 'User-Agent': headers['User-Agent'] } }
                );
                const img = coverRes.data.images?.find(i => i.front) || coverRes.data.images?.[0];
                if (img) {
                    return res.json({
                        portada_url: img.image,
                        miniaturas: img.thumbnails,
                        release_mbid: release.id
                    });
                }
            } catch {
                continue;
            }
        }

        res.status(404).json({ error: 'No se encontró portada para este álbum' });
    } catch (error) {
        res.status(error.response?.status || 500).json({ error: 'Error al obtener portada' });
    }
});

// ── Créditos de una canción ─────────────────────────────────────────────────
app.get('/cancion/creditos', async (req, res) => {
    const { titulo } = req.query;
    if (!titulo) return res.status(400).json({ error: 'Parámetro "titulo" requerido' });

    try {
        const response = await axios.get(`${MB_BASE_URL}/recording`, {
            headers,
            params: { query: `recording:${titulo}`, inc: 'work-rels', fmt: 'json' }
        });
        res.json(response.data);
    } catch (error) {
        res.status(500).json({ error: 'Error en la búsqueda' });
    }
});

app.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
});