import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import Link from "next/link";

export default async function Home() {
  const session = await getServerSession(authOptions);

  // If user is already authenticated, redirect to ingredients
  if (session) {
    redirect("/ingredients");
  }

  // Landing page for unauthenticated users
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background p-4">
      <div className="max-w-md w-full space-y-8">
        {/* Welcome Card */}
        <Card className="text-center">
          <CardHeader>
            <CardTitle className="text-3xl font-bold">Macro App</CardTitle>
            <CardDescription className="text-lg">
              Track your nutrition and manage your recipes with ease
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Link href="/login" className="w-full">
                <Button className="w-full" size="lg">
                  Sign In
                </Button>
              </Link>

              <div className="pt-2">
                <Link href="/register" className="w-full">
                  <Button variant="outline" className="w-full" size="lg">
                    Create Account
                  </Button>
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Features Card */}
        <Card>
          <CardHeader>
            <CardTitle className="text-xl">Features</CardTitle>
            <CardDescription>
              Everything you need to track your nutrition
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3">
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></div>
                <div>
                  <p className="font-medium text-sm">Ingredient Library</p>
                  <p className="text-xs text-muted-foreground">
                    Build your personal database of foods with detailed
                    nutrition info
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></div>
                <div>
                  <p className="font-medium text-sm">Recipe Management</p>
                  <p className="text-xs text-muted-foreground">
                    Create recipes and automatically calculate nutrition per
                    serving
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></div>
                <div>
                  <p className="font-medium text-sm">Macro Tracking</p>
                  <p className="text-xs text-muted-foreground">
                    Monitor calories, protein, carbs, and fat intake
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></div>
                <div>
                  <p className="font-medium text-sm">Dietary Restrictions</p>
                  <p className="text-xs text-muted-foreground">
                    Track allergens and filter foods based on your needs
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="text-center">
          <p className="text-sm text-muted-foreground">
            Start tracking your macros today
          </p>
        </div>
      </div>
    </div>
  );
}
