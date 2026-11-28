-- Page views (anonymous). Run once in the D1 console of the site's database.
CREATE TABLE IF NOT EXISTS views (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  ts TEXT NOT NULL DEFAULT (strftime('%Y-%m-%d %H:%M:%S','now')),   -- UTC
  pg TEXT NOT NULL,        -- page path, e.g. /records or /en/press
  lang TEXT,               -- it | en
  country TEXT,            -- 2-letter code from Cloudflare (no IP stored)
  ref TEXT,                -- referrer host (e.g. google.com), empty = direct
  dev TEXT                 -- mobile | desktop
);
CREATE INDEX IF NOT EXISTS views_ts ON views(ts);
CREATE INDEX IF NOT EXISTS views_pg ON views(pg);
