import { AppSidebar } from "@/components/app-sidebar";
import { ChartAreaInteractive } from "@/components/chart-area-interactive";
import { DataTable } from "@/components/data-table";
import { SectionCards } from "@/components/section-cards";
import { SiteHeader } from "@/components/site-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { prisma } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { notFound } from "next/navigation";

// import data from "./data.json";

export default async function Page() {
  const { userId: clerkId } = await auth();
  if (!clerkId) return; // Optional: redirect instead

  const user = await prisma.user.findUnique({
    where: { clerkId },
    select: { id: true },
  });

  if (!user) return notFound();

  const expensesRaw = await prisma.expense.findMany({
    where: { userId: user.id },
    orderBy: { date: "desc" },
  });

  // Convert Decimal amount to number
  const expenses = expensesRaw.map((expense) => ({
    ...expense,
    amount:
      typeof expense.amount === "number"
        ? expense.amount
        : Number(expense.amount),
    notes: expense.notes === null ? undefined : expense.notes,
  }));

  const incomesRaw = await prisma.income.findMany({
    where: { userId: user.id },
    orderBy: { date: "desc" },
  });

  // Convert Decimal amount to number
  const incomes = incomesRaw.map((income) => ({
    ...income,
    amount:
      typeof income.amount === "number" ? income.amount : Number(income.amount),
    notes: income.notes === null ? undefined : income.notes,
  }));

  // const data = await getData();

  return (
    <SidebarProvider
      style={
        {
          "--sidebar-width": "calc(var(--spacing) * 72)",
          "--header-height": "calc(var(--spacing) * 12)",
        } as React.CSSProperties
      }
    >
      <AppSidebar variant="inset" />
      <SidebarInset>
        <SiteHeader />
        <div className="flex flex-1 flex-col">
          <div className="@container/main flex flex-1 flex-col gap-2">
            <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
              <SectionCards expenses={expenses} incomes={incomes} />
              <div className="px-4 lg:px-6">
                <ChartAreaInteractive />
              </div>
              {/* <DataTable data={data} /> */}
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
