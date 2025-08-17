import { NextResponse } from "next/server";
import { startScheduler } from "../../../../lib/scheduler";

let started = false;

export async function GET() {
    if (!started) {
      console.log("Cron job triggered",started);
    startScheduler();
    started = true;
  }
  return NextResponse.json({ status: "Cron started" });
}
