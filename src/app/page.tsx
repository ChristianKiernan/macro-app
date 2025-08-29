import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default async function Home() {
  const session = await getServerSession(authOptions);

  // If user is already authenticated, redirect to ingredients
  if (session) {
    redirect("/ingredients");
  }

  // Landing page for unauthenticated users
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="max-w-md w-full space-y-8 p-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Macro App</h1>
          <p className="text-lg text-gray-600 mb-8">
            Track your nutrition and manage your recipes with ease
          </p>
        </div>

        <div className="space-y-4">
          <Link href="/login" className="w-full">
            <Button className="w-full" size="lg">
              Sign In
            </Button>
          </Link>

          <Link href="/register" className="w-full">
            <Button variant="outline" className="w-full" size="lg">
              Create Account
            </Button>
          </Link>
        </div>

        <div className="text-center text-sm text-gray-500">
          Start tracking your macros today
        </div>
      </div>
    </div>
  );
}
