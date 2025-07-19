import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/authOptions";

const prisma = new PrismaClient();

export async function GET() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const events = await prisma.event.findMany({
    where: {
      user: {
        email: session.user.email,
      },
    },
  });

  return NextResponse.json(events);
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const data = await request.json();
    console.log("Received event data:", data);

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Convert date strings to DateTime objects
    const eventData = {
      title: data.title,
      start: new Date(data.start + (data.allDay ? "T00:00:00" : "")),
      end: new Date(data.end + (data.allDay ? "T23:59:59" : "")),
      allDay: data.allDay || false,
      timezone: data.timezone || "UTC",
      recurring: data.recurring ? JSON.stringify(data.recurring) : undefined,
      userId: user.id,
    };

    console.log("Processed event data:", eventData);

    const newEvent = await prisma.event.create({
      data: eventData,
    });

    console.log("Created event:", newEvent);
    return NextResponse.json(newEvent);
  } catch (error) {
    console.error("Error creating event:", error);
    return NextResponse.json(
      {
        error: "Failed to create event",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
