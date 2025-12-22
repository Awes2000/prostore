import {
  getDashboardStatsAction,
  getMonthlySalesAction,
  getRecentOrdersAction,
} from '@/app/actions/admin-stats';
import StatsCards from '@/components/admin/stats-cards';
import SalesChart from '@/components/admin/sales-chart';
import RecentOrders from '@/components/admin/recent-orders';

export const metadata = {
  title: 'Admin Dashboard',
};

export default async function AdminDashboardPage() {
  // Fetch all dashboard data in parallel
  const [stats, salesData, recentOrders] = await Promise.all([
    getDashboardStatsAction(),
    getMonthlySalesAction(),
    getRecentOrdersAction(5),
  ]);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold">Dashboard Overview</h1>
        <p className="text-muted-foreground mt-1">
          Welcome to your admin dashboard
        </p>
      </div>

      {/* Stats Cards */}
      <StatsCards stats={stats} />

      {/* Charts and Recent Orders */}
      <div className="grid gap-6 lg:grid-cols-2">
        <SalesChart data={salesData} />
        <RecentOrders orders={recentOrders} />
      </div>
    </div>
  );
}
