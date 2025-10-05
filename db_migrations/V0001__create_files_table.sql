CREATE TABLE IF NOT EXISTS files (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  size BIGINT NOT NULL,
  mime_type TEXT,
  file_data BYTEA NOT NULL,
  uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  expires_at TIMESTAMP NOT NULL,
  download_count INT DEFAULT 0
);

CREATE INDEX idx_files_expires_at ON files(expires_at);
CREATE INDEX idx_files_uploaded_at ON files(uploaded_at);