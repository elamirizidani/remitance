import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

// Routes that require an authenticated session
// NOTE: /api/quote is intentionally PUBLIC — guests need it for the homepage widget
const PROTECTED_API = ['/api/transfers', '/api/users', '/api/recipients', '/api/kyc'];
// Webhook routes bypass all auth — Stripe/Pawapay send raw bodies, no cookies
const WEBHOOK_ROUTES = ['/api/webhooks'];

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Never touch webhook routes
  if (WEBHOOK_ROUTES.some(r => pathname.startsWith(r))) {
    return NextResponse.next();
  }

  let response = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // Refresh the session token
  const { data: { user } } = await supabase.auth.getUser();

  // Block unauthenticated access to protected API routes
  if (PROTECTED_API.some(r => pathname.startsWith(r)) && !user) {
    return NextResponse.json({ error: 'Unauthorized', code: 'UNAUTHENTICATED' }, { status: 401 });
  }

  return response;
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
