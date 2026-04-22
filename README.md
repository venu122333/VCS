# NomadAI Trip Planner - Deployment Guide

This app is built with React, Vite, and Tailwind CSS. It uses the Google Gemini API for travel planning and content generation.

## Hosting on EdgeOne Pages (Static Site)

To host this app on EdgeOne Pages (or any static hosting like Vercel, Netlify, or GitHub Pages):

1. **Download the ZIP** of this project.
2. **Install Dependencies**:
   ```bash
   npm install
   ```
3. **Build the Project**:
   ```bash
   npm run build
   ```
   This will create a `dist` folder.
4. **Deploy to EdgeOne**:
   - Upload the contents of the `dist` folder to your EdgeOne Pages project.
   - Set the entry point to `index.html`.

## API Key Configuration

Since this is a static site, you have two ways to provide your Gemini API key:

### Option 1: In-App Settings (Recommended for standalone hosting)
After deploying, open the app in your browser, click the **Settings (Gear Icon)** in the header, and paste your Gemini API key. The key will be stored securely in your browser's `localStorage`.

### Option 2: Environment Variable (Recommended for build-time)
Create a `.env` file in the root directory (based on `.env.example`) and add your key:
```env
GEMINI_API_KEY=your_api_key_here
```
Then run `npm run build`. The key will be embedded in the static files.

## Getting a Gemini API Key
You can get a free Gemini API key from the [Google AI Studio](https://aistudio.google.com/app/apikey).
