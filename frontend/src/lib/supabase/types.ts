export interface SupabaseLikeClient {
  from: (table: string) => unknown;
}

export interface CookieToSet<TOptions = unknown> {
  name: string;
  value: string;
  options?: TOptions;
}
