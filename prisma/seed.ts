import { PrismaClient, ServingUnit } from "../src/generated/prisma";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Starting database seeding...");

  // Clean up existing data (in correct order to avoid foreign key constraints)
  console.log("🧹 Cleaning up existing data...");
  await prisma.recipeAllergen.deleteMany();
  await prisma.ingredientAllergen.deleteMany();
  await prisma.recipeIngredient.deleteMany();
  await prisma.allergen.deleteMany();
  await prisma.recipe.deleteMany();
  await prisma.ingredient.deleteMany();
  await prisma.user.deleteMany();

  // Create test users
  console.log("👤 Creating users...");
  const user1 = await prisma.user.create({
    data: {
      email: "john@example.com",
      name: "John Doe",
    },
  });

  const user2 = await prisma.user.create({
    data: {
      email: "jane@example.com",
      name: "Jane Smith",
    },
  });

  console.log(`✅ Created users: ${user1.name} and ${user2.name}`);

  // Create allergens
  console.log("🚫 Creating allergens...");
  const glutenAllergen = await prisma.allergen.create({
    data: {
      name: "Gluten",
      userId: user1.id,
    },
  });

  const nutsAllergen = await prisma.allergen.create({
    data: {
      name: "Tree Nuts",
      userId: user1.id,
    },
  });

  const dairyAllergen = await prisma.allergen.create({
    data: {
      name: "Dairy",
      userId: user2.id,
    },
  });

  console.log(
    `✅ Created allergens: ${glutenAllergen.name}, ${nutsAllergen.name}, ${dairyAllergen.name}`
  );

  // Create ingredients
  console.log("🥕 Creating ingredients...");
  const chickenBreast = await prisma.ingredient.create({
    data: {
      name: "Chicken Breast",
      brand: "Organic Valley",
      calories: 165,
      fat: 3.6,
      protein: 31,
      carbs: 0,
      sugar: 0,
      servingSize: 100,
      servingUnit: ServingUnit.GRAM,
      userId: user1.id,
    },
  });

  const rice = await prisma.ingredient.create({
    data: {
      name: "White Rice",
      brand: "Uncle Ben's",
      calories: 130,
      fat: 0.3,
      protein: 2.7,
      carbs: 28,
      sugar: 0,
      servingSize: 1,
      servingUnit: ServingUnit.CUP,
      userId: user1.id,
    },
  });

  const flour = await prisma.ingredient.create({
    data: {
      name: "All-Purpose Flour",
      brand: "King Arthur",
      calories: 455,
      fat: 1.2,
      protein: 13,
      carbs: 95,
      sugar: 0.3,
      servingSize: 1,
      servingUnit: ServingUnit.CUP,
      userId: user2.id,
    },
  });

  const almonds = await prisma.ingredient.create({
    data: {
      name: "Raw Almonds",
      calories: 579,
      fat: 49.9,
      protein: 21.2,
      carbs: 21.6,
      sugar: 4.4,
      servingSize: 100,
      servingUnit: ServingUnit.GRAM,
      userId: user2.id,
    },
  });

  const milk = await prisma.ingredient.create({
    data: {
      name: "Whole Milk",
      brand: "Horizon Organic",
      calories: 61,
      fat: 3.3,
      protein: 3.2,
      carbs: 4.8,
      sugar: 5.1,
      servingSize: 100,
      servingUnit: ServingUnit.MILLIILITER,
      userId: user2.id,
    },
  });

  console.log(
    `✅ Created ${
      [chickenBreast, rice, flour, almonds, milk].length
    } ingredients`
  );

  // Create ingredient-allergen relationships
  console.log("🔗 Creating ingredient-allergen relationships...");
  await prisma.ingredientAllergen.create({
    data: {
      ingredientId: flour.id,
      allergenId: glutenAllergen.id,
    },
  });

  await prisma.ingredientAllergen.create({
    data: {
      ingredientId: almonds.id,
      allergenId: nutsAllergen.id,
    },
  });

  await prisma.ingredientAllergen.create({
    data: {
      ingredientId: milk.id,
      allergenId: dairyAllergen.id,
    },
  });

  console.log("✅ Created ingredient-allergen relationships");

  // Create recipes
  console.log("🍽️ Creating recipes...");
  const chickenRiceRecipe = await prisma.recipe.create({
    data: {
      name: "Chicken and Rice Bowl",
      description:
        "A simple and nutritious meal with grilled chicken breast and steamed rice.",
      servings: 2,
      userId: user1.id,
    },
  });

  const breadRecipe = await prisma.recipe.create({
    data: {
      name: "Simple White Bread",
      description: "Basic homemade white bread recipe.",
      servings: 8,
      userId: user2.id,
    },
  });

  console.log(
    `✅ Created recipes: ${chickenRiceRecipe.name}, ${breadRecipe.name}`
  );

  // Create recipe ingredients
  console.log("🥘 Adding ingredients to recipes...");
  await prisma.recipeIngredient.create({
    data: {
      recipeId: chickenRiceRecipe.id,
      ingredientId: chickenBreast.id,
      quantity: 200,
      unit: "grams",
    },
  });

  await prisma.recipeIngredient.create({
    data: {
      recipeId: chickenRiceRecipe.id,
      ingredientId: rice.id,
      quantity: 1,
      unit: "cup",
    },
  });

  await prisma.recipeIngredient.create({
    data: {
      recipeId: breadRecipe.id,
      ingredientId: flour.id,
      quantity: 3,
      unit: "cups",
    },
  });

  await prisma.recipeIngredient.create({
    data: {
      recipeId: breadRecipe.id,
      ingredientId: milk.id,
      quantity: 250,
      unit: "ml",
    },
  });

  console.log("✅ Added ingredients to recipes");

  // Create recipe-allergen relationships
  console.log("⚠️ Creating recipe-allergen relationships...");
  await prisma.recipeAllergen.create({
    data: {
      recipeId: breadRecipe.id,
      allergenId: glutenAllergen.id,
    },
  });

  await prisma.recipeAllergen.create({
    data: {
      recipeId: breadRecipe.id,
      allergenId: dairyAllergen.id,
    },
  });

  console.log("✅ Created recipe-allergen relationships");

  // Test database queries
  console.log("\n🔍 Testing database queries...");

  // Test 1: Get user with all related data
  const userWithData = await prisma.user.findUnique({
    where: { id: user1.id },
    include: {
      ingredients: true,
      recipes: {
        include: {
          ingredients: {
            include: {
              ingredient: true,
            },
          },
          allergens: {
            include: {
              allergen: true,
            },
          },
        },
      },
      allergens: true,
    },
  });

  console.log(`📊 User ${userWithData?.name} has:`);
  console.log(`   - ${userWithData?.ingredients.length} ingredients`);
  console.log(`   - ${userWithData?.recipes.length} recipes`);
  console.log(`   - ${userWithData?.allergens.length} allergens`);

  // Test 2: Calculate recipe nutrition
  const recipeWithNutrition = await prisma.recipe.findUnique({
    where: { id: chickenRiceRecipe.id },
    include: {
      ingredients: {
        include: {
          ingredient: true,
        },
      },
    },
  });

  if (recipeWithNutrition) {
    let totalCalories = 0;
    let totalProtein = 0;
    let totalCarbs = 0;
    let totalFat = 0;

    for (const recipeIngredient of recipeWithNutrition.ingredients) {
      const ingredient = recipeIngredient.ingredient;
      // Simple calculation assuming quantity is in same unit as serving size
      const ratio = recipeIngredient.quantity / ingredient.servingSize;
      totalCalories += ingredient.calories * ratio;
      totalProtein += ingredient.protein * ratio;
      totalCarbs += ingredient.carbs * ratio;
      totalFat += ingredient.fat * ratio;
    }

    console.log(`🍽️ ${recipeWithNutrition.name} nutrition (total):`);
    console.log(`   - Calories: ${Math.round(totalCalories)}`);
    console.log(`   - Protein: ${Math.round(totalProtein)}g`);
    console.log(`   - Carbs: ${Math.round(totalCarbs)}g`);
    console.log(`   - Fat: ${Math.round(totalFat)}g`);
  }

  // Test 3: Find recipes with allergens
  const recipesWithAllergens = await prisma.recipe.findMany({
    include: {
      allergens: {
        include: {
          allergen: true,
        },
      },
    },
    where: {
      allergens: {
        some: {},
      },
    },
  });

  console.log(
    `⚠️ Found ${recipesWithAllergens.length} recipes with allergen warnings`
  );
  for (const recipe of recipesWithAllergens) {
    const allergenNames = recipe.allergens
      .map((ra) => ra.allergen.name)
      .join(", ");
    console.log(`   - ${recipe.name}: ${allergenNames}`);
  }

  // Test 4: Find ingredients by allergen
  const glutenIngredients = await prisma.ingredient.findMany({
    where: {
      allergens: {
        some: {
          allergen: {
            name: "Gluten",
          },
        },
      },
    },
    include: {
      allergens: {
        include: {
          allergen: true,
        },
      },
    },
  });

  console.log(
    `🌾 Found ${glutenIngredients.length} ingredients containing gluten:`
  );
  glutenIngredients.forEach((ingredient) => {
    console.log(`   - ${ingredient.name}`);
  });

  console.log("\n✨ Database seeding completed successfully!");
  console.log("🎉 All relationships and queries are working correctly!");
}

main()
  .catch((e) => {
    console.error("❌ Error during seeding:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
