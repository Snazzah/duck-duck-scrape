export interface CallbackSearchResult {
  /** Website description */
  a: string;
  /** Unknown */
  ae: null;
  /** ddg!bang information (ex. w Wikipedia en.wikipedia.org) */
  b?: string;
  /** URL */
  c: string;
  /** URL of some sort. */
  d: string;
  /** Class name associations. */
  da?: string;
  /** Unknown */
  h: number;
  /** Website hostname */
  i: string;
  /** Unknown */
  k: null;
  /** Unknown */
  m: number;
  /** Unknown */
  o: number;
  /** Unknown */
  p: number;
  /** Unknown */
  s: string;
  /** Website Title */
  t: string;
  /** Website URL */
  u: string;
}

export interface CallbackNextSearch {
  /** URL to the next page of results. */
  n: string;
}

export interface CallbackDuckbarPayload<T> {
  ads: any[];
  query: string;
  queryEncoded: string;
  response_type: string;
  results: T[];
  vqd: {
    [query: string]: string;
  };
}

export interface DuckbarImageResult {
  height: number;
  image: string;
  source: string;
  thumbnail: string;
  title: string;
  url: string;
  width: number;
}

export interface DuckbarVideoResult {
  content: string;
  description: string;
  duration: string;
  embed_html: string;
  embed_url: string;
  images: {
    large: string;
    medium: string;
    motion: string;
    small: string;
  };
  provider: string;
  published: string;
  publisher: string;
  statistics: {
    viewCount?: number;
  };
  title: string;
  uploader: string;
}

export interface DuckbarRelatedSearch {
  display_text: string;
  text: string;
  web_search_url: string;
}
