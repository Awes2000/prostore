'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Package, User } from 'lucide-react';
import { cn } from '@/lib/utils';

const menuItems = [
  {
    label: 'My Orders',
    href: '/user/orders',
    icon: Package,
  },
  {
    label: 'Profile',
    href: '/user/profile',
    icon: User,
  },
];

export default function UserMenu() {
  const pathname = usePathname();

  return (
    <nav className="space-y-1" aria-label="User account navigation">
      {menuItems.map((item) => {
        const Icon = item.icon;
        const isActive = pathname === item.href;

        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
              isActive
                ? 'bg-primary text-primary-foreground'
                : 'text-muted-foreground hover:bg-muted hover:text-foreground'
            )}
            aria-current={isActive ? 'page' : undefined}
          >
            <Icon className="h-4 w-4" />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
