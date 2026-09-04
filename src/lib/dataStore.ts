import { getSupabase } from '@/lib/supabase';
import { DiaryEntry, VisitorQuestion } from '@/types';

export async function getDiaryEntries(): Promise<DiaryEntry[]> {
  const { data, error } = await getSupabase()
    .from('entries')
    .select('*')
    .order('pinned', { ascending: false })
    .order('date', { ascending: false });

  if (error) {
    console.error('Error fetching entries:', error);
    return [];
  }
  return data || [];
}

export async function createDiaryEntry(
  entryData: Omit<DiaryEntry, 'id' | 'reactions'>
): Promise<DiaryEntry> {
  const newEntry = {
    ...entryData,
    id: `entry-${Date.now()}`,
    reactions: { loved: 0, cozy: 0, thoughtful: 0, spark: 0 },
  };

  const { error } = await getSupabase().from('entries').insert(newEntry);
  if (error) {
    console.error('Error creating entry:', error);
  }
  return newEntry;
}

export async function deleteDiaryEntry(id: string): Promise<boolean> {
  const { error, count } = await getSupabase()
    .from('entries')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting entry:', error);
    return false;
  }
  return true;
}

export async function incrementReaction(
  entryId: string,
  reactionType: 'loved' | 'cozy' | 'thoughtful' | 'spark'
): Promise<DiaryEntry | null> {
  const { data: entry, error: fetchError } = await getSupabase()
    .from('entries')
    .select('*')
    .eq('id', entryId)
    .single();

  if (fetchError || !entry) {
    console.error('Error fetching entry for reaction:', fetchError);
    return null;
  }

  const reactions = entry.reactions || { loved: 0, cozy: 0, thoughtful: 0, spark: 0 };
  reactions[reactionType] = (reactions[reactionType] || 0) + 1;

  const { error: updateError } = await getSupabase()
    .from('entries')
    .update({ reactions })
    .eq('id', entryId);

  if (updateError) {
    console.error('Error updating reaction:', updateError);
    return null;
  }

  return { ...entry, reactions };
}

export async function getVisitorQuestions(): Promise<VisitorQuestion[]> {
  const nowISO = new Date().toISOString();

  const { data: allQuestions, error: fetchError } = await getSupabase()
    .from('questions')
    .select('*');

  if (fetchError) {
    console.error('Error fetching questions:', fetchError);
    return [];
  }

  const activeQuestions = (allQuestions || []).filter((q) => {
    if (q.retention === 'ephemeral_24h' && q.expiresAt) {
      return q.expiresAt > nowISO;
    }
    return true;
  });

  const expiredIds = (allQuestions || [])
    .filter((q) => q.retention === 'ephemeral_24h' && q.expiresAt && q.expiresAt <= nowISO)
    .map((q) => q.id);

  if (expiredIds.length > 0) {
    await getSupabase().from('questions').delete().in('id', expiredIds);
  }

  return activeQuestions.sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
}

export async function createVisitorQuestion(
  authorName: string,
  question: string,
  retention: 'ephemeral_24h' | 'permanent',
  visitorId?: string
): Promise<VisitorQuestion> {
  const createdAt = new Date();
  const expiresAt =
    retention === 'ephemeral_24h'
      ? new Date(createdAt.getTime() + 24 * 60 * 60 * 1000).toISOString()
      : null;

  const newQuestion: VisitorQuestion = {
    id: `q-${Date.now()}`,
    authorName: authorName.trim() || 'Anonymous Visitor',
    question: question.trim(),
    createdAt: createdAt.toISOString(),
    retention,
    expiresAt,
    visitorId: visitorId || undefined,
  };

  const { error } = await getSupabase().from('questions').insert(newQuestion);
  if (error) {
    console.error('Error creating question:', error);
  }
  return newQuestion;
}

export async function replyToQuestion(
  id: string,
  replyText: string
): Promise<VisitorQuestion | null> {
  const { data: question, error: fetchError } = await getSupabase()
    .from('questions')
    .select('*')
    .eq('id', id)
    .single();

  if (fetchError || !question) {
    console.error('Error fetching question:', fetchError);
    return null;
  }

  const { error: updateError } = await getSupabase()
    .from('questions')
    .update({
      adminReply: replyText,
      repliedAt: new Date().toISOString(),
    })
    .eq('id', id);

  if (updateError) {
    console.error('Error updating question:', updateError);
    return null;
  }

  return { ...question, adminReply: replyText, repliedAt: new Date().toISOString() };
}

export async function visitorSelfReply(
  id: string,
  replyText: string,
  visitorId: string
): Promise<VisitorQuestion | null> {
  const { data: question, error: fetchError } = await getSupabase()
    .from('questions')
    .select('*')
    .eq('id', id)
    .single();

  if (fetchError || !question) {
    console.error('Error fetching question:', fetchError);
    return null;
  }

  if (question.visitorId !== visitorId || question.visitorReply) {
    return null;
  }

  const { error: updateError } = await getSupabase()
    .from('questions')
    .update({
      visitorReply: replyText,
      visitorReplyAt: new Date().toISOString(),
    })
    .eq('id', id);

  if (updateError) {
    console.error('Error updating visitor reply:', updateError);
    return null;
  }

  return { ...question, visitorReply: replyText, visitorReplyAt: new Date().toISOString() };
}

export async function deleteVisitorQuestion(id: string): Promise<boolean> {
  const { error } = await getSupabase().from('questions').delete().eq('id', id);

  if (error) {
    console.error('Error deleting question:', error);
    return false;
  }
  return true;
}
