package db

const createSeriesTable = `
CREATE TABLE IF NOT EXISTS series (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  slug TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);`

const createChaptersTable = `
CREATE TABLE IF NOT EXISTS chapters (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  series_id INTEGER NOT NULL REFERENCES series(id) ON DELETE CASCADE,
  slug TEXT NOT NULL,
  hub_json TEXT NOT NULL DEFAULT '{}',
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now')),
  UNIQUE (series_id, slug)
);`

const createPostsTable = `
CREATE TABLE IF NOT EXISTS posts (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  series_id INTEGER NOT NULL REFERENCES series(id) ON DELETE CASCADE,
  chapter TEXT NOT NULL,
  slug TEXT NOT NULL,
  title TEXT NOT NULL,
  author TEXT NOT NULL DEFAULT '',
  sort_order INTEGER NOT NULL DEFAULT 0,
  hub_entry_json TEXT NOT NULL DEFAULT '{}',
  sermon_url TEXT NOT NULL DEFAULT '',
  metadata_json TEXT NOT NULL DEFAULT '{}',
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now')),
  UNIQUE (series_id, chapter, slug)
);`

const createPostSectionsTable = `
CREATE TABLE IF NOT EXISTS post_sections (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  post_id INTEGER NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  heading TEXT NOT NULL DEFAULT '',
  sort_order INTEGER NOT NULL DEFAULT 0,
  quiz_json TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);`

const createPostSectionUnitsTable = `
CREATE TABLE IF NOT EXISTS post_section_units (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  section_id INTEGER NOT NULL REFERENCES post_sections(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  content_json TEXT NOT NULL,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);`

const createPostsSeriesChapterIndex = `
CREATE INDEX IF NOT EXISTS idx_posts_series_chapter
ON posts (series_id, chapter, sort_order, slug);`

const createPostSectionsPostIndex = `
CREATE INDEX IF NOT EXISTS idx_post_sections_post
ON post_sections (post_id, sort_order);`

const createPostSectionUnitsSectionIndex = `
CREATE INDEX IF NOT EXISTS idx_post_section_units_section
ON post_section_units (section_id, sort_order);`

const createServiceLogsTable = `
CREATE TABLE IF NOT EXISTS service_logs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  service TEXT NOT NULL,
  level TEXT NOT NULL DEFAULT 'info',
  message TEXT NOT NULL,
  context_json TEXT NOT NULL DEFAULT '{}',
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);`

const createServiceLogsCreatedIndex = `
CREATE INDEX IF NOT EXISTS idx_service_logs_created
ON service_logs (created_at DESC, id DESC);`

const createServiceLogsServiceIndex = `
CREATE INDEX IF NOT EXISTS idx_service_logs_service
ON service_logs (service, created_at DESC, id DESC);`
