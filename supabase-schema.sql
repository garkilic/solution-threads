-- Multi-Tenant Workflow Platform Database Schema
-- Run this in your Supabase SQL Editor

-- ============================================
-- Table: clients
-- ============================================
CREATE TABLE IF NOT EXISTS clients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  access_code TEXT UNIQUE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- Table: contacts
-- ============================================
CREATE TABLE IF NOT EXISTS contacts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  company TEXT NOT NULL,
  title TEXT,
  email TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- Table: workflow_runs
-- ============================================
CREATE TABLE IF NOT EXISTS workflow_runs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
  contact_id UUID REFERENCES contacts(id) ON DELETE SET NULL,
  context TEXT,
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ
);

-- ============================================
-- Table: workflow_outputs
-- ============================================
CREATE TABLE IF NOT EXISTS workflow_outputs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  run_id UUID REFERENCES workflow_runs(id) ON DELETE CASCADE,
  key_stats JSONB,
  sections JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- Table: uploaded_files
-- ============================================
CREATE TABLE IF NOT EXISTS uploaded_files (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
  run_id UUID REFERENCES workflow_runs(id) ON DELETE SET NULL,
  source TEXT NOT NULL,
  filename TEXT NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- Indexes for performance
-- ============================================
CREATE INDEX IF NOT EXISTS contacts_client_id_idx ON contacts(client_id);
CREATE INDEX IF NOT EXISTS workflow_runs_client_id_idx ON workflow_runs(client_id);
CREATE INDEX IF NOT EXISTS workflow_runs_contact_id_idx ON workflow_runs(contact_id);
CREATE INDEX IF NOT EXISTS workflow_outputs_run_id_idx ON workflow_outputs(run_id);
CREATE INDEX IF NOT EXISTS uploaded_files_client_id_idx ON uploaded_files(client_id);
CREATE INDEX IF NOT EXISTS uploaded_files_run_id_idx ON uploaded_files(run_id);

-- ============================================
-- Row Level Security (RLS)
-- ============================================
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE workflow_runs ENABLE ROW LEVEL SECURITY;
ALTER TABLE workflow_outputs ENABLE ROW LEVEL SECURITY;
ALTER TABLE uploaded_files ENABLE ROW LEVEL SECURITY;

-- ============================================
-- Policies (allow all for now - using service role key)
-- ============================================
DROP POLICY IF EXISTS "Allow all on clients" ON clients;
CREATE POLICY "Allow all on clients" ON clients FOR ALL USING (true);

DROP POLICY IF EXISTS "Allow all on contacts" ON contacts;
CREATE POLICY "Allow all on contacts" ON contacts FOR ALL USING (true);

DROP POLICY IF EXISTS "Allow all on workflow_runs" ON workflow_runs;
CREATE POLICY "Allow all on workflow_runs" ON workflow_runs FOR ALL USING (true);

DROP POLICY IF EXISTS "Allow all on workflow_outputs" ON workflow_outputs;
CREATE POLICY "Allow all on workflow_outputs" ON workflow_outputs FOR ALL USING (true);

DROP POLICY IF EXISTS "Allow all on uploaded_files" ON uploaded_files;
CREATE POLICY "Allow all on uploaded_files" ON uploaded_files FOR ALL USING (true);

-- ============================================
-- Seed demo client
-- ============================================
INSERT INTO clients (slug, name, access_code)
VALUES ('demo', 'Demo Company', 'demo123')
ON CONFLICT (slug) DO NOTHING;

-- Verify tables created
SELECT
  'clients' as table_name, COUNT(*) as row_count FROM clients
UNION ALL
SELECT 'contacts', COUNT(*) FROM contacts
UNION ALL
SELECT 'workflow_runs', COUNT(*) FROM workflow_runs
UNION ALL
SELECT 'workflow_outputs', COUNT(*) FROM workflow_outputs
UNION ALL
SELECT 'uploaded_files', COUNT(*) FROM uploaded_files;
