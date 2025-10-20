import { useState, useEffect } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { Loader2, Plus, X, Sparkles, AlertCircle, Clock } from "lucide-react";
import { apiService, type Recipe, type DailyUsageResponse } from "../services/api";
import React from "react";

export function RecipeGenerator() {
  const [ingredients, setIngredients] = useState<string[]>([]);
  const [currentIngredient, setCurrentIngredient] = useState("");
  const [generatedRecipe, setGeneratedRecipe] = useState<Recipe | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dailyUsage, setDailyUsage] = useState<DailyUsageResponse['usage'] | null>(null);
  const [isLoadingUsage, setIsLoadingUsage] = useState(true);

  // Check daily usage on component mount
  useEffect(() => {
    checkUsage();
  }, []);

  const checkUsage = async () => {
    try {
      setIsLoadingUsage(true);
      const response = await apiService.checkDailyUsage();
      setDailyUsage(response.usage);
    } catch (error) {
      console.error('Failed to check daily usage:', error);
    } finally {
      setIsLoadingUsage(false);
    }
  };

  const addIngredient = () => {
    if (currentIngredient.trim() && !ingredients.includes(currentIngredient.trim())) {
      setIngredients([...ingredients, currentIngredient.trim()]);
      setCurrentIngredient("");
    }
  };

  const removeIngredient = (ingredient: string) => {
    setIngredients(ingredients.filter(i => i !== ingredient));
  };

  const clearAll = () => {
    setIngredients([]);
    setGeneratedRecipe(null);
    setError(null);
  };

  const generateRecipe = async () => {
    setIsGenerating(true);
    setError(null);
    
    try {
      console.log('🤖 Calling OpenAI API to generate recipe with ingredients:', ingredients);
      
      const response = await apiService.getOpenAIRecipe({
        ingredients,
        servings: 4,
        mealType: 'any'
      });

      console.log('✅ OpenAI recipe generated successfully:', response);
      setGeneratedRecipe(response.recipe);
      
      // Always refresh usage info after successful generation
      await checkUsage();
      
    } catch (error) {
      console.error('❌ Failed to generate OpenAI recipe:', error);
      
      // Check if it's a daily limit error
      if (error instanceof Error && error.message.includes('Daily AI recipe limit reached')) {
        setError('Daily limit reached! You can generate 5 AI recipes per day. This limit helps manage API costs for this portfolio demo. Try the ingredient substitution finder or check back tomorrow!');
        await checkUsage(); // Refresh usage to show current status
      } else {
        setError(error instanceof Error ? error.message : 'Failed to generate recipe');
      }
    } finally {
      setIsGenerating(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      addIngredient();
    }
  };

  const canGenerate = dailyUsage?.canGenerate !== false && ingredients.length >= 4;
  const isAtLimit = dailyUsage && !dailyUsage.canGenerate;

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50 p-6">
      <div className="max-w-4xl mx-auto pt-32">
        <div className="text-center mb-8">
          <h1 className="text-4xl mb-4 text-gray-900">Recipe Generator</h1>
          <p className="text-lg text-gray-600">
            Add your available ingredients and let AI create a perfect recipe for you
          </p>
        </div>

        {/* Daily Usage Info */}
        {!isLoadingUsage && dailyUsage && (
          <Card className="mb-6">
            <CardContent className="pt-6 pb-6 px-6 [&:last-child]:pb-[1.375rem]">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-blue-500" />
                  <span className="text-sm font-medium">Daily AI Recipe Usage</span>
                </div>
                <div className="text-right">
                  <div className="flex items-center gap-2">
                    <span className={`text-sm font-bold ${isAtLimit ? 'text-red-600' : 'text-green-600'}`}>
                      {dailyUsage.remaining} of {dailyUsage.max} remaining
                    </span>
                    <span className="text-xs text-gray-500">• Resets daily at midnight UTC</span>
                  </div>
                </div>
              </div>
              
              {isAtLimit && (
                <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                  <div className="flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
                    <div className="text-sm">
                      <p className="font-medium text-amber-800"><strong>Daily limit reached</strong></p>
                      <p className="text-amber-700 mt-1">
                        This portfolio demo limits AI recipe generation to manage API costs. 
                        You can still use the ingredient substitution finder and meal planner!
                      </p>
                      <div className="mt-2 text-xs text-amber-600">
                        <strong>Try these alternatives:</strong>
                        <ul className="list-disc list-inside mt-1 ml-2">
                          <li>Ingredient Substitution Finder</li>
                          <li>Meal Planning Feature</li>
                          <li>Come back tomorrow for more AI recipes</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        <div className="grid lg:grid-cols-2 gap-8 mt-8">
          <Card>
            <CardHeader>
              <CardTitle>Your Ingredients</CardTitle>
              <CardDescription>
                Add at least 4 ingredients to generate a recipe
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <Input
                  placeholder="Enter an ingredient..."
                  value={currentIngredient}
                  onChange={(e) => setCurrentIngredient(e.target.value)}
                  onKeyPress={handleKeyPress}
                />
                <Button onClick={addIngredient} size="icon">
                  <Plus className="w-4 h-4" />
                </Button>
              </div>

              <div className="flex flex-wrap gap-2">
                {ingredients.map((ingredient) => (
                  <Badge
                    key={ingredient}
                    variant="secondary"
                    className="px-3 py-1 flex items-center gap-2"
                  >
                    {ingredient}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        removeIngredient(ingredient);
                      }}
                      className="ml-1 hover:text-red-500 focus:outline-none focus:text-red-500 transition-colors"
                      aria-label={`Remove ${ingredient}`}
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </Badge>
                ))}
              </div>

              {error && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                  <strong>Error:</strong> {error}
                  {!error.includes('Daily limit') && (
                    <>
                      <br />
                      <span className="text-xs">Make sure your backend server is running on localhost:3001</span>
                    </>
                  )}
                </div>
              )}

              <Button
                onClick={generateRecipe}
                disabled={!canGenerate || isGenerating || isAtLimit}
                className="w-full"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Generating AI Recipe...
                  </>
                ) : isAtLimit ? (
                  <>
                    <AlertCircle className="w-4 h-4 mr-2" />
                    Daily Limit Reached (5/5)
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    Generate Recipe
                  </>
                )}
              </Button>

              <Button
                onClick={clearAll}
                disabled={ingredients.length === 0}
                className="w-full mt-2"
              >
                Clear All
              </Button>

              {dailyUsage && !isAtLimit && ingredients.length >= 4 && (
                <p className="text-xs text-center text-gray-500">
                  {dailyUsage.remaining} AI generations remaining today
                </p>
              )}
            </CardContent>
          </Card>

          {generatedRecipe && (
            <Card>
              <CardHeader>
                <CardTitle>{generatedRecipe.name}</CardTitle>
                <CardDescription>{generatedRecipe.description}</CardDescription>
                <div className="flex gap-4 text-sm text-gray-500">
                  <span>⏱️ {generatedRecipe.prepTime}</span>
                  <span>🍳 {generatedRecipe.cookTime}</span>
                  <span>👥 Serves {generatedRecipe.servings}</span>
                  <span>📊 {generatedRecipe.difficulty}</span>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-semibold mb-2">Ingredients:</h4>
                  <ul className="list-disc list-inside space-y-1 text-sm">
                    {generatedRecipe.ingredients.map((ingredient, index) => (
                      <li key={index}>{ingredient}</li>
                    ))}
                  </ul>
                </div>

                <div>
                  <h4 className="font-semibold mb-2">Instructions:</h4>
                  <ol className="list-decimal list-inside space-y-2 text-sm">
                    {generatedRecipe.instructions.map((instruction, index) => (
                      <li key={index}>{instruction}</li>
                    ))}
                  </ol>
                </div>

                {generatedRecipe.nutritionInfo && (
                  <div>
                    <h4 className="font-semibold mb-2">Nutrition (per serving):</h4>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <span>Calories: {generatedRecipe.nutritionInfo.calories}</span>
                      <span>Protein: {generatedRecipe.nutritionInfo.protein}</span>
                      <span>Carbs: {generatedRecipe.nutritionInfo.carbs}</span>
                      <span>Fat: {generatedRecipe.nutritionInfo.fat}</span>
                    </div>
                  </div>
                )}

                <div className="text-xs text-gray-500 border-t pt-2">
                  Generated at: {new Date(generatedRecipe.generatedAt).toLocaleString()}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}