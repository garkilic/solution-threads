-- ============================================================
-- RLS Security Migration
-- Run this in your Supabase SQL Editor AFTER initial setup.
--
-- Replaces the "allow all" policies with properly scoped ones.
-- The service-role key (used by server-side API routes) bypasses
-- RLS entirely, so these policies protect against accidental
-- exposure via the anon/public key.
-- ============================================================

-- ── clients ─────────────────────────────────────────────────
-- Only the service role should read/write clients.
-- Anon key gets no access at all.

DROP POLICY IF EXISTS "Allow all on clients" ON clients;

CREATE POLICY "Service role only on clients"
  ON clients
  FOR ALL
  USING (auth.role() = 'service_role');


-- ── contacts ────────────────────────────────────────────────
-- Readable/writable only for the owning client_id.
-- We embed the client UUID in the session and validate server-side,
-- so the anon key should not be used for direct DB access here.

DROP POLICY IF EXISTS "Allow all on contacts" ON contacts;

CREATE POLICY "Service role only on contacts"
  ON contacts
  FOR ALL
  USING (auth.role() = 'service_role');


-- ── workflow_runs ────────────────────────────────────────────

DROP POLICY IF EXISTS "Allow all on workflow_runs" ON workflow_runs;

CREATE POLICY "Service role only on workflow_runs"
  ON workflow_runs
  FOR ALL
  USING (auth.role() = 'service_role');


-- ── workflow_outputs ─────────────────────────────────────────

DROP POLICY IF EXISTS "Allow all on workflow_outputs" ON workflow_outputs;

CREATE POLICY "Service role only on workflow_outputs"
  ON workflow_outputs
  FOR ALL
  USING (auth.role() = 'service_role');


-- ── uploaded_files ───────────────────────────────────────────

DROP POLICY IF EXISTS "Allow all on uploaded_files" ON uploaded_files;

CREATE POLICY "Service role only on uploaded_files"
  ON uploaded_files
  FOR ALL
  USING (auth.role() = 'service_role');


-- ── book_projects (if table exists) ──────────────────────────

DO $$
BEGIN
  IF EXISTS (
    SELECT FROM information_schema.tables
    WHERE table_name = 'book_projects'
  ) THEN
    EXECUTE 'DROP POLICY IF EXISTS "Allow all on book_projects" ON book_projects';
    EXECUTE $p$
      CREATE POLICY "Service role only on book_projects"
        ON book_projects
        FOR ALL
        USING (auth.role() = ''service_role'')
    $p$;
  END IF;
END $$;


-- ── book_chapters (if table exists) ──────────────────────────

DO $$
BEGIN
  IF EXISTS (
    SELECT FROM information_schema.tables
    WHERE table_name = 'book_chapters'
  ) THEN
    EXECUTE 'DROP POLICY IF EXISTS "Allow all on book_chapters" ON book_chapters';
    EXECUTE $p$
      CREATE POLICY "Service role only on book_chapters"
        ON book_chapters
        FOR ALL
        USING (auth.role() = ''service_role'')
    $p$;
  END IF;
END $$;


-- ── Verify ───────────────────────────────────────────────────
SELECT
  schemaname,
  tablename,
  policyname,
  cmd,
  qual
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, policyname;
