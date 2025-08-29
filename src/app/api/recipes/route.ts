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

    // Only return recipes belonging to the authenticated user
    const recipes = await prisma.recipe.findMany({
      where: { userId: user.id },
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
      orderBy: { name: "desc" },
    });

    // Transform to match expected format
    const transformedRecipes = recipes.map((recipe) => ({
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
    }));

    return NextResponse.json(transformedRecipes);
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "An unknown error occurred";
    return NextResponse.json(
      { error: "Failed to fetch recipes: " + message },
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
    const { userId, ingredients, allergens, ...recipeData } = requestData;

    // Ensure servings is a number
    if (typeof recipeData.servings === "string") {
      recipeData.servings = parseInt(recipeData.servings, 10);
    }

    // Create the recipe first
    const newRecipe = await prisma.recipe.create({
      data: {
        ...recipeData,
        userId: user.id,
      },
    });

    // Handle ingredients if any are provided
    if (ingredients && ingredients.length > 0) {
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
            recipeId: newRecipe.id,
            ingredientId: ingredientItem.ingredientId,
            quantity: parseFloat(ingredientItem.quantity),
            unit: ingredientItem.unit,
          },
        });
      }
    }

    // Handle allergens if any are provided
    if (allergens && allergens.length > 0) {
      // Create or find allergens and link them to the recipe
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
            recipeId: newRecipe.id,
            allergenId: allergen.id,
          },
        });
      }
    }

    // Fetch the complete recipe with ingredients and allergens for the response
    const completeRecipe = await prisma.recipe.findUnique({
      where: { id: newRecipe.id },
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

    // Transform to match expected format
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

    return NextResponse.json(transformedRecipe, { status: 201 });
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "An unknown error occurred";
    console.error("Error creating recipe:", error);
    return NextResponse.json(
      { error: "Failed to create recipe: " + message },
      { status: 500 }
    );
  }
}
