import { db } from "@/lib/db";
import { currentUser } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export async function GET(req) {
  try {
    const user = await currentUser();
    if (!user) {
      return NextResponse.json(
        {
          success: false,
          error: "Unauthorized",
        },
        { status: 401 },
      );
    }

    const dbUser = await db.user.findUnique({
      where: {
        clerkId: user.id,
      },
    });

    if (!dbUser) {
      return NextResponse.json(
        {
          success: false,
          error: "User not found",
        },
        { status: 404 },
      );
    }

    const playlists = await db.playlist.findMany({
      where: { userId: dbUser.id },
      include: {
        problems: {
          include: {
            problem: {
              select: {
                id: true,
                title: true,
                difficulty: true,
              },
            },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    if (!playlists) {
      return NextResponse.json(
        {
          success: false,
          error: "Create a playlist",
        },
        { status: 400 },
      );
    }

    return NextResponse.json(
      {
        success: true,
        playlists,
      },
      { status: 201 },
    );
  } catch (error) {
    console.log("failed to fetch playlist", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch playlists",
      },
      { status: 500 },
    );
  }
}

export async function POST(req) {
  try {
    const user = await currentUser();
    if (!user) {
      return NextResponse.json(
        {
          success: false,
          error: "Unauthorized",
        },
        { status: 401 },
      );
    }

    const dbUser = await db.user.findUnique({
      where: {
        clerkId: user.id,
      },
    });

    if (!dbUser) {
      return NextResponse.json(
        {
          success: false,
          error: "User not found",
        },
        { status: 404 },
      );
    }

    const { name, description } = await req.json();

    if (!name) {
      return NextResponse.json(
        {
          success: false,
          error: "Name is required",
        },
        { status: 400 },
      );
    }

    const playlistData = await db.playlist.create({
      data: {
        name,
        description,
        userId: dbUser.id,
      },
    });

    return NextResponse.json(
      {
        success: true,
        playlistData,
      },
      { status: 201 },
    );
  } catch (error) {
    console.log("Failed to created a playlist", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to create a playlist",
      },
      { status: 500 },
    );
  }
}
