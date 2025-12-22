import { Suspense } from 'react'
import { EllipsisVertical, ShoppingCart, UserIcon } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'
import { ModeToggle } from './mode-toggle'
import CartBadge from '@/components/cart/cart-badge'

export default function Menu() {
  return (
    <div className="flex justify-end gap-3">
      {/* Desktop Navigation - hidden on mobile */}
      <nav className="hidden md:flex w-full max-w-xs gap-1">
        <ModeToggle />
        <Suspense
          fallback={
            <Button variant="ghost">
              <ShoppingCart className="h-5 w-5" />
              <span className="ml-1">Cart</span>
            </Button>
          }
        >
          <CartBadge />
        </Suspense>
        <Button asChild>
          <Link href="/sign-in">
            <UserIcon /> Sign in
          </Link>
        </Button>
      </nav>

      {/* Mobile Navigation - hidden on desktop */}
      <nav className="md:hidden">
        <Sheet>
          <SheetTrigger className="align-middle">
            <EllipsisVertical />
          </SheetTrigger>
          <SheetContent className="flex flex-col items-start">
            <SheetTitle>Menu</SheetTitle>
            <div className="flex flex-col gap-3 mt-4 w-full">
              <ModeToggle />
              <Suspense
                fallback={
                  <Button variant="ghost" className="w-full justify-start">
                    <ShoppingCart className="h-5 w-5" />
                    <span className="ml-1">Cart</span>
                  </Button>
                }
              >
                <CartBadge />
              </Suspense>
              <Button asChild className="w-full justify-start">
                <Link href="/sign-in">
                  <UserIcon /> Sign in
                </Link>
              </Button>
            </div>
            <SheetDescription />
          </SheetContent>
        </Sheet>
      </nav>
    </div>
  )
}
