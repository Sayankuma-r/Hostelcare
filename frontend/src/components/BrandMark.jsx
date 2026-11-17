export default function BrandMark({ className = '' }) {
  return (
    <span className={`brand-mark ${className}`} aria-hidden="true">
      <svg viewBox="0 0 48 48" fill="none">
        <rect x="1" y="1" width="46" height="46" rx="15" />
        <path className="brand-mark-building" d="M12 37V17.2L24 11l12 6.2V37h-8v-9h-8v9h-8Z" />
        <path className="brand-mark-window" d="M17 20h4v4h-4zm10 0h4v4h-4z" />
        <path className="brand-mark-check" d="m31 33 2.2 2.2 4.3-4.5" />
      </svg>
    </span>
  )
}
