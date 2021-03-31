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
  /** URL to the next page of results */
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
  /** URL of the video */
  content: string;
  /** Description of the video */
  description: string;
  /** Duration of the video */
  duration: string;
  /** Embed HTML for the video */
  embed_html: string;
  /** Embed URL for the video */
  embed_url: string;
  /** Thumbnail images of the video */
  images: {
    large: string;
    medium: string;
    motion: string;
    small: string;
  };
  /** Where this search result came from */
  provider: string;
  /** ISO timestamp of the upload */
  published: string;
  /** What site the video was on */
  publisher: string;
  /** Various statistics */
  statistics: {
    /** View count of the video */
    viewCount?: number;
  };
  /** Title of the video */
  title: string;
  /** Name of the video uploader(?) */
  uploader: string;
}

export interface DuckbarRelatedSearch {
  display_text: string;
  text: string;
  web_search_url: string;
}

export interface DuckbarNewsResult {
  date: number;
  excerpt: string;
  image: string;
  relative_time: string;
  syndicate: string;
  title: string;
  url: string;
  use_relevancy: number;
}
