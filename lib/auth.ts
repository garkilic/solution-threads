import { supabase } from './supabase';

export interface Client {
  id: string;
  slug: string;
  name: string;
  access_code: string;
  created_at: string;
}

export async function validateAccessCode(slug: string, code: string): Promise<boolean> {
  const { data, error } = await supabase
    .from('clients')
    .select('id')
    .eq('slug', slug)
    .eq('access_code', code)
    .single();

  return !error && !!data;
}

export async function getClientBySlug(slug: string): Promise<Client | null> {
  const { data, error } = await supabase
    .from('clients')
    .select('*')
    .eq('slug', slug)
    .single();

  if (error || !data) return null;
  return data as Client;
}
