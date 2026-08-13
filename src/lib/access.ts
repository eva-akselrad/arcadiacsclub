import { createRemoteJWKSet, jwtVerify } from 'jose';

let jwksCache = new Map<string, ReturnType<typeof createRemoteJWKSet>>();

function getJwks(teamDomain: string) {
  let jwks = jwksCache.get(teamDomain);
  if (!jwks) {
    jwks = createRemoteJWKSet(
      new URL(`https://${teamDomain}/cdn-cgi/access/certs`),
    );
    jwksCache.set(teamDomain, jwks);
  }
  return jwks;
}

function getAccessToken(request: Request): string | null {
  const header = request.headers.get('Cf-Access-Jwt-Assertion');
  if (header) return header;

  const cookie = request.headers.get('Cookie');
  if (!cookie) return null;

  for (const part of cookie.split(';')) {
    const trimmed = part.trim();
    if (trimmed.startsWith('CF_Authorization=')) {
      return decodeURIComponent(trimmed.slice('CF_Authorization='.length));
    }
  }

  return null;
}

export async function requireAccess(
  request: Request,
  env: Env,
): Promise<{ email: string } | Response> {
  const policyAud = env.POLICY_AUD;
  const teamDomain = env.ACCESS_TEAM_DOMAIN;

  if (!policyAud || !teamDomain) {
    if (import.meta.env.DEV) {
      return { email: 'dev@local' };
    }
    return new Response('Admin auth not configured', { status: 503 });
  }

  const token = getAccessToken(request);
  if (!token) {
    return new Response('Unauthorized', { status: 401 });
  }

  try {
    const { payload } = await jwtVerify(token, getJwks(teamDomain), {
      audience: policyAud,
      issuer: `https://${teamDomain}`,
    });

    const email = typeof payload.email === 'string' ? payload.email : '';
    if (!email) {
      return new Response('Unauthorized', { status: 401 });
    }

    return { email };
  } catch {
    return new Response('Unauthorized', { status: 401 });
  }
}
