import { useTranslation } from "react-i18next";
import type { StockItemView } from "../../../domain/domain.types";
import app from "../../app.module.css";
import { CloseIcon, MinusIcon, PlusIcon } from "../shell/icons";
import styles from "./stock.module.css";

const BULK_UNITS = new Set(["g", "ml", "gram", "grams", "גרם", "מ״ל"]);

/** One item: a switch for spices, a stepper for everything with an amount, and a remove button. */
export function StockRow({
  item,
  onChange,
  onRemove,
}: {
  item: StockItemView;
  onChange: (item: StockItemView) => void;
  onRemove: (itemId: string) => void;
}) {
  const { t } = useTranslation();
  const spice = item.location === "spices";
  const amount = item.amount ?? 0;
  const has = spice ? item.present === true : amount > 0;
  const step = item.unit && BULK_UNITS.has(item.unit.toLowerCase()) ? 50 : 1;

  return (
    <li className={app.row}>
      <span className={app.rowText}>
        <span className={app.rowTitle}>{item.name}</span>
        <span className={has ? app.rowSub : styles.out}>{has ? t("stock.have") : t("stock.missingItem")}</span>
      </span>
      {spice ? (
        <button
          type="button"
          role="switch"
          className={styles.switch}
          aria-checked={has}
          aria-label={t("stock.inKitchenSwitch", { name: item.name })}
          onClick={() => onChange({ ...item, present: !has })}
        >
          <span className={styles.knob} />
        </button>
      ) : (
        <span className={styles.stepper}>
          <button
            type="button"
            aria-label={t("stock.less", { name: item.name })}
            disabled={amount <= 0}
            onClick={() => onChange({ ...item, amount: Math.max(0, roundAmount(amount - step)) })}
          >
            <MinusIcon size={18} strokeWidth={2.4} />
          </button>
          <span className={styles.amount}>{[formatAmount(amount), item.unit].filter(Boolean).join(" ")}</span>
          <button
            type="button"
            className={styles.more}
            aria-label={t("stock.more", { name: item.name })}
            onClick={() => onChange({ ...item, amount: roundAmount(amount + step) })}
          >
            <PlusIcon size={18} strokeWidth={2.4} />
          </button>
        </span>
      )}
      <button
        type="button"
        className={styles.remove}
        aria-label={t("stock.removeItem", { name: item.name })}
        onClick={() => onRemove(item.id)}
      >
        <CloseIcon size={16} strokeWidth={2.2} />
      </button>
    </li>
  );
}

function roundAmount(value: number): number {
  return Math.round(value * 100) / 100;
}

function formatAmount(value: number): string {
  return Number.isInteger(value) ? String(value) : value.toFixed(2).replace(/0+$/, "").replace(/\.$/, "");
}
