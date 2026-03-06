import { supabase } from './supabase';

export interface Submission {
  id: string;
  task_id: string;
  user_id: string;
  before_photo_url: string;
  after_photo_url: string;
  notes: string | null;
  status: 'pending' | 'approved' | 'rejected';
  reviewed_at: string | null;
  created_at: string;
}

export async function uploadPhoto(
  userId: string,
  taskId: string,
  uri: string,
  type: 'before' | 'after'
): Promise<string> {
  const fileName = `${userId}/${taskId}/${type}_${Date.now()}.jpg`;

  const response = await fetch(uri);
  const blob = await response.blob();

  const { error: uploadError } = await supabase.storage
    .from('task-photos')
    .upload(fileName, blob, {
      contentType: 'image/jpeg',
      upsert: true,
    });

  if (uploadError) throw uploadError;

  const { data } = supabase.storage
    .from('task-photos')
    .getPublicUrl(fileName);

  return data.publicUrl;
}

export async function createSubmission(
  taskId: string,
  userId: string,
  beforePhotoUrl: string,
  afterPhotoUrl: string,
  notes?: string
): Promise<Submission> {
  const { data, error } = await supabase
    .from('submissions')
    .insert({
      task_id: taskId,
      user_id: userId,
      before_photo_url: beforePhotoUrl,
      after_photo_url: afterPhotoUrl,
      notes: notes || null,
    })
    .select()
    .single();

  if (error) throw error;
  return data as Submission;
}

export async function fetchUserSubmissions(userId: string): Promise<Submission[]> {
  const { data, error } = await supabase
    .from('submissions')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data as Submission[];
}
