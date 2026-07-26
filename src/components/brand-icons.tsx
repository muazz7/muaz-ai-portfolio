import type { SVGProps } from 'react';

/**
 * Brand marks.
 *
 * lucide-react dropped brand icons in v1, so these live here instead of adding
 * another dependency. Geometry follows each brand's published mark; GitHub, X
 * and WhatsApp use their filled logo paths, the rest are drawn as strokes to sit
 * beside the lucide icons without looking out of place.
 */

type IconProps = SVGProps<SVGSVGElement>;

const strokeProps = {
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 2,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
} as const;

export function GithubIcon({ className, ...props }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" width="24" height="24" className={className} aria-hidden {...strokeProps} {...props}>
      <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.4 5.4 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
      <path d="M9 18c-4.51 2-5-2-7-2" />
    </svg>
  );
}

export function FacebookIcon({ className, ...props }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" width="24" height="24" className={className} aria-hidden {...strokeProps} {...props}>
      <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
    </svg>
  );
}

export function InstagramIcon({ className, ...props }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" width="24" height="24" className={className} aria-hidden {...strokeProps} {...props}>
      <rect x="2" y="2" width="20" height="20" rx="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
    </svg>
  );
}

export function XIcon({ className, ...props }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" width="24" height="24" className={className} fill="currentColor" aria-hidden {...props}>
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}

export function WhatsappIcon({ className, ...props }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" width="24" height="24" className={className} fill="currentColor" aria-hidden {...props}>
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.174-.297-.019-.458.13-.606.134-.133.347-.397.52-.595.174-.199.232-.34.348-.539.113-.198.056-.371-.058-.52-.113-.148-.643-1.55-.882-2.123-.234-.564-.47-.487-.643-.496a11.6 11.6 0 0 0-.585-.011c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.71.306 1.263.489 1.695.625.712.227 1.36.195 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.29.173-1.414-.074-.124-.272-.198-.57-.347z" />
      <path d="M20.52 3.449A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.548 4.142 1.588 5.945L0 24l6.304-1.654a11.88 11.88 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.82 11.82 0 0 0-3.365-8.452zM12 21.785h-.004a9.87 9.87 0 0 1-5.032-1.378l-.361-.214-3.741.981.999-3.648-.235-.374a9.86 9.86 0 0 1-1.511-5.26c.002-5.45 4.437-9.884 9.889-9.884a9.82 9.82 0 0 1 6.988 2.898 9.825 9.825 0 0 1 2.892 6.994c-.003 5.45-4.437 9.885-9.884 9.885z" />
    </svg>
  );
}

export function RedditIcon({ className, ...props }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" width="24" height="24" className={className} aria-hidden {...strokeProps} {...props}>
      <circle cx="12" cy="13" r="8" />
      <circle cx="9" cy="12.5" r="1" fill="currentColor" stroke="none" />
      <circle cx="15" cy="12.5" r="1" fill="currentColor" stroke="none" />
      <path d="M9 16.2c1.8 1.2 4.2 1.2 6 0" />
      <path d="M12 5v-2l4 .8" />
      <circle cx="18" cy="3.5" r="1.5" />
      <path d="M20 10.5a2 2 0 0 1 2 2.5M4 10.5a2 2 0 0 0-2 2.5" />
    </svg>
  );
}
