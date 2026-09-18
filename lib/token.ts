import AgoraToken from 'agora-token';

export const TOKEN_EXPIRATION_SECONDS = 3600;

type TokenBuilder = (
  appId: string,
  appCertificate: string,
  channelName: string,
  userAccount: string,
  role: number,
  tokenExpire: number,
  privilegeExpire: number,
) => string;

type BuildRtcTokenInput = {
  appId: string;
  appCertificate: string;
  channelName: string;
  userAccount: string;
  builder?: TokenBuilder;
};

export function buildRtcToken({
  appId,
  appCertificate,
  channelName,
  userAccount,
  builder,
}: BuildRtcTokenInput): string {
  const build =
    builder ??
    ((...args: Parameters<TokenBuilder>) =>
      AgoraToken.RtcTokenBuilder.buildTokenWithUserAccount(...args));

  return build(
    appId,
    appCertificate,
    channelName,
    userAccount,
    AgoraToken.RtcRole.PUBLISHER,
    TOKEN_EXPIRATION_SECONDS,
    TOKEN_EXPIRATION_SECONDS,
  );
}
