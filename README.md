# SeolA-0223 GitHub Pages Site

Static GitHub Pages site for the `SeolA-0223` account.

## Repository Name

For a personal GitHub Pages site, the remote repository should be:

`SeolA-0223.github.io`

The local folder can still be named `SeolA-0223`.

## Files

- `index.html`: main page
- `styles.css`: page styles
- `news/index.html`: Supabase-backed board page
- `news/board.js`: browser client for loading and creating board posts
- `supabase/setup-board.sql`: SQL for the `board_posts` table and public policies

## Publish Flow

1. Keep the remote repository name as `SeolA-0223.github.io`.
2. Push the `main` branch to GitHub.
3. Open `https://seola-0223.github.io/`.

## Supabase Board Setup

1. Open the Supabase SQL Editor for `uisuogutyhjnmgbgbdjs`.
2. Run `supabase/setup-board.sql`.
3. Push this repository and open `/news/`.
4. Use the board form to create posts.
