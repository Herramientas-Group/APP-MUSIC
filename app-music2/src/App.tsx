import { useState, useEffect, useCallback } from 'react';
import { TopBar } from './components/TopBar';
import { Sidebar } from './components/Sidebar';
import { MainPanel } from './components/MainPanel';
import { useToast } from './components/Toast';
import { useMusicBrainz } from './hooks/useMusicBrainz';
import type { Artist, ReleaseGroup } from './types/musicbrainz';
import './App.css';

function App() {
  const [artists, setArtists] = useState<Artist[]>([]);
  const [selectedArtist, setSelectedArtist] = useState<Artist | null>(null);
  const [albums, setAlbums] = useState<ReleaseGroup[]>([]);
  const [selectedMbid, setSelectedMbid] = useState<string | null>(null);
  const [serverOnline, setServerOnline] = useState<boolean | null>(null);
  const [searchLoading, setSearchLoading] = useState(false);
  const [artistLoading, setArtistLoading] = useState(false);

  const { showToast, Toast } = useToast();
  const {
    buscarArtista,
    getArtista,
    getAlbumes,
    getReleases,
    getPortada,
    checkServer,
  } = useMusicBrainz();

  useEffect(() => {
    checkServer().then(setServerOnline);
  }, [checkServer]);

  const handleSearch = useCallback(async (query: string) => {
    if (!query) return;
    setSearchLoading(true);
    const results = await buscarArtista(query);
    setArtists(results);
    setSearchLoading(false);
  }, [buscarArtista]);

  const handleSelectArtist = useCallback(async (mbid: string) => {
    setSelectedMbid(mbid);
    setArtistLoading(true);
    setSelectedArtist(null);
    setAlbums([]);

    const [artistData, albumsData] = await Promise.all([
      getArtista(mbid),
      getAlbumes(mbid),
    ]);

    if (artistData) setSelectedArtist(artistData);
    if (albumsData) setAlbums(albumsData['release-groups'] || []);
    setArtistLoading(false);
  }, [getArtista, getAlbumes]);

  const handleCopyMBID = useCallback((mbid: string) => {
    navigator.clipboard.writeText(mbid).then(() => showToast('MBID copiado'));
  }, [showToast]);

  return (
    <>
      <TopBar onSearch={handleSearch} serverOnline={serverOnline} />
      <div className="layout">
        <Sidebar
          artists={artists}
          loading={searchLoading}
          onSelectArtist={handleSelectArtist}
          selectedMbid={selectedMbid}
        />
        <MainPanel
          artist={selectedArtist}
          albums={albums}
          loading={artistLoading}
          error={null}
          getPortada={getPortada}
          getReleases={getReleases}
          onCopyMBID={handleCopyMBID}
        />
      </div>
      <Toast />
    </>
  );
}

export default App;
