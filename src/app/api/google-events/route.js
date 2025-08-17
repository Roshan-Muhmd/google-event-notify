import { NextResponse } from "next/server"

export async function GET(req) {
  try {
    const accessToken = req.headers.get("authorization")?.replace("Bearer ", "")
    if (!accessToken) {
      return NextResponse.json({ error: "Missing access token" }, { status: 401 })
    }

    const res = await fetch(
      "https://www.googleapis.com/calendar/v3/calendars/primary/events",
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    )

    const data = await res.json()
    return NextResponse.json(data)
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
