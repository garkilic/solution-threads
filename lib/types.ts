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

// Book / Storytelling types
export interface ChapterOutlineItem {
  number: number;
  title: string;
  theme: string;
  keyCharacters: string[];
}

export interface BookProject {
  id: string;
  client_id: string;
  title: string;
  subject_name: string;
  art_style: string;
  target_age: string;
  ancestry_data?: string;
  oral_history?: string;
  chapter_outline?: ChapterOutlineItem[];
  character_guide?: string;
  created_at: string;
}

export interface BookChapter {
  id: string;
  project_id: string;
  chapter_number: number;
  title?: string;
  narrative?: string;
  illustration_prompt?: string;
  image_url?: string;
  status: 'draft' | 'approved' | 'revision_requested';
  feedback?: string;
  created_at: string;
  approved_at?: string;
}
