import { useState } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { Textarea } from "./ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Checkbox } from "./ui/checkbox";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Plus, X, ShoppingCart, Calendar, Copy } from "lucide-react";
import React from "react";

interface Meal {
  id: string;
  name: string;
  type: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  ingredients: string[];
  servings: number;
  originalId?: string; // For tracking meals applied to multiple days
}

interface DayPlan {
  [key: string]: Meal[];
}

export function MealPlanner() {
  const [weekPlan, setWeekPlan] = useState<DayPlan>({
    Monday: [],
    Tuesday: [],
    Wednesday: [],
    Thursday: [],
    Friday: [],
    Saturday: [],
    Sunday: []
  });
  const [newMeal, setNewMeal] = useState({
    name: '',
    type: 'breakfast' as const,
    ingredients: '',
    servings: 1
  });
  const [selectedDay, setSelectedDay] = useState('Monday');
  const [groceryList, setGroceryList] = useState<string[]>([]);
  const [showGroceryList, setShowGroceryList] = useState(false);
  
  // Multi-day meal application state
  const [multiDayMeal, setMultiDayMeal] = useState({
    name: '',
    ingredients: '',
    servings: 4,
    selectedDays: [] as string[],
    selectedMealTypes: [] as ('breakfast' | 'lunch' | 'dinner' | 'snack')[]
  });

  const addMeal = () => {
    if (!newMeal.name.trim()) return;

    const meal: Meal = {
      id: Date.now().toString(),
      name: newMeal.name,
      type: newMeal.type,
      servings: newMeal.servings,
      ingredients: newMeal.ingredients
        .split(',')
        .map(i => i.trim())
        .filter(i => i.length > 0)
    };

    setWeekPlan(prev => ({
      ...prev,
      [selectedDay]: [...prev[selectedDay], meal]
    }));

    setNewMeal({ name: '', type: 'breakfast', ingredients: '', servings: 1 });
  };

  const addMultiDayMeal = () => {
    if (!multiDayMeal.name.trim() || multiDayMeal.selectedDays.length === 0 || multiDayMeal.selectedMealTypes.length === 0) return;

    const baseId = Date.now().toString();
    const ingredients = multiDayMeal.ingredients
      .split(',')
      .map(i => i.trim())
      .filter(i => i.length > 0);

    setWeekPlan(prev => {
      const newPlan = { ...prev };
      
      multiDayMeal.selectedDays.forEach(day => {
        multiDayMeal.selectedMealTypes.forEach(mealType => {
          const meal: Meal = {
            id: `${baseId}-${day}-${mealType}`,
            name: multiDayMeal.name,
            type: mealType,
            servings: multiDayMeal.servings,
            ingredients,
            originalId: baseId
          };
          
          newPlan[day] = [...newPlan[day], meal];
        });
      });
      
      return newPlan;
    });

    setMultiDayMeal({
      name: '',
      ingredients: '',
      servings: 4,
      selectedDays: [],
      selectedMealTypes: []
    });
  };

  const toggleDay = (day: string) => {
    setMultiDayMeal(prev => ({
      ...prev,
      selectedDays: prev.selectedDays.includes(day)
        ? prev.selectedDays.filter(d => d !== day)
        : [...prev.selectedDays, day]
    }));
  };

  const toggleMealType = (mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack') => {
    setMultiDayMeal(prev => ({
      ...prev,
      selectedMealTypes: prev.selectedMealTypes.includes(mealType)
        ? prev.selectedMealTypes.filter(t => t !== mealType)
        : [...prev.selectedMealTypes, mealType]
    }));
  };

  const removeMeal = (day: string, mealId: string) => {
    setWeekPlan(prev => ({
      ...prev,
      [day]: prev[day].filter(meal => meal.id !== mealId)
    }));
  };

  const generateGroceryList = () => {
    const allIngredients: string[] = [];
    
    Object.values(weekPlan).forEach(dayMeals => {
      dayMeals.forEach(meal => {
        allIngredients.push(...meal.ingredients);
      });
    });

    // Remove duplicates and sort
    const uniqueIngredients = [...new Set(allIngredients)].sort();
    setGroceryList(uniqueIngredients);
    setShowGroceryList(true);
  };

  const getMealTypeColor = (type: string) => {
    switch (type) {
      case 'breakfast': return 'bg-yellow-100 text-yellow-800';
      case 'lunch': return 'bg-blue-100 text-blue-800';
      case 'dinner': return 'bg-purple-100 text-purple-800';
      case 'snack': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 p-6">
      <div className="max-w-7xl mx-auto pt-32">
        <div className="text-center mb-8">
          <h1 className="text-4xl mb-4 text-gray-900">Meal Planner</h1>
          <p className="text-lg text-gray-600">
            Plan your weekly meals and generate automated grocery lists
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle>Add Meals</CardTitle>
              <CardDescription>
                Add single meals or batch meals for multiple days
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="single" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="single">Single Meal</TabsTrigger>
                  <TabsTrigger value="batch">Batch Meal</TabsTrigger>
                </TabsList>
                
                <TabsContent value="single" className="space-y-4">
                  <Select value={selectedDay} onValueChange={setSelectedDay}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {days.map(day => (
                        <SelectItem key={day} value={day}>{day}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <Input
                    placeholder="Meal name"
                    value={newMeal.name}
                    onChange={(e) => setNewMeal(prev => ({ ...prev, name: e.target.value }))}
                  />

                  <div className="grid grid-cols-2 gap-2">
                    <Select 
                      value={newMeal.type} 
                      onValueChange={(value: any) => setNewMeal(prev => ({ ...prev, type: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="breakfast">Breakfast</SelectItem>
                        <SelectItem value="lunch">Lunch</SelectItem>
                        <SelectItem value="dinner">Dinner</SelectItem>
                        <SelectItem value="snack">Snack</SelectItem>
                      </SelectContent>
                    </Select>

                    <Input
                      type="number"
                      placeholder="Servings"
                      min="1"
                      value={newMeal.servings}
                      onChange={(e) => setNewMeal(prev => ({ ...prev, servings: parseInt(e.target.value) || 1 }))}
                    />
                  </div>

                  <Textarea
                    placeholder="Ingredients (comma separated)"
                    value={newMeal.ingredients}
                    onChange={(e) => setNewMeal(prev => ({ ...prev, ingredients: e.target.value }))}
                    rows={3}
                  />

                  <Button onClick={addMeal} className="w-full">
                    <Plus className="w-4 h-4 mr-2" />
                    Add Meal to {selectedDay}
                  </Button>
                </TabsContent>

                <TabsContent value="batch" className="space-y-4">
                  <Input
                    placeholder="Meal name (e.g., Chicken Stir Fry)"
                    value={multiDayMeal.name}
                    onChange={(e) => setMultiDayMeal(prev => ({ ...prev, name: e.target.value }))}
                  />

                  <Input
                    type="number"
                    placeholder="Total servings"
                    min="1"
                    value={multiDayMeal.servings}
                    onChange={(e) => setMultiDayMeal(prev => ({ ...prev, servings: parseInt(e.target.value) || 4 }))}
                  />

                  <Textarea
                    placeholder="Ingredients (comma separated)"
                    value={multiDayMeal.ingredients}
                    onChange={(e) => setMultiDayMeal(prev => ({ ...prev, ingredients: e.target.value }))}
                    rows={2}
                  />

                  <div className="space-y-3">
                    <div>
                      <label className="text-sm font-medium mb-2 block">Select Days:</label>
                      <div className="grid grid-cols-2 gap-2">
                        {days.map(day => (
                          <div key={day} className="flex items-center space-x-2">
                            <Checkbox
                              id={`day-${day}`}
                              checked={multiDayMeal.selectedDays.includes(day)}
                              onCheckedChange={() => toggleDay(day)}
                            />
                            <label htmlFor={`day-${day}`} className="text-sm">{day.slice(0, 3)}</label>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="text-sm font-medium mb-2 block">Select Meal Types:</label>
                      <div className="grid grid-cols-2 gap-2">
                        {['breakfast', 'lunch', 'dinner', 'snack'].map(mealType => (
                          <div key={mealType} className="flex items-center space-x-2">
                            <Checkbox
                              id={`meal-${mealType}`}
                              checked={multiDayMeal.selectedMealTypes.includes(mealType as any)}
                              onCheckedChange={() => toggleMealType(mealType as any)}
                            />
                            <label htmlFor={`meal-${mealType}`} className="text-sm capitalize">{mealType}</label>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  <Button 
                    onClick={addMultiDayMeal} 
                    className="w-full"
                    disabled={multiDayMeal.selectedDays.length === 0 || multiDayMeal.selectedMealTypes.length === 0}
                  >
                    <Copy className="w-4 h-4 mr-2" />
                    Apply to {multiDayMeal.selectedDays.length} day(s), {multiDayMeal.selectedMealTypes.length} meal type(s)
                  </Button>
                </TabsContent>
              </Tabs>

              <Button 
                onClick={generateGroceryList} 
                variant="outline" 
                className="w-full mt-4"
              >
                <ShoppingCart className="w-4 h-4 mr-2" />
                Generate Grocery List
              </Button>
            </CardContent>
          </Card>

          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="w-5 h-5" />
                  Weekly Meal Plan
                </CardTitle>
                <CardDescription>
                  Your planned meals for the week
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {days.map(day => (
                    <div key={day} className="border rounded-lg p-4">
                      <h3 className="mb-3">{day}</h3>
                      {weekPlan[day].length === 0 ? (
                        <p className="text-gray-500 text-sm">No meals planned</p>
                      ) : (
                        <div className="space-y-2">
                          {weekPlan[day].map(meal => (
                            <div key={meal.id} className="flex items-center justify-between bg-white p-3 rounded border">
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                  <span>{meal.name}</span>
                                  <Badge className={getMealTypeColor(meal.type)}>
                                    {meal.type}
                                  </Badge>
                                  {meal.servings > 1 && (
                                    <Badge variant="outline" className="text-xs">
                                      {meal.servings} servings
                                    </Badge>
                                  )}
                                  {meal.originalId && (
                                    <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700">
                                      Batch meal
                                    </Badge>
                                  )}
                                </div>
                                {meal.ingredients.length > 0 && (
                                  <p className="text-sm text-gray-600">
                                    Ingredients: {meal.ingredients.join(', ')}
                                  </p>
                                )}
                              </div>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => removeMeal(day, meal.id)}
                              >
                                <X className="w-4 h-4" />
                              </Button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {showGroceryList && (
          <Card className="mt-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ShoppingCart className="w-5 h-5" />
                Your Grocery List
              </CardTitle>
              <CardDescription>
                All ingredients needed for your weekly meal plan
              </CardDescription>
            </CardHeader>
            <CardContent>
              {groceryList.length === 0 ? (
                <p className="text-gray-500">No ingredients found. Add some meals to generate a grocery list.</p>
              ) : (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-2">
                  {groceryList.map((ingredient, index) => (
                    <div key={index} className="flex items-center gap-2 p-2 bg-gray-50 rounded">
                      <input type="checkbox" className="rounded" />
                      <span className="text-sm">{ingredient}</span>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}