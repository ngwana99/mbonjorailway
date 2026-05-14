# GHS Mbonjo Limbe CS Platform — Railway Deployment Guide
# Teacher: Mr Ngwana Joshua
# Department of Computer Science — Form 5

=====================================================
FOLDER STRUCTURE TO UPLOAD TO GITHUB
=====================================================

your-github-repo/
├── server.js           ← Backend server (Node.js)
├── package.json        ← Dependencies
├── railway.json        ← Railway config (auto-deploy)
├── .gitignore          ← Tells GitHub to ignore node_modules
├── data/
│   └── sessions.json   ← All student data stored here
└── public/
    ├── index.html      ← Landing page
    ├── part2_platform.html
    ├── part3_quiz.html
    ├── part4_structured.html
    ├── part5_mockpapers.html
    ├── part6_setup.html
    └── part7_hihs2024.html

=====================================================
STEP 1 — PUSH TO GITHUB
=====================================================

Option A — Using GitHub website (easiest, no coding):

1. Go to github.com → sign in
2. Open your existing repo (the one that was on Render)
   OR create a new one: click New → name it → Public → Create

3. Delete old files if repo already exists:
   - Click each old file → click trash icon → Commit changes

4. Upload new files:
   - Click "Add file" → "Upload files"
   - Upload these ROOT files first:
       server.js
       package.json
       railway.json
       .gitignore
   - Click "Commit changes"

5. Upload public/ folder files:
   - Click into the "public" folder (create it if missing)
   - Upload all 7 HTML files
   - Click "Commit changes"

6. Upload data/ folder:
   - Click into the "data" folder (create it if missing)
   - Upload sessions.json
   - Click "Commit changes"

=====================================================
STEP 2 — DEPLOY ON RAILWAY
=====================================================

1. Go to railway.app → click "Start a New Project"

2. Sign up / log in with GitHub (click "Login with GitHub")
   → Authorise Railway to access your GitHub

3. Click "Deploy from GitHub repo"

4. Select your repository (e.g. ghs-mbonjo-cs)

5. Railway detects Node.js automatically and deploys.
   Wait about 1–2 minutes.

6. When done, click "Settings" → "Networking" →
   click "Generate Domain"
   → You get a free URL like:
   https://ghs-mbonjo-cs.up.railway.app

7. Share this URL with your students!

=====================================================
STEP 3 — ADMIN ACCESS
=====================================================

- Open your Railway URL in browser
- Click "Form 5" → "Enter Platform"
- CIN: ADMIN2026
- Go to "Admin Dashboard" in the sidebar

You will see:
✅ All 52 students (even those who never logged in)
✅ Each login with device, browser, OS, location
✅ Session duration per student
✅ Quiz scores for every student
✅ Export all data as CSV

=====================================================
HOW TO UPDATE FILES LATER
=====================================================

1. Go to your GitHub repo
2. Click the file you want to update
3. Click the pencil (edit) icon
4. Make changes → click "Commit changes"
5. Railway automatically redeploys in ~1 minute

OR upload a new version:
1. Click the file → click trash icon → Commit
2. Upload new file with same name → Commit
3. Railway redeploys automatically

=====================================================
IMPORTANT NOTES
=====================================================

⚠️ Railway FREE tier gives $5 credit/month
   For a school platform with light usage this
   lasts approximately the whole month.

⚠️ Data is stored in data/sessions.json on the
   Railway server disk. It persists between deploys
   as long as you do NOT delete the volume.
   Export CSV regularly from admin panel as backup.

⚠️ If you ever need to migrate again, just:
   1. Export CSV from admin panel (saves all data)
   2. Push same files to new host
   3. Re-upload sessions.json to restore data

=====================================================
