import Link from 'next/link';
import { getAdminOrdersAction } from '@/app/actions/admin-orders';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import OrdersTable from '@/components/admin/orders-table';
import Pagination from '@/components/ui/pagination';

export const metadata = {
  title: 'Manage Orders - Admin',
};

type AdminOrdersPageProps = {
  searchParams: Promise<{
    page?: string;
    status?: string;
    search?: string;
  }>;
};

const statusFilters = [
  { label: 'All', value: '' },
  { label: 'Paid', value: 'paid' },
  { label: 'Unpaid', value: 'unpaid' },
  { label: 'Delivered', value: 'delivered' },
  { label: 'Pending', value: 'pending' },
];

export default async function AdminOrdersPage({
  searchParams,
}: AdminOrdersPageProps) {
  const params = await searchParams;
  const page = Number(params.page) || 1;
  const status = params.status || '';
  const search = params.search || '';

  const { orders, currentPage, totalPages, totalCount } =
    await getAdminOrdersAction(page, 20, { status }, search);

  // Build URL with filters
  const buildFilterUrl = (newStatus: string) => {
    const url = new URL('/admin/orders', 'http://localhost');
    if (newStatus) url.searchParams.set('status', newStatus);
    if (search) url.searchParams.set('search', search);
    return `${url.pathname}${url.search}`;
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Manage Orders</h1>
          <p className="text-muted-foreground mt-1">
            {totalCount} order{totalCount !== 1 ? 's' : ''} total
          </p>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Filter Orders</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {statusFilters.map((filter) => (
              <Button
                key={filter.value}
                variant={status === filter.value ? 'default' : 'outline'}
                size="sm"
                asChild
              >
                <Link href={buildFilterUrl(filter.value)}>{filter.label}</Link>
              </Button>
            ))}
          </div>

          {/* Active Filters */}
          {(status || search) && (
            <div className="mt-4 flex items-center gap-2">
              <span className="text-sm text-muted-foreground">
                Active filters:
              </span>
              {status && (
                <Badge variant="secondary">
                  Status: {statusFilters.find((f) => f.value === status)?.label}
                </Badge>
              )}
              {search && <Badge variant="secondary">Search: {search}</Badge>}
              <Button variant="ghost" size="sm" asChild>
                <Link href="/admin/orders">Clear All</Link>
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Orders Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Orders</span>
            {totalCount > 0 && (
              <span className="text-sm font-normal text-muted-foreground">
                Showing {(currentPage - 1) * 20 + 1}-
                {Math.min(currentPage * 20, totalCount)} of {totalCount}
              </span>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <OrdersTable orders={orders} />

          {totalPages > 1 && (
            <div className="mt-6">
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                baseUrl={`/admin/orders${status ? `?status=${status}` : ''}${
                  search ? `${status ? '&' : '?'}search=${search}` : ''
                }`}
              />
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
