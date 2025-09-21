import {
  IconArchive,
  IconCamera,
  IconCash,
  IconChartBar,
  IconClipboardSearch,
  IconDashboard,
  IconDatabase,
  IconFileAi,
  IconFileDescription,
  IconFileWord,
  IconFolder,
  IconHelp,
  IconListTree,
  IconReport,
  IconSearch,
  IconSeedling,
  IconSettings,
  IconTransform,
} from "@tabler/icons-react";

export const data = {
  user: {
    name: "Mark Porcaro",
    email: "mp@gmail.com",
    avatar: "/avatars/shadcn.jpg",
  },
  navMain: [
    {
      title: "Dashboard",
      url: "/dashboard",
      icon: IconDashboard,
    },
    {
      title: "Expenses",
      url: "/finance/expenses",
      icon: IconCash,
    },
    {
      title: "Income",
      url: "/finance/income",
      icon: IconChartBar,
    },
    {
      title: "Invoices",
      url: "/finance/invoices",
      icon: IconFolder,
    },
    {
      title: "Harvests",
      url: "/harvest",
      icon: IconSeedling,
    },
    {
      title: "Hives",
      url: "/hives",
      icon: IconArchive,
    },
    {
      title: "Inspections",
      url: "/inspection",
      icon: IconClipboardSearch,
    },
    {
      title: "Inventory",
      url: "/inventory",
      icon: IconListTree,
    },
    {
      title: "Swarms",
      url: "/swarm",
      icon: IconTransform,
    },
  ],
  navClouds: [
    {
      title: "Capture",
      icon: IconCamera,
      isActive: true,
      url: "#",
      items: [
        {
          title: "Active Proposals",
          url: "#",
        },
        {
          title: "Archived",
          url: "#",
        },
      ],
    },
    {
      title: "Proposal",
      icon: IconFileDescription,
      url: "#",
      items: [
        {
          title: "Active Proposals",
          url: "#",
        },
        {
          title: "Archived",
          url: "#",
        },
      ],
    },
    {
      title: "Prompts",
      icon: IconFileAi,
      url: "#",
      items: [
        {
          title: "Active Proposals",
          url: "#",
        },
        {
          title: "Archived",
          url: "#",
        },
      ],
    },
  ],
  navSecondary: [
    {
      title: "Settings",
      url: "#",
      icon: IconSettings,
    },
    {
      title: "Get Help",
      url: "#",
      icon: IconHelp,
    },
    {
      title: "Search",
      url: "#",
      icon: IconSearch,
    },
  ],
  documents: [
    {
      name: "Data Library",
      url: "#",
      icon: IconDatabase,
    },
    {
      name: "Reports",
      url: "#",
      icon: IconReport,
    },
    {
      name: "Word Assistant",
      url: "#",
      icon: IconFileWord,
    },
  ],
};
