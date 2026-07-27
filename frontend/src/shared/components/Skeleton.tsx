interface SkeletonProps {
  className?: string
  count?: number
}

export function Skeleton({ className = '', count = 1 }: SkeletonProps) {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className={`skeleton ${className}`} />
      ))}
    </>
  )
}

export function SkeletonCard() {
  return (
    <div className="skeleton-card">
      <div className="skeleton skeleton-title" />
      <div className="skeleton skeleton-text" />
      <div className="skeleton skeleton-text short" />
    </div>
  )
}

export function SkeletonTable({ rows = 5 }: { rows?: number }) {
  return (
    <div className="skeleton-table">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="skeleton-table-row">
          <div className="skeleton skeleton-checkbox" />
          <div className="skeleton-table-content">
            <div className="skeleton skeleton-title" />
            <div className="skeleton skeleton-text short" />
          </div>
        </div>
      ))}
    </div>
  )
}

export function SkeletonKPICard() {
  return (
    <div className="skeleton-card skeleton-kpi">
      <div className="skeleton skeleton-icon" />
      <div className="skeleton-kpi-content">
        <div className="skeleton skeleton-text" />
        <div className="skeleton skeleton-title" />
      </div>
    </div>
  )
}
