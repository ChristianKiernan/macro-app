import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthenticatedUser } from "@/lib/auth-helpers";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Get authenticated user
    const user = await getAuthenticatedUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const ingredient = await prisma.ingredient.findFirst({
      where: {
        id: params.id,
        userId: user.id, 
      },
    });

    if (!ingredient) {
      return NextResponse.json(
        { error: "Ingredient not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(ingredient);
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "An unknown error occurred";
    return NextResponse.json(
      { error: "Failed to fetch ingredient: " + message },
      { status: 500 }
    );
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Get authenticated user
    const user = await getAuthenticatedUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const requestData = await req.json();
    // Remove userId from request data (if present) and use authenticated user's ID
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { userId, ...updateData } = requestData;

    // Check if ingredient exists and belongs to user
    const existingIngredient = await prisma.ingredient.findFirst({
      where: {
        id: params.id,
        userId: user.id,
      },
    });

    if (!existingIngredient) {
      return NextResponse.json(
        { error: "Ingredient not found" },
        { status: 404 }
      );
    }

    // Update the ingredient
    const updatedIngredient = await prisma.ingredient.update({
      where: { id: params.id },
      data: updateData,
    });

    return NextResponse.json(updatedIngredient);
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "An unknown error occurred";
    return NextResponse.json(
      { error: "Failed to update ingredient: " + message },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Get authenticated user
    const user = await getAuthenticatedUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    //  Check if ingredient exists and belongs to user
    const existingIngredient = await prisma.ingredient.findFirst({
      where: {
        id: params.id,
        userId: user.id,
      },
    });

    if (!existingIngredient) {
      return NextResponse.json(
        { error: "Ingredient not found" },
        { status: 404 }
      );
    }

    // Delete ingredient from the database
    await prisma.ingredient.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ message: "Ingredient deleted successfully" });
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "An unknown error occurred";
    return NextResponse.json(
      { error: "Failed to delete ingredient: " + message },
      { status: 500 }
    );
  }
}
