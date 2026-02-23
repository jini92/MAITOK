-- Comments from TikTok Research API
CREATE TABLE IF NOT EXISTS comments (
  id            TEXT PRIMARY KEY,           -- TikTok comment ID
  video_id      TEXT NOT NULL,
  text          TEXT NOT NULL,
  parent_id     TEXT,                       -- null = top-level comment
  like_count    INTEGER DEFAULT 0,
  reply_count   INTEGER DEFAULT 0,
  created_at    INTEGER NOT NULL,           -- unix timestamp from TikTok
  fetched_at    TEXT DEFAULT (datetime('now')),
  language      TEXT,                       -- ko / vi / en / other
  sentiment     TEXT,                       -- positive / negative / neutral / question
  category      TEXT,                       -- purchase_intent / complaint / ...
  priority      INTEGER DEFAULT 3,          -- 1 (highest) to 5 (lowest)
  needs_reply   BOOLEAN DEFAULT 0,
  reply_status  TEXT DEFAULT 'pending'      -- pending / generated / approved / posted / skipped
);

-- AI-generated reply drafts
CREATE TABLE IF NOT EXISTS replies (
  id            INTEGER PRIMARY KEY AUTOINCREMENT,
  comment_id    TEXT NOT NULL REFERENCES comments(id),
  reply_text    TEXT NOT NULL,
  generated_at  TEXT DEFAULT (datetime('now')),
  approved_at   TEXT,
  posted_at     TEXT,
  status        TEXT DEFAULT 'draft',       -- draft / approved / posted / rejected
  edited_text   TEXT                        -- seller-modified version
);

-- Seller account + settings
CREATE TABLE IF NOT EXISTS seller_config (
  id                INTEGER PRIMARY KEY AUTOINCREMENT,
  tiktok_user_id    TEXT UNIQUE,
  tiktok_username   TEXT,
  access_token      TEXT,                   -- encrypted
  refresh_token     TEXT,                   -- encrypted
  token_expires_at  TEXT,
  mode              TEXT DEFAULT 'semi',    -- semi / auto
  reply_tone        TEXT DEFAULT 'friendly',
  max_daily_replies INTEGER DEFAULT 100,
  languages         TEXT DEFAULT '["ko","vi","en"]',
  created_at        TEXT DEFAULT (datetime('now')),
  updated_at        TEXT DEFAULT (datetime('now'))
);

-- Videos being monitored
CREATE TABLE IF NOT EXISTS watched_videos (
  id                INTEGER PRIMARY KEY AUTOINCREMENT,
  video_id          TEXT NOT NULL,
  video_url         TEXT,
  seller_id         INTEGER REFERENCES seller_config(id),
  last_cursor       INTEGER DEFAULT 0,      -- incremental polling cursor
  poll_interval_sec INTEGER DEFAULT 300,
  active            BOOLEAN DEFAULT 1,
  created_at        TEXT DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_comments_video ON comments(video_id);
CREATE INDEX IF NOT EXISTS idx_comments_reply_status ON comments(reply_status);
CREATE INDEX IF NOT EXISTS idx_replies_comment ON replies(comment_id);
CREATE INDEX IF NOT EXISTS idx_watched_active ON watched_videos(active);
