/**
 * Resolve a public-folder path such as `/media/x.mp3` against Vite's base URL,
 * so the build works when hosted under a sub-path (for example GitHub Pages).
 */
export function asset(path: string): string {
  if (/^(?:[a-z]+:|\/\/)/i.test(path)) return path;
  return import.meta.env.BASE_URL + path.replace(/^\//, '');
}
