import { NextRequest, NextResponse } from 'next/server';
import { deleteVisitorQuestion } from '@/lib/dataStore';

const ADMIN_SECRET_TOKEN = process.env.ADMIN_SECRET_TOKEN!;

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
  const deleted = await deleteVisitorQuestion(id);
  if (deleted) {
    return NextResponse.json({ success: true });
  }
  return NextResponse.json({ error: 'Question not found' }, { status: 404 });
}
