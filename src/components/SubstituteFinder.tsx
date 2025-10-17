import { useState } from "react";
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
import { Search, Loader2 } from "lucide-react";
import React from "react";
import { apiService } from "../services/api";

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

// Helper function to convert API response to component format
const convertApiResponseToSubstitutes = (substitutions: string[], notes: string): Substitute[] => {
  return substitutions.map((sub, index) => {
    // Extract name and ratio from the substitution string
    const parts = sub.split(' (');
    const name = parts[0].split(' per ')[0].split(' + ')[0].replace(/^\d+\/?\d*\s*(cup|teaspoon|tablespoon|amount)\s+of\s+/i, '').replace(/Equal amount of /i, '').trim();
    const ratio = sub;
    
    // Assign confidence based on position (first few are usually better)
    const confidence: "high" | "medium" | "low" = index < 2 ? "high" : index < 4 ? "medium" : "low";
    
    return {
      name: name.charAt(0).toUpperCase() + name.slice(1),
      ratio,
      notes: notes,
      confidence
    };
  });
};

export function SubstituteFinder() {
  const [searchIngredient, setSearchIngredient] = useState("");
  const [result, setResult] = useState<SubstituteResult | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const searchSubstitutes = async () => {
    if (!searchIngredient.trim()) return;

    setIsSearching(true);
    setError(null);
    setResult(null);

    try {
      console.log(`Searching substitutes for: ${searchIngredient}`);
      
      const response = await apiService.getIngredientSubstitutions({
        ingredient: searchIngredient.trim()
      });

      if (response.success) {
        console.log("Substitutions found:", response);
        
        const substitutes = convertApiResponseToSubstitutes(response.substitutions, response.notes);
        setResult({
          ingredient: response.originalIngredient,
          substitutes
        });
      } else {
        setError('Failed to find substitutions');
      }
      
    } catch (error) {
      console.error("Failed to find substitution due to error:", error);
      setError(error instanceof Error ? error.message : 'Failed to find substitutions');
    } finally {
      setIsSearching(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      searchSubstitutes();
    }
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50 p-6">
      <div className="max-w-4xl mx-auto pt-20">
        <div className="text-center mb-8">
          <h1 className="text-4xl mb-4 text-gray-900">Substitute Finder</h1>
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
                      <Badge
                        className={getConfidenceColor(substitute.confidence)}
                      >
                        {substitute.confidence} confidence
                      </Badge>
                    </div>
                    <p className="text-sm">
                      <strong>Ratio:</strong> {substitute.ratio}
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
              ].map((ingredient) => (
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
