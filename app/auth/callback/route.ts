import { NextResponse, type NextRequest } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get('code');
  if (code) {
    const supabase = await createServerSupabaseClient();
    await supabase.auth.exchangeCodeForSession(code);
  }
  // Preserve the host that initiated OAuth (localhost in local development,
  // the deployed host in production) instead of using a fixed site URL.
  return NextResponse.redirect(new URL('/', request.nextUrl.origin));
}
