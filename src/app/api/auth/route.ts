import { NextRequest, NextResponse } from 'next/server';

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'earth2026';
const ADMIN_SECRET_TOKEN = process.env.ADMIN_SECRET_TOKEN!;

export async function POST(req: NextRequest) {
  try {
    const { password } = await req.json();
    if (password === ADMIN_PASSWORD) {
      const response = NextResponse.json({ success: true });
      response.cookies.set('admin_token', ADMIN_SECRET_TOKEN, {
        httpOnly: true,
        path: '/',
        maxAge: 60 * 60 * 24 * 7, // 7 days
        sameSite: 'lax',
      });
      return response;
    }
    return NextResponse.json({ success: false, message: 'Invalid password' }, { status: 401 });
  } catch {
    return NextResponse.json({ success: false, message: 'Server error' }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  const cookieToken = req.cookies.get('admin_token')?.value;
  const isAdmin = cookieToken === ADMIN_SECRET_TOKEN;
  return NextResponse.json({ isAdmin });
}

export async function DELETE() {
  const response = NextResponse.json({ success: true, message: 'Logged out' });
  response.cookies.delete('admin_token');
  return response;
}
