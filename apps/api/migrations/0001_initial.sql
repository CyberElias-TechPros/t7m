-- T7M brand-brief submissions
CREATE TABLE IF NOT EXISTS submissions (
  id            TEXT PRIMARY KEY,
  contact_name  TEXT NOT NULL,
  contact_email TEXT NOT NULL,
  brand_name    TEXT NOT NULL,
  answers       TEXT NOT NULL, -- validated questionnaire answers (JSON)
  attachments   TEXT NOT NULL DEFAULT '[]', -- attachment metadata (JSON)
  status        TEXT NOT NULL DEFAULT 'new'
                CHECK (status IN ('new','reviewed','contacted','won','lost','archived')),
  notes         TEXT NOT NULL DEFAULT '',
  ip_hash       TEXT NOT NULL DEFAULT '',
  created_at    TEXT NOT NULL,
  updated_at    TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_submissions_created_at ON submissions (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_submissions_status ON submissions (status);
CREATE INDEX IF NOT EXISTS idx_submissions_email ON submissions (contact_email);

-- Admin/audit event log
CREATE TABLE IF NOT EXISTS submission_events (
  id            INTEGER PRIMARY KEY AUTOINCREMENT,
  submission_id TEXT,
  actor         TEXT NOT NULL DEFAULT 'system',
  type          TEXT NOT NULL,
  detail        TEXT NOT NULL DEFAULT '',
  created_at    TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_events_submission ON submission_events (submission_id);
CREATE INDEX IF NOT EXISTS idx_events_created_at ON submission_events (created_at DESC);
