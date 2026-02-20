// Server-only storage functions (book/storytelling + admin).
// Uses the service role key so these only work in API routes, never client components.
import { createServerClient } from './supabase-server';
import { BookProject, BookChapter, ChapterOutlineItem, Client, WorkflowOutput, KeyStats, BriefingSections } from './types';

function db() {
  return createServerClient();
}

// ============================================
// Book Projects
// ============================================

export async function createBookProject(
  clientId: string,
  data: {
    title: string;
    subjectName: string;
    artStyle: string;
    targetAge: string;
    ancestryData?: string;
    oralHistory?: string;
    chapterOutline?: ChapterOutlineItem[];
  }
): Promise<string> {
  const { data: row, error } = await db()
    .from('book_projects')
    .insert({
      client_id: clientId,
      title: data.title,
      subject_name: data.subjectName,
      art_style: data.artStyle,
      target_age: data.targetAge,
      ancestry_data: data.ancestryData || null,
      oral_history: data.oralHistory || null,
      chapter_outline: data.chapterOutline || null,
    })
    .select('id')
    .single();

  if (error || !row) {
    console.error('Error creating book project:', error);
    throw new Error('Failed to create book project');
  }

  return row.id;
}

export async function updateBookProjectOutline(
  projectId: string,
  outline: ChapterOutlineItem[],
  characterGuide: string
): Promise<void> {
  const { error } = await db()
    .from('book_projects')
    .update({ chapter_outline: outline, character_guide: characterGuide })
    .eq('id', projectId);

  if (error) console.error('Error updating book project outline:', error);
}

export async function getBookProject(projectId: string): Promise<BookProject | null> {
  const { data, error } = await db()
    .from('book_projects')
    .select('*')
    .eq('id', projectId)
    .single();

  if (error || !data) return null;
  return data as BookProject;
}

export async function getBookProjects(clientId: string): Promise<BookProject[]> {
  const { data, error } = await db()
    .from('book_projects')
    .select('*')
    .eq('client_id', clientId)
    .order('created_at', { ascending: false });

  if (error) return [];
  return (data || []) as BookProject[];
}

// ============================================
// Book Chapters
// ============================================

export async function getBookChapters(projectId: string): Promise<BookChapter[]> {
  const { data, error } = await db()
    .from('book_chapters')
    .select('*')
    .eq('project_id', projectId)
    .order('chapter_number', { ascending: true });

  if (error) return [];
  return (data || []) as BookChapter[];
}

export async function saveBookChapter(
  projectId: string,
  chapterNumber: number,
  data: {
    title?: string;
    narrative?: string;
    illustrationPrompt?: string;
    imageUrl?: string;
  }
): Promise<string> {
  const { data: existing } = await db()
    .from('book_chapters')
    .select('id')
    .eq('project_id', projectId)
    .eq('chapter_number', chapterNumber)
    .maybeSingle();

  if (existing) {
    await db()
      .from('book_chapters')
      .update({
        title: data.title || null,
        narrative: data.narrative || null,
        illustration_prompt: data.illustrationPrompt || null,
        image_url: data.imageUrl || null,
        status: 'draft',
      })
      .eq('id', existing.id);
    return existing.id;
  }

  const { data: row, error } = await db()
    .from('book_chapters')
    .insert({
      project_id: projectId,
      chapter_number: chapterNumber,
      title: data.title || null,
      narrative: data.narrative || null,
      illustration_prompt: data.illustrationPrompt || null,
      image_url: data.imageUrl || null,
      status: 'draft',
    })
    .select('id')
    .single();

  if (error || !row) throw new Error('Failed to save book chapter');
  return row.id;
}

export async function updateChapterStatus(
  chapterId: string,
  status: 'draft' | 'approved' | 'revision_requested',
  feedback?: string
): Promise<void> {
  const update: Record<string, unknown> = { status };
  if (feedback !== undefined) update.feedback = feedback;
  if (status === 'approved') update.approved_at = new Date().toISOString();

  await db().from('book_chapters').update(update).eq('id', chapterId);
}

// ============================================
// Meeting Prep — Contacts
// ============================================

