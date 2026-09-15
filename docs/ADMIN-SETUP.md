# Editor sign-in setup

The site uses Sveltia CMS at `/admin`, with content saved to `content/content.json` on `Domnoval/tccyg-site` main. Vercel publishes those commits automatically.

## GitHub application

The OAuth application is registered in `Domnoval`'s account at https://github.com/settings/applications/3860181:

- Application name: **Twin City Concrete Website Editor**
- Homepage URL: `https://twincityconcreteyardandgarden.com/admin`
- Description: `Sign in to edit Twin City Concrete Yard & Garden website content.`
- Authorization callback URL: `https://twincityconcreteyardandgarden.com/api/callback`
- Device flow: leave disabled.
- Expiring user access tokens: enabled. The authenticator does not refresh tokens in the background; Sveltia returns expired cached sessions to sign-in. Reopen the editor and use normal GitHub sign-in again. Do not turn off token expiration to work around a stale session.

Store its client ID and client secret as **server-only** Vercel environment variables on `quantum-tonic/kurts-website-final`:

- `GITHUB_CLIENT_ID`
- `GITHUB_CLIENT_SECRET` (sensitive/encrypted)

Both variables were saved to the production environment on September 15, 2026. The secret is stored as a non-revealable Vercel Secret. Preview environments deliberately have no production credentials.

Never commit the secret or put it in the CMS configuration. Redeploy after adding the environment variables. The browser receives a GitHub authorization response, not the application's secret.

The authenticator runs on the existing Vercel project; no Cloudflare account is required. It uses an unmodified, pinned copy of the MIT-licensed Sveltia authenticator. The adapter limits the requested scope to `public_repo`, because the content repository is public. GitHub OAuth grants public-repository access across repositories the signing-in account can write to, not a permission limited to this one repository. GitHub's consent screen remains the user's choice.

## Allowed editor addresses

Sign-in accepts the five domains already attached to this Vercel project: `twincityconcreteyardandgarden.com`, its `www` variant, `tccyg.com`, its `www` variant, and `kurts-website-final.vercel.app`. Other domains, including arbitrary preview deployments, are not allowed to receive tokens. The authentication popup always uses the longer canonical domain so its callback and state cookie stay on one host.

## Verification before handing it to Kurt

- Old `/admin.html` bookmark redirects to `/admin`.
- “Sign In with GitHub” reaches GitHub's consent page for this application.
- Kurt uses `kurtkujawa65-cyber`, which must retain write access to the repository.
- Kurt logs in from a fresh browser session, edits one label, and saves.
- Confirm a new GitHub commit and a successful Vercel deployment.
- Confirm the edit at the public website, then restore the original label.
- Upload and remove a temporary test photo through the editor.
- Sign out and log in again; verify that the content remains available.

Keep token sign-in available for recovery, but do not make token creation the routine client instructions. If an old personal token is expired, normal GitHub sign-in should eliminate the need to replace it.

## Maintenance

Run `npm test`. Tests cover domain restrictions, public-only scopes, state-cookie checks, and token delivery to the correct window origin. Verify the actual Vercel routes on a preview deployment before promotion.

Sveltia CMS is pinned to `0.212.2`; the authenticator provenance is in `vendor/sveltia-cms-auth/UPSTREAM.md`. Test upgrades deliberately.

When ownership is transferred, transfer/recreate the OAuth application with the business, preserve the callback address, and update the two private Vercel environment variables if the app changes. Reverify sign-in after any repository, domain, or ownership change.
