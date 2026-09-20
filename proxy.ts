import { NextRequest, NextResponse } from 'next/server';
import { callPath, entryCookieName, isEntryId, readCallEntry } from '@/lib/call-entry';
import { isValidChannelName } from '@/lib/channel-name';

export function proxy(request: NextRequest) {
  const channel = request.nextUrl.pathname.split('/')[2];
  if (!isValidChannelName(channel)) return NextResponse.next();
  const id = request.nextUrl.searchParams.get('entry');
  const documentRequest = request.method === 'GET' && request.headers.get('accept')?.includes('text/html') &&
    !request.headers.has('rsc') && !request.headers.has('next-router-prefetch') &&
    request.headers.get('purpose') !== 'prefetch';
  const name = documentRequest && isEntryId(id) ? readCallEntry(request.cookies.get(entryCookieName(id))?.value, channel) : null;
  const response = documentRequest && name
    ? NextResponse.next()
    : NextResponse.redirect(new URL(`/channel/${channel}`, request.url));
  response.headers.set('Cache-Control', 'private, no-store, max-age=0');
  if (documentRequest && isEntryId(id)) {
    // Set only the outgoing header: ResponseCookies would also merge the deletion
    // into Next's forwarded request, preventing the page from reading the entry.
    response.headers.append('Set-Cookie', `${entryCookieName(id)}=; Path=${callPath(channel)}; Max-Age=0; HttpOnly; SameSite=Lax${request.nextUrl.protocol === 'https:' ? '; Secure' : ''}`);
  }
  return response;
}

export const config = { matcher: '/channel/:channelName/call' };
