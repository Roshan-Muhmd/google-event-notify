# Google Event Notify

This project is a **Next.js app** deployed on **Vercel** that integrates with Google Calendar to check for events periodically and send notifications.  
It uses **Vercel Serverless Functions** for API routes and **cron jobs** (or GitHub Actions as an alternative) to schedule checks automatically.

---

## 🚀 Features
- Next.js (App Router)
- API Routes (`/api/crone/check-events`) to check Google Calendar events
- Google OAuth2 integration for authentication
- Automatic scheduled tasks via **Vercel Cron Jobs** or **GitHub Actions**
- Logging & monitoring via Vercel Dashboard


---

## ⚙️ Setup

### 1. Clone the Repository

        git clone https://github.com/Roshan-Muhmd/google-event-notify.git
        cd google-event-notify


### 3. Environment Variables

    GOOGLE_CLIENT_ID=<your-client-id>
    GOOGLE_CLIENT_SECRET=<your-client-secret>
    NEXTAUTH_SECRET=<your-random-secret>
    NEXTAUTH_URL=http://localhost:3000

### 4. Run Locally

    npm run dev

