import { createHash, randomBytes } from "crypto";

const LINE_AUTH_URL = "https://access.line.me/oauth2/v2.1/authorize";
const LINE_TOKEN_URL = "https://api.line.me/oauth2/v2.1/token";

function base64UrlEncode(buffer: Buffer): string {
  return buffer.toString("base64url");
}

export function generatePKCE() {
  const codeVerifier = randomBytes(32).toString("base64url");
  const codeChallenge = base64UrlEncode(
    createHash("sha256").update(codeVerifier).digest()
  );
  return { codeVerifier, codeChallenge };
}

export function generateState(): string {
  return randomBytes(32).toString("base64url");
}

/** Cookie不要：stateにcodeVerifierを埋め込み（LINEアプリ内ブラウザでも1回でログインできるようにする） */
export function createStateWithVerifier(codeVerifier: string): string {
  const payload = JSON.stringify({ v: codeVerifier });
  return Buffer.from(payload, "utf-8").toString("base64url");
}

export function parseStateForVerifier(state: string): string | null {
  if (!state || typeof state !== "string") return null;
  const s = state.replace(/\s/g, "");
  try {
    const payload = JSON.parse(
      Buffer.from(s, "base64url").toString("utf-8")
    );
    return typeof payload?.v === "string" ? payload.v : null;
  } catch {
    return null;
  }
}

export function buildAuthUrl(params: {
  clientId: string;
  redirectUri: string;
  state: string;
  codeChallenge: string;
}): string {
  const { clientId, redirectUri, state, codeChallenge } = params;
  const searchParams = new URLSearchParams({
    response_type: "code",
    client_id: clientId,
    redirect_uri: redirectUri,
    state,
    scope: "profile openid",
    code_challenge: codeChallenge,
    code_challenge_method: "S256",
    openExternalBrowser: "1",
  });
  return `${LINE_AUTH_URL}?${searchParams.toString()}`;
}

export async function exchangeCodeForToken(params: {
  code: string;
  redirectUri: string;
  clientId: string;
  clientSecret: string;
  codeVerifier: string;
}): Promise<{
  access_token: string;
  id_token: string;
  refresh_token?: string;
}> {
  const { code, redirectUri, clientId, clientSecret, codeVerifier } = params;
  const body = new URLSearchParams({
    grant_type: "authorization_code",
    code,
    redirect_uri: redirectUri,
    client_id: clientId,
    client_secret: clientSecret,
    code_verifier: codeVerifier,
  });

  const res = await fetch(LINE_TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: body.toString(),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`LINE token exchange failed: ${err}`);
  }

  return res.json();
}

export function decodeIdToken(idToken: string): {
  sub: string;
  name?: string;
  picture?: string;
} {
  const payload = idToken.split(".")[1];
  if (!payload) throw new Error("Invalid id_token");
  const decoded = JSON.parse(
    Buffer.from(payload, "base64url").toString("utf-8")
  );
  return {
    sub: decoded.sub,
    name: decoded.name,
    picture: decoded.picture,
  };
}
