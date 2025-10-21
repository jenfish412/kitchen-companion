const API_BASE_URL = 'kitchen-companion-production-12c7.up.railway.app';

export interface RecipeRequest {
  ingredients: string[];
  dietaryRestrictions?: string[];
  mealType?: string;
  servings?: number;
}

export interface Recipe {
  name: string;
  description: string;
  prepTime: string;
  cookTime: string;
  servings: number;
  difficulty: string;
  ingredients: string[];
  instructions: string[];
  nutritionInfo: {
    calories: number;
    protein: string;
    carbs: string;
    fat: string;
  };
  generatedAt: string;
  usedIngredients: string[];
  dietaryRestrictions: string[];
  mealType: string;
}

export interface SubstitutionRequest {
  ingredient: string;
}

export interface SubstitutionResponse {
  success: boolean;
  originalIngredient: string;
  substitutions: Array<{
    substitution: string;
    note: string;
  }>;
  generatedAt: string;
}

export interface MealPlanRequest {
  days?: number;
  dietaryRestrictions?: string[];
  preferences?: string;
  budget?: string;
}

export interface DailyUsageResponse {
  success: boolean;
  usage: {
    current: number;
    max: number;
    remaining: number;
    canGenerate: boolean;
  };
  message: string;
}

class ApiService {
  private async makeRequest<T>(endpoint: string, options?: RequestInit): Promise<T> {
    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          ...options?.headers,
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error(`API request failed for ${endpoint}:`, error);
      throw error;
    }
  }

  async healthCheck(): Promise<{ status: string; timestamp: string; message: string }> {
    return this.makeRequest('/health');
  }

  async generateMockRecipe(request: RecipeRequest): Promise<{ success: boolean; recipe: Recipe; message: string }> {
    return this.makeRequest('/generate-mock-recipe', {
      method: 'POST',
      body: JSON.stringify(request),
    });
  }

  async getIngredientSubstitutions(request: SubstitutionRequest): Promise<SubstitutionResponse> {
    return this.makeRequest('/get-openai-substitute', {
      method: 'POST',
      body: JSON.stringify(request),
    });
  }

  async generateMealPlan(request: MealPlanRequest) {
    return this.makeRequest('/generate-meal-plan', {
      method: 'POST',
      body: JSON.stringify(request),
    });
  }

  async getOpenAIRecipe(request: RecipeRequest): Promise<{ success: boolean; recipe: Recipe; message: string }> {
    return this.makeRequest('/get-openai-recipe', {
      method: 'POST',
      body: JSON.stringify(request),
    });
  }

  async checkDailyUsage(): Promise<DailyUsageResponse> {
    return this.makeRequest('/daily-usage');
  }

  async checkDailySubstitutionUsage(): Promise<DailyUsageResponse> {
    return this.makeRequest('/daily-substitution-usage');
  }
}

export const apiService = new ApiService();