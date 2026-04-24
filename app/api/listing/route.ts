import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const id = req.nextUrl.searchParams.get("id");

  if (!id) {
    return NextResponse.json({ error: "Missing listing id" }, { status: 400 });
  }

  try {
    const res = await fetch(`https://api.shopgarage.com/listing?field_id=${id}`);

    if (!res.ok) {
      const text = await res.text();
      return NextResponse.json(
        { error: `Garage API error: ${res.status} — ${text}` },
        { status: res.status }
      );
    }

    const data = await res.json();
    return NextResponse.json(data);
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed to reach Garage API." }, { status: 500 });
  }
}
