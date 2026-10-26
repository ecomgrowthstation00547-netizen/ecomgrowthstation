# Ecom Growth Station: website

Static website (HTML/CSS/JS, no build step) with a Supabase database and a private admin dashboard.

## Pages
`index.html` Home · `services.html` · `academy.html` · `team.html` · `gallery.html` (video + photos) · `hire.html` (hire us / give us work) · `join.html` · `contact.html` · `admin.html` (private)

## 1. Connect Supabase (5 minutes)
1. Create a project at https://supabase.com.
2. Open **SQL Editor**, paste all of `supabase/schema.sql`, click **Run**. This creates the `submissions` table (every form on the site saves here) and the `admins` table, with Row Level Security:
   - the public can only **insert** enquiries,
   - only users listed in `admins` can read, update or delete them.
3. **Project Settings > API**: copy the **Project URL** and the **anon public** key into `js/config.js`.
   (The anon key is meant to be public. Never put the `service_role` key in this site.)
4. **Authentication > Providers > Email**: turn **off** "Allow new users to sign up" so strangers cannot create accounts.
5. **Authentication > Users > Add user**: create the admin (email + strong password, tick "Auto confirm").
6. In the SQL Editor run (with the admin's real email):
   ```sql
   insert into public.admins (user_id, email)
   select id, email from auth.users where email = 'ADMIN_EMAIL_HERE';
   ```
7. Open `admin.html`, sign in, and you will see every enquiry: search, filter by form type and status, open details, add private notes, mark contacted/closed, email or WhatsApp the person, export CSV.

Until `js/config.js` is filled in, the forms fall back to opening the visitor's mail app (addressed to ecomgrowthstation00547@gmail.com), so nothing breaks.

## 2. Photos and videos
- Photos: `media/photos/` (six illustrative images are included; overwrite them with real photos using the same file names, or edit `gallery.html` / `build` list).
- Video: `media/video/brand-reel.mp4` + `brand-reel-poster.jpg`. Replace with your own video (MP4, H.264 is the safest), or add more `<video>` blocks.

## 3. Hosting
Upload the whole folder to any static host (Netlify, Vercel, Cloudflare Pages, GitHub Pages, cPanel). Then in Supabase **Authentication > URL Configuration**, set the Site URL to your domain.

## Contact details used on the site
Email ecomgrowthstation00547@gmail.com · Phone/WhatsApp +92 345 7077263 · Pakistan
