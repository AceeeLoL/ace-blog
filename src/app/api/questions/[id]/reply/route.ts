import { NextRequest, NextResponse } from 'next/server';
import { replyToQuestion } from '@/lib/dataStore';

const ADMIN_SECRET_TOKEN = process.env.ADMIN_SECRET_TOKEN!;

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const cookieToken = req.cookies.get('admin_token')?.value;
  const isAdmin = cookieToken === ADMIN_SECRET_TOKEN;

  if (!isAdmin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { replyText } = await req.json();
    if (!replyText || replyText.trim().length === 0) {
      return NextResponse.json({ error: 'Reply text is required' }, { status: 400 });
    }

    const { id } = await params;
    const updated = await replyToQuestion(id, replyText);
    if (updated) {
      return NextResponse.json({ success: true, question: updated });
    }
    return NextResponse.json({ error: 'Question not found' }, { status: 404 });
  } catch {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
