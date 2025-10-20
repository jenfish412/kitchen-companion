import { ChefHat, Utensils, Calendar, RefreshCw } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./ui/card";
import React from "react";

interface HomePageProps {
  onNavigate: (page: string) => void;
}

export function HomePage({ onNavigate }: HomePageProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-amber-50 flex items-center justify-center p-6 pt-32">
      <div className="max-w-4xl mx-auto text-center space-y-8">
        <div className="space-y-6">
          <div className="flex items-center justify-center gap-3">
            <ChefHat className="w-12 h-12 text-orange-600" />
            <h1 className="text-6xl text-gray-900">Kitchen Companion</h1>
          </div>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Your intelligent cooking assistant that helps you create amazing
            meals, find ingredient substitutes, and plan your weekly menu with
            ease.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 mt-12">
          <div
            className="cursor-pointer"
            onClick={() => onNavigate("recipe-generator")}
          >
            <button className="border-2 border-orange-100 hover:border-orange-200 transition-colors bg-white rounded-lg shadow-sm text-left w-full">
              <CardHeader>
                <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <Utensils className="w-6 h-6 text-orange-600" />
                </div>
                <CardTitle>Recipe Generator</CardTitle>
                <CardDescription className="mb-2">
                  Enter your ingredients and get AI-powered recipe suggestions
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-500">
                  Simply add 4+ ingredients from your pantry and AI will
                  generate delicious recipes.
                </p>
              </CardContent>
            </button>
          </div>

          <div
            className="cursor-pointer"
            onClick={() => onNavigate("ingredient-substitute")}
          >
            <button className="border-2 border-green-100 hover:border-green-200 transition-colors bg-white rounded-lg shadow-sm text-left w-full">
              <CardHeader>
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <RefreshCw className="w-6 h-6 text-green-600" />
                </div>
                <CardTitle>Substitute Finder</CardTitle>
                <CardDescription className="mb-2">
                  Find perfect substitutes for missing ingredients
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-500">
                  Missing an ingredient? Get smart suggestions for substitutes
                  that will work perfectly in your recipe.
                </p>
              </CardContent>
            </button>
          </div>

          <div
            className="cursor-pointer"
            onClick={() => onNavigate("meal-planner")}
          >
            <button className="border-2 border-blue-100 hover:border-blue-200 transition-colors bg-white rounded-lg shadow-sm text-left w-full">
              <CardHeader>
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <Calendar className="w-6 h-6 text-blue-600" />
                </div>
                <CardTitle>Meal Planner</CardTitle>
                <CardDescription className="mb-2">
                  Plan your weekly meals and generate a grocery list
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-500">
                  Organize your week with smart meal planning and automatically
                  generated shopping lists.
                </p>
              </CardContent>
            </button>
          </div>
        </div>

        <div className="pt-8">
          <p className="text-gray-500">
            Get started by selecting one of the tools from the navigation menu
            above
          </p>
        </div>
      </div>
    </div>
  );
}
