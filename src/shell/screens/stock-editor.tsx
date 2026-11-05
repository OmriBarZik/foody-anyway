import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import { useTranslation } from "react-i18next";
import type { StockItemView, StockLocation } from "../../domain/domain.types";
import styles from "../app.module.css";

/** Add one item to a location. Spices are present or absent. Other food has an amount. */
export function AddStockItem({
  location,
  onAdd,
}: {
  location: StockLocation;
  onAdd: (draft: Omit<StockItemView, "id">) => Promise<void>;
}) {
  const { t } = useTranslation();
  const [name, setName] = useState("");
  const [amount, setAmount] = useState("");
  const [unit, setUnit] = useState("");
  const [present, setPresent] = useState(true);
  const spice = location === "spices";

  function submit(event: FormEvent<HTMLFormElement>): void {
    event.preventDefault();
    const trimmed = name.trim();

    if (!trimmed) {
      return;
    }

    void onAdd({
      location,
      name: trimmed,
      amount: spice ? null : Number(amount),
      unit: spice ? null : unit.trim() || null,
      present: spice ? present : null,
    }).then(() => {
      setName("");
      setAmount("");
      setUnit("");
      setPresent(true);
    });
  }

  return (
    <form className={styles.pasteRow} onSubmit={submit}>
      <input
        className={styles.pasteField}
        value={name}
        placeholder={t("stock.name")}
        aria-label={t("stock.name")}
        onChange={(event) => setName(event.target.value)}
      />
      {spice ? (
        <label className={styles.stockCheck}>
          <input type="checkbox" checked={present} onChange={(event) => setPresent(event.target.checked)} />
          {t("stock.have")}
        </label>
      ) : (
        <>
          <input
            className={styles.amountField}
            inputMode="decimal"
            value={amount}
            placeholder={t("stock.amount")}
            aria-label={t("stock.amount")}
            onChange={(event) => setAmount(event.target.value)}
          />
          <input
            className={styles.unitField}
            value={unit}
            placeholder={t("stock.unit")}
            aria-label={t("stock.unit")}
            onChange={(event) => setUnit(event.target.value)}
          />
        </>
      )}
      <button className={styles.pineButton} type="submit">
        {t("stock.add")}
      </button>
    </form>
  );
}

/** One saved item. Amount and unit save when the field loses focus. */
export function StockRow({
  item,
  onChange,
  onRemove,
}: {
  item: StockItemView;
  onChange: (item: StockItemView) => Promise<void>;
  onRemove: (itemId: string) => Promise<void>;
}) {
  const { t } = useTranslation();
  const [amount, setAmount] = useState(item.amount === null ? "" : String(item.amount));
  const [unit, setUnit] = useState(item.unit ?? "");
  const spice = item.location === "spices";

  useEffect(() => {
    setAmount(item.amount === null ? "" : String(item.amount));
    setUnit(item.unit ?? "");
  }, [item.amount, item.unit]);

  function commit(): void {
    const nextAmount = Number(amount);
    const nextUnit = unit.trim() || null;

    if (!Number.isFinite(nextAmount) || nextAmount < 0) {
      return;
    }

    if (nextAmount === item.amount && nextUnit === item.unit) {
      return;
    }

    void onChange({ ...item, amount: nextAmount, unit: nextUnit });
  }

  return (
    <li className={styles.stockRow}>
      <span>{item.name}</span>
      {spice ? (
        <button
          type="button"
          className={styles.choice}
          aria-pressed={item.present === true}
          onClick={() => void onChange({ ...item, present: item.present !== true })}
        >
          {item.present ? t("stock.have") : t("stock.missingItem")}
        </button>
      ) : (
        <span className={styles.stockEdit}>
          <input
            className={styles.amountField}
            inputMode="decimal"
            value={amount}
            aria-label={t("stock.amount")}
            onChange={(event) => setAmount(event.target.value)}
            onBlur={commit}
          />
          <input
            className={styles.unitField}
            value={unit}
            aria-label={t("stock.unit")}
            onChange={(event) => setUnit(event.target.value)}
            onBlur={commit}
          />
        </span>
      )}
      <button type="button" className={styles.textButton} onClick={() => void onRemove(item.id)}>
        {t("stock.remove")}
      </button>
    </li>
  );
}
