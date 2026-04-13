import Image from "next/image";
import { ModeToggle } from "./mode-toggle";
import { ThemeSelector } from "./theme-selector";
import ChatWidget from "./chat-widget";

export function SiteHeader() {
  return (
    <header className="flex h-(--header-height) shrink-0 items-center gap-2 border-b transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-(--header-height)">
      <div className="flex w-full items-center gap-1 px-4 lg:gap-2 lg:px-6">
        <Image
          src="/hive_tool@1x.png"
          alt="Hive Tool Logo"
          width={32}
          height={32}
          className="align-middle"
          priority
        />
        <h1 className="text-base font-medium">Hive Tool</h1>
        <div className="ml-auto flex items-center gap-2">
          <ThemeSelector />
          <ModeToggle />
          <ChatWidget />
        </div>
      </div>
    </header>
  );
}
