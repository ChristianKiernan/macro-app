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
      include: {
        allergens: {
          include: {
            allergen: true,
          },
        },
      },
      orderBy: { name: "desc" },
    });

    // Transform to match our interface format
    const transformedIngredients = ingredients.map((ingredient) => ({
      ...ingredient,
      allergens: ingredient.allergens.map((ia) => ia.allergen.name),
    }));

    return NextResponse.json(transformedIngredients);
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
    const { userId, allergens, ...ingredientData } = requestData;

    // Ensure servingSize is a number
    if (typeof ingredientData.servingSize === "string") {
      ingredientData.servingSize = parseFloat(ingredientData.servingSize);
    }

    // Create the ingredient first
    const newIngredient = await prisma.ingredient.create({
      data: {
        ...ingredientData,
        userId: user.id,
      },
    });

    // Handle allergens if any are provided
    if (allergens.length > 0) {
      // Create or find allergens and link them to the ingredient
      for (const allergenName of allergens) {
        // Find or create the allergen
        const allergen = await prisma.allergen.upsert({
          where: {
            userId_name: {
              userId: user.id,
              name: allergenName.trim(),
            },
          },
          update: {}, // No update needed if exists
          create: {
            userId: user.id,
            name: allergenName.trim(),
          },
        });

        // Create the ingredient-allergen relationship
        await prisma.ingredientAllergen.create({
          data: {
            ingredientId: newIngredient.id,
            allergenId: allergen.id,
          },
        });
      }
    }

    // Fetch the complete ingredient with allergens for the response
    const completeIngredient = await prisma.ingredient.findUnique({
      where: { id: newIngredient.id },
      include: {
        allergens: {
          include: {
            allergen: true,
          },
        },
      },
    });

    // Transform to match our interface format
    const transformedIngredient = {
      ...completeIngredient,
      allergens:
        completeIngredient?.allergens.map((ia) => ia.allergen.name) || [],
    };

    return NextResponse.json(transformedIngredient, { status: 201 });
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "An unknown error occurred";
    console.error("Error creating ingredient:", error);
    return NextResponse.json(
      { error: "Failed to create ingredient: " + message },
      { status: 500 }
    );
  }
}
