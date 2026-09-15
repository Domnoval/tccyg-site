import authenticator from '../vendor/sveltia-cms-auth/index.js';

const allowedDomains = [
  'twincityconcreteyardandgarden.com',
  'www.twincityconcreteyardandgarden.com',
  'tccyg.com',
  'www.tccyg.com',
  'kurts-website-final.vercel.app',
].join(',');

// The OAuth exchange runs on the existing Vercel project. Only the two app
// credentials are read from its private environment; neither reaches the CMS.
export async function handleCmsAuth(request, route, env = process.env) {
  const headers = {
    'Cache-Control': 'no-store',
    'Referrer-Policy': 'no-referrer',
    'X-Content-Type-Options': 'nosniff',
    'Content-Security-Policy': "frame-ancestors 'none'",
  };
  if (request.method !== 'GET') {
    return new Response('Method not allowed', { status: 405, headers: { ...headers, Allow: 'GET' } });
  }
  if (!['auth', 'callback'].includes(route)) {
    return new Response('Not found', { status: 404, headers });
  }

  const incoming = new URL(request.url);
  const upstream = new URL('/' + route, 'https://twincityconcreteyardandgarden.com');
  upstream.search = incoming.search;
  if (route === 'auth') {
    // This repository is public. Never request access to private repositories,
    // even if an older CMS or a crafted request asks for the broader scope.
    upstream.searchParams.set('scope', 'public_repo');
  }
  const response = await authenticator.fetch(new Request(upstream, { headers: request.headers }), {
    GITHUB_CLIENT_ID: env.GITHUB_CLIENT_ID,
    GITHUB_CLIENT_SECRET: env.GITHUB_CLIENT_SECRET,
    ALLOWED_DOMAINS: allowedDomains,
  });
  for (const [name, value] of Object.entries(headers)) response.headers.set(name, value);
  return response;
}
