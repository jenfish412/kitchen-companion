import { useState } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { Search, Loader2 } from "lucide-react";

interface Substitute {
  name: string;
  ratio: string;
  notes: string;
  confidence: "high" | "medium" | "low";
}

interface SubstituteResult {
  ingredient: string;
  substitutes: Substitute[];
}

export function IngredientSubstitute() {
  const [searchIngredient, setSearchIngredient] = useState("");
  const [result, setResult] = useState<SubstituteResult | null>(null);
  const [isSearching, setIsSearching] = useState(false);

  const searchSubstitutes = async () => {
    if (!searchIngredient.trim()) return;
    
    setIsSearching(true);
    
    // Mock API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Mock substitute data
    const mockSubstitutes: Record<string, Substitute[]> = {
      "butter": [
        { name: "Vegetable oil", ratio: "3/4 cup oil for 1 cup butter", notes: "Best for baking, reduces flavor slightly", confidence: "high" },
        { name: "Applesauce", ratio: "1/2 cup for 1 cup butter", notes: "Great for moist baked goods, reduces calories", confidence: "high" },
        { name: "Greek yogurt", ratio: "1/2 cup for 1 cup butter", notes: "Adds protein, works well in muffins and cakes", confidence: "medium" }
      ],
      "eggs": [
        { name: "Flax eggs", ratio: "1 tbsp ground flaxseed + 3 tbsp water per egg", notes: "Let sit for 5 minutes to thicken", confidence: "high" },
        { name: "Applesauce", ratio: "1/4 cup per egg", notes: "Works best in moist baked goods", confidence: "medium" },
        { name: "Banana", ratio: "1/4 cup mashed banana per egg", notes: "Adds sweetness and moisture", confidence: "medium" }
      ],
      "milk": [
        { name: "Almond milk", ratio: "1:1 ratio", notes: "Use unsweetened for best results", confidence: "high" },
        { name: "Oat milk", ratio: "1:1 ratio", notes: "Creamy texture, great for baking", confidence: "high" },
        { name: "Water + butter", ratio: "1 cup water + 1 tbsp butter", notes: "Emergency substitute only", confidence: "low" }
      ],
      "flour": [
        { name: "Almond flour", ratio: "1:1 ratio", notes: "Gluten-free, adds nutty flavor", confidence: "medium" },
        { name: "Oat flour", ratio: "1:1 ratio", notes: "Can make by grinding oats", confidence: "medium" },
        { name: "Coconut flour", ratio: "1/4 cup coconut flour for 1 cup regular flour", notes: "Very absorbent, reduce liquid in recipe", confidence: "medium" }
      ]
    };

    const ingredient = searchIngredient.toLowerCase().trim();
    let substitutes = mockSubstitutes[ingredient] || [];
    
    // If exact match not found, try to find partial matches
    if (substitutes.length === 0) {
      const partialMatch = Object.keys(mockSubstitutes).find(key => 
        key.includes(ingredient) || ingredient.includes(key)
      );
      if (partialMatch) {
        substitutes = mockSubstitutes[partialMatch];
      }
    }
    
    // If still no matches, provide generic substitutes
    if (substitutes.length === 0) {
      substitutes = [
        { name: "Generic substitute", ratio: "1:1 ratio", notes: "Check online cooking resources for specific substitutions", confidence: "low" }
      ];
    }

    setResult({
      ingredient: searchIngredient,
      substitutes
    });
    
    setIsSearching(false);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      searchSubstitutes();
    }
  };

  const getConfidenceColor = (confidence: string) => {
    switch (confidence) {
      case "high": return "bg-green-100 text-green-800";
      case "medium": return "bg-yellow-100 text-yellow-800";
      case "low": return "bg-red-100 text-red-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50 p-6">
      <div className="max-w-4xl mx-auto pt-20">
        <div className="text-center mb-8">
          <h1 className="text-4xl mb-4 text-gray-900">Ingredient Substitute</h1>
          <p className="text-lg text-gray-600">
            Find perfect substitutes for ingredients you don't have
          </p>
        </div>

        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Search for Substitutes</CardTitle>
            <CardDescription>
              Enter an ingredient to find suitable replacements
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex gap-2">
              <Input
                placeholder="Enter ingredient (e.g., butter, eggs, milk)..."
                value={searchIngredient}
                onChange={(e) => setSearchIngredient(e.target.value)}
                onKeyPress={handleKeyPress}
                className="flex-1"
              />
              <Button
                onClick={searchSubstitutes}
                disabled={!searchIngredient.trim() || isSearching}
              >
                {isSearching ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Searching...
                  </>
                ) : (
                  <>
                    <Search className="w-4 h-4 mr-2" />
                    Find Substitutes
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        {result && (
          <Card>
            <CardHeader>
              <CardTitle>Substitutes for "{result.ingredient}"</CardTitle>
              <CardDescription>
                Here are the best alternatives you can use
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {result.substitutes.map((substitute, index) => (
                  <div key={index} className="border rounded-lg p-4 space-y-2">
                    <div className="flex items-center justify-between">
                      <h4 className="text-lg">{substitute.name}</h4>
                      <Badge className={getConfidenceColor(substitute.confidence)}>
                        {substitute.confidence} confidence
                      </Badge>
                    </div>
                    <p className="text-sm"><strong>Ratio:</strong> {substitute.ratio}</p>
                    <p className="text-sm text-gray-600">{substitute.notes}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Popular Substitutes</CardTitle>
            <CardDescription>
              Quick access to commonly searched ingredients
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {["butter", "eggs", "milk", "flour", "sugar", "vanilla", "baking powder"].map((ingredient) => (
                <Badge
                  key={ingredient}
                  variant="outline"
                  className="cursor-pointer hover:bg-gray-100"
                  onClick={() => {
                    setSearchIngredient(ingredient);
                    setTimeout(() => searchSubstitutes(), 100);
                  }}
                >
                  {ingredient}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}