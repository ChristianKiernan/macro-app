import { Button } from "@/components/ui/button";

export default function DashboardPage() {
  return (
    <div className="p-6">
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
                <p className="text-sm opacity-90">Add ingredients or recipes</p>
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
  );
}
