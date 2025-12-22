import Link from 'next/link';
import { ShoppingBag } from 'lucide-react';
import { getUserOrdersPaginatedAction } from '@/app/actions/user';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import OrderList from '@/components/user/order-list';
import Pagination from '@/components/ui/pagination';

export const metadata = {
  title: 'My Orders',
};

type UserOrdersPageProps = {
  searchParams: Promise<{ page?: string }>;
};

export default async function UserOrdersPage({
  searchParams,
}: UserOrdersPageProps) {
  const params = await searchParams;
  const page = Number(params.page) || 1;

  const { orders, currentPage, totalPages, totalCount } =
    await getUserOrdersPaginatedAction(page, 10);

  return (
    <div>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>My Orders</span>
            {totalCount > 0 && (
              <span className="text-sm font-normal text-muted-foreground">
                {totalCount} order{totalCount !== 1 ? 's' : ''}
              </span>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {orders.length === 0 ? (
            <div className="text-center py-12">
              <ShoppingBag className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">No orders yet</h3>
              <p className="text-muted-foreground mb-6">
                You haven&apos;t placed any orders yet.
              </p>
              <Button asChild>
                <Link href="/">Start Shopping</Link>
              </Button>
            </div>
          ) : (
            <>
              <OrderList orders={orders} />
              {totalPages > 1 && (
                <div className="mt-6">
                  <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    baseUrl="/user/orders"
                  />
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
