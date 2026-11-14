/**
 * A tiny HTML page for people who open a short link that can't redirect.
 * Visitors arrive here from a browser, so they get a readable page, not JSON.
 * Only fixed strings from this codebase are inserted, never user input.
 */
export function renderStatusPage(title: string, message: string): string {
    return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="robots" content="noindex">
<title>${title} · in-a-bit</title>
<style>
  body { margin: 0; min-height: 100vh; display: grid; place-items: center; padding: 24px;
         font-family: ui-sans-serif, system-ui, sans-serif; background: #f7f5f0; color: #16140f; }
  main { max-width: 420px; }
  .logo { font-family: ui-monospace, monospace; font-weight: 600; color: inherit; text-decoration: none; }
  .logo span { color: #e8590c; }
  h1 { margin: 32px 0 8px; font-size: 28px; letter-spacing: -0.02em; }
  p { margin: 0; color: #6b665c; line-height: 1.5; }
  @media (prefers-color-scheme: dark) {
    body { background: #12110e; color: #f2efe8; }
    .logo span { color: #ff7a33; }
    p { color: #a39d90; }
  }
</style>
</head>
<body>
<main>
  <a class="logo" href="/">in-a-<span>bit</span></a>
  <h1>${title}</h1>
  <p>${message}</p>
</main>
</body>
</html>`
}
