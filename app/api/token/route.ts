import { buildRtcToken, TOKEN_EXPIRATION_SECONDS } from '@/lib/token';
import { isValidChannelName } from '@/lib/channel-name';
import {
  createRtcUserAccount,
  isValidDisplayName,
  isValidRtcUserAccount,
  normalizeDisplayName,
} from '@/lib/rtc-identity';

export const runtime = 'nodejs';

const NO_STORE_HEADERS = {
  'Cache-Control': 'no-store',
};

function json(body: unknown, status = 200): Response {
  return Response.json(body, { status, headers: NO_STORE_HEADERS });
}

export async function POST(request: Request): Promise<Response> {
  const appId = process.env.NEXT_PUBLIC_AGORA_APP_ID;
  const appCertificate = process.env.NEXT_AGORA_APP_CERTIFICATE;

  if (!appId || !appCertificate) {
    return json({ error: 'Agora credentials are not configured.' }, 500);
  }

  let payload: { channelName?: unknown; displayName?: unknown; userAccount?: unknown };
  try {
    payload = (await request.json()) as typeof payload;
  } catch {
    return json({ error: 'Request body must be valid JSON.' }, 400);
  }

  const initialRequest = payload.userAccount === undefined && isValidDisplayName(payload.displayName);
  const renewalRequest = payload.displayName === undefined && isValidRtcUserAccount(payload.userAccount);

  if (!isValidChannelName(payload.channelName) || (!initialRequest && !renewalRequest)) {
    return json({ error: 'Invalid channel name or participant identity.' }, 400);
  }

  const userAccount = renewalRequest
    ? (payload.userAccount as string)
    : createRtcUserAccount(normalizeDisplayName(payload.displayName as string));

  try {
    const token = buildRtcToken({
      appId,
      appCertificate,
      channelName: payload.channelName,
      userAccount,
    });

    if (!token) {
      throw new Error('Token builder returned an empty token.');
    }

    return json({
      appId,
      channelName: payload.channelName,
      userAccount,
      token,
      expiresIn: TOKEN_EXPIRATION_SECONDS,
    });
  } catch {
    return json({ error: 'Unable to issue an RTC token.' }, 500);
  }
}
