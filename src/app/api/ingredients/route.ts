import { prisma } from "@/lib/prisma";
import { NextResponse, NextRequest } from "next/server";
import { getAuthenticatedUser } from "@/lib/auth-helpers";

export async function GET() {
  try {
    // Get authenticated user
    const user = await getAuthenticatedUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Only return ingredients belonging to the authenticated user
    const ingredients = await prisma.ingredient.findMany({
      where: { userId: user.id },
      orderBy: { name: "desc" },
    });
    return NextResponse.json(ingredients);
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "An unknown error occurred";
    return NextResponse.json(
      { error: "Failed to fetch ingredients: " + message },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    // Get authenticated user
    const user = await getAuthenticatedUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const requestData = await request.json();

    // Remove userId from request data (if present) and use authenticated user's ID
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { userId, ...ingredientData } = requestData;

    const newIngredient = await prisma.ingredient.create({
      data: {
        ...ingredientData,
        userId: user.id, 
      },
    });
    return NextResponse.json(newIngredient, { status: 201 });
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "An unknown error occurred";
    return NextResponse.json(
      { error: "Failed to create ingredient: " + message },
      { status: 500 }
    );
  }
}
