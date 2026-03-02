"use server";

import { db } from "@/lib/db";
import { UserRole } from "@/lib/generated/prisma/enums";
import { currentUser } from "@clerk/nextjs/server";

export const onBoardUser = async () => {
  try {
    const user = await currentUser();
    if (!user) {
      return { success: false, error: "No authenticated user found" };
    }
    const { id, firstName, lastName, imageUrl, emailAddresses } = user;
    const newUser = await db.user.upsert({
      where: {
        clerkId: id,
      },
      update: {
        firstName: firstName || null,
        lastName: lastName || null,
        imageUrl: imageUrl || null,
        email: emailAddresses[0]?.emailAddress || "",
      },
      create: {
        clerkId: id,
        firstName: firstName || null,
        lastName: lastName || null,
        imageUrl: imageUrl || null,
        email: emailAddresses[0]?.emailAddress || "",
      },
    });
    return {
      success: true,
      user: newUser,
      message: "User onBoarded Sucessfully",
    };
  } catch (error) {
    console.error("onBoardUser error:", error);
    return {
      success: false,
      error: "Failed to onboard user",
    };
  }
};

export const currentUserRole = async () => {
  const user = await currentUser();
  if (!user) {
    return UserRole.USER;
  }
  const { id } = user;
  const userRole = await db.user.findUnique({
    where: {
      clerkId: id,
    },
    select: {
      role: true,
    },
  });
  return userRole?.role ?? UserRole.USER;
};
