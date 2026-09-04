import { NextRequest, NextResponse } from 'next/server';
import { getVisitorQuestions, createVisitorQuestion } from '@/lib/dataStore';

export async function GET() {
  const questions = await getVisitorQuestions();
  return NextResponse.json({ questions });
}

export async function POST(req: NextRequest) {
  try {
    const { authorName, question, retention, visitorId } = await req.json();

    if (!question || question.trim().length === 0) {
      return NextResponse.json({ error: 'Question is required' }, { status: 400 });
    }

    if (retention && !['ephemeral_24h', 'permanent'].includes(retention)) {
      return NextResponse.json({ error: 'Invalid retention type' }, { status: 400 });
    }

    const newQuestion = await createVisitorQuestion(
      authorName || 'Anonymous',
      question,
      retention || 'ephemeral_24h',
      visitorId
    );

    return NextResponse.json({ success: true, question: newQuestion });
  } catch {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
