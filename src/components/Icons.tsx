/**
 * Iconos propios de DripDev.
 * Trazo de 1.6, terminaciones redondas, sin relleno: el mismo peso en todos.
 * Se evitan metáforas gastadas (cohete, escudo) a propósito.
 */

type Props = { className?: string }

const base = {
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.6,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
  'aria-hidden': true,
}

/** Las uso yo: una mano sosteniendo un móvil. */
export function IconEnUso({ className }: Props) {
  return (
    <svg {...base} className={className}>
      <rect x="7" y="2.5" width="10" height="15" rx="2.2" />
      <path d="M10.6 5.2h2.8" />
      <path d="M5 21.5c1.8-1.5 4.2-2.3 7-2.3s5.2.8 7 2.3" />
    </svg>
  )
}

/** De la idea al móvil: una chispa, no un cohete. */
export function IconChispa({ className }: Props) {
  return (
    <svg {...base} className={className}>
      <path d="M12 2.5 13.9 9l6.6 1.9-6.6 1.9L12 19.4l-1.9-6.6L3.5 10.9 10.1 9Z" />
      <path d="M18.5 3v3M20 4.5h-3" />
    </svg>
  )
}

/** Continuidad: puntos de commit encadenados. */
export function IconCommits({ className }: Props) {
  return (
    <svg {...base} className={className}>
      <circle cx="5" cy="12" r="2.1" />
      <circle cx="12" cy="12" r="2.1" />
      <circle cx="19" cy="12" r="2.1" />
      <path d="M7.1 12h2.8M14.1 12h2.8" />
      <path d="M12 9.9V5.2M12 14.1v4.7" opacity="0.45" />
    </svg>
  )
}

/** Ubicación, en lugar del emoji 📍 */
export function IconUbicacion({ className }: Props) {
  return (
    <svg {...base} className={className}>
      <path d="M12 21.5s7-5.6 7-11a7 7 0 1 0-14 0c0 5.4 7 11 7 11Z" />
      <circle cx="12" cy="10.2" r="2.6" />
    </svg>
  )
}
