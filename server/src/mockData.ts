// Mock data for responses
export const mockRecipes = [
    {
      name: "Mediterranean Herb Bowl",
      description: "A fresh and flavorful bowl combining your ingredients with Mediterranean flair",
      prepTime: "25 minutes",
      cookTime: "10 minutes",
      servings: 4,
      difficulty: "Easy",
      ingredients: ["olive oil", "lemon juice", "garlic", "salt", "black pepper", "fresh herbs"],
      instructions: [
        "Prepare all ingredients by washing and chopping as needed",
        "Heat olive oil in a large pan over medium heat",
        "Add garlic and sauté for 1 minute until fragrant",
        "Add your main ingredients and cook for 5-7 minutes",
        "Season with salt, pepper, and lemon juice",
        "Garnish with fresh herbs and serve warm"
      ],
      nutritionInfo: {
        calories: 320,
        protein: "12g",
        carbs: "45g",
        fat: "14g"
      }
    },
    {
      name: "Quick Stir-Fry Delight",
      description: "A quick and nutritious stir-fry using your available ingredients",
      prepTime: "15 minutes",
      cookTime: "8 minutes",
      servings: 3,
      difficulty: "Easy",
      ingredients: ["soy sauce", "garlic", "ginger", "sesame oil", "green onions"],
      instructions: [
        "Heat a wok or large skillet over high heat",
        "Add oil and let it get hot",
        "Add ginger and garlic, stir-fry for 30 seconds",
        "Add your main ingredients in order of cooking time needed",
        "Stir-fry for 3-5 minutes until tender-crisp",
        "Add soy sauce and seasonings, toss to combine",
        "Garnish with green onions and serve immediately"
      ],
      nutritionInfo: {
        calories: 285,
        protein: "18g",
        carbs: "32g",
        fat: "11g"
      }
    },
    {
      name: "Rustic Garden Pasta",
      description: "A hearty pasta dish that makes the most of fresh, seasonal ingredients",
      prepTime: "20 minutes",
      cookTime: "15 minutes",
      servings: 6,
      difficulty: "Medium",
      ingredients: ["pasta", "olive oil", "garlic", "cherry tomatoes", "basil", "parmesan"],
      instructions: [
        "Bring a large pot of salted water to boil and cook pasta according to package directions",
        "Heat olive oil in a large pan over medium heat",
        "Add garlic and cook until fragrant, about 1 minute",
        "Add cherry tomatoes and cook until they start to burst",
        "Drain pasta, reserving 1/2 cup pasta water",
        "Toss pasta with the tomato mixture, adding pasta water as needed",
        "Finish with fresh basil and grated parmesan"
      ],
      nutritionInfo: {
        calories: 420,
        protein: "15g",
        carbs: "68g",
        fat: "12g"
      }
    }
  ];
  
export const mockSubstitutions = {
    "eggs": {
      substitutions: [
        "1/4 cup applesauce per egg (for baking)",
        "1 tablespoon ground flaxseed + 3 tablespoons water per egg",
        "1/4 cup mashed banana per egg (adds sweetness)",
        "Commercial egg replacer (follow package instructions)",
        "1/4 cup silken tofu per egg (for baking)"
      ],
      notes: "For binding: flaxseed works best. For moisture: applesauce or banana. For leavening: commercial replacers."
    },
    "butter": {
      substitutions: [
        "Equal amount of coconut oil (solid state)",
        "3/4 the amount of olive oil",
        "Equal amount of vegan butter",
        "1/2 the amount of applesauce (for baking)",
        "Equal amount of avocado (for spreading)"
      ],
      notes: "For baking: coconut oil works best. For cooking: olive oil. For spreading: vegan butter or avocado."
    },
    "milk": {
      substitutions: [
        "Equal amount of almond milk",
        "Equal amount of oat milk",
        "Equal amount of soy milk",
        "Equal amount of coconut milk (canned for richness)",
        "Equal amount of rice milk"
      ],
      notes: "Oat milk froths well for coffee. Coconut milk adds richness to curries. Soy milk has most protein."
    },
    "flour": {
      substitutions: [
        "1:1 ratio of almond flour (reduce liquid slightly)",
        "3/4 cup rice flour per 1 cup wheat flour",
        "1:1 ratio of gluten-free flour blend",
        "3/4 cup coconut flour + extra liquid",
        "1:1 ratio of oat flour"
      ],
      notes: "Coconut flour absorbs more liquid. Almond flour adds richness. Rice flour is neutral-tasting."
    }
  };