import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

export async function getAuthenticatedUser() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return null;
  }

  return session.user;
}
