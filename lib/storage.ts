import { supabase } from './supabase';
import { Client, WorkflowOutput, KeyStats, BriefingSections } from './types';

// ============================================
// Contacts (Client List)
// ============================================

export async function getClients(clientId: string): Promise<Client[]> {
  if (!clientId) return [];

  const { data, error } = await supabase
    .from('contacts')
    .select('*')
    .eq('client_id', clientId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching clients:', error);
    return [];
  }

  return (data || []).map(contact => ({
    name: contact.name,
    company: contact.company,
    title: contact.title || undefined,
    email: contact.email || undefined,
  }));
}

export async function saveClients(clientId: string, clients: Client[]): Promise<void> {
  if (!clientId || !clients.length) return;

  // First, delete existing contacts for this client
  await supabase
    .from('contacts')
    .delete()
    .eq('client_id', clientId);

  // Then insert new contacts
  const contacts = clients.map(client => ({
    client_id: clientId,
    name: client.name,
    company: client.company,
    title: client.title || null,
    email: client.email || null,
  }));

  const { error } = await supabase
    .from('contacts')
    .insert(contacts);

  if (error) {
    console.error('Error saving clients:', error);
    throw new Error('Failed to save clients');
  }
}

// ============================================
// Workflow Outputs
// ============================================

export async function getOutputs(clientId: string): Promise<WorkflowOutput[]> {
  if (!clientId) return [];

  const { data, error } = await supabase
    .from('workflow_runs')
    .select(`
      id,
      context,
      created_at,
      completed_at,
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

  if (error) {
    console.error('Error fetching outputs:', error);
    return [];
  }

  return (data || []).map(run => {
    const contact = Array.isArray(run.contacts) ? run.contacts[0] : run.contacts;
    const output = Array.isArray(run.workflow_outputs) ? run.workflow_outputs[0] : run.workflow_outputs;

    return {
      id: run.id,
      clientName: contact?.name || 'Unknown',
      company: contact?.company || 'Unknown',
      context: run.context || undefined,
      createdAt: run.created_at,
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

export async function saveOutput(
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
  const { data: existingContacts } = await supabase
    .from('contacts')
    .select('id')
    .eq('client_id', clientId)
    .eq('name', contactName)
    .eq('company', contactCompany)
    .limit(1);

  if (existingContacts && existingContacts.length > 0) {
    contactId = existingContacts[0].id;
  } else {
    const { data: newContact, error: contactError } = await supabase
      .from('contacts')
      .insert({
        client_id: clientId,
        name: contactName,
        company: contactCompany,
      })
      .select('id')
      .single();

    if (contactError) {
      console.error('Error creating contact:', contactError);
      throw new Error('Failed to create contact');
    }
    contactId = newContact.id;
  }

  // Create workflow run
  const { data: run, error: runError } = await supabase
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

  if (runError || !run) {
    console.error('Error creating workflow run:', runError);
    throw new Error('Failed to create workflow run');
  }

  // Save workflow output
  const { error: outputError } = await supabase
    .from('workflow_outputs')
    .insert({
      run_id: run.id,
      key_stats: keyStats || null,
      sections: sections,
    });

  if (outputError) {
    console.error('Error saving workflow output:', outputError);
    throw new Error('Failed to save workflow output');
  }

  return run.id;
}

export async function getOutput(runId: string): Promise<WorkflowOutput | null> {
  if (!runId) return null;

  const { data, error } = await supabase
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
    .eq('id', runId)
    .single();

  if (error || !data) {
    console.error('Error fetching output:', error);
    return null;
  }

  const contact = Array.isArray(data.contacts) ? data.contacts[0] : data.contacts;
  const output = Array.isArray(data.workflow_outputs) ? data.workflow_outputs[0] : data.workflow_outputs;

  return {
    id: data.id,
    clientName: contact?.name || 'Unknown',
    company: contact?.company || 'Unknown',
    context: data.context || undefined,
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

// ============================================
// Uploaded Files
// ============================================

export async function saveUploadedFile(
  clientId: string,
  source: string,
  filename: string,
  content: string,
  runId?: string
): Promise<void> {
  if (!clientId) return;

  const { error } = await supabase
    .from('uploaded_files')
    .insert({
      client_id: clientId,
      run_id: runId || null,
      source,
      filename,
      content,
    });

  if (error) {
    console.error('Error saving uploaded file:', error);
    throw new Error('Failed to save uploaded file');
  }
}

export async function getUploadedFiles(clientId: string, source?: string): Promise<Array<{
  id: string;
  source: string;
  filename: string;
  content: string;
  created_at: string;
}>> {
  if (!clientId) return [];

  let query = supabase
    .from('uploaded_files')
    .select('*')
    .eq('client_id', clientId)
    .order('created_at', { ascending: false });

  if (source) {
    query = query.eq('source', source);
  }

  const { data, error } = await query;

  if (error) {
    console.error('Error fetching uploaded files:', error);
    return [];
  }

  return data || [];
}
