import { useState, useEffect, useMemo } from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from "chart.js";
import { Bar, Line, Doughnut } from "react-chartjs-2";
import { useQuery } from "@tanstack/react-query";
import { saleService } from "@/services/Metrics/saleService";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler,
);

// ─── Types ────────────────────────────────────────────────────────────────────

export interface DashboardMetrics {
  totalSales: number;
  totalProfit: number;
  totalOrders: number;
  cancelledOrder: number;
  conversionRate: number;
  profitMargin: number;
}

export interface KPICardProps {
  label: string;
  value: string | number;
  sub?: string;
  badge?: string;
  badgeVariant?: "state" | "action" | "muted" | "danger";
  icon: React.ReactNode;
  iconVariant?: "state" | "action" | "muted";
}

export interface ChartCardProps {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}

export interface RevenueDataPoint {
  month: string;
  revenue: number;
  profit: number;
}
export interface UserGrowthDataPoint {
  month: string;
  users: number;
  newUsers: number;
}
export interface OrderDataPoint {
  day: string;
  orders: number;
  cancelled: number;
}

// ─── Dashboard Props ──────────────────────────────────────────────────────────

export interface DashboardProps {
  /** ISO string from external date range picker (e.g. shadcn DateRangePicker) */
  startDate?: string;
  /** ISO string from external date range picker */
  endDate?: string;
}

// ─── Granularity ──────────────────────────────────────────────────────────────

export type Granularity = "day" | "month" | "year";

function detectGranularity(start: Date, end: Date): Granularity {
  const diffDays = (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24);
  if (diffDays <= 31) return "day";
  if (diffDays <= 365) return "month";
  return "year";
}

function formatLabel(dateStr: string, granularity: Granularity): string {
  const date = new Date(dateStr);

  if (isNaN(date.getTime())) return "";

  if (granularity === "year") {
    return dateStr.slice(0, 4);
  }

  if (granularity === "month") {
    return date.toLocaleString("en-US", { month: "short" });
  }

  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

// ─── Static / Fallback Data ───────────────────────────────────────────────────

const ACTIVE_USERS_STATIC = 1482;

const REVENUE_DATA: RevenueDataPoint[] = [
  { month: "Jan", revenue: 2100, profit: 640 },
  { month: "Feb", revenue: 2850, profit: 810 },
  { month: "Mar", revenue: 2400, profit: 720 },
  { month: "Apr", revenue: 3100, profit: 960 },
  { month: "May", revenue: 2700, profit: 800 },
  { month: "Jun", revenue: 3400, profit: 1050 },
  { month: "Jul", revenue: 3200, profit: 980 },
  { month: "Aug", revenue: 3624, profit: 1200 },
];

const USER_GROWTH_DATA: UserGrowthDataPoint[] = [
  { month: "Jan", users: 800, newUsers: 120 },
  { month: "Feb", users: 950, newUsers: 150 },
  { month: "Mar", users: 1050, newUsers: 100 },
  { month: "Apr", users: 1180, newUsers: 130 },
  { month: "May", users: 1260, newUsers: 80 },
  { month: "Jun", users: 1340, newUsers: 80 },
  { month: "Jul", users: 1410, newUsers: 70 },
  { month: "Aug", users: 1482, newUsers: 72 },
];

const ORDER_DATA: OrderDataPoint[] = [
  { day: "Mon", orders: 12, cancelled: 1 },
  { day: "Tue", orders: 18, cancelled: 0 },
  { day: "Wed", orders: 9, cancelled: 2 },
  { day: "Thu", orders: 21, cancelled: 0 },
  { day: "Fri", orders: 15, cancelled: 1 },
  { day: "Sat", orders: 7, cancelled: 0 },
  { day: "Sun", orders: 5, cancelled: 0 },
];

// ─── Icons ────────────────────────────────────────────────────────────────────

const IconSales = () => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={1.8}
    className="w-5 h-5"
  >
    <path d="M12 2L2 7l10 5 10-5-10-5z" />
    <path d="M2 17l10 5 10-5M2 12l10 5 10-5" />
  </svg>
);
const IconProfit = () => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={1.8}
    className="w-5 h-5"
  >
    <line x1="12" y1="1" x2="12" y2="23" />
    <path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6" />
  </svg>
);
const IconUsers = () => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={1.8}
    className="w-5 h-5"
  >
    <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" />
  </svg>
);
const IconOrders = () => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={1.8}
    className="w-5 h-5"
  >
    <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2" />
    <rect x="9" y="3" width="6" height="4" rx="2" />
    <path d="M9 12h6M9 16h4" />
  </svg>
);
const IconConversion = () => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={1.8}
    className="w-5 h-5"
  >
    <polyline points="22 7 13.5 15.5 8.5 10.5 2 17" />
    <polyline points="16 7 22 7 22 13" />
  </svg>
);
const IconCancelled = () => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={1.8}
    className="w-5 h-5"
  >
    <circle cx="12" cy="12" r="10" />
    <line x1="15" y1="9" x2="9" y2="15" />
    <line x1="9" y1="9" x2="15" y2="15" />
  </svg>
);
const IconMargin = () => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={1.8}
    className="w-5 h-5"
  >
    <circle cx="9" cy="9" r="2" />
    <circle cx="15" cy="15" r="2" />
    <line x1="6" y1="18" x2="18" y2="6" />
  </svg>
);

