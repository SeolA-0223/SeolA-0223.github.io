# SeolA-0223 GitHub Pages Site

Static GitHub Pages site for the `SeolA-0223` account.

## Repository Name

For a personal GitHub Pages site, the remote repository should be:

`SeolA-0223.github.io`

The local folder can still be named `SeolA-0223`.

## Files

- `index.html`: main page
- `styles.css`: page styles
- `auth.js`: shared Supabase Auth client for sign-up, sign-in, session sync, and sign-out
- `news/index.html`: Supabase-backed board page
- `news/board.js`: browser client for posts, comments, self-delete, and admin auth
- `supabase/setup-board.sql`: SQL for posts, comments, RPC helpers, and admin policies

## Publish Flow

1. Keep the remote repository name as `SeolA-0223.github.io`.
2. Push the `main` branch to GitHub.
3. Open `https://seola-0223.github.io/`.

## Supabase Board Setup

1. Open the Supabase SQL Editor for `uisuogutyhjnmgbgbdjs`.
2. Run `supabase/setup-board.sql`.
3. If you already ran an older version of the SQL, run the updated file again.
4. Push this repository and open `/news/`.
5. Use the board form to create posts and comments.

## Site Member Auth Setup

1. Open Supabase Auth for project `uisuogutyhjnmgbgbdjs`.
2. Make sure Email provider sign-in is enabled.
3. Add `https://seola-0223.github.io` to the Site URL / redirect allow list.
4. Push this repository and open the home page.
5. Use the new Member Access section to sign up, sign in, and sign out.

## Admin Login Setup

1. Create an email/password user in Supabase Auth.
2. Add that email to `private.board_admins`.
3. Sign in from `/news/` with that same email and password.
4. Admin delete controls will appear on every post.
