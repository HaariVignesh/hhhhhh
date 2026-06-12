# NUE — Deployment Guide

## 1. Prerequisites

Before deploying NUE, ensure the following are installed and available:

| Tool | Minimum Version | Purpose |
|------|----------------|---------|
| Node.js | 20.x LTS | Runtime |
| npm | 10.x | Package manager |
| PostgreSQL | 15+ | Primary database |
| Git | 2.x | Version control |
| Docker & Docker Compose | 24.x / 2.x | Containerised deployment |

External service accounts required:

- **Stripe** — payment processing and webhooks
- **Google Cloud Console** — OAuth 2.0 credentials
- **Cloudinary** — image hosting and CDN
- **Resend** (or any SMTP provider) — transactional email
- **Vercel** (optional) — managed hosting

---

## 2. Local Development Setup

### Step 1 — Clone the repository

```bash
git clone https://github.com/your-org/nue.git
cd nue
```

### Step 2 — Install dependencies

```bash
npm install
```

### Step 3 — Configure environment variables

```bash
cp .env.example .env.local
# Edit .env.local with your values (see Section 3)
```

### Step 4 — Start a local PostgreSQL instance

Using Docker (recommended):

```bash
docker run --name nue_dev_pg \
  -e POSTGRES_USER=nue \
  -e POSTGRES_PASSWORD=nuepassword123 \
  -e POSTGRES_DB=nue_db \
  -p 5432:5432 \
  -d postgres:16-alpine
```

Or install PostgreSQL natively and create the database:

```sql
CREATE USER nue WITH PASSWORD 'nuepassword123';
CREATE DATABASE nue_db OWNER nue;
```

### Step 5 — Run database migrations

```bash
npx prisma migrate dev --name init
```

### Step 6 — Seed the database

```bash
npx prisma db seed
```

This creates the admin user (`admin@nueclothing.com` / `Admin@1234`), a test customer, all categories, 10 products, coupons, a hero banner, and newsletter subscribers.

### Step 7 — Start the development server

```bash
npm run dev
```

The app is now available at `http://localhost:3000`.

### Step 8 — (Optional) Open Prisma Studio

```bash
npx prisma studio
```

---

## 3. Environment Variables

Create a `.env.local` file in the project root. Every variable listed below is required unless marked *optional*.

### Application

```env
# Public-facing URL of the app (no trailing slash)
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Secret used by NextAuth to sign session tokens — generate with:
#   openssl rand -base64 32
NEXTAUTH_SECRET=your-nextauth-secret-here

# Must match NEXT_PUBLIC_APP_URL in production
NEXTAUTH_URL=http://localhost:3000
```

### Database

```env
# Full PostgreSQL connection string
DATABASE_URL=postgresql://nue:nuepassword123@localhost:5432/nue_db
```

### Google OAuth

```env
# From Google Cloud Console → APIs & Services → Credentials
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
```

### Stripe

```env
# Publishable key (safe to expose to the browser)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...

# Secret key (server-side only — never expose)
STRIPE_SECRET_KEY=sk_test_...

# Webhook signing secret from Stripe Dashboard → Webhooks
STRIPE_WEBHOOK_SECRET=whsec_...
```

### Cloudinary

```env
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
```

### Email (Resend)

```env
# API key from resend.com dashboard
RESEND_API_KEY=re_...

# Verified sender address
EMAIL_FROM=noreply@nueclothing.com
```

---

## 4. Database Setup

### Running migrations

```bash
# Development — creates migration files and applies them
npx prisma migrate dev --name <migration-name>

# Production — applies existing migrations only (no schema changes)
npx prisma migrate deploy
```

### Generating the Prisma client

Regenerate whenever `prisma/schema.prisma` changes:

```bash
npx prisma generate
```

### Seeding

```bash
# Uses the script defined in package.json under "prisma.seed"
npx prisma db seed
```

To reset the database and re-seed from scratch:

```bash
npx prisma migrate reset   # drops, recreates, migrates, and seeds
```

### Viewing data

```bash
npx prisma studio          # opens browser-based GUI at localhost:5555
```

---

## 5. Stripe Configuration

### Step 1 — Create a Stripe account

