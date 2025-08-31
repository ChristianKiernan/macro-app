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

    const recipe = await prisma.recipe.findFirst({
      where: {
        id,
        userId: user.id,
      },
      include: {
        ingredients: {
          include: {
            ingredient: {
              include: {
                allergens: {
                  include: {
                    allergen: true,
                  },
                },
              },
            },
          },
        },
        allergens: {
          include: {
            allergen: true,
          },
        },
      },
    });

    if (!recipe) {
      return NextResponse.json({ error: "Recipe not found" }, { status: 404 });
    }

    // Transform the data to match the frontend interface
    const transformedRecipe = {
      ...recipe,
      ingredients: recipe.ingredients.map((ri) => ({
        ingredient: {
          ...ri.ingredient,
          allergens: ri.ingredient.allergens.map((ia) => ia.allergen.name),
        },
        quantity: ri.quantity,
        unit: ri.unit,
      })),
      allergens: recipe.allergens.map((ra) => ra.allergen.name),
    };

    return NextResponse.json(transformedRecipe);
  } catch (error) {
    console.error("Error fetching recipe:", error);
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
    // Remove ingredients and allergens from request data (handle separately)
    const { ingredients = [], allergens = [], ...updateData } = requestData;

    // Ensure servings is a number if it exists
    if (typeof updateData.servings === "string") {
      updateData.servings = parseInt(updateData.servings, 10);
    }

    // Check if recipe exists and belongs to user
    const existingRecipe = await prisma.recipe.findFirst({
      where: {
        id,
        userId: user.id,
      },
    });

    if (!existingRecipe) {
      return NextResponse.json({ error: "Recipe not found" }, { status: 404 });
    }

    // Update the recipe basic data
    await prisma.recipe.update({
      where: { id },
      data: updateData,
    });

    // Handle ingredient updates
    // First, remove all existing ingredient relationships
    await prisma.recipeIngredient.deleteMany({
      where: { recipeId: id },
    });

    // Then create new ingredient relationships
    if (ingredients.length > 0) {
      for (const ingredientItem of ingredients) {
        // Validate that the ingredient belongs to the user
        const ingredient = await prisma.ingredient.findFirst({
          where: {
            id: ingredientItem.ingredientId,
            userId: user.id,
          },
        });

        if (!ingredient) {
          throw new Error(
            `Ingredient ${ingredientItem.ingredientId} not found or not accessible`
          );
        }

        // Create the recipe-ingredient relationship
        await prisma.recipeIngredient.create({
          data: {
            recipeId: id,
            ingredientId: ingredientItem.ingredientId,
            quantity: parseFloat(ingredientItem.quantity),
            unit: ingredientItem.unit,
          },
        });
      }
    }

    // Handle allergen updates
    // First, remove all existing allergen relationships
    await prisma.recipeAllergen.deleteMany({
      where: { recipeId: id },
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

        // Create the recipe-allergen relationship
        await prisma.recipeAllergen.create({
          data: {
            recipeId: id,
            allergenId: allergen.id,
          },
        });
      }
    }

    // Fetch the complete updated recipe with ingredients and allergens
    const completeRecipe = await prisma.recipe.findUnique({
      where: { id },
      include: {
        ingredients: {
          include: {
            ingredient: {
              include: {
                allergens: {
                  include: {
                    allergen: true,
                  },
                },
              },
            },
          },
        },
        allergens: {
          include: {
            allergen: true,
          },
        },
      },
    });

    // Transform to match our interface format
    const transformedRecipe = {
      ...completeRecipe,
      ingredients:
        completeRecipe?.ingredients.map((ri) => ({
          ingredient: {
            ...ri.ingredient,
            allergens: ri.ingredient.allergens.map((ia) => ia.allergen.name),
          },
          quantity: ri.quantity,
          unit: ri.unit,
        })) || [],
      allergens: completeRecipe?.allergens.map((ra) => ra.allergen.name) || [],
    };

    return NextResponse.json(transformedRecipe);
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "An unknown error occurred";
    return NextResponse.json(
      { error: "Failed to update recipe: " + message },
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

    // Check if recipe exists and belongs to user
    const existingRecipe = await prisma.recipe.findFirst({
      where: {
        id,
        userId: user.id,
      },
    });

    if (!existingRecipe) {
      return NextResponse.json({ error: "Recipe not found" }, { status: 404 });
    }

    // Delete recipe from the database
    // The cascade deletes will handle RecipeIngredient and RecipeAllergen relationships
    await prisma.recipe.delete({
      where: { id },
    });

    return NextResponse.json({ message: "Recipe deleted successfully" });
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "An unknown error occurred";
    return NextResponse.json(
      { error: "Failed to delete recipe: " + message },
      { status: 500 }
    );
  }
}