export async function getMeetingPrepClients(clientId: string): Promise<Client[]> {
  if (!clientId) return [];
  const { data, error } = await db()
    .from('contacts')
    .select('*')
    .eq('client_id', clientId)
    .order('created_at', { ascending: false });
  if (error) return [];
  return (data || []).map((c: Record<string, string>) => ({
    name: c.name,
    company: c.company,
    title: c.title || undefined,
    email: c.email || undefined,
  }));
}

export async function saveMeetingPrepClients(clientId: string, clients: Client[]): Promise<void> {
  if (!clientId || !clients.length) return;
  await db().from('contacts').delete().eq('client_id', clientId);
  const contacts = clients.map((c) => ({
    client_id: clientId,
    name: c.name,
    company: c.company,
    title: c.title || null,
    email: c.email || null,
  }));
  const { error } = await db().from('contacts').insert(contacts);
  if (error) throw new Error('Failed to save contacts');
}

// ============================================
// Meeting Prep — Outputs
// ============================================

export async function getMeetingPrepOutputs(clientId: string): Promise<WorkflowOutput[]> {
  if (!clientId) return [];
  const { data, error } = await db()
    .from('workflow_runs')
    .select(`
      id,
      context,
      created_at,
      contacts!workflow_runs_contact_id_fkey (
        name,
        company
      ),
      workflow_outputs (
        key_stats,
        sections
      )
    `)
    .eq('client_id', clientId)
    .eq('status', 'completed')
    .order('created_at', { ascending: false });
  if (error) return [];
  return (data || []).map((run: Record<string, unknown>) => {
    const contact = Array.isArray(run.contacts) ? run.contacts[0] : run.contacts as Record<string, string>;
    const output = Array.isArray(run.workflow_outputs) ? run.workflow_outputs[0] : run.workflow_outputs as Record<string, unknown>;
    return {
      id: run.id as string,
      clientName: contact?.name || 'Unknown',
      company: contact?.company || 'Unknown',
      context: (run.context as string) || undefined,
      createdAt: run.created_at as string,
      keyStats: output?.key_stats as KeyStats | undefined,
      sections: (output?.sections || {
        portfolioSummary: [],
        relationshipHistory: [],
        accountStatus: [],
        recentCommunications: [],
        meetingAgenda: [],
      }) as BriefingSections,
    };
  });
}

export async function getMeetingPrepOutput(runId: string): Promise<WorkflowOutput | null> {
  if (!runId) return null;
  const { data, error } = await db()
    .from('workflow_runs')
    .select(`
      id,
      context,
      created_at,
      client_id,
      contacts!workflow_runs_contact_id_fkey (
        name,
        company
      ),
      workflow_outputs (
        key_stats,
        sections
      )
    `)
    .eq('id', runId)
    .single();
  if (error || !data) return null;
  const contact = Array.isArray(data.contacts) ? data.contacts[0] : data.contacts as Record<string, string>;
  const output = Array.isArray(data.workflow_outputs) ? data.workflow_outputs[0] : data.workflow_outputs as Record<string, unknown>;
  return {
    id: data.id,
    clientName: contact?.name || 'Unknown',
    company: contact?.company || 'Unknown',
    context: (data.context as string) || undefined,
    createdAt: data.created_at,
    keyStats: output?.key_stats as KeyStats | undefined,
    sections: (output?.sections || {
      portfolioSummary: [],
      relationshipHistory: [],
      accountStatus: [],
      recentCommunications: [],
      meetingAgenda: [],
    }) as BriefingSections,
  };
}

