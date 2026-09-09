import { NextRequest, NextResponse } from 'next/server';
import { deleteDiaryEntry, updateDiaryEntry } from '@/lib/dataStore';

const ADMIN_SECRET_TOKEN = process.env.ADMIN_SECRET_TOKEN!;

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const cookieToken = req.cookies.get('admin_token')?.value;
  const isAdmin = cookieToken === ADMIN_SECRET_TOKEN;

  if (!isAdmin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { id } = await params;
    const body = await req.json();
    const { title, excerpt, content, category, pinned } = body;

    if (!title || !content) {
      return NextResponse.json({ error: 'Title and content are required' }, { status: 400 });
    }

    const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');

    const updateFields: Record<string, any> = {
      title,
      slug,
      excerpt: excerpt || content.substring(0, 120) + '...',
      content,
      category: category || 'Reflections',
    };

    if (typeof pinned !== 'undefined') {
      updateFields.pinned = !!pinned;
    }

    const updatedEntry = await updateDiaryEntry(id, updateFields);

    if (!updatedEntry) {
      return NextResponse.json({ error: 'Entry not found or update failed' }, { status: 404 });
    }

    return NextResponse.json({ success: true, entry: updatedEntry });
  } catch (error) {
    console.error('Error updating entry:', error);
    return NextResponse.json({ error: 'Failed to update entry' }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const cookieToken = req.cookies.get('admin_token')?.value;
  const isAdmin = cookieToken === ADMIN_SECRET_TOKEN;

  if (!isAdmin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await params;
  const deleted = await deleteDiaryEntry(id);
  if (deleted) {
    return NextResponse.json({ success: true });
  }
  return NextResponse.json({ error: 'Entry not found' }, { status: 404 });
}
