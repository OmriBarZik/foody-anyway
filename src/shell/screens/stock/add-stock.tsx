import { useEffect, useRef, useState } from "react";
import type { FormEvent } from "react";
import { useTranslation } from "react-i18next";
import type { StockItemView, StockLocation } from "../../../domain/domain.types";
import app from "../../app.module.css";
import styles from "./stock.module.css";

/** Add one item to the open place. Spices are present or absent; other food has an amount. */
export function AddStockItem({
  location,
  onAdd,
}: {
  location: StockLocation;
  onAdd: (draft: Omit<StockItemView, "id">) => Promise<void>;
}) {
  const { t } = useTranslation();
  const [name, setName] = useState("");
  const [amount, setAmount] = useState("1");
  const [unit, setUnit] = useState("");
  const first = useRef<HTMLInputElement>(null);
  const spice = location === "spices";

  useEffect(() => {
    first.current?.focus();
  }, []);

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
      present: spice ? true : null,
    });
  }

  return (
    <form className={styles.addCard} onSubmit={submit}>
      <p className={app.label}>
        {t("stock.addItem")} · {t(`stock.locations.${location}`)}
      </p>
      <input
        ref={first}
        className={app.field}
        value={name}
        placeholder={t("stock.name")}
        aria-label={t("stock.name")}
        onChange={(event) => setName(event.target.value)}
      />
      {spice ? null : (
        <div className={styles.addPair}>
          <input
            className={app.field}
            inputMode="decimal"
            value={amount}
            placeholder={t("stock.amount")}
            aria-label={t("stock.amount")}
            onChange={(event) => setAmount(event.target.value)}
          />
          <input
            className={app.field}
            value={unit}
            placeholder={t("stock.unit")}
            aria-label={t("stock.unit")}
            onChange={(event) => setUnit(event.target.value)}
          />
        </div>
      )}
      <button className={app.dark} type="submit">
        {t("stock.add")}
      </button>
    </form>
  );
}
