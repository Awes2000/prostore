import Image from 'next/image'
import Link from 'next/link'
import { APP_NAME } from '@/lib/constants'
import { Button } from '@/components/ui/button'

export default function NotFoundPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <Image
        src="/images/logo.svg"
        width={48}
        height={48}
        alt={`${APP_NAME} logo`}
        priority={true}
      />
      <div className="p-6 w-1/3 rounded-lg shadow-md text-center">
        <h1 className="text-3xl font-bold mb-4">404 - Page Not Found</h1>
        <p className="text-gray-600 mb-4">
          The page you are looking for doesn&apos;t exist or has been moved.
        </p>
        <Button asChild className="mt-4">
          <Link href="/">Go back to home</Link>
        </Button>
      </div>
    </div>
  )
}
