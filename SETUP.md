# Multi-Tenant Workflow Platform Setup Guide

This guide will help you set up and deploy the multi-tenant workflow platform.

## Prerequisites

- Node.js 18+ installed
- A Supabase account (free tier works)
- Anthropic API key
- Vercel account (for deployment)

## Step 1: Set Up Supabase

1. **Create a new Supabase project:**
   - Go to [https://supabase.com](https://supabase.com)
   - Click "New Project"
   - Choose an organization, name your project (e.g., "workflow-platform")
   - Set a database password (save it securely)
   - Choose a region close to your users
   - Click "Create new project"

2. **Run the database schema:**
   - Once the project is ready, go to the SQL Editor
   - Copy the entire contents of `supabase-schema.sql`
   - Paste it into the SQL Editor
   - Click "Run" to execute the schema
   - Verify that tables were created by checking the "Table Editor" tab

3. **Get your API credentials:**
   - Go to Project Settings → API
   - Copy the "Project URL" (e.g., `https://your-project.supabase.co`)
   - Copy the "anon" / "public" key (it's safe to use this in the browser)

## Step 2: Configure Environment Variables

1. **Create `.env.local` file:**
   ```bash
   cp .env.example .env.local
   ```

2. **Add your credentials to `.env.local`:**
   ```env
   # Anthropic API Key (get from https://console.anthropic.com)
   ANTHROPIC_API_KEY=sk-ant-api03-...

   # Supabase Configuration
   NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
   ```

## Step 3: Install Dependencies and Run Locally

```bash
npm install
npm run dev
```

The app should now be running at [http://localhost:3000](http://localhost:3000)

## Step 4: Test the Application

1. **Test landing pages:**
   - Visit `http://localhost:3000` - should show landing page
   - Visit `http://localhost:3000/about` - should show about page
   - Visit `http://localhost:3000/testimonials` - should show testimonials

2. **Test workflow access:**
   - Visit `http://localhost:3000/workflows/demo`
   - You should be redirected to `/workflows/demo/access`
   - Enter access code: `demo123`
   - You should be redirected to the dashboard

3. **Test workflow functionality:**
   - Download demo files from the dashboard
   - Click "Client Meeting Prep" to run the workflow
   - Upload `clients.csv` first
   - Select a client (e.g., "Whitfield Family Office")
   - Upload `fidelity-whitfield.txt` and `outlook-whitfield.txt` when prompted
   - Run the workflow
   - Verify the output is saved and accessible

## Step 5: Add More Clients

To add more clients (tenants) to your platform:

1. Go to Supabase → Table Editor → `clients` table
2. Click "Insert row"
3. Fill in:
   - `slug`: URL-friendly identifier (e.g., "acme", "client-name")
   - `name`: Display name (e.g., "Acme Corp")
   - `access_code`: Unique access code (e.g., "acme456")
4. Click "Save"

Now users can access `/workflows/acme` with code `acme456`.

## Step 6: Deploy to Vercel

1. **Push code to GitHub:**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin https://github.com/your-username/your-repo.git
   git push -u origin main
   ```

2. **Deploy to Vercel:**
   - Go to [https://vercel.com](https://vercel.com)
   - Click "Add New Project"
   - Import your GitHub repository
   - Configure environment variables:
     - Add `ANTHROPIC_API_KEY`
     - Add `NEXT_PUBLIC_SUPABASE_URL`
     - Add `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - Click "Deploy"

3. **Test production deployment:**
   - Visit your Vercel URL (e.g., `https://your-app.vercel.app`)
   - Test landing pages
   - Test workflow access with `/workflows/demo` and code `demo123`
   - Run a workflow end-to-end

## Architecture Overview

### URL Structure
- `/` - Landing page (public)
- `/about` - About page (public)
- `/testimonials` - Testimonials page (public)
- `/workflows/[slug]` - Client-specific workflow dashboard (requires access code)
- `/workflows/[slug]/run/client-prep` - Run workflow
- `/workflows/[slug]/output/[id]` - View workflow output
- `/workflows/[slug]/access` - Access code entry page

### Multi-Tenancy
- Each client gets a unique `slug` (e.g., "acme", "demo")
- Access is controlled via simple access codes
- All client data (contacts, runs, outputs) is isolated by `client_id` in Supabase
- Session cookies ensure users can only access their own client's data

### Data Flow
1. User visits `/workflows/demo`
2. Middleware checks for session cookie
3. If no session, redirect to `/workflows/demo/access`
4. User enters access code
5. API validates code against Supabase
6. Session cookie is set with slug + code
7. User can now access dashboard and run workflows
8. All workflow data is stored in Supabase with `client_id` foreign key

## Troubleshooting

### "Missing Supabase environment variables"
- Make sure `.env.local` exists and has correct values
- Restart the dev server after adding environment variables

### "Invalid access code" error
- Check that the client exists in Supabase `clients` table
- Verify the `slug` and `access_code` match exactly
- Check for typos (access codes are case-sensitive)

### Workflow fails with "Failed to run workflow"
- Check that `ANTHROPIC_API_KEY` is set correctly
- Verify your Anthropic API key is valid and has credits
- Check browser console for detailed error messages

### Data not persisting
- Verify Supabase connection by checking browser Network tab
- Check Supabase logs in the Supabase dashboard
- Ensure RLS policies are set correctly (they should allow all operations)

## Next Steps

Once the basic platform is working, consider these enhancements:

1. **Admin Dashboard** (`/admin/clients`)
   - Create new clients via UI instead of SQL
   - View usage metrics per client
   - Manage access codes

2. **Better Access Control**
   - Add password hashing for access codes
   - Implement refresh tokens
   - Add logout functionality

3. **File Upload to Storage**
   - Use Supabase Storage instead of storing files in database
   - Reduces database size
   - Better performance for large files

4. **Email Notifications**
   - Send email when workflow completes
   - Use Supabase Functions or Resend

5. **Custom Branding**
   - Allow each client to have custom logos/colors
   - White-label the platform

6. **Analytics**
   - Track workflow runs per client
   - Monitor API usage
   - Identify popular workflows

## Support

For issues or questions, check:
- Supabase documentation: [https://supabase.com/docs](https://supabase.com/docs)
- Next.js documentation: [https://nextjs.org/docs](https://nextjs.org/docs)
- Anthropic API documentation: [https://docs.anthropic.com](https://docs.anthropic.com)
