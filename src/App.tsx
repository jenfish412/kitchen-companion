import { useState } from "react";
import { Navigation } from "./components/Navigation";
import { HomePage } from "./components/HomePage";
import { RecipeGenerator } from "./components/RecipeGenerator";
import { IngredientSubstitute } from "./components/IngredientSubstitute";
import { MealPlanner } from "./components/MealPlanner";

export default function App() {
  const [currentPage, setCurrentPage] = useState('home');

  const renderCurrentPage = () => {
    switch (currentPage) {
      case 'home':
        return <HomePage />;
      case 'recipe-generator':
        return <RecipeGenerator />;
      case 'ingredient-substitute':
        return <IngredientSubstitute />;
      case 'meal-planner':
        return <MealPlanner />;
      default:
        return <HomePage />;
    }
  };

  return (
    <div className="min-h-screen">
      <Navigation currentPage={currentPage} onNavigate={setCurrentPage} />
      {renderCurrentPage()}
    </div>
  );
}