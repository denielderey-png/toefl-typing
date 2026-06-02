-- TOEFL Typing Studio 排行榜数据表
-- 在 Cloudflare D1 里执行一次：
--   wrangler d1 execute toefl-leaderboard --file=./leaderboard-schema.sql
-- 或在控制台 D1 → Console 里粘贴执行。

CREATE TABLE IF NOT EXISTS scores (
  id   INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT    NOT NULL,
  mode TEXT    NOT NULL,
  wpm  INTEGER NOT NULL,
  acc  INTEGER NOT NULL,
  ts   INTEGER NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_scores_mode_wpm ON scores (mode, wpm DESC);
