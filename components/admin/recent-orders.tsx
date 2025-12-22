import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { formatCurrency } from '@/lib/format-currency';
import { formatDateShort } from '@/lib/format-date';
import { shortenId } from '@/lib/shorten-id';
import { RecentOrder } from '@/app/actions/admin-stats';

type RecentOrdersProps = {
  orders: RecentOrder[];
};

export default function RecentOrders({ orders }: RecentOrdersProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Recent Orders</CardTitle>
        <Button variant="outline" size="sm" asChild>
          <Link href="/admin/orders">
            View All
            <ArrowRight className="h-4 w-4 ml-1" />
          </Link>
        </Button>
      </CardHeader>
      <CardContent>
        {orders.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            No orders yet
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Order ID</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Total</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {orders.map((order) => (
                <TableRow key={order.id}>
                  <TableCell>
                    <Link
                      href={`/orders/${order.id}`}
                      className="font-mono text-sm hover:underline"
                    >
                      {shortenId(order.id)}
                    </Link>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="font-medium">
                        {order.user?.name || 'Guest'}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {order.user?.email}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>{formatDateShort(order.createdAt)}</TableCell>
                  <TableCell className="font-medium">
                    {formatCurrency(order.totalPrice)}
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col gap-1">
                      <Badge
                        variant={order.isPaid ? 'default' : 'secondary'}
                        className={
                          order.isPaid
                            ? 'bg-green-600 hover:bg-green-700 w-fit'
                            : 'bg-amber-500 hover:bg-amber-600 text-white w-fit'
                        }
                      >
                        {order.isPaid ? 'Paid' : 'Unpaid'}
                      </Badge>
                      <Badge
                        variant={order.isDelivered ? 'default' : 'secondary'}
                        className={
                          order.isDelivered
                            ? 'bg-blue-600 hover:bg-blue-700 w-fit'
                            : 'w-fit'
                        }
                      >
                        {order.isDelivered ? 'Delivered' : 'Pending'}
                      </Badge>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}
