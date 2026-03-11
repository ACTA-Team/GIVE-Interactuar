import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { createServerSupabaseClient } from '@/lib/supabase/server';

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);

  if (!body?.email || !body?.password || !body?.name) {
    return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
  }

  const { email, password, name } = body as {
    email: string;
    password: string;
    name: string;
  };

  const hash = await bcrypt.hash(password, 12);
  const supabase = await createServerSupabaseClient();

  const { error } = await supabase
    .from('users' as never)
    .insert({ email, password: hash, name } as never);

  if (error) {
    const pgError = error as { code?: string };
    if (pgError.code === '23505') {
      return NextResponse.json(
        { error: 'Email already registered' },
        { status: 409 },
      );
    }
    return NextResponse.json({ error: 'Registration failed' }, { status: 500 });
  }

  return NextResponse.json({ success: true }, { status: 201 });
}
