import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const id = req.nextUrl.searchParams.get("id");

  if (!id) {
    return NextResponse.json({ error: "Missing listing id" }, { status: 400 });
  }

  try {
    const res = await fetch(`https://garage-backend.onrender.com/listings/${id}`, {
      headers: {
        "Accept": "application/json, text/plain, */*",
        "Origin": "https://www.shopgarage.com",
        "Referer": "https://www.shopgarage.com/",
        "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36",
      },
    });
    

    if (!res.ok) {
      const text = await res.text();
      return NextResponse.json(
        { error: `Garage API error: ${res.status} — ${text}` },
        { status: res.status }
      );
    }

    const data = await res.json();
    console.log("Garage API response:", JSON.stringify(data, null, 2));
    return NextResponse.json(data);
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed to reach Garage API." }, { status: 500 });
  }
}
