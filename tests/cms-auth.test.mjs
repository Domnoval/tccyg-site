import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import { handleCmsAuth } from '../lib/cms-auth.js';

const origin = 'https://twincityconcreteyardandgarden.com';
const env = { GITHUB_CLIENT_ID: 'test-client', GITHUB_CLIENT_SECRET: 'test-secret' };
const request = (path, options) => new Request(origin + path, options);

test('login redirects to GitHub with only public repository scope and a secure state cookie', async () => {
  const response = await handleCmsAuth(request('/api/auth?provider=github&site_id=tccyg.com&scope=repo,user'), 'auth', env);
  assert.equal(response.status, 302);
  const destination = new URL(response.headers.get('location'));
  assert.equal(destination.origin, 'https://github.com');
  assert.equal(destination.searchParams.get('scope'), 'public_repo');
  assert.equal(destination.searchParams.get('client_id'), env.GITHUB_CLIENT_ID);
  assert.match(destination.searchParams.get('state'), /^[0-9a-f]{32}$/);
  const cookie = response.headers.get('set-cookie');
  assert.ok(cookie.includes('github_' + destination.searchParams.get('state')));
  for (const attribute of ['HttpOnly', 'Secure', 'SameSite=Lax', 'Max-Age=600']) assert.ok(cookie.includes(attribute));
  assert.equal(response.headers.get('cache-control'), 'no-store');
});

test('all five known website domains can begin login', async () => {
  for (const domain of ['tccyg.com', 'www.tccyg.com', 'twincityconcreteyardandgarden.com', 'www.twincityconcreteyardandgarden.com', 'kurts-website-final.vercel.app']) {
    const response = await handleCmsAuth(request('/api/auth?provider=github&site_id=' + domain), 'auth', env);
    assert.equal(response.status, 302, domain);
  }
});

test('unrelated domains cannot use the authenticator', async () => {
  const response = await handleCmsAuth(request('/api/auth?provider=github&site_id=tccyg.com.attacker.example'), 'auth', env);
  assert.equal(response.headers.get('location'), null);
  assert.match(await response.text(), /UNSUPPORTED_DOMAIN/);
});

test('missing app credentials produce a recoverable sign-in error', async () => {
  const response = await handleCmsAuth(request('/api/auth?provider=github&site_id=tccyg.com'), 'auth', {});
  assert.match(await response.text(), /MISCONFIGURED_CLIENT/);
  assert.equal(response.headers.get('cache-control'), 'no-store');
});

test('only GET requests are accepted', async () => {
  const response = await handleCmsAuth(request('/api/auth', { method: 'POST' }), 'auth', env);
  assert.equal(response.status, 405);
  assert.equal(response.headers.get('allow'), 'GET');
});

test('a callback with mismatched state never exchanges an authorization code', async (t) => {
  t.mock.method(globalThis, 'fetch', () => { assert.fail('must reject before reaching GitHub'); });
  const response = await handleCmsAuth(request('/api/callback?code=test&state=wrong', {
    headers: { cookie: 'csrf-token=github_0123456789abcdef0123456789abcdef' },
  }), 'callback', env);
  assert.match(await response.text(), /CSRF_DETECTED/);
  assert.match(response.headers.get('set-cookie'), /Max-Age=0/);
});

test('successful callback only sends its token to a trusted opener', async (t) => {
  const state = '0123456789abcdef0123456789abcdef';
  t.mock.method(globalThis, 'fetch', async (url, options) => {
    assert.equal(url, 'https://github.com/login/oauth/access_token');
    assert.equal(JSON.parse(options.body).client_secret, env.GITHUB_CLIENT_SECRET);
    return Response.json({ access_token: 'test-oauth-token' });
  });
  const response = await handleCmsAuth(request('/api/callback?code=test-code&state=' + state, {
    headers: { cookie: 'csrf-token=github_' + state },
  }), 'callback', env);
  const html = await response.text();
  assert.ok(!html.includes(env.GITHUB_CLIENT_SECRET));
  assert.equal(response.headers.get('cache-control'), 'no-store');
  let listener;
  const messages = [];
  vm.runInNewContext(html.match(/<script>([\s\S]*?)<\/script>/)[1], {
    URL,
    window: {
      addEventListener: (_, fn) => { listener = fn; },
      opener: { postMessage: (message, target) => messages.push({ message, target }) },
    },
  });
  assert.deepEqual(messages, [{ message: 'authorizing:github', target: '*' }]);
  listener({ data: 'authorizing:github', origin: 'https://tccyg.com.attacker.example' });
  assert.equal(messages.length, 1);
  listener({ data: 'authorizing:github', origin: 'https://tccyg.com' });
  assert.equal(messages[1].target, 'https://tccyg.com');
  assert.match(messages[1].message, /authorization:github:success/);
});
