# Vercel Deployment Guide: SmartHub

This guide explains how to deploy your SmartHub Vite frontend and Express Node.js backend to Vercel.

---

## ⚡ Option 1: Deploying the Frontend (Vite) Only (Recommended)

Since the frontend is a static single-page React app and the backend runs active simulation intervals, the simplest setup is hosting the frontend on Vercel and hosting the Express API on a serverless container like Google Cloud Run.

### Step 1: Install Vercel CLI (Optional but easy)
```bash
npm install -g vercel
```

### Step 2: Deploy Frontend
1. Open your terminal in the `Smart hub` root directory.
2. Run:
   ```bash
   vercel
   ```
3. Follow the CLI prompts:
   - **Set up and deploy?** Yes
   - **Which scope?** Your personal scope
   - **Link to existing project?** No
   - **What name?** `smart-city-decision-hub`
   - **In which directory?** `./` (root)
   - **Auto-detected framework?** Vite (Vercel will auto-detect Vite)
   - **Modify build settings?** No (use default `npm run build` and `dist`)

4. Push to production:
   ```bash
   vercel --prod
   ```

---

## ⚙️ Option 2: Deploying Both Frontend & Backend on Vercel

To host both the frontend and backend on Vercel, you must configure a `vercel.json` file in the project root to map API requests to the Express server as a serverless function.

### Step 1: Create `vercel.json` in the root
Create a `vercel.json` file with the following routing configurations:
```json
{
  "version": 2,
  "builds": [
    {
      "src": "package.json",
      "use": "@vercel/static-build",
      "config": { "distDir": "dist" }
    },
    {
      "src": "server/server.js",
      "use": "@vercel/node"
    }
  ],
  "routes": [
    {
      "src": "/api/(.*)",
      "dest": "server/server.js"
    },
    {
      "src": "/(.*)",
      "dest": "/$1"
    }
  ]
}
```

### Step 2: Update Server Listen Logic
Vercel handles routing dynamically. Ensure `server/server.js` only runs `app.listen` when NOT running in a serverless function environment:
```javascript
if (process.env.NODE_ENV !== 'production') {
  app.listen(PORT, () => {
    console.log(`Smart City backend server listening at http://localhost:${PORT}`);
  });
}
export default app;
```

### Step 3: Run Deploy
Open your terminal in the root folder and run:
```bash
vercel --prod
```

### Step 4: Add Environment Variables
1. Go to your Vercel Project Dashboard.
2. Navigate to **Settings** -> **Environment Variables**.
3. Add:
   - `GEMINI_API_KEY`: Your Gemini API Key credentials.
