const express = require('express');
const axios = require('axios');
const cors = require('cors');
const app = express();
const PORT = 3000;

app.use(cors({
    origin: "*",
}));

const MB_BASE_URL = 'https://musicbrainz.org/ws/2';
const headers = {
    'User-Agent': 'MiAppMusical/1.0.0 ( johnchm007@gmail.com )',
    'Accept': 'application/json'
};

//BUSCAR ARTISTA
app.get('/buscar-artista', async (req, res) => {
    const { nombre } = req.query;

    try {
        const response = await axios.get(`${MB_BASE_URL}/artist`, {
            headers,
            params: {
                query: `artist:${nombre}`,
                fmt: 'json'
            }
        });
        res.json(response.data);
    } catch (error) {
        res.status(error.response?.status || 500).json({ error: 'Error al consultar MusicBrainz' });
    }
});


//BUSCAR ALBUNES DE UN ARTISTA
app.get('/artista/:mbid/albumes', async (req, res) => {
    const { mbid } = req.params;

    try {
        const response = await axios.get(`${MB_BASE_URL}/release`, {
            headers,
            params: {
                artist: mbid,
                inc: 'release-groups',
                fmt: 'json'
            }
        });
        res.json(response.data);
    } catch (error) {
        res.status(error.response?.status || 500).json({ error: 'Error al obtener álbumes' });
    }
});

//OBTENER LA PORTADA DE UN ÁLBUM
app.get('/album/:mbid/portada', async (req, res) => {
    const { mbid } = req.params;
    try {
        // Esta es una API distinta pero usa el mismo ID de MusicBrainz
        const response = await axios.get(`https://coverartarchive.org/release/${mbid}`);
        res.json({
            portada_url: response.data.images[0]?.image,
            miniaturas: response.data.images[0]?.thumbnails
        });
    } catch (error) {
        res.status(404).json({ error: 'No se encontró portada para este álbum' });
    }
});

//BUSCAR UNA CANCIÓN Y VER SUS CRÉDITOS (Compositores)
app.get('/cancion/creditos', async (req, res) => {
    const { titulo } = req.query;
    try {
        const response = await axios.get(`${MB_BASE_URL}/recording`, {
            headers,
            params: {
                query: `recording:${titulo}`,
                inc: 'work-rels',
                fmt: 'json'
            }
        });
        res.json(response.data);
    } catch (error) {
        res.status(500).json({ error: 'Error en la búsqueda' });
    }
});

app.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
});