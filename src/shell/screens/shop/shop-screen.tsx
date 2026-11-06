import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import { useTranslation } from "react-i18next";
import type { ShopItemView } from "../../../shop/shop.types";
import { ApiError } from "../../api";
import styles from "../../app.module.css";
import { createShopItem, fetchShop, removeShopItem } from "../../client/household-api";

/** Items to buy, added by hand. Recipe gaps are added from Ideas. */
export function ShopScreen() {
  const { t } = useTranslation();
  const [items, setItems] = useState<ShopItemView[]>([]);
  const [name, setName] = useState("");
  const [amount, setAmount] = useState("");
  const [unit, setUnit] = useState("");
  const [errorCode, setErrorCode] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    void fetchShop()
      .then((next) => {
        if (active) {
          setItems(next);
        }
      })
      .catch(() => {
        if (active) {
          setErrorCode("save_failed");
        }
      });

    return () => {
      active = false;
    };
  }, []);

  function submit(event: FormEvent<HTMLFormElement>): void {
    event.preventDefault();
    const trimmed = name.trim();

    if (!trimmed) {
      return;
    }

    setErrorCode(null);
    void createShopItem({
      name: trimmed,
      amount: amount.trim() === "" ? null : Number(amount),
      unit: unit.trim() || null,
    })
      .then((next) => {
        setItems(next);
        setName("");
        setAmount("");
        setUnit("");
      })
      .catch((error: unknown) => {
        setErrorCode(error instanceof ApiError ? error.code : "save_failed");
      });
  }

  function remove(itemId: string): void {
    setErrorCode(null);
    void removeShopItem(itemId)
      .then(() => setItems((current) => current.filter((item) => item.id !== itemId)))
      .catch(() => setErrorCode("save_failed"));
  }

  const error = errorCode === "bad_item" ? t("shop.badItem") : errorCode ? t("shop.saveFailed") : null;

  return (
    <section className={styles.stack}>
      {error ? <p className={styles.alert}>{error}</p> : null}
      <form className={styles.pasteRow} onSubmit={submit}>
        <input
          className={styles.pasteField}
          value={name}
          placeholder={t("shop.name")}
          aria-label={t("shop.name")}
          onChange={(event) => setName(event.target.value)}
        />
        <input
          className={styles.amountField}
          inputMode="decimal"
          value={amount}
          placeholder={t("shop.amount")}
          aria-label={t("shop.amount")}
          onChange={(event) => setAmount(event.target.value)}
        />
        <input
          className={styles.unitField}
          value={unit}
          placeholder={t("shop.unit")}
          aria-label={t("shop.unit")}
          onChange={(event) => setUnit(event.target.value)}
        />
        <button className={styles.pineButton} type="submit">
          {t("shop.add")}
        </button>
      </form>
      {items.length === 0 ? <p>{t("shop.empty")}</p> : null}
      <ul className={styles.stockList}>
        {items.map((item) => (
          <li key={item.id} className={styles.stockRow}>
            <span>{item.name}</span>
            <span>
              {item.amount} {item.unit}
            </span>
            <button type="button" className={styles.textButton} onClick={() => remove(item.id)}>
              {t("shop.remove")}
            </button>
          </li>
        ))}
      </ul>
    </section>
  );
}
