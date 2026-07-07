import type { Release } from '../types/musicbrainz';

interface ReleaseListProps {
  releases: Release[];
  albumTitle: string;
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

export function ReleaseList({ releases, albumTitle, onCopyMBID }: ReleaseListProps) {
  return (
    <>
      <hr className="divider" />
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
        <div style={{ fontSize: 15, fontWeight: 600 }}>Releases — {esc(albumTitle)}</div>
      </div>
      <div className="release-list">
        {releases.length === 0 ? (
          <div className="empty">Sin releases</div>
        ) : (
          releases.map((r) => (
            <div key={r.id} className="release-row">
              <div className="release-row-title">{esc(r.title)}</div>
              {r.date && <span className="release-row-date">{r.date}</span>}
              {r.country && <span className="release-row-country">{esc(r.country)}</span>}
              {r.status && (
                <span className={`pill ${r.status === 'Official' ? 'green' : 'amber'}`}>
                  {esc(r.status)}
                </span>
              )}
              <span
                className="mbid"
                onClick={() => onCopyMBID(r.id)}
                title="Copiar MBID"
              >
                {r.id.slice(0, 8)}…
              </span>
            </div>
          ))
        )}
      </div>
    </>
  );
}
