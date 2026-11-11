import { PlateIcon } from "../shell/icons";
import styles from "./library.module.css";

const TINTS = [
  ["#f6dccb", "#c0714a"],
  ["#dce6c6", "#6e8a3a"],
  ["#e3e7ee", "#7a8598"],
  ["#f2e6c2", "#a08a3e"],
  ["#eadceb", "#8c6a8e"],
];

/** The dish photo, or a soft tinted plate when there is none. The tint stays the same per recipe. */
export function DishImage({
  seed,
  url,
  iconSize = 40,
  onError,
}: {
  seed: string;
  url: string | null;
  iconSize?: number;
  onError?: () => void;
}) {
  if (url) {
    return <img className={styles.photo} src={url} alt="" loading="lazy" onError={onError} />;
  }

  const [background, color] = TINTS[hash(seed) % TINTS.length] ?? ["#e3e7ee", "#7a8598"];

  return (
    <span className={styles.placeholder} style={{ background, color }}>
      <PlateIcon size={iconSize} strokeWidth={1.5} />
    </span>
  );
}

function hash(value: string): number {
  let total = 0;

  for (const char of value) {
    total = (total * 31 + char.charCodeAt(0)) >>> 0;
  }

  return total;
}
