import { NextRequest, NextResponse } from 'next/server';
import { CALL_ENTRY_SECONDS, callPath, entryCookieName } from '@/lib/call-entry';
import { isValidChannelName } from '@/lib/channel-name';
import { isValidDisplayName, normalizeDisplayName } from '@/lib/rtc-identity';

export async function POST(request: NextRequest) {
  const headers = { 'Cache-Control': 'no-store' };
  let origin: URL | null = null;
  try { origin = new URL(request.headers.get('origin') ?? ''); } catch { /* Invalid origin. */ }
  // Next normalizes loopback URLs to localhost; compare the actual HTTP Host.
  if (!origin || !['http:', 'https:'].includes(origin.protocol) || origin.protocol !== request.nextUrl.protocol || origin.host !== request.headers.get('host')) {
    return NextResponse.json({ error: 'Invalid request origin.' }, { status: 403, headers });
  }
  if (request.headers.get('content-type')?.split(';')[0].trim() !== 'application/json') {
    return NextResponse.json({ error: 'Expected JSON.' }, { status: 415, headers });
  }
  let data;
  try { data = await request.json(); } catch {
    return NextResponse.json({ error: 'Invalid request body.' }, { status: 400, headers });
  }
  if (!data || !isValidChannelName(data.channelName) || !isValidDisplayName(data.displayName)) {
    return NextResponse.json({ error: 'Invalid channel or display name.' }, { status: 400, headers });
  }
  const id = crypto.randomUUID().replaceAll('-', '');
  const path = callPath(data.channelName);
  const response = NextResponse.json({ url: `${path}?entry=${id}` }, { headers });
  response.cookies.set(entryCookieName(id), JSON.stringify({
    channelName: data.channelName, displayName: normalizeDisplayName(data.displayName),
    expiresAt: Date.now() + CALL_ENTRY_SECONDS * 1000,
  }), { httpOnly: true, sameSite: 'lax', secure: origin.protocol === 'https:', path, maxAge: CALL_ENTRY_SECONDS });
  return response;
}
