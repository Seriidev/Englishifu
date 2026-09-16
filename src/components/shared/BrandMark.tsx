export default function BrandMark({ className = '' }: { className?: string }) {
  return (
    <span className={`font-bold tracking-tight ${className}`}>
      English<span className="text-brand">Core</span>
    </span>
  )
}
