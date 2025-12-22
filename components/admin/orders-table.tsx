import Link from 'next/link';
import { Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
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
import OrderActions from './order-actions';

type Order = {
  id: string;
  createdAt: Date;
  totalPrice: number | string | { toString(): string };
  isPaid: boolean;
  isDelivered: boolean;
  paymentMethod: string;
  user: {
    name: string;
    email: string;
  } | null;
};

type OrdersTableProps = {
  orders: Order[];
};

export default function OrdersTable({ orders }: OrdersTableProps) {
  if (orders.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        No orders found
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Order ID</TableHead>
            <TableHead>Customer</TableHead>
            <TableHead>Date</TableHead>
            <TableHead>Total</TableHead>
            <TableHead>Payment</TableHead>
            <TableHead>Delivery</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {orders.map((order, index) => (
            <TableRow
              key={order.id}
              className={index % 2 === 0 ? 'bg-muted/50' : ''}
            >
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
                    {order.user?.email || 'N/A'}
                  </span>
                </div>
              </TableCell>
              <TableCell>{formatDateShort(order.createdAt)}</TableCell>
              <TableCell className="font-medium">
                {formatCurrency(Number(order.totalPrice))}
              </TableCell>
              <TableCell>
                <Badge
                  variant={order.isPaid ? 'default' : 'secondary'}
                  className={
                    order.isPaid
                      ? 'bg-green-600 hover:bg-green-700'
                      : 'bg-amber-500 hover:bg-amber-600 text-white'
                  }
                >
                  {order.isPaid ? 'Paid' : 'Unpaid'}
                </Badge>
              </TableCell>
              <TableCell>
                <Badge
                  variant={order.isDelivered ? 'default' : 'secondary'}
                  className={
                    order.isDelivered ? 'bg-blue-600 hover:bg-blue-700' : ''
                  }
                >
                  {order.isDelivered ? 'Delivered' : 'Pending'}
                </Badge>
              </TableCell>
              <TableCell>
                <div className="flex items-center justify-end gap-2">
                  <Button variant="outline" size="sm" asChild>
                    <Link href={`/orders/${order.id}`}>
                      <Eye className="h-4 w-4" />
                    </Link>
                  </Button>
                  <OrderActions
                    orderId={order.id}
                    paymentMethod={order.paymentMethod}
                    isPaid={order.isPaid}
                    isDelivered={order.isDelivered}
                  />
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
