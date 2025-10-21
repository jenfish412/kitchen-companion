import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import OpenAI from 'openai';

import { mockRecipes, mockSubstitutions } from './mockData';

// Load environment variables
dotenv.config();

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Daily usage tracking
let dailyUsage = {
  date: new Date().toDateString(),
  count: 0,
  maxDaily: 5 // Maximum 5 AI recipe requests per day
};

// Daily substitution usage tracking
let dailySubstitutionUsage = {
  date: new Date().toDateString(),
  count: 0,
  maxDaily: 5 // Maximum 5 AI substitution requests per day
};

// Function to check and update daily usage
const checkDailyLimit = () => {
  const today = new Date().toDateString();
  
  // Reset counter if it's a new day
  if (dailyUsage.date !== today) {
    dailyUsage = {
      date: today,
      count: 0,
      maxDaily: 5
    };
  }
  
  return {
    canProceed: dailyUsage.count < dailyUsage.maxDaily,
    current: dailyUsage.count,
    max: dailyUsage.maxDaily,
    remaining: dailyUsage.maxDaily - dailyUsage.count
  };
};

// Function to check and update daily substitution usage
const checkDailySubstitutionLimit = () => {
  const today = new Date().toDateString();
  
  // Reset counter if it's a new day
  if (dailySubstitutionUsage.date !== today) {
    dailySubstitutionUsage = {
      date: today,
      count: 0,
      maxDaily: 5
    };
  }
  
  return {
    canProceed: dailySubstitutionUsage.count < dailySubstitutionUsage.maxDaily,
    current: dailySubstitutionUsage.count,
    max: dailySubstitutionUsage.maxDaily,
    remaining: dailySubstitutionUsage.maxDaily - dailySubstitutionUsage.count
  };
};

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors({
  origin: [
    process.env.FRONTEND_URL || 'http://localhost:5173',
    'http://localhost:3001', // For local testing with deployed backend
    'http://localhost:3000'  // Backup in case it runs on 3000
  ],
  credentials: true
}));
app.use(express.json());


// Simulate processing delay
const simulateDelay = (ms: number = 1500) => new Promise(resolve => setTimeout(resolve, ms));

// Basic health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    message: 'Kitchen Companion Server is running!'
  });
});

// OpenAI API test endpoint
app.get('/api/test-openai', async (req, res) => {
  try {
    console.log('🤖 Testing OpenAI API connection...');
    
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "user",
          content: "Say 'Hello from OpenAI! Your API key is working correctly.' in exactly that format."
        }
      ],
      max_tokens: 50,
      temperature: 0
    });

    const response = completion.choices[0]?.message?.content || 'No response received';
    
    console.log('✅ OpenAI API test successful');
    console.log('📝 Response:', response);

    res.json({
      success: true,
      message: 'OpenAI API key is working correctly!',
      response: response,
      model: completion.model,
      usage: completion.usage,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ OpenAI API test failed:', error);
    
    let errorMessage = 'Unknown error occurred';
    let errorType = 'unknown';

    if (error instanceof Error) {
      errorMessage = error.message;
      
      // Check for common OpenAI API errors
      if (error.message.includes('401')) {
        errorType = 'authentication';
        errorMessage = 'Invalid API key - please check your OPENAI_API_KEY in .env file';
      } else if (error.message.includes('429')) {
        errorType = 'rate_limit';
        errorMessage = 'Rate limit exceeded or quota reached';
      } else if (error.message.includes('network') || error.message.includes('ENOTFOUND')) {
        errorType = 'network';
        errorMessage = 'Network error - check your internet connection';
      }
    }

    res.status(500).json({
      success: false,
      error: errorType,
      message: errorMessage,
      timestamp: new Date().toISOString()
    });
  }
});

