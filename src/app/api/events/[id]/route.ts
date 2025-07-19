import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../auth/authOptions";

const prisma = new PrismaClient();

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  const { id } = await params;

  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const data = await request.json();
    console.log("Received update data:", data);

    // Verify the event belongs to the user
    const existingEvent = await prisma.event.findFirst({
      where: {
        id: id,
        user: {
          email: session.user.email,
        },
      },
    });

    if (!existingEvent) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 });
    }

    // Convert date strings to DateTime objects
    const updateData = {
      title: data.title,
      start: data.start
        ? new Date(data.start + (data.allDay ? "T00:00:00" : ""))
        : undefined,
      end: data.end
        ? new Date(data.end + (data.allDay ? "T23:59:59" : ""))
        : undefined,
      allDay: data.allDay,
      timezone: data.timezone,
      recurring: data.recurring ? JSON.stringify(data.recurring) : undefined,
    };

    console.log("Processed update data:", updateData);

    const updatedEvent = await prisma.event.update({
      where: { id: id },
      data: updateData,
    });

    console.log("Updated event:", updatedEvent);
    return NextResponse.json(updatedEvent);
  } catch (error) {
    console.error("Error updating event:", error);
    return NextResponse.json(
      {
        error: "Failed to update event",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  const { id } = await params;

  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // Verify the event belongs to the user
    const existingEvent = await prisma.event.findFirst({
      where: {
        id: id,
        user: {
          email: session.user.email,
        },
      },
    });

    if (!existingEvent) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 });
    }

    await prisma.event.delete({
      where: { id: id },
    });

    return NextResponse.json({ message: "Event deleted successfully" });
  } catch (error) {
    console.error("Error deleting event:", error);
    return NextResponse.json(
      { error: "Failed to delete event" },
      { status: 500 }
    );
  }
}
