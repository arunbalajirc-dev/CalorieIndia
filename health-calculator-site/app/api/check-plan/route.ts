import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase';

export async function GET(req: NextRequest) {
  const email = req.nextUrl.searchParams.get('email');

  if (!email) {
    return NextResponse.json({ error: 'email required' }, { status: 400 });
  }

  try {
    const supabase = createServerClient();

    const { data, error } = await supabase
      .from('user_plans')
      .select('id, status, pdf_url')
      .eq('email', email)
      .eq('status', 'ready')
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error) throw error;

    return NextResponse.json({
      ready: !!data,
      downloadUrl: data?.pdf_url ?? null,
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Unknown error';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
