"use client";

import {
  Calendar,
  Home,
  Search,
  Settings,
  LogOut,
  ChefHat,
  type LucideIcon,
} from "lucide-react";
import { Session } from "next-auth";
import Link, { type LinkProps } from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
} from "@/components/ui/sidebar";

// TypeScript interface for menu items
interface MenuItem {
  title: string;
  url: LinkProps["href"];
  icon: LucideIcon;
}

// Menu items with proper typing
const items: MenuItem[] = [
  {
    title: "Home",
    url: "/home",
    icon: Home,
  },
  {
    title: "Ingredients",
    url: "/ingredients",
    icon: ChefHat,
  },
  {
    title: "Recipes",
    url: "/recipes",
    icon: Calendar,
  },
  {
    title: "Search",
    url: "/search",
    icon: Search,
  },
  {
    title: "Settings",
    url: "/settings",
    icon: Settings,
  },
  {
    title: "Sign Out",
    url: "/api/auth/signout",
    icon: LogOut,
  },
];

interface AppSidebarProps {
  session: Session | null;
}

export function AppSidebar({ session }: AppSidebarProps) {
  const pathname = usePathname();

  const isActiveLink = (url: string) => {
    if (url === "/home") {
      return pathname === "/home" || pathname === "/";
    }
    return pathname.startsWith(url);
  };

  return (
    <Sidebar>
      <SidebarHeader className="p-4">
        <div className="flex flex-col space-y-2">
          <h1 className="text-lg font-semibold">Macro Tracker</h1>
          <div className="text-sm text-muted-foreground">
            Welcome, {session?.user?.name || session?.user?.email || "Guest"}
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item: MenuItem) => {
                const IconComponent = item.icon;
                const isActive = isActiveLink(item.url as string);

                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton
                      asChild
                      className={cn(
                        "transition-colors duration-200",
                        isActive &&
                          "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground"
                      )}
                    >
                      <Link href={item.url}>
                        <IconComponent className="w-4 h-4" />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