// Generate mock recipe endpoint
app.post('/api/generate-mock-recipe', async (req, res) => {
  try {
    const { ingredients, dietaryRestrictions = [], mealType = 'any', servings = 4 } = req.body;

    if (!ingredients || !Array.isArray(ingredients) || ingredients.length === 0) {
      return res.status(400).json({ 
        error: 'Ingredients array is required and must not be empty' 
      });
    }

    console.log(`🍳 Generating recipe for ingredients: ${ingredients.join(', ')}`);
    
    // Simulate AI processing time
    await simulateDelay(2000);

    // Select a random recipe and customize it
    const baseRecipe = mockRecipes[Math.floor(Math.random() * mockRecipes.length)];
    
    // Merge user ingredients with recipe ingredients
    const combinedIngredients = [...new Set([...ingredients, ...baseRecipe.ingredients])];
    
    const customizedRecipe = {
      ...baseRecipe,
      ingredients: combinedIngredients,
      servings: servings,
      generatedAt: new Date().toISOString(),
      usedIngredients: ingredients,
      dietaryRestrictions: dietaryRestrictions,
      mealType: mealType
    };

    res.json({ 
      success: true,
      recipe: customizedRecipe,
      message: `Recipe generated using ${ingredients.length} of your ingredients!`
    });

  } catch (error) {
    console.error('Error generating recipe:', error);
    res.status(500).json({ 
      error: 'Failed to generate recipe',
      message: 'Internal server error occurred while generating recipe'
    });
  }
});

// Ingredient substitution endpoint
app.post('/api/substitute-mock-ingredient', async (req, res) => {
  try {
    const { ingredient } = req.body;

    if (!ingredient || typeof ingredient !== 'string') {
      return res.status(400).json({ 
        error: 'Ingredient name is required and must be a string' 
      });
    }

    console.log(`🔄 Finding substitutions for: ${ingredient}`);

    // Simulate processing time
    await simulateDelay(1200);

    const lowerIngredient = ingredient.toLowerCase().trim();
    const substitutionData = mockSubstitutions[lowerIngredient as keyof typeof mockSubstitutions];

    if (substitutionData) {
      res.json({
        success: true,
        originalIngredient: ingredient,
        substitutions: substitutionData.substitutions,
        notes: substitutionData.notes,
        generatedAt: new Date().toISOString()
      });
    } else {
      // Generic response for ingredients not in our mock data
      res.json({
        success: true,
        originalIngredient: ingredient,
        substitutions: [
          `Try searching online for "${ingredient} substitute"`,
          "Check if you have similar ingredients in the same food category",
          "Consider the ingredient's role (binding, flavoring, texture) and find alternatives",
          "Ask at your local grocery store for recommendations"
        ],
        notes: `No specific substitutions available for "${ingredient}" in our database, but these general tips might help!`,
        generatedAt: new Date().toISOString()
      });
    }

  } catch (error) {
    console.error('Error finding substitutions:', error);
    res.status(500).json({ 
      error: 'Failed to find substitutions',
      message: 'Internal server error occurred while finding ingredient substitutions'
    });
  }
});

// Meal plan generation endpoint
app.post('/api/generate-meal-plan', async (req, res) => {
  try {
    const { days = 7, dietaryRestrictions = [], preferences, budget } = req.body;

    console.log(`📅 Generating ${days}-day meal plan`);
    console.log(`🥗 Dietary restrictions: ${dietaryRestrictions.join(', ') || 'None'}`);
    console.log(`💰 Budget: ${budget || 'Not specified'}`);

    // Simulate processing time
    await simulateDelay(2500);

    const mealPlanDays = [];
    const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

    for (let i = 0; i < Math.min(days, 7); i++) {
      const dayRecipes = mockRecipes.sort(() => 0.5 - Math.random()).slice(0, 3);
      
      mealPlanDays.push({
        day: daysOfWeek[i],
        date: new Date(Date.now() + i * 24 * 60 * 60 * 1000).toLocaleDateString(),
        meals: {
          breakfast: {
            name: `Day ${i + 1} Breakfast Bowl`,
            description: "A nutritious start to your day",
            prepTime: "10 minutes"
          },
          lunch: {
            name: dayRecipes[0].name,
            description: dayRecipes[0].description,
            prepTime: dayRecipes[0].prepTime
          },
          dinner: {
            name: dayRecipes[1].name,
            description: dayRecipes[1].description,
            prepTime: dayRecipes[1].prepTime
          }
        },
        shoppingList: [
          ...dayRecipes[0].ingredients.slice(0, 3),
          ...dayRecipes[1].ingredients.slice(0, 3)
        ]
      });
    }

    res.json({
      success: true,
      mealPlan: {
        days: mealPlanDays,
        totalDays: days,
        dietaryRestrictions: dietaryRestrictions,
        preferences: preferences || null,
        budget: budget || null,
        generatedAt: new Date().toISOString(),
        weeklyShoppingList: [...new Set(mealPlanDays.flatMap(day => day.shoppingList))]
      },
      message: `Generated a ${days}-day meal plan tailored to your preferences!`
    });

  } catch (error) {
    console.error('Error generating meal plan:', error);
    res.status(500).json({ 
      error: 'Failed to generate meal plan',
      message: 'Internal server error occurred while generating meal plan'
    });
  }
});

