import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function DashboardPage() {
  return (
    <div className="relative p-6">
      {/* Blurred Content */}
      <div className="blur-md pointer-events-none select-none">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
          <p className="text-muted-foreground">
            Track your daily nutrition and progress
          </p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-card p-6 rounded-lg border border-border shadow-sm">
            <h3 className="text-sm font-medium text-primary">
              Today&apos;s Calories
            </h3>
            <p className="text-2xl font-bold text-foreground">1,847</p>
            <p className="text-sm text-muted-foreground">of 2,200 goal</p>
          </div>
          <div className="bg-card p-6 rounded-lg border border-border shadow-sm">
            <h3 className="text-sm font-medium text-chart-2">Protein</h3>
            <p className="text-2xl font-bold text-foreground">142g</p>
            <p className="text-sm text-muted-foreground">of 150g goal</p>
          </div>
          <div className="bg-card p-6 rounded-lg border border-border shadow-sm">
            <h3 className="text-sm font-medium text-chart-3">Carbs</h3>
            <p className="text-2xl font-bold text-foreground">203g</p>
            <p className="text-sm text-muted-foreground">of 250g goal</p>
          </div>
          <div className="bg-card p-6 rounded-lg border border-border shadow-sm">
            <h3 className="text-sm font-medium text-chart-4">Fat</h3>
            <p className="text-2xl font-bold text-foreground">67g</p>
            <p className="text-sm text-muted-foreground">of 75g goal</p>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div>
            <h2 className="text-lg font-semibold text-foreground mb-4">
              Recent Meals
            </h2>
            <div className="space-y-3">
              <div className="flex justify-between items-center p-4 bg-muted rounded-lg border border-border">
                <div>
                  <p className="font-medium text-foreground">Breakfast</p>
                  <p className="text-sm text-muted-foreground">
                    Oatmeal with berries
                  </p>
                </div>
                <p className="text-sm font-medium text-foreground">340 cal</p>
              </div>
              <div className="flex justify-between items-center p-4 bg-muted rounded-lg border border-border">
                <div>
                  <p className="font-medium text-foreground">Lunch</p>
                  <p className="text-sm text-muted-foreground">Chicken salad</p>
                </div>
                <p className="text-sm font-medium text-foreground">520 cal</p>
              </div>
              <div className="flex justify-between items-center p-4 bg-muted rounded-lg border border-border">
                <div>
                  <p className="font-medium text-foreground">Snack</p>
                  <p className="text-sm text-muted-foreground">Greek yogurt</p>
                </div>
                <p className="text-sm font-medium text-foreground">150 cal</p>
              </div>
            </div>
          </div>

          <div>
            <h2 className="text-lg font-semibold text-foreground mb-4">
              Quick Actions
            </h2>
            <div className="space-y-3">
              <Button
                variant="default"
                className="w-full p-4 h-auto text-left justify-start"
              >
                <div className="text-left">
                  <p className="font-medium">Log a meal</p>
                  <p className="text-sm opacity-90">
                    Add ingredients or recipes
                  </p>
                </div>
              </Button>
              <Button
                variant="secondary"
                className="w-full p-4 h-auto text-left justify-start"
              >
                <div className="text-left">
                  <p className="font-medium">Create new recipe</p>
                  <p className="text-sm opacity-90">
                    Build from your ingredients
                  </p>
                </div>
              </Button>
              <Button
                variant="outline"
                className="w-full p-4 h-auto text-left justify-start"
              >
                <div className="text-left">
                  <p className="font-medium">Add ingredient</p>
                  <p className="text-sm opacity-90">Expand your library</p>
                </div>
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Coming Soon Overlay */}
      <div className="absolute inset-0 flex items-center justify-center bg-background/80 backdrop-blur-sm">
        <div className="text-center space-y-4 p-8 rounded-xl bg-card/90 border border-border shadow-xl">
          <div className="space-y-2">
            <h2 className="text-4xl font-bold text-foreground">Coming Soon</h2>
            <p className="text-xl text-muted-foreground">Dashboard Feature</p>
          </div>
          <div className="space-y-1">
            <p className="text-muted-foreground">
              Track daily nutrition, view progress charts, and log meals
            </p>
            <p className="text-sm text-muted-foreground">
              Currently available:{" "}
              <span className="text-foreground font-medium">Ingredients</span>{" "}
              and <span className="text-foreground font-medium">Recipes</span>
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 pt-4">
            <Button asChild>
              <Link href="/ingredients">Manage Ingredients</Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/recipes">View Recipes</Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
