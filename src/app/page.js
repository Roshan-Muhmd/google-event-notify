'use client';
import { useState } from "react";
import { useSession, signIn, signOut } from "next-auth/react"
import { format } from "date-fns";
import { useEffect } from "react";

export default function Home() {

   const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [events, setEvents] = useState([])
  

  const { data: session, status } = useSession();

  // Fetch events and user phone number on page load

  const getEvents = async () => {
    const now = new Date();
    const oneYearLater = new Date();
    oneYearLater.setFullYear(now.getFullYear() + 3);
    const url = new URL("https://www.googleapis.com/calendar/v3/calendars/primary/events");
    url.searchParams.set("singleEvents", "true");
    url.searchParams.set("orderBy", "startTime");
    url.searchParams.set("timeMin", now.toISOString());
    url.searchParams.set("timeMax", oneYearLater.toISOString());
    const res = await fetch(url, {
      headers: {
        Authorization: `Bearer ${session?.accessToken}`,
      },
    });
    const data = await res.json();
    setEvents(data.items || []);
  };

  const fetchUserPhone = async () => {
    if (!session?.user?.email) return;
    const res = await fetch("/api/user?email=" + encodeURIComponent(session.user.email));
    if (res.ok) {
      const data = await res.json();
      if (data.phoneNumber) setPhone(data.phoneNumber);
    }
  };

  useEffect(() => {
    if (status === "authenticated") {
      getEvents();
      fetchUserPhone();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status, session]);




const save = async () => {

  if(phone.trim() === "") {
    setMessage("Phone number is required");
    return;
  }
  setLoading(true);
  setMessage("");
  try {
    const res = await fetch("/api/user", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: session?.user?.email,
        phoneNumber: phone,
        googleRefreshToken: session?.refreshToken, // Add refresh token
      }),
    });

    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || "Failed to save");
    }

    setMessage("Saved.");
  } catch (e) {
    setMessage(e.message || "An error occurred");
  } finally {
    setLoading(false);
  }
};


  return (
    <div className="font-sans min-h-screen bg-gray-50 dark:bg-gray-900 p-8 grid place-items-center">
      <main className="w-full max-w-4xl space-y-8 bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Google Calendar Call Reminders</h1>

        {status !== "authenticated" ? (
          <button
            onClick={() => signIn("google")}
            className="w-full m-20 max-w-2xl h-10 rounded-lg bg-black text-white dark:bg-white dark:text-black font-medium transition hover:bg-gray-800 dark:hover:bg-gray-200"
          >
            Sign in with Google
          </button>
        ) : (
          <div className="space-y-6">
            <div className="text-sm text-gray-700 dark:text-gray-300">Signed in as <span className="font-semibold">{session.user?.email || ""}</span></div>
            <div className="flex gap-2">
              <input
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="flex-1 h-10 rounded-lg border max-w-lg border-gray-300 dark:border-gray-700 px-3 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter phonenumber with country code e.g. +15551234567"
              />
              <button
                onClick={save}
                disabled={loading}
                className="h-10 rounded-lg px-4 bg-blue-600 text-white font-semibold transition hover:bg-blue-700 disabled:opacity-60"
              >
                {loading ? "Saving..." : "Save"}
              </button>
            </div>
            {message && <div className="text-sm text-blue-600 dark:text-blue-400">{message}</div>}
            <button
              onClick={() => signOut()}
              className="text-sm underline text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition"
            >
              Sign out
            </button>

            <div className="bg-gray-100 dark:bg-gray-700 rounded-lg p-4 mt-4">
              <h2 className="text-lg font-semibold text-gray-800 dark:text-white mb-2">Google Calendar Events</h2>
              <button
                onClick={getEvents}
                className="mb-4 px-4 py-2 rounded bg-blue-500 text-white font-medium hover:bg-blue-600 transition"
              >
                Load Events
              </button>
              <ul className="space-y-2">
                {events.map((event) => {
                  let dateStr = event.start?.dateTime || event.start?.date;
                  let formattedDate = dateStr
                    ? format(new Date(dateStr), event.start?.dateTime ? "PPpp" : "PPP")
                    : "";
                  return (
                    <li key={event.id} className="p-2 rounded bg-white dark:bg-gray-800 shadow text-gray-900 dark:text-gray-100">
                      <strong>{event.summary}</strong>
                      <span className="ml-2 text-sm text-gray-600 dark:text-gray-400">
                        — {formattedDate}
                      </span>
                    </li>
                  );
                })}
              </ul>
            </div>
          </div>
        )}

        <p className="text-xs opacity-70 text-gray-500 dark:text-gray-400 mt-6">
          A cron job will call your phone 5 minutes before events on your primary calendar.
        </p>
      </main>
    </div>
  );
}
