// lib/scheduler.js
import cron from "node-cron";
import { google } from "googleapis";
import twilio from "twilio";
import dbConnect from "./dbconnect";
import User from "../models/User.js";

const client = twilio(process.env.TWILIO_SID, process.env.TWILIO_AUTH_TOKEN);

function formatDate(d) {
  return {
    utc: d.toISOString(),
    local: d.toLocaleString(),
  };
}

async function processUser(user) {
     console.log(`Processing user: ${user.email}`);
  if (!user.googleRefreshToken || !user.phoneNumber) return;
  console.log(`token: ${user.googleRefreshToken}, phone: ${user.phoneNumber}`);
  try {
    // Google OAuth client
    const oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      process.env.GOOGLE_REDIRECT_URI
    );

    oauth2Client.setCredentials({
      refresh_token: user.googleRefreshToken,
    });

    const { token } = await oauth2Client.getAccessToken();
    oauth2Client.setCredentials({ access_token: token });

    const calendar = google.calendar({ version: "v3", auth: oauth2Client });

    const now = new Date();
    const in5 = new Date(now.getTime() + 5 * 60 * 1000);
    const oneDayLater = new Date(now.getTime() + 24 * 60 * 60 * 1000);

    // Fetch upcoming events ordered by start time
    const res = await calendar.events.list({
      calendarId: "primary",
      timeMin: now.toISOString(), // only from now onwards
      timeMax: oneDayLater.toISOString(), // up to one day later
      maxResults: 20,
      singleEvents: true,
      orderBy: "startTime",
    });

    const events = res.data.items || [];
    const calledEventIds = user.calledEventIds || [];
    console.log("events:",events)

    for (const event of events) {
      const start = new Date(event.start.dateTime || event.start.date);
      const end = new Date(event.end.dateTime || event.end.date);

      const isOngoing = start <= now && end >= now;
      const startsSoon = start >= now && start <= in5;


      // stop if event starts after 5 mins (since sorted, no need to check further)
      if (start > in5) break;

      if ((isOngoing || startsSoon) && !calledEventIds.includes(event.id)) {
        console.log(`Triggering call for ${user.email}:`, event.summary);

        await client.calls.create({
          url: "http://demo.twilio.com/docs/voice.xml", // Replace with TwiML endpoint
          to: user.phoneNumber,
          from: process.env.TWILIO_PHONE_NUMBER,
        });

        console.log(`Call triggered to ${user.phoneNumber} for event ${event.id}`);

        // Only add if not already present
        if (!user.calledEventIds.includes(event.id)) {
          user.calledEventIds.push(event.id);
          await user.save();
        }

        // Exit loop for this user after first triggered call
        break;
      }
    }
  } catch (err) {
    console.error(`Error checking events for ${user.email}:`, err.message);
  }
}

async function checkEventsAndCall() {
  await dbConnect();
  const users = await User.find({}); // fetch all users
     console.log(`users found: ${users.length}`);
  // Process users in parallel
  await Promise.all(users.map(processUser));
}

// Run every minute
export function startScheduler() {
     console.log(`cron job started at ${new Date().toISOString()}`);
  cron.schedule("* * * * *", checkEventsAndCall);
}
