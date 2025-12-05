import Image from 'next/image'

export default function LoadingPage() {
  return (
    <div className="flex justify-center items-center h-screen">
      <Image
        src="/images/loader.gif"
        alt="Loading..."
        width={150}
        height={150}
        unoptimized
      />
    </div>
  )
}
