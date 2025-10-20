import React from "react";
import { Button } from "./ui/button";
import { ChefHat } from "lucide-react";

interface NavigationProps {
  currentPage: string;
  onNavigate: (page: string) => void;
}

export function Navigation({ currentPage, onNavigate }: NavigationProps) {
  const navItems = [
    { id: "home", label: "Home" },
    { id: "recipe-generator", label: "Recipe Generator" },
    { id: "ingredient-substitute", label: "Substitute Finder" },
    { id: "meal-planner", label: "Meal Planner" },
  ];

  // Get background color based on current page
  const getNavBackground = () => {
    switch (currentPage) {
      case "home":
        return "bg-gradient-to-r from-orange-50 to-amber-50";
      case "recipe-generator":
        return "bg-gradient-to-r from-orange-50 to-red-50";
      case "ingredient-substitute":
        return "bg-gradient-to-r from-green-50 to-emerald-50";
      case "meal-planner":
        return "bg-gradient-to-r from-blue-50 to-indigo-50";
      default:
        return "bg-gradient-to-r from-orange-50 to-amber-50";
    }
  };

  return (
    <nav
      className={`fixed top-0 left-0 right-0 p-6 z-50 ${getNavBackground()} border-b border-orange-200 shadow-sm`}
    >
      <div className="flex justify-between items-center">
        {/* Logo */}
        <div
          className="flex items-center gap-2 cursor-pointer transition-all duration-200 hover:opacity-80"
          onClick={() => onNavigate("home")}
        >
          <ChefHat className="h-8 w-8 text-emerald-600" />
          <span className="text-xl font-semibold text-gray-800">
            Kitchen Companion
          </span>
        </div>

        {/* Navigation Links */}
        <div className="flex gap-4">
          {navItems.map((item) => (
            <Button
              key={item.id}
              variant={currentPage === item.id ? "default" : "ghost"}
              onClick={() => onNavigate(item.id)}
              className="transition-all duration-200"
            >
              {item.label}
            </Button>
          ))}
        </div>
      </div>
    </nav>
  );
}
