ALTER TABLE job_messages
ADD COLUMN IF NOT EXISTS read_at TIMESTAMPTZ NULL;

CREATE INDEX IF NOT EXISTS job_messages_unread_sender_idx
ON job_messages (sender_id, read_at);