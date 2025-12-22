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

type Order = {
  id: string;
  createdAt: Date;
  totalPrice: number | string | { toString(): string };
  isPaid: boolean;
  isDelivered: boolean;
  paidAt?: Date | null;
  deliveredAt?: Date | null;
};

type OrderListProps = {
  orders: Order[];
};

export default function OrderList({ orders }: OrderListProps) {
  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Order ID</TableHead>
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
              <TableCell className="font-mono text-sm">
                {shortenId(order.id)}
              </TableCell>
              <TableCell>{formatDateShort(order.createdAt)}</TableCell>
              <TableCell className="font-medium">
                {formatCurrency(Number(order.totalPrice))}
              </TableCell>
              <TableCell>
                {order.isPaid ? (
                  <Badge className="bg-green-600 hover:bg-green-700">
                    Paid
                  </Badge>
                ) : (
                  <Badge variant="secondary" className="bg-amber-500 hover:bg-amber-600 text-white">
                    Unpaid
                  </Badge>
                )}
              </TableCell>
              <TableCell>
                {order.isDelivered ? (
                  <Badge className="bg-blue-600 hover:bg-blue-700">
                    Delivered
                  </Badge>
                ) : (
                  <Badge variant="secondary">Not Delivered</Badge>
                )}
              </TableCell>
              <TableCell className="text-right">
                <Button variant="outline" size="sm" asChild>
                  <Link href={`/orders/${order.id}`}>
                    <Eye className="h-4 w-4 mr-1" />
                    View
                  </Link>
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
