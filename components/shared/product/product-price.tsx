import { cn } from '@/lib/utils'

type Props = {
  value: number
  className?: string
}

export default function ProductPrice({ value, className }: Props) {
  // Ensure 2 decimal places
  const stringValue = value.toFixed(2)

  // Split into integer and float parts
  const [intValue, floatValue] = stringValue.split('.')

  return (
    <p className={cn('text-2xl', className)}>
      <span className="text-xs align-super">$</span>
      {intValue}
      <span className="text-xs align-super">.{floatValue}</span>
    </p>
  )
}
