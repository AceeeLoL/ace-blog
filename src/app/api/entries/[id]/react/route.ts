import { NextRequest, NextResponse } from 'next/server';
import { incrementReaction } from '@/lib/dataStore';

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { reactionType } = await req.json();
    if (!['loved', 'cozy', 'thoughtful', 'spark'].includes(reactionType)) {
      return NextResponse.json({ error: 'Invalid reaction type' }, { status: 400 });
    }

    const { id } = await params;
    const updated = await incrementReaction(id, reactionType);
    if (updated) {
      return NextResponse.json({ success: true, reactions: updated.reactions });
    }
    return NextResponse.json({ error: 'Entry not found' }, { status: 404 });
  } catch {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
