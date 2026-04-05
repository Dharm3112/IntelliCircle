# IntelliCircle Production Launch Checklist

Before broadcasting the public URL, ensure all phases of this checklist are verified by the engineering team.

## 1. Domain & Networking
- [ ] Has a custom domain been purchased and DNS A/CNAME records pointed to the CDN?
- [ ] Does `https://domain.com` force redirect to `https://www.domain.com` (or vice-versa) to prevent split SEO?
- [ ] Is SSL TLS 1.2+ enforced? (Verify via [Qualys SSL Labs](https://www.ssllabs.com/ssltest/))
- [ ] Are WebSockets wss:// successfully establishing on the production domain?

## 2. Infrastructure Resilience
- [ ] Are Render services using the "Starter" plan or higher for ASG autoscaling?
- [ ] Is the database connection pool right-sized (`max: 20` for pgBouncer)?
- [ ] Are `healthCheckPath: /api/health` settings correctly applied in `render.yaml`?
- [ ] Are metrics actively flowing into Datadog/Grafana?

## 3. SEO & OpenGraph
- [ ] Are the `<title>` and `<meta name="description">` tags populated for all static routes (Home, About, Discover)?
- [ ] Does the HTML `<head>` contain `og:title`, `og:image`, `og:description`, and `twitter:card` tags?
- [ ] Did you verify the OG Image displays correctly using the [Facebook Sharing Debugger](https://developers.facebook.com/tools/debug/)?
- [ ] Is the `robots.txt` file configured to allow search engine indexing?
- [ ] Is `sitemap.xml` generated and accessible?

## 4. Frontend QA
- [ ] Test Geolocation permission flow: Does it gracefully fallback to "Global Mode" when denied?
- [ ] Test WebSocket reconnect logic: Drop network connection, then reconnect. Does the chat sync?
- [ ] Verify Cross-Browser compatibility:
    - [ ] Chrome (Desktop/Mobile)
    - [ ] Safari (Desktop/iOS)
    - [ ] Firefox
- [ ] Verify accessibility (Lighthouse score > 90 for Accessibility).

## 5. Security & Authentication
- [ ] Did you run the `scripts/rotate-keys.js` to ensure production has unique, isolated JWT keys?
- [ ] Is `NODE_ENV=production`? (Critical for disabling stack traces).
- [ ] Are the Fastify CORS policies strictly limiting origins to the Production Frontend Domain?
- [ ] Verify `npm run check` and `npm audit` show 0 critical vulnerabilities.

## 6. Cold Start Verification
- [ ] Did you execute `npm run seed:production -w @intellicircle/server`?
- [ ] Are the 10 Global Virtual Rooms visible instantly in the UI when Geolocation fails/defaults?
