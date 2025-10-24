"use client";

import { IconDotsVertical, IconLogout } from "@tabler/icons-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import {
  SignedIn,
  SignedOut,
  SignInButton,
  SignOutButton,
  SignUpButton,
  UserButton,
  useUser,
} from "@clerk/nextjs";

export function NavUser() {
  const { isMobile } = useSidebar();
  const { user } = useUser();

  // Optionally handle loading or signed out state
  if (!user) return null;

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
            >
              <Avatar className="h-8 w-8 rounded-lg grayscale">
                <SignedIn>
                  <UserButton />
                </SignedIn>
              </Avatar>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-medium">
                  {user.fullName ||
                    user.username ||
                    user.primaryEmailAddress?.emailAddress}
                </span>
                <span className="text-muted-foreground truncate text-xs">
                  {user.primaryEmailAddress?.emailAddress}
                </span>
              </div>
              <IconDotsVertical className="ml-auto size-4" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg"
            side={isMobile ? "bottom" : "right"}
            align="end"
            sideOffset={4}
          >
            <DropdownMenuLabel className="p-0 font-normal">
              <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                <Avatar className="h-8 w-8 rounded-lg">
                  <AvatarImage
                    src={user.imageUrl}
                    alt={user.fullName || user.username || "User"}
                  />
                  <AvatarFallback className="rounded-lg">
                    {user.firstName?.[0]}
                    {user.lastName?.[0]}
                  </AvatarFallback>
                </Avatar>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-medium">
                    {user.fullName ||
                      user.username ||
                      user.primaryEmailAddress?.emailAddress}
                  </span>
                  <span className="text-muted-foreground truncate text-xs">
                    {user.primaryEmailAddress?.emailAddress}
                  </span>
                </div>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />

            <DropdownMenuSeparator />
            <DropdownMenuItem>
              <SignedOut>
                <SignInButton />
                <SignUpButton>
                  <div className="flex items-center gap-2">
                    <IconLogout className="size-4" />
                    <span>Sign In / Sign Up</span>
                  </div>
                </SignUpButton>
              </SignedOut>
            </DropdownMenuItem>
            <DropdownMenuItem>
              <SignedIn>
                <SignOutButton redirectUrl="/sign-in">
                  <div className="flex items-center gap-2">
                    <IconLogout className="size-4" />
                    <span>Log out</span>
                  </div>
                </SignOutButton>
              </SignedIn>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
