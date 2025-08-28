import { prisma } from "@/lib/prisma";
import { NextResponse, NextRequest } from "next/server";
import { getAuthenticatedUser } from "@/lib/auth-helpers";
import bcrypt from "bcryptjs";

export async function GET() {
  try {
    const user = await getAuthenticatedUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userProfile = await prisma.user.findUnique({
      where: { id: user.id },
      select: {
        id: true,
        email: true,
        name: true,
        createdAt: true,

        // Include counts for dashboard statistics
        _count: {
          select: {
            ingredients: true,
            recipes: true,
            allergens: true,
          },
        },
      },
    });

    return NextResponse.json(userProfile);
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "An unknown error occurred";
    return NextResponse.json(
      { error: "Failed to fetch profile: " + message },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const user = await getAuthenticatedUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const updateData = await request.json();
    const { name, email, password, currentPassword } = updateData;

    // Prepare update object
    const dataToUpdate: {
      name?: string;
      email?: string;
      password?: string;
    } = {};

    // Update name if provided
    if (name !== undefined) {
      dataToUpdate.name = name;
    }

    // Update email if provided
    if (email !== undefined) {
      // Check if email is already taken by another user
      const existingUser = await prisma.user.findUnique({
        where: { email },
      });

      if (existingUser && existingUser.id !== user.id) {
        return NextResponse.json(
          { error: "Email is already taken by another user" },
          { status: 400 }
        );
      }

      dataToUpdate.email = email;
    }

    // Update password if provided
    if (password !== undefined) {
      // For password updates, we should verify the current password for security
      if (!currentPassword) {
        return NextResponse.json(
          { error: "Current password is required to update password" },
          { status: 400 }
        );
      }

      // Get user's current password from database
      const userWithPassword = await prisma.user.findUnique({
        where: { id: user.id },
        select: { password: true },
      });

      // Verify current password (only if user has a password; OAuth users might not)
      if (userWithPassword?.password) {
        const isCurrentPasswordValid = await bcrypt.compare(
          currentPassword,
          userWithPassword.password
        );

        if (!isCurrentPasswordValid) {
          return NextResponse.json(
            { error: "Current password is incorrect" },
            { status: 400 }
          );
        }
      }

      // Hash new password
      const hashedNewPassword = await bcrypt.hash(password, 12);
      dataToUpdate.password = hashedNewPassword;
    }

    // Perform the update
    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: dataToUpdate,
      select: {
        id: true,
        email: true,
        name: true,
        updatedAt: true,
      },
    });

    return NextResponse.json({
      message: "Profile updated successfully",
      user: updatedUser,
    });
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "An unknown error occurred";
    return NextResponse.json(
      { error: "Failed to update profile: " + message },
      { status: 500 }
    );
  }
}
