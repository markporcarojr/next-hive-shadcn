// lib/chartThemes.ts
export const chartThemes = {
  default: {
    chart1: "hsl(43, 96%, 56%)", // golden honey
    chart2: "hsl(145, 63%, 42%)", // green
    chart3: "hsl(0, 84%, 60%)", // red
  },
  blue: {
    chart1: "hsl(217, 91%, 60%)",
    chart2: "hsl(199, 89%, 48%)",
    chart3: "hsl(210, 40%, 40%)",
  },
  green: {
    chart1: "hsl(142, 76%, 36%)",
    chart2: "hsl(141, 73%, 48%)",
    chart3: "hsl(140, 50%, 30%)",
  },
  honey: {
    chart1: "hsl(43, 96%, 56%)",
    chart2: "hsl(30, 100%, 70%)",
    chart3: "hsl(16, 70%, 45%)",
  },
  amber: {
    chart1: "hsl(39, 96%, 46%)",
    chart2: "hsl(33, 98%, 52%)",
    chart3: "hsl(25, 78%, 40%)",
  },
  cream: {
    chart1: "hsl(40, 40%, 80%)",
    chart2: "hsl(30, 30%, 70%)",
    chart3: "hsl(25, 25%, 60%)",
  },
  brown: {
    chart1: "hsl(25, 45%, 35%)",
    chart2: "hsl(30, 35%, 45%)",
    chart3: "hsl(20, 40%, 25%)",
  },
  deep: {
    chart1: "hsl(30, 60%, 25%)",
    chart2: "hsl(27, 80%, 30%)",
    chart3: "hsl(20, 75%, 20%)",
  },
  wax: {
    chart1: "hsl(50, 95%, 65%)",
    chart2: "hsl(45, 90%, 55%)",
    chart3: "hsl(40, 80%, 40%)",
  },
  hive: {
    chart1: "hsl(43, 100%, 45%)",
    chart2: "hsl(35, 90%, 50%)",
    chart3: "hsl(27, 85%, 40%)",
  },
  smoke: {
    chart1: "hsl(220, 5%, 50%)",
    chart2: "hsl(220, 4%, 35%)",
    chart3: "hsl(220, 3%, 25%)",
  },
} as const;

export type ChartThemeName = keyof typeof chartThemes;
