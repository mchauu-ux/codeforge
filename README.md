# CodeForge

## Setup

1. Install dependencies with `npm install`.
2. Create a `.env.local` file with `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`.
3. Run `npm run dev`.

Only use the Supabase anon/publishable key in the browser. Never expose a service-role key in a `VITE_` variable or commit it to Git.

## Private chat access

The hidden chat is gated by the server-managed Supabase Auth `app_metadata` flag `codeforge_chat_access`. A client-side email list is not a security boundary.

1. Apply every SQL migration in `supabase/migrations` to the Supabase project. The latest migration restricts chat data and avatar uploads to approved users.
2. In the Supabase Dashboard, open **Authentication → Users**, select each approved user, and set their **app metadata** to include:

   ```json
   {
     "codeforge_chat_access": true
   }
   ```

3. Have the approved user sign out and sign back in so the refreshed session contains the new app metadata.

Do not put this flag in user-editable `user_metadata`: users must not be able to grant themselves access. Do not add service-role credentials to the frontend.

## Build

- `npm run build` — TypeScript check and production build.
- `npm run lint` — Oxlint.
