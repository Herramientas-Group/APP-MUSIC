import { useState, useEffect } from 'react';
import type { ReleaseGroup } from '../types/musicbrainz';

interface AlbumCardProps {
  rg: ReleaseGroup;
  onSelect: (rgMbid: string, title: string) => void;
  getPortada: (mbid: string) => Promise<string | null>;
}

function esc(str: string | undefined): string {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

export function AlbumCard({ rg, onSelect, getPortada }: AlbumCardProps) {
  const [portada, setPortada] = useState<string | null>(null);
  const [loadingCover, setLoadingCover] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoadingCover(true);
    getPortada(rg.id).then((url) => {
      if (!cancelled) {
        setPortada(url);
        setLoadingCover(false);
      }
    });
    return () => { cancelled = true; };
  }, [rg.id, getPortada]);

  const year = rg['first-release-date']?.slice(0, 4) || '';

  return (
    <div className="album-card" onClick={() => onSelect(rg.id, rg.title)}>
      <div className={`album-cover ${loadingCover ? 'loading' : ''}`}>
        {portada ? (
          <img src={portada} alt="Portada" />
        ) : (
          <>
            <svg className="album-cover-icon" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.2">
              <circle cx="12" cy="12" r="10" />
              <circle cx="12" cy="12" r="3" />
            </svg>
            {year && <span className="album-cover-year">{year}</span>}
          </>
        )}
      </div>
      <div className="album-info">
        <div className="album-title">{esc(rg.title)}</div>
        <div className="album-meta">
          {rg['primary-type'] || 'Álbum'}{year ? ` · ${year}` : ''}
        </div>
      </div>
    </div>
  );
}
