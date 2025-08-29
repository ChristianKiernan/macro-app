import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthenticatedUser } from "@/lib/auth-helpers";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const user = await getAuthenticatedUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const ingredient = await prisma.ingredient.findFirst({
      where: {
        id,
        userId: user.id,
      },
      include: {
        allergens: {
          include: {
            allergen: true,
          },
        },
      },
    });

    if (!ingredient) {
      return NextResponse.json(
        { error: "Ingredient not found" },
        { status: 404 }
      );
    }

    // Transform the data to match the frontend interface
    const transformedIngredient = {
      ...ingredient,
      allergens: ingredient.allergens.map((ia) => ia.allergen.name),
    };

    return NextResponse.json(transformedIngredient);
  } catch (error) {
    console.error("Error fetching ingredient:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    // Get authenticated user
    const user = await getAuthenticatedUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const requestData = await req.json();
    // Remove userId and allergens from request data (handle separately)
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { userId, allergens = [], ...updateData } = requestData;

    // Ensure servingSize is a number if it exists
    if (typeof updateData.servingSize === "string") {
      updateData.servingSize = parseFloat(updateData.servingSize);
    }

    // Check if ingredient exists and belongs to user
    const existingIngredient = await prisma.ingredient.findFirst({
      where: {
        id,
        userId: user.id,
      },
    });

    if (!existingIngredient) {
      return NextResponse.json(
        { error: "Ingredient not found" },
        { status: 404 }
      );
    }

    // Update the ingredient basic data
    await prisma.ingredient.update({
      where: { id },
      data: updateData,
    });

    // Handle allergen updates
    // First, remove all existing allergen relationships
    await prisma.ingredientAllergen.deleteMany({
      where: { ingredientId: id },
    });

    // Then create new allergen relationships
    if (allergens.length > 0) {
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
            ingredientId: id,
            allergenId: allergen.id,
          },
        });
      }
    }

    // Fetch the complete updated ingredient with allergens
    const completeIngredient = await prisma.ingredient.findUnique({
      where: { id },
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

    return NextResponse.json(transformedIngredient);
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
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    // Get authenticated user
    const user = await getAuthenticatedUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    //  Check if ingredient exists and belongs to user
    const existingIngredient = await prisma.ingredient.findFirst({
      where: {
        id,
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
      where: { id },
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
