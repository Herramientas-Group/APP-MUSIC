import { useState, useCallback } from 'react';
import type { Artist, Release, SearchResponse, ReleasesResponse, CoverArtResponse } from '../types/musicbrainz';

const API = import.meta.env.VITE_API_URL || 'http://localhost:3004';

export function useMusicBrainz() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const buscarArtista = useCallback(async (nombre: string): Promise<Artist[]> => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API}/buscar-artista?nombre=${encodeURIComponent(nombre)}`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data: SearchResponse = await res.json();
      return data.artists || [];
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Error desconocido';
      setError(msg);
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  const getArtista = useCallback(async (mbid: string): Promise<Artist | null> => {
    try {
      const res = await fetch(`${API}/artista/${mbid}`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return await res.json();
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Error desconocido';
      setError(msg);
      return null;
    }
  }, []);

  const getAlbumes = useCallback(async (mbid: string): Promise<ReleasesResponse | null> => {
    try {
      const res = await fetch(`${API}/artista/${mbid}/albumes`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return await res.json();
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Error desconocido';
      setError(msg);
      return null;
    }
  }, []);

  const getReleases = useCallback(async (rgMbid: string): Promise<Release[]> => {
    try {
      const res = await fetch(`${API}/album/${rgMbid}/releases`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      return data.releases || [];
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Error desconocido';
      setError(msg);
      return [];
    }
  }, []);

  const getPortada = useCallback(async (mbid: string): Promise<string | null> => {
    try {
      const res = await fetch(`${API}/album/${mbid}/portada`);
      if (!res.ok) return null;
      const data: CoverArtResponse = await res.json();
      return data.miniaturas?.small || data.portada_url || null;
    } catch {
      return null;
    }
  }, []);

  const checkServer = useCallback(async (): Promise<boolean> => {
    try {
      await fetch(`${API}/buscar-artista?nombre=test`);
      return true;
    } catch {
      return false;
    }
  }, []);

  return {
    loading,
    error,
    buscarArtista,
    getArtista,
    getAlbumes,
    getReleases,
    getPortada,
    checkServer,
  };
}