// Add endpoint to check daily usage status
app.get('/api/daily-usage', (req, res) => {
  const usage = checkDailyLimit();
  res.json({
    success: true,
    usage: {
      current: usage.current,
      max: usage.max,
      remaining: usage.remaining,
      canGenerate: usage.canProceed
    },
    message: usage.canProceed 
      ? `${usage.remaining} AI recipe generations remaining today`
      : 'Daily AI recipe limit reached'
  });
});

// Add endpoint to check daily substitution usage status
app.get('/api/daily-substitution-usage', (req, res) => {
  const usage = checkDailySubstitutionLimit();
  res.json({
    success: true,
    usage: {
      current: usage.current,
      max: usage.max,
      remaining: usage.remaining,
      canGenerate: usage.canProceed
    },
    message: usage.canProceed 
      ? `${usage.remaining} AI substitution generations remaining today`
      : 'Daily AI substitution limit reached'
  });
});

// OpenAI Recipe Generation Test endpoint
app.post('/api/get-openai-recipe', async (req, res) => {
  try {
    // Check daily limit first
    const usage = checkDailyLimit();
    
    if (!usage.canProceed) {
      console.log(`🚫 Daily limit reached: ${usage.current}/${usage.max} requests used`);
      return res.status(429).json({
        success: false,
        error: 'daily_limit_exceeded',
        message: 'Daily AI recipe limit reached (5 recipes per day)',
        usage: {
          current: usage.current,
          max: usage.max,
          remaining: 0
        },
        explanation: 'This is a portfolio demo with API cost management. The limit resets daily at midnight UTC. You can still use the other features of the app!',
        alternatives: [
          'Try the ingredient substitution finder',
          'Explore the meal planning feature', 
          'Check back tomorrow for more AI recipe generations'
        ]
      });
    }

    const { ingredients, dietaryRestrictions = [], mealType = 'any', servings = 4 } = req.body;

    if (!ingredients || !Array.isArray(ingredients) || ingredients.length === 0) {
      return res.status(400).json({ 
        error: 'Ingredients array is required and must not be empty' 
      });
    }

    console.log(`🤖 Generating OpenAI recipe for ingredients: ${ingredients.join(', ')}`);
    console.log(`📊 Daily usage: ${usage.current + 1}/${usage.max}`);

    // Create a more focused prompt for better JSON consistency
    const prompt = `You are a professional chef. Create a recipe using some or all of these ingredients: ${ingredients.join(', ')} and any other common ingredients or kitchen items.

    Return ONLY valid JSON in this EXACT format (no additional text):

    {
      "name": "Recipe Name Here",
      "description": "Brief description of the dish",
      "prepTime": "XX minutes",
      "cookTime": "XX minutes", 
      "servings": ${servings},
      "difficulty": "Easy",
      "ingredients": [
        "ingredient with measurement",
        "another ingredient with measurement"
      ],
      "instructions": [
        "Step 1 instruction",
        "Step 2 instruction",
        "Step 3 instruction"
      ],
      "nutritionInfo": {
        "calories": 300,
        "protein": "15g",
        "carbs": "25g",
        "fat": "10g"
      }
    }

    Requirements:
    - Use the provided ingredients: ${ingredients.join(', ')} and any other common ingredients or spices
    - Add measurements to ingredients
    - Include 4-8 clear cooking steps
    - Make difficulty "Easy", "Medium", or "Hard"
    - Provide realistic nutrition values
    - Return ONLY the JSON object, no explanations`;

    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: "You are a recipe generator that responds only with valid JSON. Never include explanations or extra text."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      max_tokens: 1500,
      temperature: 0.3
    });

    // Increment usage counter on successful API call
    dailyUsage.count++;

    const response = completion.choices[0]?.message?.content || '';
    console.log('🔍 Raw OpenAI response:', response);
    
    try {
      // Clean the response to extract JSON
      let jsonResponse = response.trim();
      
      // Remove any markdown formatting if present
      jsonResponse = jsonResponse.replace(/```json\s*|\s*```/g, '');
      jsonResponse = jsonResponse.replace(/```\s*|\s*```/g, '');
      
      // Parse the JSON response
      const recipe = JSON.parse(jsonResponse);
      
      // Validate that it has the required Recipe interface structure
      const requiredFields = ['name', 'description', 'prepTime', 'cookTime', 'servings', 'difficulty', 'ingredients', 'instructions', 'nutritionInfo'];
      const missingFields = requiredFields.filter(field => !recipe.hasOwnProperty(field));
      
      if (missingFields.length > 0) {
        throw new Error(`Generated recipe is missing required fields: ${missingFields.join(', ')}`);
      }

      // Ensure proper data types and add metadata
      const validatedRecipe = {
        name: String(recipe.name || 'Generated Recipe'),
        description: String(recipe.description || 'A delicious recipe'),
        prepTime: String(recipe.prepTime || '15 minutes'),
        cookTime: String(recipe.cookTime || '20 minutes'),
        servings: Number(recipe.servings) || servings,
        difficulty: String(recipe.difficulty || 'Easy'),
        ingredients: Array.isArray(recipe.ingredients) ? recipe.ingredients : [],
        instructions: Array.isArray(recipe.instructions) ? recipe.instructions : [],
        nutritionInfo: {
          calories: Number(recipe.nutritionInfo?.calories) || 300,
          protein: String(recipe.nutritionInfo?.protein || '15g'),
          carbs: String(recipe.nutritionInfo?.carbs || '25g'),
          fat: String(recipe.nutritionInfo?.fat || '10g')
        },
        generatedAt: new Date().toISOString(),
        usedIngredients: ingredients,
        dietaryRestrictions: dietaryRestrictions,
        mealType: mealType
      };

      console.log('✅ OpenAI recipe generated successfully');
      console.log(`📝 Recipe: ${validatedRecipe.name}`);

      res.json({
        success: true,
        recipe: validatedRecipe,
        message: `AI-generated recipe created using ${ingredients.length} of your ingredients!`,
        usage: {
          current: dailyUsage.count,
          max: dailyUsage.maxDaily,
          remaining: dailyUsage.maxDaily - dailyUsage.count
        }
      });

    } catch (parseError) {
      console.error('❌ Failed to parse OpenAI response as JSON:', parseError);
      console.error('Raw response length:', response.length);
      console.error('Raw response preview:', response.substring(0, 200));
      
      // Create fallback recipe using the request parameters that are in scope
      const fallbackRecipe = mockRecipes[Math.floor(Math.random() * mockRecipes.length)];
      const customizedRecipe = {
        ...fallbackRecipe,
        name: `${fallbackRecipe.name} (Enhanced)`,
        ingredients: [...new Set([...ingredients, ...fallbackRecipe.ingredients])],
        servings: servings,
        generatedAt: new Date().toISOString(),
        usedIngredients: ingredients,
        dietaryRestrictions: dietaryRestrictions,
        mealType: mealType
      };

      res.json({
        success: true,
        recipe: customizedRecipe,
        message: `Recipe generated using ${ingredients.length} of your ingredients! (Note: AI response parsing failed, using enhanced mock data with your ingredients)`,
        usage: {
          current: dailyUsage.count,
          max: dailyUsage.maxDaily,
          remaining: dailyUsage.maxDaily - dailyUsage.count
        }
      });
    }

  } catch (error) {
    console.error('❌ OpenAI recipe generation failed:', error);
    
    // Extract request parameters for fallback (they're in scope here)
    const { ingredients = [], dietaryRestrictions = [], mealType = 'any', servings = 4 } = req.body;
    
    // Check if it's a quota/rate limit error
    if (error instanceof Error && error.message.includes('429')) {
      // Don't increment counter for OpenAI rate limit errors
      // Fallback to mock recipe for rate limit errors
      const fallbackRecipe = mockRecipes[Math.floor(Math.random() * mockRecipes.length)];
      const customizedRecipe = {
        ...fallbackRecipe,
        name: `${fallbackRecipe.name} (Mock)`,
        ingredients: Array.isArray(ingredients) ? [...new Set([...ingredients, ...fallbackRecipe.ingredients])] : fallbackRecipe.ingredients,
        servings: servings,
        generatedAt: new Date().toISOString(),
        usedIngredients: Array.isArray(ingredients) ? ingredients : [],
        dietaryRestrictions: dietaryRestrictions,
        mealType: mealType
      };

      res.json({
        success: true,
        recipe: customizedRecipe,
        message: `Recipe generated using ${Array.isArray(ingredients) ? ingredients.length : 0} of your ingredients! (Note: OpenAI quota exceeded, using mock data with your ingredients)`,
        usage: {
          current: dailyUsage.count,
          max: dailyUsage.maxDaily,
          remaining: dailyUsage.maxDaily - dailyUsage.count
        }
      });
    } else {
      res.status(500).json({ 
        error: 'Failed to generate AI recipe',
        message: error instanceof Error ? error.message : 'Internal server error occurred while generating AI recipe'
      });
    }
  }
});


