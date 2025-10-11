"use client";

import * as React from "react";
import { Area, AreaChart, CartesianGrid, XAxis } from "recharts";

import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";

const chartConfig = {
  harvest: {
    label: "Harvest (lbs)",
    color: "hsl(var(--chart-1))",
  },
  income: {
    label: "Income ($)",
    color: "hsl(var(--chart-2))",
  },
  expenses: {
    label: "Expenses ($)",
    color: "hsl(var(--chart-3))",
  },
} satisfies ChartConfig;

interface ChartData {
  date: string;
  harvest: number;
  income: number;
  expenses: number;
}

interface HarvestFinanceChartProps {
  harvests?: Array<{ harvestDate: Date; harvestAmount: number }>;
  incomes?: Array<{ date: Date; amount: number }>;
  expenses?: Array<{ date: Date; amount: number }>;
}

export function HarvestFinanceChart({
  harvests = [],
  incomes = [],
  expenses = [],
}: HarvestFinanceChartProps) {
  const [timeRange, setTimeRange] = React.useState("365d");

  const aggregateData = React.useMemo(() => {
    const dataMap = new Map<string, ChartData>();

    harvests.forEach((h) => {
      const dateKey = new Date(h.harvestDate).toISOString().split("T")[0];
      const existing = dataMap.get(dateKey) || {
        date: dateKey,
        harvest: 0,
        income: 0,
        expenses: 0,
      };
      existing.harvest += h.harvestAmount;
      dataMap.set(dateKey, existing);
    });

    incomes.forEach((i) => {
      const dateKey = new Date(i.date).toISOString().split("T")[0];
      const existing = dataMap.get(dateKey) || {
        date: dateKey,
        harvest: 0,
        income: 0,
        expenses: 0,
      };
      existing.income += Number(i.amount);
      dataMap.set(dateKey, existing);
    });

    expenses.forEach((e) => {
      const dateKey = new Date(e.date).toISOString().split("T")[0];
      const existing = dataMap.get(dateKey) || {
        date: dateKey,
        harvest: 0,
        income: 0,
        expenses: 0,
      };
      existing.expenses += Number(e.amount);
      dataMap.set(dateKey, existing);
    });

    return Array.from(dataMap.values()).sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
    );
  }, [harvests, incomes, expenses]);

  const filteredData = React.useMemo(() => {
    const referenceDate = new Date();
    let daysToSubtract = 90;
    if (timeRange === "30d") {
      daysToSubtract = 30;
    } else if (timeRange === "7d") {
      daysToSubtract = 7;
    } else if (timeRange === "365d") {
      daysToSubtract = 365;
    }
    const startDate = new Date(referenceDate);
    startDate.setDate(startDate.getDate() - daysToSubtract);

    return aggregateData.filter((item) => {
      const date = new Date(item.date);
      return date >= startDate;
    });
  }, [aggregateData, timeRange]);

  const totals = React.useMemo(() => {
    return filteredData.reduce(
      (acc, item) => ({
        harvest: acc.harvest + item.harvest,
        income: acc.income + item.income,
        expenses: acc.expenses + item.expenses,
      }),
      { harvest: 0, income: 0, expenses: 0 }
    );
  }, [filteredData]);

  return (
    <Card className="@container/card">
      <CardHeader>
        <CardTitle>Harvest & Finance Overview</CardTitle>
        <CardDescription>
          <span className="hidden @[540px]/card:block">
            Harvest: {totals.harvest.toFixed(1)} lbs • Income: $
            {totals.income.toFixed(2)} • Expenses: ${totals.expenses.toFixed(2)}
          </span>
          <span className="@[540px]/card:hidden">
            {totals.harvest.toFixed(1)} lbs • ${totals.income.toFixed(2)}
          </span>
        </CardDescription>
        <CardAction>
          <ToggleGroup
            type="single"
            value={timeRange}
            onValueChange={setTimeRange}
            variant="outline"
            className="hidden *:data-[slot=toggle-group-item]:!px-4 @[767px]/card:flex"
          >
            <ToggleGroupItem value="365d">Last year</ToggleGroupItem>
            <ToggleGroupItem value="90d">Last 3 months</ToggleGroupItem>
            <ToggleGroupItem value="30d">Last 30 days</ToggleGroupItem>
            <ToggleGroupItem value="7d">Last 7 days</ToggleGroupItem>
          </ToggleGroup>
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger
              className="flex w-40 **:data-[slot=select-value]:block **:data-[slot=select-value]:truncate @[767px]/card:hidden"
              size="sm"
              aria-label="Select a value"
            >
              <SelectValue placeholder="Last 3 months" />
            </SelectTrigger>
            <SelectContent className="rounded-xl">
              <SelectItem value="365d" className="rounded-lg">
                Last year
              </SelectItem>
              <SelectItem value="90d" className="rounded-lg">
                Last 3 months
              </SelectItem>
              <SelectItem value="30d" className="rounded-lg">
                Last 30 days
              </SelectItem>
              <SelectItem value="7d" className="rounded-lg">
                Last 7 days
              </SelectItem>
            </SelectContent>
          </Select>
        </CardAction>
      </CardHeader>
      <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
        <ChartContainer
          config={chartConfig}
          className="aspect-auto h-[250px] w-full"
        >
          <AreaChart data={filteredData}>
            <defs>
              <linearGradient id="fillHarvest" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="5%"
                  stopColor="hsl(var(--chart-1))"
                  stopOpacity={1.0}
                />
                <stop
                  offset="95%"
                  stopColor="hsl(var(--chart-1))"
                  stopOpacity={0.1}
                />
              </linearGradient>

              <linearGradient id="fillIncome" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="5%"
                  stopColor="hsl(var(--chart-2))"
                  stopOpacity={0.8}
                />
                <stop
                  offset="95%"
                  stopColor="hsl(var(--chart-2))"
                  stopOpacity={0.1}
                />
              </linearGradient>

              <linearGradient id="fillExpenses" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="5%"
                  stopColor="hsl(var(--chart-3))"
                  stopOpacity={0.8}
                />
                <stop
                  offset="95%"
                  stopColor="hsl(var(--chart-3))"
                  stopOpacity={0.1}
                />
              </linearGradient>
            </defs>
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="date"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              minTickGap={32}
              tickFormatter={(value) => {
                const date = new Date(value);
                return date.toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                });
              }}
            />
            <ChartTooltip
              cursor={false}
              content={
                <ChartTooltipContent
                  labelFormatter={(value) => {
                    return new Date(value).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    });
                  }}
                  indicator="dot"
                />
              }
            />
            <Area
              dataKey="expenses"
              type="natural"
              fill="url(#fillExpenses)"
              stroke="hsl(var(--chart-3))"
              stackId="a"
            />
            <Area
              dataKey="income"
              type="natural"
              fill="url(#fillIncome)"
              stroke="hsl(var(--chart-2))"
              stackId="a"
            />
            <Area
              dataKey="harvest"
              type="natural"
              fill="url(#fillHarvest)"
              stroke="hsl(var(--chart-1))"
              strokeWidth={2}
              stackId="a"
            />
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
