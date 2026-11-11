import type { ReactNode } from "react";

type IconProps = { size?: number; strokeWidth?: number };

function Svg({ size = 22, strokeWidth = 2, children }: IconProps & { children: ReactNode }) {
  return (
    <svg
      aria-hidden="true"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {children}
    </svg>
  );
}

/** A video frame with a play mark. */
export function RecipesIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <rect x="3" y="4" width="18" height="16" rx="3" />
      <path d="M10 9.5v5l4-2.5z" />
    </Svg>
  );
}

/** A fridge. */
export function KitchenIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <rect x="5" y="3" width="14" height="18" rx="2" />
      <path d="M5 10h14M8 6.5v1.5M8 13v2" />
    </Svg>
  );
}

/** A steaming pot. */
export function CookIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M4 11h16v3a6 6 0 0 1-6 6h-4a6 6 0 0 1-6-6z" />
      <path d="M2 11h20M9 7c0-1 1-1.5 1-2.5M14 7c0-1 1-1.5 1-2.5" />
    </Svg>
  );
}

/** A checklist. */
export function ListIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M9 6h11M9 12h11M9 18h11" />
      <path d="M4 6l1 1 2-2M4 12l1 1 2-2" />
      <circle cx="5" cy="18" r="1" />
    </Svg>
  );
}

/** Plus. */
export function PlusIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M12 5v14M5 12h14" />
    </Svg>
  );
}

/** Minus. */
export function MinusIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M5 12h14" />
    </Svg>
  );
}

/** A cross for close and remove. */
export function CloseIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M6 6l12 12M18 6L6 18" />
    </Svg>
  );
}

/** A check mark. */
export function CheckIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M5 12l5 5 9-10" />
    </Svg>
  );
}

/** A chevron that points back. Mirrored in right-to-left pages by CSS. */
export function BackIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M15 5l-7 7 7 7" />
    </Svg>
  );
}

/** A chevron that points forward. */
export function ForwardIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M9 6l6 6-6 6" />
    </Svg>
  );
}

/** An arrow that points forward. */
export function ArrowIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M5 12h14M13 6l6 6-6 6" />
    </Svg>
  );
}

/** A chevron up, for expanding a stack. */
export function UpIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M6 15l6-6 6 6" />
    </Svg>
  );
}

/** A chevron down, for collapsing a stack. */
export function DownIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M6 9l6 6 6-6" />
    </Svg>
  );
}

/** A magnifier. */
export function SearchIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <circle cx="11" cy="11" r="7" />
      <path d="M20 20l-3.5-3.5" />
    </Svg>
  );
}

/** A clock. */
export function ClockIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3 2" />
    </Svg>
  );
}

/** Two people. */
export function PeopleIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <circle cx="9" cy="8" r="3.5" />
      <path d="M3 20c0-3.5 2.7-6 6-6s6 2.5 6 6M16 4.5a3.5 3.5 0 0 1 0 7M18 14c2 .8 3 2.8 3 6" />
    </Svg>
  );
}

/** A person with a plus, for invites. */
export function InviteIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <circle cx="9" cy="8" r="3.5" />
      <path d="M3 20c0-3.5 2.7-6 6-6s6 2.5 6 6M19 8v6M16 11h6" />
    </Svg>
  );
}

/** A pencil. */
export function PencilIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M4 20h4L19 9l-4-4L4 16z" />
      <path d="M13.5 6.5l4 4" />
    </Svg>
  );
}

/** A part circle that spins while something loads. */
export function SpinnerIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M12 3a9 9 0 1 0 9 9" />
    </Svg>
  );
}

/** An exclamation mark. */
export function AlertIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M12 7v6M12 17h.01" />
    </Svg>
  );
}

/** A plate, used where a recipe has no photo. */
export function PlateIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <circle cx="12" cy="12" r="8" />
      <circle cx="12" cy="12" r="4" />
    </Svg>
  );
}

/** A filled play triangle. */
export function PlayIcon({ size = 18 }: IconProps) {
  return (
    <svg aria-hidden="true" width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
      <path d="M8 5v14l11-7z" />
    </svg>
  );
}
