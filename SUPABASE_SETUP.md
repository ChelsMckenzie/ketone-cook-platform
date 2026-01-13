# Supabase Setup Guide

## Step 1: Get Your Supabase Credentials

1. Go to your [Supabase Dashboard](https://app.supabase.com)
2. Select your project
3. Navigate to **Project Settings** → **API**
4. Copy the following values:
   - **Project URL** (e.g., `https://xxxxx.supabase.co`)
   - **anon/public key** (starts with `eyJ...`)

## Step 2: Create Environment Variables File

Create a file named `.env.local` in the root of your project (`ketone-cook-platform/`) with the following content:

```env
NEXT_PUBLIC_SUPABASE_URL=your-project-url-here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

**Important:** 
- Replace `your-project-url-here` with your actual Project URL
- Replace `your-anon-key-here` with your actual anon/public key
- Never commit `.env.local` to git (it's already in `.gitignore`)

## Step 3: Verify Setup

After creating `.env.local`, restart your development server:

```bash
npm run dev
```

The Supabase client should now be configured and ready to use!

## What Was Set Up

✅ **Installed Packages:**
- `@supabase/supabase-js` - Supabase JavaScript client
- `@supabase/ssr` - Server-side rendering support for Next.js

✅ **Created Files:**
- `lib/supabase/client.ts` - Client-side Supabase client (for use in Client Components)
- `lib/supabase/server.ts` - Server-side Supabase client (for use in Server Components & Server Actions)
- `types/database.ts` - TypeScript types matching your database schema
- `middleware.ts` - Next.js middleware to refresh auth sessions

## Usage Examples

### In a Server Component:
```typescript
import { createClient } from "@/lib/supabase/server";

export default async function Page() {
  const supabase = await createClient();
  const { data } = await supabase.from("profile").select("*");
  // ...
}
```

### In a Client Component:
```typescript
"use client";
import { createClient } from "@/lib/supabase/client";

export default function Component() {
  const supabase = createClient();
  // ...
}
```

### In a Server Action:
```typescript
"use server";
import { createClient } from "@/lib/supabase/server";

export async function myAction() {
  const supabase = await createClient();
  // ...
}
```
