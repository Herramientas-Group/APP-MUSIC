const express = require('express');
const axios = require('axios');
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

app.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
});