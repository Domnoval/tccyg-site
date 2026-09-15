# Twin City Concrete Yard & Garden

The live business website is https://twincityconcreteyardandgarden.com/ (also https://tccyg.com/).

## Edit the website

Open https://twincityconcreteyardandgarden.com/admin and choose **Sign In with GitHub**. Kurt's account is `kurtkujawa65-cyber` and must have write access to `Domnoval/tccyg-site`.

Open **Twin City Concrete → Website Content**, edit the required fields, and save/publish. Changes are committed to `content/content.json` on `main`; Vercel then publishes them, normally within about a minute. Confirm the result on the public website.

The old `/admin.html` bookmark redirects to `/admin`. Email magic-link instructions describe the retired Supabase editor and no longer apply. Access-token sign-in remains a recovery option.

## Source of truth

- `content/content.json`: current website copy, contact details, sale settings, products, and photo references.
- `admin/config.yml`: Sveltia CMS editor fields. Keep this schema aligned with the content file so edits preserve all fields.
- `assets/cms/`: photos uploaded through the editor.
- `index.html` and the referenced local scripts/styles: public storefront.
- `api/auth.js`, `api/callback.js`, `lib/cms-auth.js`: GitHub sign-in on Vercel.
- `vendor/sveltia-cms-auth/`: pinned upstream authenticator and its license/provenance.

Supabase is not required by the current storefront or editor. Earlier handoff folders and database instructions are historical.

## Hosting

As verified on September 15, 2026, the live site is the **kurts-website-final** Vercel project in **quantum-tonic**, linked to this repository's `main` branch. That team has an active Pro plan. Both public domains still resolve to Vercel; a Cloudflare migration has not been verified.

Vercel deploys pushes to `main`. The legacy GitHub Pages workflow is manual-only and is not the production publishing path. It cannot run the OAuth API functions.

The two private production environment variables are `GITHUB_CLIENT_ID` and `GITHUB_CLIENT_SECRET`. Keep the secret out of Git and client-side code. Registration, ownership, and verification details are in [docs/ADMIN-SETUP.md](docs/ADMIN-SETUP.md).

## Local checks

Run `npm test` for sign-in security and callback tests. A static HTTP server can preview the storefront; use Vercel development/preview deployment to exercise the API functions. Before release, verify the old bookmark redirect, GitHub sign-in, and a complete editor save and public-site update.

Sveltia CMS is pinned to `0.212.2`. Test version upgrades deliberately.
