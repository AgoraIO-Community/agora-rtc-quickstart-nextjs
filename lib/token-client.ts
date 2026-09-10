export type RtcTokenResponse = {
  appId: string;
  roomId: string;
  userAccount: string;
  token: string;
  expiresIn: number;
};

export async function requestRtcToken(
  roomId: string,
  identity: { displayName: string } | { userAccount: string },
  fetcher: typeof fetch = fetch,
): Promise<RtcTokenResponse> {
  const response = await fetcher('/api/token', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ roomId, ...identity }),
    cache: 'no-store',
  });
  const body = (await response.json()) as RtcTokenResponse | { error?: string };

  if (!response.ok || !('token' in body)) {
    throw new Error('error' in body && body.error ? body.error : 'Unable to issue an RTC token.');
  }

  return body;
}
