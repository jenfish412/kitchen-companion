# Kitchen Companion - AI Coding Agent Guidelines

## Architecture Overview

**Tech Stack**: React 18 + TypeScript + Vite + TailwindCSS + Radix UI

- **Single-page application** with client-side navigation using React state
- **Component-driven architecture** with clear separation of concerns
- **Mock data patterns** for AI-powered features (recipe generation, ingredient substitution)

## Project Structure

```
src/
├── App.tsx                    # Main app with navigation state management
├── components/
│   ├── Navigation.tsx         # Fixed header navigation with brand
│   ├── HomePage.tsx          # Landing page with feature cards
│   ├── RecipeGenerator.tsx   # AI recipe generation with ingredients input
│   ├── IngredientSubstitute.tsx # Ingredient substitution lookup
│   ├── MealPlanner.tsx       # Weekly meal planning interface
│   ├── figma/                # Figma-generated components
│   │   └── ImageWithFallback.tsx # Error-resistant image component
│   └── ui/                   # Shadcn/ui design system components
├── styles/globals.css        # Global styles and Tailwind base
└── index.css                 # Auto-generated Tailwind utilities
```

## Development Patterns

### Navigation & State Management

- **Client-side routing**: Use simple string-based page state in `App.tsx`
- **Navigation pattern**: `Navigation` component receives `currentPage` and `onNavigate` props
- **Page rendering**: Switch statement in `App.tsx` renders current page component

### UI Component System

- **Design system**: Uses Radix UI primitives with custom styling via `class-variance-authority`
- **Styling approach**: TailwindCSS with `cn()` utility for class merging (`clsx` + `tailwind-merge`)
- **Component imports**: Import UI components from `./ui/` directory, icons from `lucide-react`

### Mock Data Patterns

- **AI Features**: Simulate API calls with `setTimeout` delays (1500-2000ms)
- **Loading states**: Use `isLoading` state with `Loader2` icon from Lucide
- **Data structures**: Define TypeScript interfaces for consistent data shapes
- **Error handling**: Provide fallback data when searches don't match mock datasets

### Example Component Structure

```tsx
export function FeaturePage() {
  const [inputState, setInputState] = useState("");
  const [result, setResult] = useState<ResultType | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleAction = async () => {
    setIsLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 1500)); // Mock API
    // Process mock data...
    setResult(mockResult);
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-amber-50 p-6 pt-32">
      {/* Component content */}
    </div>
  );
}
```

## Development Workflow

### Build & Run Commands

```bash
npm i                  # Install dependencies
npm run dev           # Start Vite dev server
npm run build         # Production build
```

### Key Dependencies

- **Vite config**: Contains extensive alias mapping for all dependencies
- **No testing setup**: Project uses manual testing approach
- **No backend**: Purely frontend application with mock data

## Design System Conventions

### Color Palette

- **Primary colors**: Orange/amber gradients for warm, food-focused branding
- **Accent colors**: Emerald green for logo/branding elements
- **UI variants**: Consistent with Radix UI design tokens

### Layout Patterns

- **Fixed navigation**: Header stays at top with `fixed` positioning and `pt-32` content padding
- **Gradient backgrounds**: Consistent `bg-gradient-to-br from-orange-50 to-amber-50` pattern
- **Card-based content**: Use `Card` components for feature sections and results
- **Responsive grid**: `md:grid-cols-3` for feature cards, mobile-first approach

### Component Conventions

- **Props interfaces**: Always define TypeScript interfaces for component props
- **State naming**: Use descriptive names like `isGenerating`, `currentIngredient`, etc.
- **Icon usage**: Lucide React icons for consistent visual language
- **Loading states**: Always implement loading UI for async operations

## File Modification Guidelines

- **UI components**: Modify existing `ui/` components carefully - they're design system primitives
- **New features**: Add new page components to `components/` and register in `App.tsx` navigation
- **Styling**: Use Tailwind classes, avoid custom CSS unless necessary
- **Mock data**: Extend existing mock data patterns rather than adding real API calls
- **Images**: Use `ImageWithFallback` component for any image displays

This codebase prioritizes rapid prototyping of cooking-related features with a consistent design system and mock AI capabilities.
