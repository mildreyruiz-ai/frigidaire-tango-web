-- Frigidaire Tango · listening stats (Cloudflare D1)
CREATE TABLE IF NOT EXISTS tracks (
  key TEXT PRIMARY KEY,        -- a:<audio path> | d:<deezer id> | y:<youtube id>
  album_slug TEXT NOT NULL,
  album_title TEXT NOT NULL,
  pos INTEGER NOT NULL,
  title TEXT NOT NULL,
  dur INTEGER                  -- seconds
);
CREATE TABLE IF NOT EXISTS plays (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  ts TEXT NOT NULL DEFAULT (strftime('%Y-%m-%d %H:%M:%S','now')),   -- UTC
  key TEXT NOT NULL,
  src TEXT NOT NULL,           -- site (own player) | widget (Deezer player in page) | link (click to Deezer/YouTube/Spotify)
  pf TEXT,                     -- platform for link clicks
  secs INTEGER,                -- seconds actually listened (own player only)
  maxpos INTEGER,              -- furthest second reached (own player only)
  dur INTEGER,                 -- track length in seconds (own player only)
  done INTEGER,                -- 1 = finished (ended or >=90% listened)
  title TEXT, pg TEXT, lang TEXT,
  country TEXT                 -- 2-letter country code from Cloudflare (no IP stored)
);
CREATE INDEX IF NOT EXISTS plays_ts ON plays(ts);
CREATE INDEX IF NOT EXISTS plays_key ON plays(key);
