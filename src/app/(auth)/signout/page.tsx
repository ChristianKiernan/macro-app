"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { signOut } from "next-auth/react";
import Link from "next/link";

export default function SignOutPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background p-4">
      <div className="max-w-md w-full">
        <Card className="text-center">
          <CardHeader>
            <CardTitle className="text-2xl">Sign Out</CardTitle>
            <CardDescription>
              Are you sure you want to sign out of your account?
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <Button
                onClick={() => signOut({ callbackUrl: "/" })}
                variant="destructive"
                className="w-full"
                size="lg"
              >
                Yes, Sign Out
              </Button>

              <Link href="/ingredients" className="w-full">
                <Button variant="outline" className="w-full" size="lg">
                  Cancel
                </Button>
              </Link>
            </div>

            <div className="pt-4 border-t border-border">
              <p className="text-xs text-muted-foreground">
                You&apos;ll be redirected to the homepage after signing out
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
