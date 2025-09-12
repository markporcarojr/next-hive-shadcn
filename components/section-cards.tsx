import { IconTrendingDown, IconTrendingUp } from "@tabler/icons-react";

import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardAction,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

type Expense = {
  amount: number;
  createdAt: Date;
  date: Date;
  id: number;
  item: string;
  notes?: string;
  updatedAt: Date;
  userId: number;
};

type Income = {
  amount: number;
  createdAt: Date;
  date: Date;
  id: number;
  notes?: string;
  source: string;
  updatedAt: Date;
  userId: number;
};

type SectionCardsProps = {
  expenses: Expense[];
  incomes: Income[];
};

export function SectionCards({ expenses, incomes }: SectionCardsProps) {
  const totalRevenue = incomes.reduce((sum, i) => sum + Number(i.amount), 0);
  const totalExpenses = expenses.reduce((sum, e) => sum + Number(e.amount), 0);
  const netIncome = totalRevenue - totalExpenses;
  const numIncomes = incomes.length;
  const numExpenses = expenses.length;

  return (
    <div className="*:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card dark:*:data-[slot=card]:bg-card grid grid-cols-1 gap-4 px-4 *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:shadow-xs lg:px-6 @xl/main:grid-cols-2 @5xl/main:grid-cols-4">
      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Total Revenue</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            $
            {totalRevenue.toLocaleString(undefined, {
              minimumFractionDigits: 2,
            })}
          </CardTitle>
          <CardAction>
            <Badge variant="outline">
              <IconTrendingUp />
              {/* Placeholder for % change */}
              +0%
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            Revenue this period <IconTrendingUp className="size-4" />
          </div>
          <div className="text-muted-foreground">
            {numIncomes} income entries
          </div>
        </CardFooter>
      </Card>
      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Total Expenses</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            $
            {totalExpenses.toLocaleString(undefined, {
              minimumFractionDigits: 2,
            })}
          </CardTitle>
          <CardAction>
            <Badge variant="outline">
              <IconTrendingDown />
              {/* Placeholder for % change */}
              +0%
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            Expenses this period <IconTrendingDown className="size-4" />
          </div>
          <div className="text-muted-foreground">
            {numExpenses} expense entries
          </div>
        </CardFooter>
      </Card>
      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Net Income</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            ${netIncome.toLocaleString(undefined, { minimumFractionDigits: 2 })}
          </CardTitle>
          <CardAction>
            <Badge variant="outline">
              {netIncome >= 0 ? <IconTrendingUp /> : <IconTrendingDown />}
              {netIncome >= 0 ? "+" : ""}
              {netIncome.toLocaleString(undefined, {
                minimumFractionDigits: 2,
              })}
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            {netIncome >= 0 ? "Profit" : "Loss"} this period{" "}
            {netIncome >= 0 ? (
              <IconTrendingUp className="size-4" />
            ) : (
              <IconTrendingDown className="size-4" />
            )}
          </div>
          <div className="text-muted-foreground">Revenue minus expenses</div>
        </CardFooter>
      </Card>
      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Income Sources</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {Array.from(new Set(incomes.map((i) => i.source))).length}
          </CardTitle>
          <CardAction>
            <Badge variant="outline">
              <IconTrendingUp />
              {/* Placeholder for % change */}
              +0%
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            Unique sources <IconTrendingUp className="size-4" />
          </div>
          <div className="text-muted-foreground">
            {incomes.length > 0
              ? incomes
                  .map((i) => i.source)
                  .filter((v, i, a) => a.indexOf(v) === i)
                  .join(", ")
              : "No income sources"}
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}
