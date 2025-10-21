import { useState } from "react";
import { Navigation } from "./components/Navigation";
import { HomePage } from "./components/HomePage";
import { RecipeGenerator } from "./components/RecipeGenerator";
import { SubstituteFinder } from "./components/SubstituteFinder";
import { MealPlanner } from "./components/MealPlanner";
import React from "react";

export default function App() {
  const [currentPage, setCurrentPage] = useState("home");

  const renderCurrentPage = () => {
    switch (currentPage) {
      case "home":
        return <HomePage onNavigate={setCurrentPage} />;
      case "recipe-generator":
        return <RecipeGenerator />;
      case "ingredient-substitute":
        return <SubstituteFinder />;
      case "meal-planner":
        return <MealPlanner />;
      default:
        return <HomePage onNavigate={setCurrentPage} />;
    }
  };

  return (
    <div className="min-h-screen">
      <Navigation currentPage={currentPage} onNavigate={setCurrentPage} />
      {renderCurrentPage()}
    </div>
  );
}
