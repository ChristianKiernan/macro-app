"use client";

import { Calendar, Home, LogOut, ChefHat, type LucideIcon } from "lucide-react";
import { Session } from "next-auth";
import Link, { type LinkProps } from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { ThemeToggle } from "@/components/theme-toggle";
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
    title: "Dashboard",
    url: "/dashboard",
    icon: Home,
  },
  {
    title: "Sign Out",
    url: "/signout",
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
    <Sidebar className="border-r border-sidebar-border shadow-md">
      <SidebarHeader className="p-6 border-b border-sidebar-border bg-gradient-to-r from-sidebar to-sidebar-accent/10">
        <div className="flex flex-col space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded-lg bg-sidebar-primary flex items-center justify-center shadow-sm">
                <ChefHat className="w-4 h-4 text-sidebar-primary-foreground" />
              </div>
              <h1 className="text-xl font-bold tracking-tight text-sidebar-foreground">
                Macro App
              </h1>
            </div>
            <ThemeToggle />
          </div>
          <div className="text-sm text-sidebar-foreground/70 font-medium">
            Welcome back,{" "}
            {session?.user?.name ||
              session?.user?.email?.split("@")[0] ||
              "Guest"}
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent className="p-4">
        <SidebarGroup>
          <SidebarGroupLabel className="text-xs font-semibold uppercase tracking-wider text-sidebar-foreground/60 mb-3">
            Navigation
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="space-y-1">
              {items.map((item: MenuItem) => {
                const IconComponent = item.icon;
                const isActive = isActiveLink(item.url as string);

                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton
                      asChild
                      className={cn(
                        "rounded-xl px-4 py-3 transition-all duration-200 ease-in-out group relative overflow-hidden",
                        "hover:shadow-sm hover:scale-[1.02] active:scale-[0.98]",
                        "before:absolute before:inset-0 before:rounded-xl before:opacity-0 before:transition-opacity",
                        "hover:before:opacity-100",
                        isActive
                          ? "bg-sidebar-primary text-sidebar-primary-foreground shadow-md hover:bg-sidebar-primary/90 before:bg-white/10"
                          : "text-sidebar-foreground/80 hover:text-sidebar-foreground hover:bg-sidebar-accent/50 before:bg-sidebar-accent/20"
                      )}
                    >
                      <Link
                        href={item.url}
                        className="flex items-center space-x-3 relative z-10"
                      >
                        <IconComponent
                          className={cn(
                            "w-5 h-5 transition-all duration-200",
                            isActive
                              ? "text-sidebar-primary-foreground"
                              : "text-sidebar-foreground/60 group-hover:text-sidebar-foreground"
                          )}
                        />
                        <span className="font-medium tracking-wide">
                          {item.title}
                        </span>
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