app.post('/api/get-openai-substitute', async (req, res) => {
  try {
    // Check daily substitution limit first
    const usage = checkDailySubstitutionLimit();
    
    if (!usage.canProceed) {
      console.log(`🚫 Daily substitution limit reached: ${usage.current}/${usage.max} requests used`);
      return res.status(429).json({
        success: false,
        error: 'daily_substitution_limit_exceeded',
        message: 'Daily AI substitution limit reached (5 substitutions per day)',
        usage: {
          current: usage.current,
          max: usage.max,
          remaining: 0
        },
        explanation: 'This is a portfolio demo with API cost management. The limit resets daily at midnight UTC. You can still use the other features of the app!',
        alternatives: [
          'Try the ingredient substitution finder',
          'Explore the meal planning feature', 
          'Check back tomorrow for more AI substitution generations'
        ]
      });
    }

    const { ingredient } = req.body;

    if (!ingredient|| ingredient === "" || typeof ingredient !== 'string') {
      return res.status(400).json({ 
        error: 'Substitution ingredient is required and must be a non-empty string' 
      });
    }

    console.log(`🤖 Generating OpenAI substitution for ingredient: ${ingredient}`);

    // Create a more focused prompt for better JSON consistency
    const prompt = `You are a professional chef. Give 3-5 kitchen substitutes for ${ingredient}.

    Return ONLY valid JSON in this EXACT format (no additional text):

    { 
      substitutions : [
        {
          "substitution": "Substitution name and ratio here",
          "note": "Note about the substitution",
        },
        {
          "substitution": "Another substitute with ratio",
          "note": "Usage note for this substitute"
        }
      ]
    }

    Requirements:
    - Provide 3-5 practical kitchen substitutes for "${ingredient}"
    - Include specific ratios/measurements when applicable
    - Add helpful notes about preparation or usage
    - Return ONLY the JSON object, no explanations`;

    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: "You are a ingredient substitute generator that responds only with valid JSON. Never include explanations or extra text."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      max_tokens: 800,
      temperature: 0.3
    });

    // Increment substitution usage counter on successful API call
    dailySubstitutionUsage.count++;

    const response = completion.choices[0]?.message?.content || '';
    console.log('🔍 Raw OpenAI response:', response);

    try {
      // Clean the response to extract JSON
      let jsonResponse = response.trim();
      
      // Remove any markdown formatting if present
      jsonResponse = jsonResponse.replace(/```json\s*|\s*```/g, '');
      jsonResponse = jsonResponse.replace(/```\s*|\s*```/g, '');
      
      // Parse the JSON response
      const substitutionData = JSON.parse(jsonResponse);
      
      // Validate that it has the required structure
      if (!substitutionData.substitutions || !Array.isArray(substitutionData.substitutions)) {
        throw new Error('Invalid substitution data structure');
      }

      // Validate each substitution object
      const validatedSubstitutions = substitutionData.substitutions.map((sub: any) => ({
        substitution: String(sub.substitution || 'Unknown substitute'),
        note: String(sub.note || 'No additional notes')
      }));

      console.log('✅ OpenAI substitutions generated successfully');
      console.log(`📝 Found ${validatedSubstitutions.length} substitutions for ${ingredient}`);

      res.json({
        success: true,
        originalIngredient: ingredient,
        substitutions: validatedSubstitutions,
        generatedAt: new Date().toISOString(),
        usage: {
          current: dailySubstitutionUsage.count,
          max: dailySubstitutionUsage.maxDaily,
          remaining: dailySubstitutionUsage.maxDaily - dailySubstitutionUsage.count
        }
      });

    } catch (parseError) {
      console.error('❌ Failed to parse OpenAI response as JSON:', parseError);
      console.error('Raw response length:', response.length);
      console.error('Raw response preview:', response.substring(0, 200));
      
      // Fallback to mock data if parsing fails
      const lowerIngredient = ingredient.toLowerCase().trim();
      const mockSubstitutionData = mockSubstitutions[lowerIngredient as keyof typeof mockSubstitutions];

      if (mockSubstitutionData) {
        // Convert mock data to new format
        const formattedSubstitutions = mockSubstitutionData.substitutions.map((sub: string) => ({
          substitution: sub,
          note: "Standard substitution ratio"
        }));

        res.json({
          success: true,
          originalIngredient: ingredient,
          substitutions: formattedSubstitutions,
          notes: mockSubstitutionData.notes,
          generatedAt: new Date().toISOString(),
          usage: {
            current: dailySubstitutionUsage.count,
            max: dailySubstitutionUsage.maxDaily,
            remaining: dailySubstitutionUsage.maxDaily - dailySubstitutionUsage.count
          }
        });
      } else {
        // Generic fallback response
        res.json({
          success: true,
          originalIngredient: ingredient,
          substitutions: [
            {
              substitution: `Search online for "${ingredient} substitute"`,
              note: "Check cooking websites for specific ratios"
            },
            {
              substitution: "Look for similar ingredients in the same food category",
              note: "Consider texture and flavor profile"
            },
            {
              substitution: "Ask at your local grocery store",
              note: "Staff may have helpful recommendations"
            }
          ],
          generatedAt: new Date().toISOString(),
          usage: {
            current: dailySubstitutionUsage.count,
            max: dailySubstitutionUsage.maxDaily,
            remaining: dailySubstitutionUsage.maxDaily - dailySubstitutionUsage.count
          }
        });
      }
    }

  } catch (error) {
    console.error('❌ OpenAI substitution generation failed:', error);
    
    // Check if it's a quota/rate limit error
    if (error instanceof Error && error.message.includes('429')) {
      // Fallback to mock data for rate limit errors
      const { ingredient } = req.body;
      const lowerIngredient = ingredient.toLowerCase().trim();
      const mockSubstitutionData = mockSubstitutions[lowerIngredient as keyof typeof mockSubstitutions];

      if (mockSubstitutionData) {
        const formattedSubstitutions = mockSubstitutionData.substitutions.map((sub: string) => ({
          substitution: sub,
          note: "Standard substitution ratio"
        }));

        res.json({
          success: true,
          originalIngredient: ingredient,
          substitutions: formattedSubstitutions,
          notes: mockSubstitutionData.notes,
          generatedAt: new Date().toISOString(),
          usage: {
            current: dailySubstitutionUsage.count,
            max: dailySubstitutionUsage.maxDaily,
            remaining: dailySubstitutionUsage.maxDaily - dailySubstitutionUsage.count
          }
        });
      } else {
        res.json({
          success: true,
          originalIngredient: ingredient,
          substitutions: [
            {
              substitution: `Search online for "${ingredient} substitute"`,
              note: "OpenAI quota exceeded, using fallback suggestions"
            }
          ],
          generatedAt: new Date().toISOString(),
          usage: {
            current: dailySubstitutionUsage.count,
            max: dailySubstitutionUsage.maxDaily,
            remaining: dailySubstitutionUsage.maxDaily - dailySubstitutionUsage.count
          }
        });
      }
    } else {
      res.status(500).json({ 
        error: 'Failed to generate AI substitutions',
        message: error instanceof Error ? error.message : 'Internal server error occurred while generating AI substitutions'
      });
    }
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`📱 Ready to accept requests from frontend at ${process.env.FRONTEND_URL || 'http://localhost:5173'}`);
  console.log('📋 Available endpoints:');
  console.log('  GET  /api/health');
  console.log('  POST /api/generate-mock-recipe');
  console.log('  POST /api/substitute-mock-ingredient');
  console.log('  POST /api/generate-meal-plan');
  console.log('  GET  /api/test-openai');
  console.log('  POST /api/get-openai-recipe');
  console.log('  GET  /api/daily-usage');
  console.log('  GET  /api/daily-substitution-usage');
});