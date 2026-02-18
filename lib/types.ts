// Client contact types
export interface Client {
  name: string;
  company: string;
  title?: string;
  email?: string;
}

// Workflow output types
export interface KeyStats {
  aum: string;
  tenure: string;
  ytdReturn: string;
  keyAsk: string;
}

export interface BriefingSections {
  portfolioSummary: string[];
  relationshipHistory: string[];
  accountStatus: string[];
  recentCommunications: string[];
  meetingAgenda: string[];
}

export interface WorkflowOutput {
  id: string;
  clientName: string;
  company: string;
  context?: string;
  createdAt: string;
  keyStats?: KeyStats;
  sections: BriefingSections;
}

// Supabase database types
export interface DbClient {
  id: string;
  slug: string;
  name: string;
  access_code: string;
  created_at: string;
}

export interface DbContact {
  id: string;
  client_id: string;
  name: string;
  company: string;
  title?: string;
  email?: string;
  created_at: string;
}

export interface DbWorkflowRun {
  id: string;
  client_id: string;
  contact_id?: string;
  context?: string;
  status: string;
  created_at: string;
  completed_at?: string;
}

export interface DbWorkflowOutput {
  id: string;
  run_id: string;
  key_stats?: KeyStats;
  sections: BriefingSections;
  created_at: string;
}

export interface DbUploadedFile {
  id: string;
  client_id: string;
  run_id?: string;
  source: string;
  filename: string;
  content: string;
  created_at: string;
}
