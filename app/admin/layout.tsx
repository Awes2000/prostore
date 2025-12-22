import { redirect } from 'next/navigation';
import Link from 'next/link';
import { Menu, Shield, Home } from 'lucide-react';
import { checkAdmin } from '@/lib/admin-check';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import AdminMenu from '@/components/admin/admin-menu';

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isAdmin, user, session } = await checkAdmin();

  // Check if user is authenticated
  if (!session?.user) {
    redirect('/sign-in?callbackUrl=/admin');
  }

  // Check if user has admin role
  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-muted/50">
        <Card className="max-w-md w-full mx-4">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10">
              <Shield className="h-6 w-6 text-destructive" />
            </div>
            <CardTitle className="text-2xl">Access Denied</CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <p className="text-muted-foreground">
              You don&apos;t have permission to access the admin dashboard.
              Admin role is required.
            </p>
            <Button asChild>
              <Link href="/">
                <Home className="h-4 w-4 mr-2" />
                Back to Home
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted/30">
      {/* Top Header */}
      <header className="sticky top-0 z-40 border-b bg-background">
        <div className="flex h-14 items-center gap-4 px-4 lg:px-6">
          {/* Mobile Menu Button */}
          <Sheet>
            <SheetTrigger asChild className="md:hidden">
              <Button variant="outline" size="icon">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Toggle menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-64">
              <SheetHeader>
                <SheetTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  Admin Panel
                </SheetTitle>
              </SheetHeader>
              <div className="mt-4">
                <AdminMenu />
              </div>
            </SheetContent>
          </Sheet>

          {/* Logo/Title */}
          <div className="flex items-center gap-2">
            <Link href="/admin" className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              <span className="font-semibold hidden sm:inline">
                Admin Dashboard
              </span>
            </Link>
            <Badge variant="secondary" className="hidden sm:inline-flex">
              Admin
            </Badge>
          </div>

          {/* Spacer */}
          <div className="flex-1" />

          {/* User Info */}
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground hidden md:inline">
              {user?.name || user?.email}
            </span>
            <Button variant="outline" size="sm" asChild>
              <Link href="/">View Store</Link>
            </Button>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Desktop Sidebar */}
        <aside className="hidden md:flex w-64 shrink-0 flex-col border-r bg-background">
          <div className="flex-1 p-4">
            <AdminMenu />
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-4 lg:p-6">{children}</main>
      </div>
    </div>
  );
}
