import { useState, useEffect } from 'react';

interface TopBarProps {
  onSearch: (query: string) => void;
  serverOnline: boolean | null;
}

export function TopBar({ onSearch, serverOnline }: TopBarProps) {
  const [query, setQuery] = useState('');

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Enter') {
        onSearch(query.trim());
      }
    };
    const input = document.getElementById('searchInput');
    input?.addEventListener('keydown', handleKeyDown);
    return () => input?.removeEventListener('keydown', handleKeyDown);
  }, [query, onSearch]);

  const statusColor = serverOnline === null
    ? 'var(--amber)'
    : serverOnline
      ? 'var(--green)'
      : 'var(--red)';

  const statusText = serverOnline === null
    ? 'conectando...'
    : serverOnline
      ? 'conectado'
      : 'sin conexión';

  return (
    <div className="topbar">
      <div className="logo">Music<span>Brainz</span></div>
      <div className="search-wrap">
        <input
          id="searchInput"
          type="text"
          placeholder="Buscar artista..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') onSearch(query.trim());
          }}
        />
        <button className="btn" onClick={() => onSearch(query.trim())}>
          Buscar
        </button>
      </div>
      <span style={{ fontSize: 12, color: 'var(--muted)', whiteSpace: 'nowrap' }}>
        Servidor: <span style={{ color: statusColor }}>●</span> {statusText}
      </span>
    </div>
  );
}
