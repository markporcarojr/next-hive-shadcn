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
import { useThemeConfig } from "@/components/active-theme";
import { chartThemes, ChartThemeName } from "@/lib/chartThemes";

interface ChartData {
  date: string;
  harvest: number;
  income: number;
  expenses: number;
}

interface HarvestFinanceChartProps {
  harvests?: Array<{ harvestDate: Date | string; harvestAmount: number }>;
  incomes?: Array<{ date: Date | string; amount: number }>;
  expenses?: Array<{ date: Date | string; amount: number }>;
}

export function HarvestFinanceChart({
  harvests = [],
  incomes = [],
  expenses = [],
}: HarvestFinanceChartProps) {
  const { activeTheme } = useThemeConfig();
  const [timeRange, setTimeRange] = React.useState("1825d");

  // Get the correct theme colors
  const themeColors =
    chartThemes[activeTheme as ChartThemeName] || chartThemes.default;

  // Dynamically configure chart colors based on active theme
  const chartConfig = React.useMemo<ChartConfig>(
    () => ({
      harvest: { label: "Harvest (lbs)", color: themeColors.chart1 },
      income: { label: "Income ($)", color: themeColors.chart2 },
      expenses: { label: "Expenses ($)", color: themeColors.chart3 },
    }),
    [themeColors]
  );

  // Aggregate all data into date-based entries
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

  // Filter based on the selected time range
  // Filter based on the selected time range
  const filteredData = React.useMemo(() => {
    const referenceDate = new Date();
    let daysToSubtract = 90;

    switch (timeRange) {
      case "7d":
        daysToSubtract = 7;
        break;
      case "30d":
        daysToSubtract = 30;
        break;
      case "90d":
        daysToSubtract = 90;
        break;
      case "365d":
        daysToSubtract = 365;
        break;
      case "1825d": // 5 years
        daysToSubtract = 365 * 5;
        break;
      default:
        daysToSubtract = 90;
        break;
    }

    const startDate = new Date(referenceDate);
    startDate.setDate(startDate.getDate() - daysToSubtract);

    // Step 1: Filter by time range
    const baseData = aggregateData.filter(
      (item) => new Date(item.date) >= startDate
    );

    // Step 2: If 5-year range, group by year
    if (timeRange === "1825d") {
      const yearlyTotals: Record<
        string,
        { harvest: number; income: number; expenses: number }
      > = {};

      baseData.forEach((entry) => {
        const year = new Date(entry.date).getFullYear().toString();

        if (!yearlyTotals[year]) {
          yearlyTotals[year] = { harvest: 0, income: 0, expenses: 0 };
        }

        yearlyTotals[year].harvest += entry.harvest || 0;
        yearlyTotals[year].income += entry.income || 0;
        yearlyTotals[year].expenses += entry.expenses || 0;
      });

      return Object.entries(yearlyTotals).map(([year, values]) => ({
        date: `${year}-01-01`,
        ...values,
      }));
    }

    // Step 3: Default return for other ranges
    return baseData;
  }, [aggregateData, timeRange]);

  // Totals
  const totals = React.useMemo(
    () =>
      filteredData.reduce(
        (acc, item) => ({
          harvest: acc.harvest + item.harvest,
          income: acc.income + item.income,
          expenses: acc.expenses + item.expenses,
        }),
        { harvest: 0, income: 0, expenses: 0 }
      ),
    [filteredData]
  );

  return (
    <Card className="@container/card transition-colors duration-300">
      <CardHeader>
        <CardTitle>Harvest & Finance Overview</CardTitle>
        <CardDescription>
          Showing data for{" "}
          {timeRange === "1825d"
            ? "the last 5 years"
            : timeRange === "365d"
              ? "the last year"
              : timeRange === "90d"
                ? "the last 3 months"
                : timeRange === "30d"
                  ? "the last 30 days"
                  : "the last 7 days"}
        </CardDescription>

        <CardAction>
          <ToggleGroup
            type="single"
            value={timeRange}
            onValueChange={setTimeRange}
            variant="outline"
            className="hidden *:data-[slot=toggle-group-item]:!px-4 @[767px]/card:flex"
          >
            <ToggleGroupItem value="1825d">Last 5 years</ToggleGroupItem>
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
              <SelectItem value="1825d" className="rounded-lg">
                Last 5 years
              </SelectItem>
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
                  stopColor={themeColors.chart1}
                  stopOpacity={1}
                />
                <stop
                  offset="95%"
                  stopColor={themeColors.chart1}
                  stopOpacity={0.1}
                />
              </linearGradient>

              <linearGradient id="fillIncome" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="5%"
                  stopColor={themeColors.chart2}
                  stopOpacity={0.8}
                />
                <stop
                  offset="95%"
                  stopColor={themeColors.chart2}
                  stopOpacity={0.1}
                />
              </linearGradient>

              <linearGradient id="fillExpenses" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="5%"
                  stopColor={themeColors.chart3}
                  stopOpacity={0.8}
                />
                <stop
                  offset="95%"
                  stopColor={themeColors.chart3}
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
              tickFormatter={(value: string): string => {
                const d = new Date(value);
                return timeRange === "1825d"
                  ? d.getFullYear().toString()
                  : d.toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                    });
              }}
              interval={timeRange === "1825d" ? "preserveStartEnd" : 0}
            />

            <ChartTooltip
              cursor={false}
              content={
                <ChartTooltipContent
                  labelFormatter={(value) =>
                    new Date(value).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })
                  }
                  indicator="dot"
                />
              }
            />

            <Area
              dataKey="expenses"
              type="natural"
              fill="url(#fillExpenses)"
              stroke={themeColors.chart3}
              stackId="a"
            />
            <Area
              dataKey="income"
              type="natural"
              fill="url(#fillIncome)"
              stroke={themeColors.chart2}
              stackId="a"
            />
            <Area
              dataKey="harvest"
              type="natural"
              fill="url(#fillHarvest)"
              stroke={themeColors.chart1}
              strokeWidth={2}
              stackId="a"
            />
          </AreaChart>
        </ChartContainer>
        <div className="mt-4 grid grid-cols-3 text-sm text-muted-foreground">
          <div>
            Total Harvest:{" "}
            <span className="font-medium text-foreground">
              {totals.harvest.toFixed(1)} lbs
            </span>
          </div>
          <div>
            Total Income:{" "}
            <span className="font-medium text-foreground">
              ${totals.income.toFixed(2)}
            </span>
          </div>
          <div>
            Total Expenses:{" "}
            <span className="font-medium text-foreground">
              ${totals.expenses.toFixed(2)}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
