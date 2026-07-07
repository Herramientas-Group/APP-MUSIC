import type { Artist } from '../types/musicbrainz';

interface SidebarProps {
  artists: Artist[];
  loading: boolean;
  onSelectArtist: (mbid: string) => void;
  selectedMbid: string | null;
}

function esc(str: string | undefined): string {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

export function Sidebar({ artists, loading, onSelectArtist, selectedMbid }: SidebarProps) {
  return (
    <div className="sidebar">
      <div className="sec-label">
        Resultados {artists.length > 0 ? `(${artists.length})` : ''}
      </div>

      {loading && (
        <div className="loading">
          <div className="spinner"></div>
          Buscando...
        </div>
      )}

      {!loading && artists.length === 0 && (
        <div className="empty">Busca un artista para comenzar</div>
      )}

      {!loading && artists.length > 0 && artists.map((a) => (
        <div
          key={a.id}
          className={`artist-card ${selectedMbid === a.id ? 'active' : ''}`}
          onClick={() => onSelectArtist(a.id)}
        >
          <div className="artist-card-name">{esc(a.name)}</div>
          <div className="artist-card-meta">
            {a.type && <span className="pill">{esc(a.type)}</span>}
            {a.country && <span className="pill green">{esc(a.country)}</span>}
            {a['life-span']?.begin && (
              <span>{a['life-span'].begin!.slice(0, 4)}</span>
            )}
          </div>
          <div className="score-bar">
            <div className="score-fill" style={{ width: `${a.score || 0}%` }}></div>
          </div>
        </div>
      ))}
    </div>
  );
}
