import { prisma } from "../../../../lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { Role } from "@prisma/client";

export async function POST(request: Request) {
  const { searchParams } = new URL(request.url);
  const role = searchParams.get("role");

  const { userId } = auth();
  if (!userId) {
    return NextResponse.json(
      { success: false, message: "Unauthorized" },
      {
        status: 400,
      }
    );
  }
  if (!role) {
    return NextResponse.json(
      { success: false, message: "Missing userId or role" },
      {
        status: 400,
      }
    );
  }

  try {
    const user = await prisma.user.findUnique({
      where: { userId: userId },
    });
    if (!user) {
      return new Response("User not found", {
        status: 404,
      });
    }

    const updatedUser = await prisma.user.update({
      where: { userId: userId },
      data: { role: role as Role },
    });

    return NextResponse.json(
      {
        success: true,
        user: updatedUser,
        message: "user role added successfully",
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error updating user role", error);
    return NextResponse.json(
      { success: false, message: "Error updating user" },
      { status: 500 }
    );
  }
}
