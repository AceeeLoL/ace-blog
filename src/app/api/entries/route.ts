import { NextRequest, NextResponse } from 'next/server';
import { getDiaryEntries, createDiaryEntry } from '@/lib/dataStore';

const ADMIN_SECRET_TOKEN = process.env.ADMIN_SECRET_TOKEN!;

export async function GET() {
  const entries = await getDiaryEntries();
  return NextResponse.json({ entries });
}

export async function POST(req: NextRequest) {
  const cookieToken = req.cookies.get('admin_token')?.value;
  const isAdmin = cookieToken === ADMIN_SECRET_TOKEN;

  if (!isAdmin) {
    return NextResponse.json({ error: 'Unauthorized. Only the owner can post entries.' }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { title, excerpt, content, category, mood, readTime, pinned } = body;

    if (!title || !content) {
      return NextResponse.json({ error: 'Title and content are required' }, { status: 400 });
    }

    const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');

    const newEntry = await createDiaryEntry({
      title,
      slug,
      excerpt: excerpt || content.substring(0, 120) + '...',
      content,
      date: new Date().toISOString(),
      category: category || 'Reflections',
      readTime: readTime || `${Math.max(1, Math.ceil(content.split(' ').length / 150))} min read`,
      mood: mood || { emoji: '☕', label: 'Cozy' },
      pinned: !!pinned,
    });

    return NextResponse.json({ success: true, entry: newEntry });
  } catch (error) {
    console.error('Error creating entry:', error);
    return NextResponse.json({ error: 'Failed to create entry' }, { status: 500 });
  }
}
