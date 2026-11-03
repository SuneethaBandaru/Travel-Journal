✈ Travel Journal

Travel Journal is a full-stack web app where travelers share trip stories with photos, discover trips from other people, and talk about them in comment threads.

Live demo: add your Vercel link here

What you can do
Create an account and log in or out with email and password. The app opens on the login page.
Write trip posts with a title, a story, a country category and one or more photos.
Edit or delete your own posts, and add, replace or remove photos at any time.
Browse the feed of all trips, search by title, or filter by country on its own page (/category/spain, /category/japan, ...).
Comment on any post, reply to specific comments in nested threads, and delete your own comments. Post authors can also remove comments on their posts.
Like posts and see a My posts page with everything you've written.
Manage your profile with a name and an avatar in Settings.
Use it on phones, tablets and desktops, since the layout is responsive.

Reading posts and comments is open to everyone. Creating, editing and deleting requires logging in, and only the author can edit or delete their own posts.

Tech stack
Area	Technology
Framework	Next.js (App Router, Server Components, Server Actions)
Language	TypeScript
Auth, database, file storage	Supabase (Auth, PostgreSQL, Storage)
Styling	Tailwind CSS
Hosting	Vercel

Run: npm run dev
Open http://localhost:3000.

Database overview
Table	Purpose
auth.users	Accounts, managed by Supabase Auth
profiles	Extra user data: name and avatar
categories	Countries used to group posts
posts	Trip posts: title, content, slug, author, category
post_images	Photos belonging to a post
comments	Comments with an author, a post and an optional parent comment for replies
post_likes	Which user liked which post

Relations: one user has many posts, one post has many images and many comments, and a comment can have many replies. Row Level Security keeps edits limited to the right user.

Project structure
app/
  page.tsx                  Home feed with search
  category/[slug]/          Posts for one country
  posts/new/                Create a post (login required)
  posts/[slug]/             Post page with images and comments
  posts/[slug]/edit/        Edit a post (author only)
  posts/actions.ts          Server actions: comments, likes, delete
  my-posts/  settings/      Logged-in user pages
  login/  register/  logout/
  error.tsx  loading.tsx    Error and loading states
components/                 Header, PostCard, CommentThread, ImageCarousel, forms ...
lib/supabase/               Browser and server Supabase clients
proxy.ts                    Route protection and session refresh

Built with

Next.js · React · TypeScript · Tailwind CSS · Supabase · Vercel

Github repo link : https://github.com/SuneethaBandaru/

Vercel live link : https://