// ─── Badge ────────────────────────────────────────────────────────────────────

const Badge = ({
  children,
  variant = "state",
}: {
  children: React.ReactNode;
  variant?: "state" | "action" | "muted" | "danger";
}) => {
  const cls = {
    state: "state-light-bg state-color-text",
    action: "action-light-bg action-text",
    muted: "hover-color sub-text",
    danger: "bg-red-100 text-red-600",
  }[variant];
  return (
    <span
      className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold tracking-wide ${cls}`}
    >
      {children}
    </span>
  );
};

// ─── KPI Card ─────────────────────────────────────────────────────────────────

const KPICard = ({
  label,
  value,
  sub,
  badge,
  badgeVariant = "state",
  icon,
  iconVariant = "state",
}: KPICardProps) => {
  const iconCls = {
    state: "state-color text-white",
    action: "action text-black",
    muted: "hover-color description-text",
  }[iconVariant];

  return (
    <div className="card p-5 flex flex-col gap-3 transition-shadow duration-300">
      <div className="flex items-center justify-between">
        <span className="sub-text text-xs font-semibold uppercase tracking-widest">
          {label}
        </span>
        <div
          className={`w-9 h-9 rounded-xl flex items-center justify-center shadow-sm ${iconCls}`}
        >
          {icon}
        </div>
      </div>
      <div className="flex items-end justify-between gap-2">
        <span className="heading-font text-2xl font-bold tabular-nums leading-none">
          {value}
        </span>
        {badge && <Badge variant={badgeVariant}>{badge}</Badge>}
      </div>
      {sub && <p className="sub-text text-xs">{sub}</p>}
    </div>
  );
};

// ─── Chart Card ───────────────────────────────────────────────────────────────

const ChartCard = ({ title, subtitle, children }: ChartCardProps) => (
  <div className="card p-5">
    <div className="flex items-start justify-between mb-4">
      <div>
        <h3 className="description-text text-sm font-bold">{title}</h3>
        {subtitle && <p className="sub-text text-xs mt-0.5">{subtitle}</p>}
      </div>
    </div>
    {children}
  </div>
);

// ─── Chart Shared Config ──────────────────────────────────────────────────────

const CHART_TICK = "#9A8C98";
const CHART_GRID = "rgba(74,78,105,0.06)";
const CHART_LEGEND = "#4A4E69";

const revenueChartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: "top" as const,
      labels: {
        boxWidth: 10,
        font: { size: 11 },
        color: CHART_LEGEND,
        usePointStyle: true,
        pointStyle: "circle" as const,
      },
    },
    tooltip: { mode: "index" as const, intersect: false, cornerRadius: 10 },
  },
  scales: {
    x: {
      grid: { display: false },
      ticks: { color: CHART_TICK, font: { size: 11 } },
    },
    y: {
      grid: { color: CHART_GRID },
      ticks: {
        color: CHART_TICK,
        font: { size: 11 },
        callback: (v: any) => `$${v}`,
      },
    },
  },
};

const userGrowthChartData = {
  labels: USER_GROWTH_DATA.map((d) => d.month),
  datasets: [
    {
      label: "Total Users",
      data: USER_GROWTH_DATA.map((d) => d.users),
      borderColor: "#056B6A",
      backgroundColor: (ctx: any) => {
        const { ctx: c, chartArea } = ctx.chart;
        if (!chartArea) return "rgba(5,107,106,0.1)";
        const g = c.createLinearGradient(0, chartArea.top, 0, chartArea.bottom);
        g.addColorStop(0, "rgba(5,107,106,0.18)");
        g.addColorStop(1, "rgba(5,107,106,0.0)");
        return g;
      },
      borderWidth: 2.5,
      tension: 0.45,
      fill: true,
      pointRadius: 3,
      pointBackgroundColor: "#056B6A",
      pointBorderColor: "#fff",
      pointBorderWidth: 2,
    },
    {
      label: "New Users",
      data: USER_GROWTH_DATA.map((d) => d.newUsers),
      borderColor: "#FFCB44",
      backgroundColor: "transparent",
      borderWidth: 2,
      tension: 0.45,
      fill: false,
      pointRadius: 3,
      pointBackgroundColor: "#FFCB44",
      pointBorderColor: "#fff",
      pointBorderWidth: 2,
      borderDash: [5, 3],
    },
  ],
};

const userGrowthChartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: "top" as const,
      labels: {
        boxWidth: 10,
        font: { size: 11 },
        color: CHART_LEGEND,
        usePointStyle: true,
        pointStyle: "circle" as const,
      },
    },
    tooltip: { mode: "index" as const, intersect: false, cornerRadius: 10 },
  },
  scales: {
    x: {
      grid: { display: false },
      ticks: { color: CHART_TICK, font: { size: 11 } },
    },
    y: {
      grid: { color: CHART_GRID },
      ticks: { color: CHART_TICK, font: { size: 11 } },
    },
  },
};

const orderChartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: "top" as const,
      labels: {
        boxWidth: 10,
        font: { size: 11 },
        color: CHART_LEGEND,
        usePointStyle: true,
        pointStyle: "circle" as const,
      },
    },
    tooltip: { mode: "index" as const, intersect: false, cornerRadius: 10 },
  },
  scales: {
    x: {
      grid: { display: false },
      ticks: { color: CHART_TICK, font: { size: 11 } },
    },
    y: {
      grid: { color: CHART_GRID },
      ticks: { color: CHART_TICK, font: { size: 11 } },
      max: 30,
    },
  },
};

const donutOptions = {
  responsive: true,
  maintainAspectRatio: false,
  cutout: "76%",
  plugins: {
    legend: { display: false },
    tooltip: { enabled: true, cornerRadius: 10 },
  },
};

// ─── Dashboard ────────────────────────────────────────────────────────────────

export default function Dashboard({
  startDate: extStart,
  endDate: extEnd,
}: DashboardProps) {
  const [greeting, setGreeting] = useState("Good morning");
  const [currentTime, setCurrentTime] = useState("");

  // ── Default range: Jan 1 of current year → today (used when no picker value) ──
  const [defaultStart, defaultEnd] = useMemo(() => {
    const today = new Date();
    return [
      new Date(today.getFullYear(), 0, 1).toISOString(),
      today.toISOString(),
    ];
  }, []);

  // ── Use external picker dates if provided, otherwise fall back to default ──
  const [startDate, setStartDate] = useState(extStart ?? defaultStart);
  const [endDate, setEndDate] = useState(extEnd ?? defaultEnd);

  useEffect(() => {
    if (extStart) setStartDate(extStart);
  }, [extStart]);

  useEffect(() => {
    if (extEnd) setEndDate(extEnd);
  }, [extEnd]);

  const granularity = useMemo<Granularity>(
    () => detectGranularity(new Date(startDate), new Date(endDate)),
    [startDate, endDate],
  );

  // ── Revenue chart query — reruns whenever dates or granularity change ──
  const { data: revData } = useQuery({
    queryKey: ["revenue-chart", startDate, endDate, granularity],
    queryFn: () => saleService.getRevenueChart(startDate, endDate, granularity),
    enabled: !!startDate && !!endDate,
  });

  // ── Build revenue chart data dynamically ──
  const revenueChartData = useMemo(() => {
    const apiData = (revData ?? []).map((item: any) => ({
      label: item[granularity] ?? "", // THIS IS THE FUCKINGGG BUGGG DONTTT TOUCH THIS PART I WASTED MY PRECIOUS 2 HOURS ON THIS!!!
      revenue: item.revenue,
      profit: item.profit,
    }));

    const displayData =
      apiData.length > 0
        ? apiData
        : REVENUE_DATA.map((d) => ({
            label: d.month,
            revenue: d.revenue,
            profit: d.profit,
          }));

    return {
      labels: displayData.map((d: any) => d.label),
      datasets: [
        {
          label: "Revenue",
          data: displayData.map((d: any) => d.revenue),
          backgroundColor: (ctx: any) => {
            const { ctx: c, chartArea } = ctx.chart;
            if (!chartArea) return "rgba(5,107,106,0.7)";

            const g = c.createLinearGradient(
              0,
              chartArea.top,
              0,
              chartArea.bottom,
            );
            g.addColorStop(0, "rgba(5,107,106,0.85)");
            g.addColorStop(1, "rgba(5,107,106,0.25)");
            return g;
          },
          borderRadius: 8,
          borderSkipped: false,
          barThickness: 18,
        },
        {
          label: "Profit",
          data: displayData.map((d: any) => d.profit),
          backgroundColor: "rgba(255,203,68,0.75)",
          borderRadius: 8,
          borderSkipped: false,
          barThickness: 12,
        },
      ],
    };
  }, [revData, granularity]);

  // ── Revenue chart subtitle reflects the active date range ──
  const revenueSubtitle = useMemo(() => {
    const fmt = (iso?: string | Date | null) => {
      if (!iso) return "";

      const d = new Date(iso);
      if (isNaN(d.getTime())) return "";

      return d.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      });
    };

    const granularityLabel =
      granularity === "day"
        ? "Daily"
        : granularity === "month"
          ? "Monthly"
          : "Yearly";

    return `${granularityLabel} revenue vs profit · ${fmt(startDate)} – ${fmt(endDate)}`;
  }, [startDate, endDate, granularity]);

  useEffect(() => {
    const update = () => {
      const h = new Date().getHours();
      setGreeting(
        h < 12 ? "Good morning" : h < 17 ? "Good afternoon" : "Good evening",
      );
      setCurrentTime(
        new Date().toLocaleString("en-US", {
          weekday: "short",
          month: "short",
          day: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        }),
      );
    };
    update();
    const id = setInterval(update, 60000);
    return () => clearInterval(id);
  }, []);

  const { data: metricData } = useQuery({
    queryKey: ["payments"],
    queryFn: () => saleService.getAll(),
  });

  const orderChartData = {
    labels: ORDER_DATA.map((d) => d.day),
    datasets: [
      {
        label: "Orders",
        data: ORDER_DATA.map((d) => d.orders),
        backgroundColor: "rgba(5,107,106,0.8)",
        borderRadius: 7,
        borderSkipped: false,
        barThickness: 22,
      },
      {
        label: "Cancelled",
        data: ORDER_DATA.map((d) => d.cancelled),
        backgroundColor: "rgba(244,63,94,0.7)",
        borderRadius: 7,
        borderSkipped: false,
        barThickness: 22,
      },
    ],
  };

  const conversionDonutData = {
    labels: ["Converted", "Remaining"],
    datasets: [
      {
        data: [metricData?.conversionRate, 100 - metricData?.conversionRate],
        backgroundColor: ["#056B6A", "#F0F1EC"],
        borderWidth: 0,
        hoverOffset: 4,
      },
    ],
  };

  const kpis: KPICardProps[] = [
    {
      label: "Total Sales",
      value: `$${metricData?.totalSales.toLocaleString()}`,
      badge: "+12.4%",
      badgeVariant: "state",
      sub: "Cumulative revenue this period",
      icon: <IconSales />,
      iconVariant: "state",
    },
    {
      label: "Total Profit",
      value: `$${metricData?.totalProfit.toLocaleString()}`,
      badge: "+8.2%",
      badgeVariant: "state",
      sub: `Margin: ${metricData?.profitMargin}%`,
      icon: <IconProfit />,
      iconVariant: "muted",
    },
    {
      label: "Active Users",
      value: ACTIVE_USERS_STATIC.toLocaleString(),
      badge: "+5.1%",
      badgeVariant: "action",
      sub: "Currently active on platform",
      icon: <IconUsers />,
      iconVariant: "action",
    },
    {
      label: "Total Orders",
      value: metricData?.totalOrders,
      badge: "Live",
      badgeVariant: "state",
      sub: "Orders placed this period",
      icon: <IconOrders />,
      iconVariant: "state",
    },
    {
      label: "Conversion Rate",
      value: `${metricData?.conversionRate}%`,
      badge: "Perfect",
      badgeVariant: "state",
      sub: "All visitors converted",
      icon: <IconConversion />,
      iconVariant: "state",
    },
    {
      label: "Cancelled Orders",
      value: metricData?.cancelledOrder,
      badge: "0%",
      badgeVariant: "muted",
      sub: "Zero cancellations — great job!",
      icon: <IconCancelled />,
      iconVariant: "muted",
    },
    {
      label: "Profit Margin",
      value: `${metricData?.profitMargin}%`,
      badge: "Healthy",
      badgeVariant: "action",
      sub: "Net profit as % of sales",
      icon: <IconMargin />,
      iconVariant: "action",
    },
  ];

  return (
    <div
      className="bg-primary min-h-screen px-6 py-8"
      style={{
        fontFamily: "'Plus Jakarta Sans', 'Manrope', 'DM Sans', sans-serif",
      }}
    >
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');`}</style>

      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-8">
        <div>
          <p className="state-color-text text-xs font-semibold uppercase tracking-widest mb-1">
            {currentTime}
          </p>
          <h1 className="heading-font text-2xl font-extrabold leading-tight">
            {greeting}, <span className="state-color-text">Admin</span> 👋
          </h1>
          <p className="sub-text text-sm mt-1">
            Here's what's happening with your store today.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button className="action heading-font flex items-center gap-1.5 text-sm font-semibold rounded-full px-4 py-2 shadow-sm transition-colors duration-200">
            <svg
              className="w-4 h-4"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={2.5}
            >
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            Export Report
          </button>
        </div>
      </div>

      {/* ── KPI Grid ── */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7 gap-4 mb-6">
        {kpis.map((kpi) => (
          <KPICard key={kpi.label} {...kpi} />
        ))}
      </div>

      {/* ── Revenue & User Growth ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 mb-5">
        <div className="lg:col-span-2">
          <div className="bg-secondary border-theme flex flex-col sm:flex-row items-center gap-2 rounded-2xl sm:rounded-full px-4 py-2 shadow-sm text-sm description-text">
            <div className="flex items-center gap-2">
              <svg
                className="w-4 h-4 sub-text"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
              >
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                <line x1="16" y1="2" x2="16" y2="6" />
                <line x1="8" y1="2" x2="8" y2="6" />
                <line x1="3" y1="10" x2="21" y2="10" />
              </svg>
              <span className="sub-text text-xs font-semibold uppercase tracking-wider">
                Range:
              </span>
            </div>
            <div className="flex items-center gap-1">
              <input
                type="date"
                value={startDate.slice(0, 10)}
                onChange={(e) => {
                  if (e.target.value) {
                    setStartDate(
                      new Date(e.target.value + "T00:00:00").toISOString(),
                    );
                  }
                }}
                className="bg-transparent border-0 outline-none focus:outline-none focus:ring-0 p-0 text-xs font-bold description-text cursor-pointer w-[105px]"
                style={{ colorScheme: "dark" }}
              />
              <span className="sub-text text-xs px-1">—</span>
              <input
                type="date"
                value={endDate.slice(0, 10)}
                onChange={(e) => {
                  if (e.target.value) {
                    setEndDate(
                      new Date(e.target.value + "T23:59:59").toISOString(),
                    );
                  }
                }}
                className="bg-transparent border-0 outline-none focus:outline-none focus:ring-0 p-0 text-xs font-bold description-text cursor-pointer w-[105px]"
                style={{ colorScheme: "dark" }}
              />
            </div>
          </div>
          {/* subtitle now reflects the active date range + granularity */}
          <ChartCard title="Revenue Overview" subtitle={revenueSubtitle}>
            <div style={{ height: 260 }}>
              <Bar data={revenueChartData} options={revenueChartOptions} />
            </div>
          </ChartCard>
        </div>
        <div>
          <ChartCard
            title="User Growth"
            subtitle="Cumulative vs new user acquisition"
          >
            <div style={{ height: 260 }}>
              <Line
                data={userGrowthChartData}
                options={userGrowthChartOptions}
              />
            </div>
          </ChartCard>
        </div>
      </div>

      {/* ── Orders & Conversion ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 mb-5">
        <div className="lg:col-span-2">
          <ChartCard
            title="Order Activity"
            subtitle="Daily orders vs cancellations this week"
          >
            <div style={{ height: 240 }}>
              <Bar data={orderChartData} options={orderChartOptions} />
            </div>
          </ChartCard>
        </div>

        {/* Conversion Donut */}
        <div className="card p-5 flex flex-col">
          <div className="mb-4">
            <h3 className="description-text text-sm font-bold">
              Conversion Rate
            </h3>
            <p className="sub-text text-xs mt-0.5">
              Visitor-to-order conversion
            </p>
          </div>
          <div className="flex-1 flex flex-col items-center justify-center">
            <div className="relative" style={{ width: 160, height: 160 }}>
              <Doughnut data={conversionDonutData} options={donutOptions} />
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="heading-font text-3xl font-extrabold">
                  {metricData?.conversionRate}%
                </span>
                <span className="state-color-text text-xs font-semibold mt-0.5">
                  Perfect
                </span>
              </div>
            </div>
            <div className="mt-5 w-full grid grid-cols-2 gap-3 text-center">
              <div className="state-light-bg rounded-xl py-3 px-2">
                <p className="sub-text text-xs mb-0.5">Converted</p>
                <p className="state-color-text text-base font-bold">
                  {metricData?.totalOrders}
                </p>
              </div>
              <div className="hover-color rounded-xl py-3 px-2">
                <p className="sub-text text-xs mb-0.5">Cancelled</p>
                <p className="sub-text text-base font-bold">
                  {metricData?.cancelledOrder}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Bottom Stats Strip ── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          {
            label: "Avg Order Value",
            value: `$${(metricData?.totalSales / Math.max(metricData?.totalOrders, 1)).toFixed(2)}`,
            icon: "💳",
            bg: "hover-color",
            val: "description-text",
          },
          {
            label: "Profit Margin",
            value: `${metricData?.profitMargin}%`,
            icon: "📈",
            bg: "state-light-bg",
            val: "state-color-text",
          },
          {
            label: "Total Users",
            value: ACTIVE_USERS_STATIC.toLocaleString(),
            icon: "👥",
            bg: "state-light-bg",
            val: "state-color-text",
          },
          {
            label: "Success Rate",
            value: `${(((metricData?.totalOrders - metricData?.cancelledOrder) / Math.max(metricData?.totalOrders, 1)) * 100).toFixed(0)}%`,
            icon: "✅",
            bg: "action-light-bg",
            val: "action-text",
          },
        ].map((item) => (
          <div
            key={item.label}
            className={`${item.bg} border-theme rounded-2xl px-5 py-4 flex items-center gap-4 shadow-sm`}
          >
            <span className="text-2xl">{item.icon}</span>
            <div>
              <p className="sub-text text-xs font-semibold uppercase tracking-wider">
                {item.label}
              </p>
              <p className={`${item.val} text-xl font-extrabold mt-0.5`}>
                {item.value}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