export async function saveMeetingPrepOutput(
  clientId: string,
  contactName: string,
  contactCompany: string,
  context: string | undefined,
  keyStats: KeyStats | undefined,
  sections: BriefingSections
): Promise<string> {
  if (!clientId) throw new Error('Client ID required');

  // Find or create contact
  let contactId: string | null = null;
  const { data: existing } = await db()
    .from('contacts')
    .select('id')
    .eq('client_id', clientId)
    .eq('name', contactName)
    .eq('company', contactCompany)
    .limit(1);

  if (existing && existing.length > 0) {
    contactId = existing[0].id;
  } else {
    const { data: newContact, error: contactError } = await db()
      .from('contacts')
      .insert({ client_id: clientId, name: contactName, company: contactCompany })
      .select('id')
      .single();
    if (contactError || !newContact) throw new Error('Failed to create contact');
    contactId = newContact.id;
  }

  // Create workflow run
  const { data: run, error: runError } = await db()
    .from('workflow_runs')
    .insert({
      client_id: clientId,
      contact_id: contactId,
      context: context || null,
      status: 'completed',
      completed_at: new Date().toISOString(),
    })
    .select('id')
    .single();
  if (runError || !run) throw new Error('Failed to create workflow run');

  // Save output
  const { error: outputError } = await db()
    .from('workflow_outputs')
    .insert({ run_id: run.id, key_stats: keyStats || null, sections });
  if (outputError) throw new Error('Failed to save workflow output');

  return run.id;
}

// ============================================
// Admin — Cross-client stats
// ============================================

export interface AdminClientStat {
  id: string;
  slug: string;
  name: string;
  createdAt: string;
  meetingPrepRuns: number;
  bookProjects: number;
  lastActiveAt: string | null;
}

export interface AdminActivity {
  type: 'meeting_prep' | 'book_project';
  clientName: string;
  clientSlug: string;
  description: string;
  createdAt: string;
}

export async function getAdminStats(): Promise<{
  clients: AdminClientStat[];
  recentActivity: AdminActivity[];
  totalRuns: number;
  totalBooks: number;
}> {
  const supabase = db();

  const [{ data: clients }, { data: runs }, { data: books }] = await Promise.all([
    supabase.from('clients').select('id, slug, name, created_at').order('created_at', { ascending: false }),
    supabase.from('workflow_runs').select('id, client_id, created_at, contacts!workflow_runs_contact_id_fkey(name, company)').eq('status', 'completed').order('created_at', { ascending: false }),
    supabase.from('book_projects').select('id, client_id, title, subject_name, created_at').order('created_at', { ascending: false }),
  ]);

  const clientsData = (clients || []) as { id: string; slug: string; name: string; created_at: string }[];
  const runsData = (runs || []) as { id: string; client_id: string; created_at: string; contacts: { name: string; company: string } | { name: string; company: string }[] | null }[];
  const booksData = (books || []) as { id: string; client_id: string; title: string; subject_name: string; created_at: string }[];

  const clientMap = Object.fromEntries(clientsData.map((c) => [c.id, c]));

  const clientStats: AdminClientStat[] = clientsData.map((c) => {
    const clientRuns = runsData.filter((r) => r.client_id === c.id);
    const clientBooks = booksData.filter((b) => b.client_id === c.id);
    const allDates = [...clientRuns.map((r) => r.created_at), ...clientBooks.map((b) => b.created_at)].sort().reverse();
    return {
      id: c.id,
      slug: c.slug,
      name: c.name,
      createdAt: c.created_at,
      meetingPrepRuns: clientRuns.length,
      bookProjects: clientBooks.length,
      lastActiveAt: allDates[0] || null,
    };
  });

  const runActivities: AdminActivity[] = runsData.map((r) => {
    const contact = Array.isArray(r.contacts) ? r.contacts[0] : r.contacts;
    const client = clientMap[r.client_id];
    return {
      type: 'meeting_prep',
      clientName: client?.name || r.client_id,
      clientSlug: client?.slug || r.client_id,
      description: contact ? `${contact.name} · ${contact.company}` : 'Unknown contact',
      createdAt: r.created_at,
    };
  });

  const bookActivities: AdminActivity[] = booksData.map((b) => {
    const client = clientMap[b.client_id];
    return {
      type: 'book_project',
      clientName: client?.name || b.client_id,
      clientSlug: client?.slug || b.client_id,
      description: `"${b.title}" · ${b.subject_name}`,
      createdAt: b.created_at,
    };
  });

  const recentActivity = [...runActivities, ...bookActivities]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 30);

  return {
    clients: clientStats,
    recentActivity,
    totalRuns: runsData.length,
    totalBooks: booksData.length,
  };
}
