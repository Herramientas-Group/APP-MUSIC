import { useState } from 'react';
import type { Artist, ReleaseGroup, Release } from '../types/musicbrainz';
import { AlbumCard } from './AlbumCard';
import { ReleaseList } from './ReleaseList';
import { Charts } from './Charts';

interface MainPanelProps {
  artist: Artist | null;
  albums: ReleaseGroup[];
  loading: boolean;
  error: string | null;
  getPortada: (mbid: string) => Promise<string | null>;
  getReleases: (rgMbid: string) => Promise<Release[]>;
  onCopyMBID: (mbid: string) => void;
}

function esc(str: string | undefined): string {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

export function MainPanel({
  artist,
  albums,
  loading,
  error,
  getPortada,
  getReleases,
  onCopyMBID,
}: MainPanelProps) {
  const [selectedReleases, setSelectedReleases] = useState<Release[] | null>(null);
  const [selectedAlbumTitle, setSelectedAlbumTitle] = useState('');
  const [loadingReleases, setLoadingReleases] = useState(false);

  const handleSelectAlbum = async (rgMbid: string, title: string) => {
    setLoadingReleases(true);
    setSelectedAlbumTitle(title);
    const releases = await getReleases(rgMbid);
    setSelectedReleases(releases);
    setLoadingReleases(false);
  };

  if (loading) {
    return (
      <div className="main" id="mainPanel">
        <div className="loading">
          <div className="spinner"></div>
          Cargando artista...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="main" id="mainPanel">
        <div className="error-box">Error: {error}</div>
      </div>
    );
  }

  if (!artist) {
    return (
      <div className="main" id="mainPanel">
        <div className="empty" style={{ paddingTop: 80 }}>
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2"
            style={{ opacity: 0.25, marginBottom: 16 }}>
            <circle cx="12" cy="12" r="10" />
            <circle cx="12" cy="12" r="3" />
            <line x1="12" y1="2" x2="12" y2="5" />
            <line x1="12" y1="19" x2="12" y2="22" />
            <line x1="2" y1="12" x2="5" y2="12" />
            <line x1="19" y1="12" x2="22" y2="12" />
          </svg>
          <div>Selecciona un artista para ver sus álbumes</div>
        </div>
      </div>
    );
  }

  const tags = (artist.tags || []).sort((a, b) => b.count - a.count).slice(0, 8);
  const lifespan = artist['life-span'];
  const founded = lifespan?.begin ? lifespan.begin.slice(0, 4) : '—';
  const ended = lifespan?.ended ? (lifespan.end?.slice(0, 4) || '?') : null;

  return (
    <div className="main" id="mainPanel">
      <div className="panel-header">
        <div>
          <div className="panel-title">{esc(artist.name)}</div>
          <div className="panel-sub">
            {artist.type || 'Artista'}
            {artist.country ? ` · ${artist.country}` : ''}
            {founded !== '—' ? ` · ${founded}${ended ? ` → ${ended}` : ' → presente'}` : ''}
          </div>
        </div>
        <span
          className="mbid"
          onClick={() => onCopyMBID(artist.id)}
          title="Click para copiar MBID"
        >
          {artist.id.slice(0, 8)}...
        </span>
      </div>

      {tags.length > 0 && (
        <div className="meta-row">
          {tags.map((t) => (
            <span key={t.name} className="tag-chip">{esc(t.name)}</span>
          ))}
        </div>
      )}

      <div className="stats">
        <div className="stat">
          <div className="stat-label">Álbumes</div>
          <div className="stat-val accent">{albums.length}</div>
        </div>
        <div className="stat">
          <div className="stat-label">Fundación</div>
          <div className="stat-val" style={{ fontSize: 16 }}>{founded}</div>
        </div>
        {artist.country && (
          <div className="stat">
            <div className="stat-label">País</div>
            <div className="stat-val" style={{ fontSize: 16 }}>{esc(artist.country)}</div>
          </div>
        )}
        {artist.type && (
          <div className="stat">
            <div className="stat-label">Tipo</div>
            <div className="stat-val" style={{ fontSize: 16 }}>{esc(artist.type)}</div>
          </div>
        )}
      </div>

      <Charts artist={artist} albums={albums} />

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
        <div style={{ fontSize: 15, fontWeight: 600 }}>Discografía</div>
      </div>

      <div className="albums-grid" id="albumsGrid">
        {albums.length === 0 ? (
          <div className="empty">Sin álbumes encontrados</div>
        ) : (
          albums.map((rg) => (
            <AlbumCard key={rg.id} rg={rg} onSelect={handleSelectAlbum} getPortada={getPortada} />
          ))
        )}
      </div>

      {loadingReleases && (
        <div className="loading">
          <div className="spinner"></div>
          Cargando releases...
        </div>
      )}

      {!loadingReleases && selectedReleases && (
        <ReleaseList
          releases={selectedReleases}
          albumTitle={selectedAlbumTitle}
          onCopyMBID={onCopyMBID}
        />
      )}
    </div>
  );
}
