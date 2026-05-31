import { useState, useEffect, useCallback, useMemo } from "react";
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

import {
  IconCancelled,
  IconConversion,
  IconMargin,
  IconOrders,
  IconProfit,
  IconSales,
  IconUsers,
  PlusIcon,
} from "@/assets/Icons/Icons";
import { saleService } from "@/services/Metrics/saleService";
import { CustomerService } from "@/services/Customer/CustomerService";
import {
  type UserGrowthItemType,
  type CustomerType,
} from "@/TypeDefinitions/Customer.type";
import { DashboardService } from "@/services/Dashboard/dashboard.service";
import DateRangeFilter, {
  type DateRange,
} from "@/components/DatePicker/DateRangeFilter";
import { detectGranularity } from "@/lib/utils";
import type { DateRangeData, Granularity } from "@/TypeDefinitions/common";

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

// ─── Fallback / static data ───────────────────────────────────────────────────
/*
const ACTIVE_USERS_STATIC = 1482;

const USER_GROWTH_DATA = [
  { month: "Jan", users: 800, newUsers: 120 },
  { month: "Feb", users: 950, newUsers: 150 },
  { month: "Mar", users: 1050, newUsers: 100 },
  { month: "Apr", users: 1180, newUsers: 130 },
  { month: "May", users: 1260, newUsers: 80 },
  { month: "Jun", users: 1340, newUsers: 80 },
  { month: "Jul", users: 1410, newUsers: 70 },
  { month: "Aug", users: 1482, newUsers: 10 },
];
*/

const REVENUE_FALLBACK = [
  { label: "Jan", revenue: 2100, profit: 640 },
  { label: "Feb", revenue: 2850, profit: 810 },
  { label: "Mar", revenue: 2400, profit: 720 },
  { label: "Apr", revenue: 3100, profit: 960 },
  { label: "May", revenue: 2700, profit: 800 },
  { label: "Jun", revenue: 3400, profit: 1050 },
  { label: "Jul", revenue: 3200, profit: 980 },
  { label: "Aug", revenue: 3624, profit: 1200 },
];

const ORDER_DATA = [
  { day: "Mon", orders: 12, cancelled: 1 },
  { day: "Tue", orders: 18, cancelled: 0 },
  { day: "Wed", orders: 9, cancelled: 2 },
  { day: "Thu", orders: 21, cancelled: 0 },
  { day: "Fri", orders: 15, cancelled: 1 },
  { day: "Sat", orders: 7, cancelled: 0 },
  { day: "Sun", orders: 5, cancelled: 0 },
];

// ─── Chart helpers ────────────────────────────────────────────────────────────

const CHART_TICK = "#9A8C98";
const CHART_GRID = "rgba(74,78,105,0.06)";
const CHART_LEGEND = "#4A4E69";

function buildRevenueChartData(
  apiData: any[] | undefined,
  granularity: Granularity,
) {
  const rows =
    apiData && apiData.length > 0
      ? apiData.map((item: any) => ({
          label: item[granularity] ?? "",
          revenue: item.revenue,
          profit: item.profit,
        }))
      : REVENUE_FALLBACK;

  return {
    labels: rows.map((r) => r.label),
    datasets: [
      {
        label: "Revenue",
        data: rows.map((r) => r.revenue),
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
        data: rows.map((r) => r.profit),
        backgroundColor: "rgba(255,203,68,0.75)",
        borderRadius: 8,
        borderSkipped: false,
        barThickness: 12,
      },
    ],
  };
}

function buildOrderChartData(
  apiData: any[] | undefined,
  granularity: Granularity,
) {
  const rows = apiData ?? ORDER_DATA;

  return {
    labels: rows.map((r) => r[granularity]),
    datasets: [
      {
        label: "Orders",
        data: rows.map((r) => r.orders),
        backgroundColor: "rgba(255,203,68,0.75)",
        borderRadius: 8,
        borderSkipped: false,
        barThickness: 18,
      },
      {
        label: "Cancellations",
        data: rows.map((r) => r.cancellations),
        backgroundColor: "rgba(239,68,68,0.75)",
        borderRadius: 8,
        borderSkipped: false,
        barThickness: 12,
      },
    ],
  };
}

// ─── Small UI pieces ──────────────────────────────────────────────────────────

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

