import dbConnect from "../../../lib/dbconnect";
import User from "../../../models/User";

export async function PUT(req) {
  await dbConnect();

  try {
    const body = await req.json();
    const { name, email, googleRefreshToken, phoneNumber } = body;

    if (!email) {
      return new Response(JSON.stringify({ error: "Email is required" }), { status: 400 });
    }

    const user = await User.findOneAndUpdate(
      { email },
      { name, googleRefreshToken, phoneNumber },
      { new: true, upsert: true } // creates if not exists
    );

    return new Response(JSON.stringify(user), { status: 200 });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
}

export async function PATCH(req) {
  await dbConnect();

  try {
    const body = await req.json();
    const { email, ...updates } = body;

    if (!email) {
      return new Response(JSON.stringify({ error: "Email is required" }), { status: 400 });
    }

    const user = await User.findOneAndUpdate(
      { email },
      { $set: updates }, // only update provided fields
      { new: true }
    );

    if (!user) {
      return new Response(JSON.stringify({ error: "User not found" }), { status: 404 });
    }

    return new Response(JSON.stringify(user), { status: 200 });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
}

export async function GET(req) {
  await dbConnect();

  try {
    const { searchParams } = new URL(req.url);
    const email = searchParams.get("email");

    if (!email) {
      return new Response(JSON.stringify({ error: "Email required" }), { status: 400 });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return new Response(JSON.stringify({ error: "User not found" }), { status: 404 });
    }

    return new Response(JSON.stringify({
      phoneNumber: user.phoneNumber || null,
    }), { status: 200 });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
}
