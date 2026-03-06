import { supabase } from './supabase';

export type EffortLevel = 'easy' | 'medium' | 'hard';
export type TaskStatus = 'open' | 'in_progress' | 'completed' | 'expired';

export interface Task {
  id: string;
  created_by: string;
  title: string;
  description: string;
  latitude: number;
  longitude: number;
  location_name: string | null;
  effort: EffortLevel;
  reward_points: number;
  estimated_minutes: number;
  status: TaskStatus;
  claimed_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface CreateTaskInput {
  title: string;
  description: string;
  latitude: number;
  longitude: number;
  location_name?: string;
  effort: EffortLevel;
  reward_points: number;
  estimated_minutes: number;
}

export async function fetchOpenTasks(): Promise<Task[]> {
  const { data, error } = await supabase
    .from('tasks')
    .select('*')
    .in('status', ['open', 'in_progress'])
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data as Task[];
}

export async function fetchTaskById(id: string): Promise<Task> {
  const { data, error } = await supabase
    .from('tasks')
    .select('*')
    .eq('id', id)
    .single();

  if (error) throw error;
  return data as Task;
}

export async function createTask(userId: string, input: CreateTaskInput): Promise<Task> {
  const { data, error } = await supabase
    .from('tasks')
    .insert({ ...input, created_by: userId })
    .select()
    .single();

  if (error) throw error;
  return data as Task;
}

export async function claimTask(taskId: string, userId: string): Promise<void> {
  const { error } = await supabase
    .from('tasks')
    .update({ status: 'in_progress', claimed_by: userId })
    .eq('id', taskId)
    .eq('status', 'open');

  if (error) throw error;
}
