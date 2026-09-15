# Cloudflare Pages deployment

- Project: `apex-voyage`
- Project ID: `45e37820-c981-4bd4-b95a-f5e63ee456da`
- Account: `0c54c70e82d87eae90d6e2cf645724a2`
- Production branch: `main`
- Build output: `dist`
- Production domain: https://speed.chentaoai.com
- Pages domain: https://apex-voyage.pages.dev

The game is deployed directly to Cloudflare Pages. The root domain hosts a separate project and must not be overwritten. Netlify is no longer the intended deployment destination.

## Direct upload through the Cloudflare connector

1. Run TypeScript checks, tests and the Vite production build.
2. Request a short-lived Pages upload JWT for this project through the connector. Keep it out of logs and version control.
3. Supply the JWT temporarily in `artifacts/cf-upload-token.txt` and run `node tools/cloudflare-upload-assets.mjs`. The script checks and uploads missing assets and writes `artifacts/cloudflare-manifest.json`.
4. Create a production deployment through the connector, submitting that manifest, branch `main`, accurate commit metadata, and `public/_headers` as multipart form data. Never claim a dirty checkout is a clean commit.
5. Remove the temporary JWT file. Check deployment status and compare the published files against the offline manifest hashes.

`public/_headers` contains Cloudflare-compatible cache and security headers. Deployment control files are excluded from the game's offline resource manifest.

## Migration record

On 2026-09-15, deployment `27cb9ed7-8e40-47a1-a46b-b3f554bd29c9` was uploaded from the working directory. The DNS CNAME for `speed.chentaoai.com` changed from `allenspeedcar.netlify.app` (unproxied) to `apex-voyage.pages.dev` (proxied). The previous Netlify site was retained for rollback; no root-domain or unrelated DNS records were changed.
