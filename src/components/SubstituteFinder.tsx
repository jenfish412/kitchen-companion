import { useState, useEffect } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { Badge } from "./ui/badge";
import { Search, Loader2, Clock, AlertCircle, X } from "lucide-react";
import React from "react";
import { apiService, type DailyUsageResponse } from "../services/api";

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

// Helper function to convert new API response format to component format
const convertApiResponseToSubstitutes = (substitutions: Array<{substitution: string, note: string}>): Substitute[] => {
  return substitutions.map((sub, index) => {
    // Extract name from the substitution string (everything before the first parenthesis or ratio)
    const parts = sub.substitution.split('(');
    let name = parts[0].trim();
    
    // Clean up the name by removing common prefixes
    name = name.replace(/^\d+\/?\d*\s*(cup|teaspoon|tablespoon|amount)\s+(of\s+)?/i, '');
    name = name.replace(/^equal\s+amount\s+(of\s+)?/i, '');
    name = name.split(' + ')[0].trim(); // Take first part if it's a combination
    
    // Assign confidence based on position (first few are usually better)
    const confidence: "high" | "medium" | "low" = index < 2 ? "high" : index < 4 ? "medium" : "low";
    
    return {
      name: name.charAt(0).toUpperCase() + name.slice(1),
      ratio: sub.substitution,
      notes: sub.note,
      confidence
    };
  });
};

export function SubstituteFinder() {
  const [searchIngredient, setSearchIngredient] = useState("");
  const [result, setResult] = useState<SubstituteResult | null>(null);
  const [isSearching, setIsSearching] = useState(false);
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
      const response = await apiService.checkDailySubstitutionUsage();
      setDailyUsage(response.usage);
    } catch (error) {
      console.error('Failed to check daily substitution usage:', error);
    } finally {
      setIsLoadingUsage(false);
    }
  };

  const searchSubstitutes = async (ingredientToSearch?: string) => {
    const ingredient = ingredientToSearch || searchIngredient.trim();
    if (!ingredient) return;

    setIsSearching(true);
    setError(null);
    setResult(null);

    try {
      console.log(`Searching substitutes for: ${ingredient}`);
      
      const response = await apiService.getIngredientSubstitutions({
        ingredient: ingredient
      });

      if (response.success && response.substitutions) {
        console.log("Substitutions found:", response);
        
        const substitutes = convertApiResponseToSubstitutes(response.substitutions);
        setResult({
          ingredient: response.originalIngredient,
          substitutes
        });
        
        // Always refresh usage info after successful generation
        await checkUsage();
      } else {
        setError('Failed to find substitutions');
      }
      
    } catch (error) {
      console.error("Failed to find substitution due to error:", error);
      
      // Check if it's a daily limit error
      if (error instanceof Error && error.message.includes('Daily AI substitution limit reached')) {
        setError('Daily limit reached! You can generate 5 AI substitutions per day. This limit helps manage API costs for this portfolio demo. Try the recipe generator or check back tomorrow!');
        await checkUsage(); // Refresh usage to show current status
      } else {
        setError(error instanceof Error ? error.message : 'Failed to find substitutions');
      }
    } finally {
      setIsSearching(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      searchSubstitutes();
    }
  };

  const handlePopularIngredientClick = async (ingredient: string) => {
    if (isAtLimit || isSearching) return;
    
    setSearchIngredient(ingredient);
    await searchSubstitutes(ingredient);
  };

  const clearSearch = () => {
    setSearchIngredient("");
    setResult(null);
    setError(null);
  };

  const getConfidenceColor = (confidence: string) => {
    switch (confidence) {
      case "high":
        return "bg-green-100 text-green-800";
      case "medium":
        return "bg-yellow-100 text-yellow-800";
      case "low":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const canSearch = dailyUsage?.canGenerate !== false && searchIngredient.trim();
  const isAtLimit = dailyUsage && !dailyUsage.canGenerate;

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50 p-6">
      <div className="max-w-4xl mx-auto pt-32">
        <div className="text-center mb-8">
          <h1 className="text-4xl mb-4 text-gray-900">Substitute Finder</h1>
          <p className="text-lg text-gray-600">
            Find perfect substitutes for ingredients you don't have
          </p>
        </div>

        {/* Daily Usage Info */}
        {!isLoadingUsage && dailyUsage && (
          <Card className="mb-6">
            <CardContent className="pt-6 pb-6 px-6 [&:last-child]:pb-[1.375rem]">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-blue-500" />
                  <span className="text-sm font-medium">Daily AI Substitution Usage</span>
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
                        This portfolio demo limits AI substitution generation to manage API costs. 
                        You can still use the recipe generator and meal planner!
                      </p>
                      <div className="mt-2 text-xs text-amber-600">
                        <strong>Try these alternatives:</strong>
                        <ul className="list-disc list-inside mt-1 ml-2">
                          <li>AI Recipe Generator</li>
                          <li>Meal Planning Feature</li>
                          <li>Come back tomorrow for more AI substitutions</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        <Card className="mb-8 mt-8">
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
              {searchIngredient && (
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={clearSearch}
                  aria-label="Clear search"
                >
                  <X className="w-4 h-4" />
                </Button>
              )}
              <Button
                onClick={searchSubstitutes}
                disabled={!canSearch || isSearching || isAtLimit}
              >
                {isSearching ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Searching...
                  </>
                ) : isAtLimit ? (
                  <>
                    <AlertCircle className="w-4 h-4 mr-2" />
                    Daily Limit Reached (5/5)
                  </>
                ) : (
                  <>
                    <Search className="w-4 h-4 mr-2" />
                    Find Substitutes
                  </>
                )}
              </Button>
            </div>

            {error && (
              <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                <strong>Error:</strong> {error}
                {!error.includes('Daily limit') && (
                  <>
                    <br />
                    <span className="text-xs">Make sure your backend server is running on localhost:3001</span>
                  </>
                )}
              </div>
            )}

            {dailyUsage && !isAtLimit && searchIngredient.trim() && (
              <p className="text-xs text-center text-gray-500 mt-4">
                {dailyUsage.remaining} AI substitution searches remaining today
              </p>
            )}
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
                      <h4 className="text-lg font-semibold">{substitute.name}</h4>
                      <Badge
                        className={getConfidenceColor(substitute.confidence)}
                      >
                        {substitute.confidence} confidence
                      </Badge>
                    </div>
                    <p className="text-sm">
                      <strong>Substitution:</strong> {substitute.ratio}
                    </p>
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
              {[
                "butter",
                "eggs",
                "milk",
                "flour",
                "sugar",
                "vanilla",
                "baking powder",
                "buttermilk",
                "heavy cream",
                "brown sugar"
              ].map((ingredient) => (
                <Badge
                  key={ingredient}
                  variant="outline"
                  className="cursor-pointer hover:bg-gray-100 transition-colors"
                  onClick={() => handlePopularIngredientClick(ingredient)}
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
