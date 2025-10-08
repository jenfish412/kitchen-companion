import { useState } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { Loader2, Plus, X, Sparkles } from "lucide-react";

interface Recipe {
  name: string;
  description: string;
  prepTime: string;
  servings: number;
  ingredients: string[];
  instructions: string[];
}

export function RecipeGenerator() {
  const [ingredients, setIngredients] = useState<string[]>([]);
  const [currentIngredient, setCurrentIngredient] = useState("");
  const [generatedRecipe, setGeneratedRecipe] = useState<Recipe | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const addIngredient = () => {
    if (currentIngredient.trim() && !ingredients.includes(currentIngredient.trim())) {
      setIngredients([...ingredients, currentIngredient.trim()]);
      setCurrentIngredient("");
    }
  };

  const removeIngredient = (ingredient: string) => {
    setIngredients(ingredients.filter(i => i !== ingredient));
  };

  const generateRecipe = async () => {
    setIsGenerating(true);
    
    // Mock AI recipe generation
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const mockRecipes = [
      {
        name: "Mediterranean Herb Bowl",
        description: "A fresh and flavorful bowl combining your ingredients with Mediterranean flair",
        prepTime: "25 minutes",
        servings: 4,
        ingredients: [...ingredients, "olive oil", "lemon juice", "salt", "black pepper"],
        instructions: [
          "Prepare all ingredients by washing and chopping as needed",
          "Heat olive oil in a large pan over medium heat",
          "Add your main ingredients and sauté for 5-7 minutes",
          "Season with salt, pepper, and lemon juice",
          "Serve warm in bowls with a drizzle of olive oil"
        ]
      },
      {
        name: "Quick Stir-Fry Delight",
        description: "A quick and nutritious stir-fry using your available ingredients",
        prepTime: "15 minutes",
        servings: 3,
        ingredients: [...ingredients, "soy sauce", "garlic", "ginger", "sesame oil"],
        instructions: [
          "Heat a wok or large skillet over high heat",
          "Add oil and let it get hot",
          "Add your ingredients in order of cooking time needed",
          "Stir-fry for 3-5 minutes until tender-crisp",
          "Add seasonings and toss to combine"
        ]
      }
    ];
    
    const randomRecipe = mockRecipes[Math.floor(Math.random() * mockRecipes.length)];
    setGeneratedRecipe(randomRecipe);
    setIsGenerating(false);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      addIngredient();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50 p-6">
      <div className="max-w-4xl mx-auto pt-20">
        <div className="text-center mb-8">
          <h1 className="text-4xl mb-4 text-gray-900">Recipe Generator</h1>
          <p className="text-lg text-gray-600">
            Add your available ingredients and let AI create a perfect recipe for you
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
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
                    <X
                      className="w-3 h-3 cursor-pointer hover:text-red-500"
                      onClick={() => removeIngredient(ingredient)}
                    />
                  </Badge>
                ))}
              </div>

              <Button
                onClick={generateRecipe}
                disabled={ingredients.length < 4 || isGenerating}
                className="w-full"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Generating Recipe...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 mr-2" />
                    Generate Recipe ({ingredients.length}/4+ ingredients)
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          {generatedRecipe && (
            <Card>
              <CardHeader>
                <CardTitle>{generatedRecipe.name}</CardTitle>
                <CardDescription>{generatedRecipe.description}</CardDescription>
                <div className="flex gap-4 text-sm text-gray-500">
                  <span>⏱️ {generatedRecipe.prepTime}</span>
                  <span>👥 Serves {generatedRecipe.servings}</span>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="mb-2">Ingredients:</h4>
                  <ul className="list-disc list-inside space-y-1 text-sm">
                    {generatedRecipe.ingredients.map((ingredient, index) => (
                      <li key={index}>{ingredient}</li>
                    ))}
                  </ul>
                </div>

                <div>
                  <h4 className="mb-2">Instructions:</h4>
                  <ol className="list-decimal list-inside space-y-2 text-sm">
                    {generatedRecipe.instructions.map((instruction, index) => (
                      <li key={index}>{instruction}</li>
                    ))}
                  </ol>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}