const KPICard = ({
  label,
  value,
  sub,
  badge,
  badgeVariant = "state",
  icon,
  iconVariant = "state",
}: any) => {
  const iconCls = {
    state: "state-color text-white",
    action: "action text-black",
    muted: "hover-color description-text",
  }[iconVariant as string];
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

const ChartCard = ({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) => (
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

// ─── Chart options ────────────────────────────────────────────────────────────

const revenueChartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  animation: { duration: 300 },
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
    tooltip: {
      mode: "index" as const,
      intersect: false,
      cornerRadius: 10,
      animation: {
        duration: 80,
        easing: "easeOutCubic" as const,
      },
    },
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
  animation: { duration: 300 },
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
    tooltip: {
      mode: "index" as const,
      intersect: false,
      cornerRadius: 10,
      animation: {
        duration: 80,
        easing: "easeOutCubic" as const,
      },
    },
  },
  scales: {
    x: {
      grid: { display: false },
      ticks: { color: CHART_TICK, font: { size: 11 } },
    },
    y: {
      min: 0,
      suggestedMax: 5,
      grid: { color: CHART_GRID },
      ticks: {
        color: CHART_TICK,
        font: { size: 11 },
        stepSize: 5,
      },
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

//───gender and age filter chart Data

function buildGenderChartData(apiData: any[] | undefined) {
  const rows = apiData ?? [];

  return {
    labels: rows.map((r) => r.gender),
    datasets: [
      {
        label: "Users",
        data: rows.map((r) => r._count.gender),
        backgroundColor: "rgba(59,130,246,0.75)",
        borderRadius: 8,
        borderSkipped: false,
        barThickness: 18,
      },
    ],
  };
}

function buildAgeChartData(apiData: any[] | undefined) {
  const rows = apiData ?? [];

  return {
    labels: rows.map((r) => r.ageGroup),
    datasets: [
      {
        label: "Users",
        data: rows.map((r) => r._count.ageGroup),
        backgroundColor: "rgba(34,197,94,0.75)",
        borderRadius: 8,
        borderSkipped: false,
        barThickness: 18,
      },
    ],
  };
}

// ─── Dashboard ────────────────────────────────────────────────────────────────

export default function Dashboard() {
  const [greeting, setGreeting] = useState("Good morning");
  const [currentTime, setCurrentTime] = useState("");

  const [revenueChartData, setRevenueChartData] = useState(() =>
    buildRevenueChartData(undefined, "month"),
  );
  const [revenueSubtitle, setRevenueSubtitle] = useState("");

  // const [orderChartData, setOrderChartData] = useState(() =>
  //   buildOrderChartData(undefined, "day"),
  // );

  const [dateRange, setDateRange] = useState<DateRange>({
    from: new Date(new Date().getFullYear(), 0, 1).toISOString(),
    to: new Date().toISOString(),
  });

  const [orderDateRange, setOrderDateRange] = useState<DateRange>({
    from: new Date(new Date().getFullYear(), 0, 1).toISOString(),
    to: new Date().toISOString(),
  });

  //fetch total customer data
  const { data: Customers = [] } = useQuery<CustomerType[]>({
    queryKey: ["customers"],
    queryFn: CustomerService.getAll,
  });
  const totalCustomers = Customers.length || 0;
  const activeCustomers = Customers?.filter((c) => c.isActive).length || 0;

  //fetch user growth data
  const { data: UserGrowth = [] } = useQuery<UserGrowthItemType[]>({
    queryKey: ["userGrowth"],
    queryFn: DashboardService.getUserGrowth,
  });

  //changed month:may 2026 to just 'May'
  const userGrowthMapped = UserGrowth.map((i) => ({
    ...i,
    month: i.month.split(" ")[0],
  }));

  const userGrowthChartData = {
    labels: userGrowthMapped.map((d) => d.month),
    datasets: [
      {
        label: "Total Users",
        data: userGrowthMapped.map((d) => d.users),
        borderColor: "#056B6A",
        backgroundColor: (ctx: any) => {
          const { ctx: c, chartArea } = ctx.chart;
          if (!chartArea) return "rgba(5,107,106,0.1)";
          const g = c.createLinearGradient(
            0,
            chartArea.top,
            0,
            chartArea.bottom,
          );
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
        data: userGrowthMapped.map((d) => d.newUsers),
        borderColor: "#FFCB44",
        backgroundColor: "transparent",
        borderWidth: 2,
        tension: 0.45,
        fill: false,
        borderDash: [5, 3],
        pointRadius: 3,
        pointBackgroundColor: "#FFCB44",
        pointBorderColor: "#fff",
        pointBorderWidth: 2,
      },
    ],
  };

  //fetch filtered users
  const { data: genderData = [] } = useQuery({
    queryKey: ["gender-stats"],
    queryFn: CustomerService.getGenderStats,
  });
  const genderChartData = buildGenderChartData(genderData);

  const { data: ageData = [] } = useQuery({
    queryKey: ["agegroup-stats"],
    queryFn: CustomerService.getAgeGroupStats,
  });
  const ageChartData = buildAgeChartData(ageData);

  // ── FIX: Destroy all Chart.js instances on unmount to unblock navigation ──
  useEffect(() => {
    return () => {
      Object.values(ChartJS.instances).forEach((chart) => chart.destroy());
    };
  }, []);

  //revenue chart
  const handleRevenueData = useCallback((result: DateRangeData<any[]>) => {
    if (result.isLoading) return;

    setRevenueChartData(
      buildRevenueChartData(result.data, result.revenueGranularity),
    );

    const fmt = (iso: string) =>
      new Date(iso).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      });

    const granLabel =
      result.revenueGranularity === "day"
        ? "Daily"
        : result.revenueGranularity === "month"
          ? "Monthly"
          : "Yearly";
    setRevenueSubtitle(
      `${granLabel} revenue vs profit · ${fmt(result.startDate)} – ${fmt(result.endDate)}`,
    );
  }, []);

  const revenueGranularity = useMemo(
    () =>
      dateRange.from && dateRange.to
        ? detectGranularity(dateRange.from, dateRange.to)
        : "month",
    [dateRange.from, dateRange.to],
  );

  const { data, isLoading } = useQuery({
    queryKey: [
      "revenue-chart",
      dateRange.from,
      dateRange.to,
      revenueGranularity,
    ],
    queryFn: () =>
      saleService.getRevenueChart(
        dateRange.from!,
        dateRange.to!,
        revenueGranularity,
      ),
    enabled: !!(dateRange.from && dateRange.to),
  });

  useEffect(() => {
    if (isLoading || !data) return;
    handleRevenueData({
      data,
      startDate: dateRange.from!,
      endDate: dateRange.to!,
      revenueGranularity,
      isLoading,
      isError: false,
      error: null,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data, isLoading, dateRange, revenueGranularity]);

  //order conversion rate
  const orderGranularity = useMemo(
    () =>
      orderDateRange.from && orderDateRange.to
        ? detectGranularity(orderDateRange.from, orderDateRange.to)
        : "month",
    [orderDateRange.from, orderDateRange.to],
  );

  const { data: orderData, isLoading: orderLoading } = useQuery({
    queryKey: [
      "order-chart",
      orderDateRange.from,
      orderDateRange.to,
      orderGranularity,
    ],
    queryFn: () =>
      saleService.getOrderChart(
        orderDateRange.from!,
        orderDateRange.to!,
        orderGranularity,
      ),
    enabled: !!(orderDateRange.from && orderDateRange.to),
  });

  const orderChartData = useMemo(() => {
    if (orderLoading || !orderData)
      return buildOrderChartData(undefined, "day");
    return buildOrderChartData(orderData, orderGranularity);
  }, [orderData, orderLoading, orderGranularity]);

  // ── Clock ──────────────────────────────────────────────────────────────────
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
    const id = setInterval(update, 60_000);
    return () => clearInterval(id);
  }, []);

  // ── KPI metrics ────────────────────────────────────────────────────────────
  const { data: metricData } = useQuery({
    queryKey: ["payments"],
    queryFn: () => saleService.getAll(),
  });

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

  const kpis = [
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
      value: activeCustomers,
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
        <button className="action heading-font flex items-center gap-1.5 text-sm font-semibold rounded-full px-4 py-2 shadow-sm transition-colors duration-200">
          <PlusIcon />
          Export Report
        </button>
      </div>

      {/* ── KPI Grid ── */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 mb-6">
        {kpis.map((kpi) => (
          <KPICard key={kpi.label} {...kpi} />
        ))}
      </div>

      {/* ── Revenue & User Growth ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 mb-5">
        <div className="lg:col-span-2 flex flex-col gap-3">
          <DateRangeFilter
            dateRange={dateRange}
            handleDateRangeChange={(range) => {
              setDateRange(range);
            }}
          />
          <ChartCard title="Revenue Overview" subtitle={revenueSubtitle}>
            <div style={{ height: 260 }}>
              <Bar data={revenueChartData} options={revenueChartOptions} />
            </div>
          </ChartCard>
        </div>

        <div className="card">
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
          <DateRangeFilter
            dateRange={orderDateRange}
            handleDateRangeChange={(range) => {
              setOrderDateRange(range);
            }}
          />
          <ChartCard
            title="Order Activity"
            subtitle="Daily orders vs cancellations this week"
          >
            <div style={{ height: 240 }}>
              <Bar data={orderChartData} options={orderChartOptions} />
            </div>
          </ChartCard>
        </div>

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
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-5">
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
            icon: <IconConversion />,
            bg: "state-light-bg",
            val: "state-color-text",
          },
          {
            label: "Total Users",
            value: totalCustomers,
            icon: <IconUsers />,
            bg: "state-light-bg",
            val: "state-color-text",
          },
          {
            label: "Success Rate",
            value: `${(((metricData?.totalOrders - metricData?.cancelledOrder) / Math.max(metricData?.totalOrders, 1)) * 100).toFixed(0)}%`,
            icon: <IconSales />,
            bg: "action-light-bg",
            val: "state-color-text",
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

      <div className="grid md:grid-cols-2 grid-cols-1 gap-5 mb-5">
        <ChartCard title="User Group" subtitle="Group users by age">
          <div style={{ height: 240 }}>
            <Bar data={ageChartData} />
          </div>
        </ChartCard>
        <ChartCard title="User Group" subtitle="Group users by gender">
          <div style={{ height: 240 }}>
            <Bar data={genderChartData} />
          </div>
        </ChartCard>
      </div>
    </div>
  );
}
