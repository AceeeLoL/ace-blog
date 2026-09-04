import { NextRequest, NextResponse } from 'next/server';
import { visitorSelfReply } from '@/lib/dataStore';

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { replyText, visitorId } = await req.json();

    if (!replyText || !replyText.trim()) {
      return NextResponse.json({ error: 'Reply text is required' }, { status: 400 });
    }

    if (!visitorId) {
      return NextResponse.json({ error: 'Visitor ID is required' }, { status: 400 });
    }

    const { id } = await params;
    const updated = await visitorSelfReply(id, replyText.trim(), visitorId);

    if (updated) {
      return NextResponse.json({ success: true, question: updated });
    }

    return NextResponse.json({ error: 'Not authorized or already replied' }, { status: 403 });
  } catch {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
