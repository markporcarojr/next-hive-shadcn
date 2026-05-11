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
    <Card className="p-6 ">
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
        {/* Revenue */}
        <div className="space-y-3 rounded-xl  p-4">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-muted-foreground text-sm">Total Revenue</p>
              <h3 className="text-2xl font-semibold tabular-nums">
                $
                {totalRevenue.toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                })}
              </h3>
            </div>
          </div>

          <div className="space-y-1 text-sm">
            <div className="flex items-center gap-2 font-medium">
              Revenue this period
              <IconTrendingUp className="size-4" />
            </div>

            <p className="text-muted-foreground">{numIncomes} income entries</p>
          </div>
        </div>

        {/* Expenses */}
        <div className="space-y-3 rounded-xl  p-4">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-muted-foreground text-sm">Total Expenses</p>

              <h3 className="text-2xl font-semibold tabular-nums">
                $
                {totalExpenses.toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                })}
              </h3>
            </div>
          </div>

          <div className="space-y-1 text-sm">
            <div className="flex items-center gap-2 font-medium">
              Expenses this period
              <IconTrendingDown className="size-4" />
            </div>

            <p className="text-muted-foreground">
              {numExpenses} expense entries
            </p>
          </div>
        </div>

        {/* Net Income */}
        <div className="space-y-3 rounded-xl p-4">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-muted-foreground text-sm">Net Income</p>

              <h3 className="text-2xl font-semibold tabular-nums">
                $
                {netIncome.toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                })}
              </h3>
            </div>
          </div>

          <div className="space-y-1 text-sm">
            <div className="flex items-center gap-2 font-medium">
              {netIncome >= 0 ? "Profit" : "Loss"} this period
              {netIncome >= 0 ? (
                <IconTrendingUp className="size-4" />
              ) : (
                <IconTrendingDown className="size-4" />
              )}
            </div>

            <p className="text-muted-foreground">Revenue minus expenses</p>
          </div>
        </div>

        {/* Income Sources */}
      </div>
    </Card>
  );
}
