# ForumCentral - World of Warcraft Styled Community Forums

ForumCentral is a full-featured, secure community forum application inspired by the classic World of Warcraft official forums. Built with **Next.js 14 App Router (JavaScript)**, **React 18**, and **Firebase Admin SDK** (Firestore & Firebase Storage) with 100% server-authoritative security.

---

## ⚔ Features

- **World of Warcraft Aesthetics**: Dark navy/black background with subtle vignette, dark slate panels, golden borders and in-game button gradients, Blizzard-blue links, and fantasy serif typography (Cinzel).
- **Class Colours**: Registered users receive a character class colour (Warrior brown `#c79c6e`, Mage light blue `#3fc7eb`, Rogue yellow `#fff569`, Druid orange `#ff7d0a`, Paladin pink `#f58cba`, Priest white `#ffffff`, Shaman blue `#0070de`, Hunter green `#abd473`, Warlock purple `#9482c9`, Death Knight red `#c41f3b`).
- **Topic Pages with Avatar Sidebar**: Left sidebar featuring framed avatar, username in class colour, join date, post count, and gold **Forum Moderator** tag for creators.
- **Classic Terminology**: Board Index, Forums, Topics, Replies, Memberlist, Buddy List, Login, Logout, Register, Post New Topic, Submit Topic, Post Reply, Submit Reply, Joined, Forum Moderator, Guest.
- **Guest Posting**: Visitors can browse freely, start new topics, submit replies, and upload photos as a guest (e.g. `Guest4821`). Guests are restricted from creating forums, using the Buddy List, or appearing in the Memberlist, and have stricter cooldowns (60 seconds) and image limits (1 MB).
- **Auto-Seeded Categories**:
  - General & Internet Culture
  - Gaming
  - Tech & Programming
  - Music
  - Cars Bikes & Hobbies
  - Anime & Fandom
  - Sports
  - Parenting & Advice
  - Blogs & Writing
- **Custom Forum Creation**: Registered users can establish new forums within categories (up to 5 per day) and serve as the Forum Moderator.
- **Real Magic-Byte Photo Validation**: Accepts up to 4 images per post (JPG, PNG, WebP, GIF) with strict magic-byte verification (no SVG or executable masquerading). Stored in Firebase Storage with random filenames and displayed as clickable lightbox thumbnails.
- **Buddy List**: Registered members can add/remove buddies from profiles, and view "New topics from your Buddy List" on the home page.
- **Bank-Grade Security**:
  - Passwords hashed with `bcryptjs` (cost factor 12) with dummy hash comparison to prevent username enumeration timing attacks.
  - Account lockouts for 15 minutes after 5 consecutive failed logins.
  - 32-byte cryptographically random session tokens stored as SHA-256 hashes in Firestore.
  - Strict Content-Security-Policy (CSP), HSTS, nosniff, and anti-clickjacking headers.
  - Zero direct client database access (`firestore.rules` and `storage.rules` deny all direct client reads/writes).

---

## 🛠 Tech Stack

- **Framework**: Next.js 14.2.35 (App Router, JavaScript)
- **UI & Styling**: React 18, Tailwind CSS, Lucide icons
- **Backend**: Firebase Admin SDK (`firebase-admin`)
- **Database**: Firebase Firestore
- **File Storage**: Firebase Storage
- **Authentication**: Server-side cookies with SHA-256 hashed session tokens & bcrypt (cost 12)

---

## 🚀 Beginner-Friendly Deployment Guide

Follow these steps to deploy ForumCentral to Vercel with your own Firebase project:

### Step 1: Create a Firebase Project
1. Go to the [Firebase Console](https://console.firebase.google.com/) and click **Add Project**.
2. Enter a project name (e.g. `forumcentral-prod`) and click **Continue**.
3. Choose whether to enable Google Analytics (optional) and click **Create Project**.

### Step 2: Enable Cloud Firestore
1. In your Firebase Console sidebar, navigate to **Build** -> **Firestore Database**.
2. Click **Create Database**.
3. Choose a location closest to your users (e.g. `us-central1` or `europe-west3`).
4. Select **Start in production mode** (all client access will be locked down).
5. Click **Enable**.
6. Under the **Rules** tab, paste the contents of `firestore.rules` (which denies all direct browser read/write access) and click **Publish**.

### Step 3: Enable Firebase Storage
1. In the sidebar, navigate to **Build** -> **Storage**.
2. Click **Get Started**.
3. Keep default security rules and select a Cloud Storage location.
4. Click **Done**.
5. Under the **Rules** tab, paste the contents of `storage.rules` and click **Publish**.
6. Copy your bucket name shown on the storage dashboard (e.g. `forumcentral-prod.appspot.com` or `forumcentral-prod.firebasestorage.app`).

### Step 4: Generate a Firebase Service Account Key
1. In the Firebase Console, click the **Gear Icon** (Project Settings) at the top left.
2. Switch to the **Service accounts** tab.
3. Ensure **Firebase Admin SDK** is selected, then click **Generate new private key**.
4. Confirm by clicking **Generate key**. A `.json` file will download to your computer.
5. Open the downloaded `.json` file in any text editor. You will see:
   - `project_id`
   - `client_email`
   - `private_key`

### Step 5: Upload Code to GitHub
1. Open your terminal or Git client in the project directory.
2. Initialize and commit your files:
   ```bash
   git init
   git add .
   git commit -m "Initial commit of ForumCentral"
   ```
3. Create a new repository on [GitHub](https://github.com/new).
4. Link and push your repository:
   ```bash
   git remote add origin https://github.com/your-username/forumcentral.git
   git branch -M main
   git push -u origin main
   ```

### Step 6: Deploy to Vercel & Configure Environment Variables
1. Log in to [Vercel](https://vercel.com/) and click **Add New** -> **Project**.
2. Import your `forumcentral` GitHub repository.
3. Under the **Environment Variables** section, add the following 4 variables from your downloaded service account key:

   | Variable Name | Value Source | Example Value |
   | :--- | :--- | :--- |
   | `FIREBASE_PROJECT_ID` | `project_id` from JSON | `forumcentral-prod` |
   | `FIREBASE_CLIENT_EMAIL` | `client_email` from JSON | `firebase-adminsdk-xxx@...` |
   | `FIREBASE_PRIVATE_KEY` | `private_key` from JSON | `-----BEGIN PRIVATE KEY-----\nMIIEv...` |
   | `FIREBASE_STORAGE_BUCKET` | Your Storage bucket name | `forumcentral-prod.appspot.com` |

4. Click **Deploy**.
5. Vercel will build and deploy the Next.js App Router application.
6. Open your live Vercel URL—the default categories and initial welcoming forum topics will be automatically seeded on your first visit!

---

## 🧪 Local Development

```bash
# Install dependencies
npm install

# Run unit tests (logic & magic byte validation)
npx tsx --test lib/security.test.js

# Start local Next.js dev server
npm run dev
```

Visit `http://localhost:3000` to browse the forums!
