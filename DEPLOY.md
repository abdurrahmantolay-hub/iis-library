# Deployment Guide

This app is built with **Vite + React** and uses **Supabase** for the database and **Google Gemini** for AI features.

## Prerequisites
1.  A GitHub account.
2.  A [Supabase](https://supabase.com) account.
3.  A [Vercel](https://vercel.com) account.
4.  A [Google AI Studio](https://aistudio.google.com/) API Key.

---

## Step 1: Setup Supabase Database
1.  Create a new project on Supabase.
2.  Go to the **SQL Editor** in the left sidebar.
3.  Open the file `db_schema.sql` from this repository, copy the content, and run it in the SQL Editor. This creates your tables.
4.  Go to **Project Settings > API**.
5.  Copy the **Project URL** and the **anon public key**. You will need these in Step 2.

## Step 2: Deploy to Vercel

1.  **Push to GitHub**: Ensure this code is pushed to a repository in your GitHub account.
2.  **Import to Vercel**:
    *   Log in to Vercel.
    *   Click **"Add New..."** -> **"Project"**.
    *   Select the `iis-library` repository you just pushed.
3.  **Configure Build**:
    *   Framework Preset: `Vite` (Vercel usually detects this automatically).
    *   Root Directory: `./` (default).
    *   Build Command: `npm run build` (default).
    *   Output Directory: `dist` (default).
4.  **Environment Variables (CRITICAL)**:
    *   Expand the **"Environment Variables"** section.
    *   Add the following variables exactly as named:
    
    | Key | Value |
    | --- | --- |
    | `API_KEY` | Your Google Gemini API Key |
    | `SUPABASE_URL` | Your Supabase Project URL (e.g. https://xyz.supabase.co) |
    | `SUPABASE_KEY` | Your Supabase `anon` public key |

5.  **Deploy**:
    *   Click **"Deploy"**.
    *   Wait for the build to finish. Vercel will install dependencies, build the React app, and deploy it.

## Troubleshooting
*   **"Tables not found" error**: Make sure you ran the SQL from `db_schema.sql` in your Supabase SQL Editor.
*   **AI features not working**: Check that your `API_KEY` is set correctly in Vercel settings and that your Google Cloud billing/credits are active (if applicable).
*   **Login issues**: The app uses a mock login. Use any email ending in `@istanbulint.com` or the provided demo buttons.
