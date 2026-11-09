import type { SVGProps } from 'react'

type IconProps = SVGProps<SVGSVGElement> & { size?: number }

function Base({ size = 20, children, ...props }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...props}
    >
      {children}
    </svg>
  )
}

export function ArrowUpRight(props: IconProps) {
  return (
    <Base {...props}>
      <path d="M7 17 17 7M8 7h9v9" />
    </Base>
  )
}

export function ArrowDown(props: IconProps) {
  return (
    <Base {...props}>
      <path d="M12 4v16M6 14l6 6 6-6" />
    </Base>
  )
}

export function ArrowLeft(props: IconProps) {
  return (
    <Base {...props}>
      <path d="M20 12H4M10 6l-6 6 6 6" />
    </Base>
  )
}

export function ArrowRight(props: IconProps) {
  return (
    <Base {...props}>
      <path d="M4 12h16M14 6l6 6-6 6" />
    </Base>
  )
}

export function Plus(props: IconProps) {
  return (
    <Base {...props}>
      <path d="M12 5v14M5 12h14" />
    </Base>
  )
}

export function Close(props: IconProps) {
  return (
    <Base {...props}>
      <path d="m6 6 12 12M18 6 6 18" />
    </Base>
  )
}

export function Menu(props: IconProps) {
  return (
    <Base {...props}>
      <path d="M4 7h16M4 12h16M4 17h16" />
    </Base>
  )
}

export function Check(props: IconProps) {
  return (
    <Base {...props}>
      <path d="m4 12 5 5L20 6" />
    </Base>
  )
}

export function Upload(props: IconProps) {
  return (
    <Base {...props}>
      <path d="M12 16V4M7 9l5-5 5 5M4 16v3h16v-3" />
    </Base>
  )
}

export function External(props: IconProps) {
  return (
    <Base {...props}>
      <path d="M14 4h6v6M20 4l-9 9M19 14v5H5V5h5" />
    </Base>
  )
}

export function Mail(props: IconProps) {
  return (
    <Base {...props}>
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <path d="m3 7 9 6 9-6" />
    </Base>
  )
}

export function Phone(props: IconProps) {
  return (
    <Base {...props}>
      <path d="M8 3H5a2 2 0 0 0-2 2c0 8.8 7.2 16 16 16a2 2 0 0 0 2-2v-3l-4-1-1.5 3a13 13 0 0 1-9.5-9.5L9 7 8 3Z" />
    </Base>
  )
}

export function MapPin(props: IconProps) {
  return (
    <Base {...props}>
      <path d="M20 10c0 6-8 11-8 11S4 16 4 10a8 8 0 1 1 16 0Z" />
      <circle cx="12" cy="10" r="2.5" />
    </Base>
  )
}

export function Trash(props: IconProps) {
  return (
    <Base {...props}>
      <path d="M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13M10 11v5M14 11v5" />
    </Base>
  )
}

export function Edit(props: IconProps) {
  return (
    <Base {...props}>
      <path d="M4 20h4L19 9l-4-4L4 16v4ZM14 6l4 4" />
    </Base>
  )
}

export function LogOut(props: IconProps) {
  return (
    <Base {...props}>
      <path d="M10 4H4v16h6M14 8l4 4-4 4M8 12h10" />
    </Base>
  )
}

export function Eye(props: IconProps) {
  return (
    <Base {...props}>
      <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Z" />
      <circle cx="12" cy="12" r="3" />
    </Base>
  )
}

export function Save(props: IconProps) {
  return (
    <Base {...props}>
      <path d="M4 4h13l3 3v13H4V4Z" />
      <path d="M8 4v6h8V4M8 20v-6h8v6" />
    </Base>
  )
}

export function ChevronUp(props: IconProps) {
  return (
    <Base {...props}>
      <path d="m6 15 6-6 6 6" />
    </Base>
  )
}

export function ChevronDown(props: IconProps) {
  return (
    <Base {...props}>
      <path d="m6 9 6 6 6-6" />
    </Base>
  )
}

export function Copy(props: IconProps) {
  return (
    <Base {...props}>
      <rect x="9" y="9" width="11" height="11" rx="2" />
      <path d="M5 15H4V4h11v1" />
    </Base>
  )
}

export function Spark(props: IconProps) {
  return (
    <Base {...props}>
      <path d="M12 3v4M12 17v4M3 12h4M17 12h4M6 6l2.5 2.5M15.5 15.5 18 18M18 6l-2.5 2.5M8.5 15.5 6 18" />
    </Base>
  )
}
