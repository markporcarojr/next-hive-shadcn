"use client";

import * as React from "react";

import { NavMain } from "@/components/nav-main";
import { NavSecondary } from "@/components/nav-secondary";
import { NavUser } from "@/components/nav-user";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import Link from "next/link";

import { usePathname } from "next/navigation";
import { useEffect } from "react";
import { data } from "../Data/nav-data";

import Image from "next/image";
export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const currentPath = usePathname();
  const { setOpenMobile } = useSidebar();

  useEffect(() => {
    setOpenMobile(false);
  }, [currentPath, setOpenMobile]);

  if (currentPath === "/sign-in" || currentPath === "/sign-up") {
    return null;
  }

  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              className="data-[slot=sidebar-menu-button]:!p-1.5"
            >
              <Link href="/" className="flex items-center gap-2">
                <Image
                  src="/hive_tool@1x.png"
                  alt="Hive Tool Logo"
                  width={32}
                  height={32}
                  className="align-middle"
                  priority
                />
                <span className="text-base font-semibold leading-none">
                  Hive Tool
                </span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} activePath={currentPath} />
        {/* <NavDocuments items={data.documents} /> */}
        <NavSecondary
          items={data.navSecondary}
          activePath={currentPath}
          className="mt-auto"
        />
      </SidebarContent>
      <SidebarFooter>
        <NavUser />
      </SidebarFooter>
    </Sidebar>
  );
}
