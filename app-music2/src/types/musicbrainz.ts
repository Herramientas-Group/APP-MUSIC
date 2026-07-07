export interface LifeSpan {
  begin?: string;
  end?: string;
  ended?: boolean;
}

export interface Tag {
  name: string;
  count: number;
  url?: string;
}

export interface Artist {
  id: string;
  name: string;
  type?: string;
  country?: string;
  'life-span'?: LifeSpan;
  tags?: Tag[];
  score?: number;
}

export interface ReleaseGroup {
  id: string;
  title: string;
  'primary-type'?: string;
  'first-release-date'?: string;
}

export interface ReleasesResponse {
  'release-groups': ReleaseGroup[];
  'release-group-count': number;
}

export interface Release {
  id: string;
  title: string;
  date?: string;
  country?: string;
  status?: string;
}

export interface CoverArtResponse {
  portada_url?: string;
  miniaturas?: {
    small?: string;
    large?: string;
  };
}

export interface SearchResponse {
  artists: Artist[];
}