Sign up at [stripe.com](https://stripe.com) and complete identity verification for live payments.

### Step 2 — Obtain API keys

Navigate to **Developers → API keys** and copy:
- **Publishable key** → `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
- **Secret key** → `STRIPE_SECRET_KEY`

Use `pk_test_` / `sk_test_` keys for development.

### Step 3 — Configure webhooks

#### For local development

Install the Stripe CLI:

```bash
# macOS
brew install stripe/stripe-cli/stripe

# Linux
# Download from https://github.com/stripe/stripe-cli/releases

stripe login
stripe listen --forward-to localhost:3000/api/webhooks/stripe
```

The CLI prints a webhook signing secret starting with `whsec_` — set this as `STRIPE_WEBHOOK_SECRET`.

#### For production

1. Go to **Developers → Webhooks → Add endpoint**
2. Set the endpoint URL to `https://your-domain.com/api/webhooks/stripe`
3. Select these events to listen for:
   - `payment_intent.succeeded`
   - `payment_intent.payment_failed`
   - `checkout.session.completed`
   - `customer.subscription.created` *(if using subscriptions)*
4. Copy the **Signing secret** → `STRIPE_WEBHOOK_SECRET`

### Step 4 — Test payments

Use Stripe's test card numbers:

| Scenario | Card Number |
|----------|-------------|
| Success | `4242 4242 4242 4242` |
| Authentication required | `4000 0025 0000 3155` |
| Declined | `4000 0000 0000 9995` |

Expiry: any future date. CVV: any 3 digits. ZIP: any 5 digits.

---

## 6. Google OAuth Setup

### Step 1 — Create a project

1. Go to [console.cloud.google.com](https://console.cloud.google.com)
2. Create a new project named **NUE**

### Step 2 — Enable the Google+ API

Navigate to **APIs & Services → Library**, search for **Google+ API**, and enable it.

### Step 3 — Configure the OAuth consent screen

1. Go to **APIs & Services → OAuth consent screen**
2. Choose **External** (or Internal for organisation-only)
3. Fill in the application name, support email, and authorised domain
4. Add scopes: `email`, `profile`, `openid`
5. Add test users during development

### Step 4 — Create OAuth credentials

1. Go to **APIs & Services → Credentials → Create Credentials → OAuth client ID**
2. Application type: **Web application**
3. Add authorised redirect URIs:
   - Development: `http://localhost:3000/api/auth/callback/google`
   - Production: `https://your-domain.com/api/auth/callback/google`
4. Copy the **Client ID** and **Client Secret** into `.env.local`

---

## 7. Cloudinary Setup

### Step 1 — Create an account

Sign up at [cloudinary.com](https://cloudinary.com). The free tier supports up to 25 GB storage and 25 GB monthly bandwidth.

### Step 2 — Obtain credentials

From the **Dashboard**, copy:
- **Cloud name** → `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME`
- **API key** → `CLOUDINARY_API_KEY`
- **API secret** → `CLOUDINARY_API_SECRET`

### Step 3 — Create an upload preset

1. Go to **Settings → Upload → Upload presets → Add upload preset**
2. Set **Signing mode** to **Unsigned** for client-side uploads from the admin panel
3. Set a folder (e.g., `nue/products`) to keep uploads organised
4. Enable **Auto-tagging** and **Auto-quality** for best results
5. Note the preset name and set it in your admin upload component

### Step 4 — Configure transformations (optional)

Create named transformations for consistent image sizing:

```
product_card   → w_600,h_800,c_fill,g_auto,q_auto,f_auto
product_detail → w_1200,h_1600,c_fill,g_auto,q_auto,f_auto
thumbnail      → w_200,h_267,c_fill,g_auto,q_auto,f_auto
```

---

## 8. Docker Deployment

### Build and start all services

```bash
# Copy and edit environment file
cp .env.example .env.local

# Build the image and start containers
docker compose up --build -d
```

The app will be available at `http://localhost:3000`.

### Run database migrations in Docker

```bash
docker compose exec app npx prisma migrate deploy
docker compose exec app npx prisma db seed
```

### View logs

```bash
docker compose logs -f app
docker compose logs -f postgres
```

### Stop containers

```bash
docker compose down

# To also remove the database volume (destructive)
docker compose down -v
```

### Rebuild after code changes

```bash
docker compose up --build -d app
```

### Environment variable notes for Docker

The `docker-compose.yml` reads `.env.local` via `env_file`. The `DATABASE_URL` is overridden to point to the `postgres` service container by name rather than `localhost`.

For production Docker deployments, inject secrets via your orchestrator's secret management (e.g., Docker Swarm secrets, Kubernetes secrets, AWS Secrets Manager) rather than committing `.env.local`.

---

## 9. Vercel Deployment

### Step 1 — Install Vercel CLI

```bash
npm install -g vercel
vercel login
```

### Step 2 — Link the project

```bash
vercel link
```

### Step 3 — Add environment variables

Either via the Vercel dashboard (**Project → Settings → Environment Variables**) or the CLI:

```bash
vercel env add DATABASE_URL
vercel env add NEXTAUTH_SECRET
vercel env add NEXTAUTH_URL
vercel env add GOOGLE_CLIENT_ID
vercel env add GOOGLE_CLIENT_SECRET
vercel env add NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
vercel env add STRIPE_SECRET_KEY
vercel env add STRIPE_WEBHOOK_SECRET
vercel env add NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME
vercel env add CLOUDINARY_API_KEY
vercel env add CLOUDINARY_API_SECRET
vercel env add RESEND_API_KEY
vercel env add EMAIL_FROM
vercel env add NEXT_PUBLIC_APP_URL
```

### Step 4 — Connect a PostgreSQL database

Use **Vercel Postgres** (powered by Neon) for zero-config setup:

1. Go to **Project → Storage → Create Database → Postgres**
2. Vercel automatically sets `DATABASE_URL` and `POSTGRES_*` variables

Or connect an external database (Railway, Neon, Supabase, etc.) by setting `DATABASE_URL` manually.

### Step 5 — Deploy

```bash
# Preview deployment
vercel

# Production deployment
vercel --prod
```

### Step 6 — Run migrations on first deploy

```bash
vercel env pull .env.local          # pull production env locally
npx prisma migrate deploy           # run migrations against production DB
npx prisma db seed                  # optional: seed initial data
```

### Step 7 — Configure Stripe webhook for production

Update your Stripe webhook endpoint to the production URL:
`https://your-vercel-domain.vercel.app/api/webhooks/stripe`

Update `STRIPE_WEBHOOK_SECRET` in Vercel with the new signing secret.

### Automatic deployments

Vercel automatically deploys on every push to the `main` branch. Preview deployments are created for every pull request.

---

## 10. Production Checklist

Complete every item before going live.

### Security

- [ ] `NEXTAUTH_SECRET` is a randomly generated 32-byte string (`openssl rand -base64 32`)
- [ ] All `.env` files are in `.gitignore` and not committed
- [ ] Stripe **live** keys (`pk_live_`, `sk_live_`) replace test keys
- [ ] Stripe webhook uses the production signing secret
- [ ] Google OAuth redirect URIs include the production domain
- [ ] CORS / allowed origins are restricted in `next.config.ts`
- [ ] Rate limiting is enabled on auth and payment API routes
- [ ] `NEXTAUTH_URL` matches the exact production URL (including `https://`)

### Database

- [ ] `npx prisma migrate deploy` has been run against the production database
- [ ] Database backups are automated (daily minimum)
- [ ] Connection pooling is configured (PgBouncer or Prisma Data Proxy)
- [ ] Database is not publicly accessible; app connects via private network

### Performance

- [ ] `output: "standalone"` is set in `next.config.ts`
- [ ] Images are served via Cloudinary with auto quality and format (`q_auto,f_auto`)
- [ ] `next/image` is used for all images with correct `sizes` props
- [ ] Unused dependencies are removed
- [ ] `NEXT_TELEMETRY_DISABLED=1` is set in production

### Monitoring

- [ ] Error tracking is configured (e.g., Sentry)
- [ ] Uptime monitoring is active (e.g., Better Uptime, UptimeRobot)
- [ ] Log aggregation is set up (e.g., Logtail, Datadog)
- [ ] Vercel Analytics or Plausible is enabled for traffic insights

### SEO & Accessibility

- [ ] `sitemap.xml` is accessible at `/sitemap.xml`
- [ ] `robots.txt` is accessible at `/robots.txt`
- [ ] Open Graph and Twitter card meta tags are set on all pages
- [ ] Canonical URLs are configured
- [ ] All images have descriptive `alt` text

### Email

- [ ] Resend (or SMTP) sender domain is verified
- [ ] Order confirmation emails are tested end-to-end
- [ ] Password reset flow is tested

### Final Checks

- [ ] All payment flows tested with Stripe test cards in staging
- [ ] Admin panel access restricted to `ADMIN` role users
- [ ] `NEXT_PUBLIC_APP_URL` is set to the live domain
- [ ] SSL certificate is valid and auto-renewing
- [ ] `www` redirects to the apex domain (or vice versa)
- [ ] 404 and error pages render correctly
