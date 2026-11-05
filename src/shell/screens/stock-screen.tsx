import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import type { StockItemView, StockLocation } from "../../domain/domain.types";
import { ApiError, createStock, fetchStock, removeStock, saveStock } from "../api";
import styles from "../app.module.css";
import { AddStockItem, StockRow } from "./stock-editor";

const LOCATIONS: StockLocation[] = ["fridge", "freezer", "pantry", "spices"];

/** List mode for the shared fridge, freezer, pantry, and spices. */
export function StockScreen() {
  const { t } = useTranslation();
  const [items, setItems] = useState<StockItemView[]>([]);
  const [errorCode, setErrorCode] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    void fetchStock()
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

  async function add(draft: Omit<StockItemView, "id">): Promise<void> {
    setErrorCode(null);

    try {
      const saved = await createStock(draft);
      setItems((current) => [...current, saved].sort(byName));
    } catch (error) {
      setErrorCode(error instanceof ApiError ? error.code : "save_failed");
    }
  }

  async function change(item: StockItemView): Promise<void> {
    setErrorCode(null);

    try {
      const saved = await saveStock(item);
      setItems((current) => current.map((entry) => (entry.id === saved.id ? saved : entry)));
    } catch (error) {
      setErrorCode(error instanceof ApiError ? error.code : "save_failed");
    }
  }

  async function remove(itemId: string): Promise<void> {
    setErrorCode(null);

    try {
      await removeStock(itemId);
      setItems((current) => current.filter((entry) => entry.id !== itemId));
    } catch {
      setErrorCode("save_failed");
    }
  }

  const error =
    errorCode === "bad_item" ? t("stock.badItem") : errorCode === "save_failed" ? t("stock.saveFailed") : null;

  return (
    <div className={styles.stock}>
      {error ? (
        <p className={styles.alert} role="alert">
          {error}
        </p>
      ) : null}
      {LOCATIONS.map((location) => (
        <section key={location} className={styles.stockSection}>
          <h2 className={styles.sectionTitle}>{t(`stock.locations.${location}`)}</h2>
          <AddStockItem location={location} onAdd={add} />
          <ul className={styles.stockList}>
            {items
              .filter((item) => item.location === location)
              .map((item) => (
                <StockRow key={item.id} item={item} onChange={change} onRemove={remove} />
              ))}
          </ul>
          {items.some((item) => item.location === location) ? null : <p>{t("stock.empty")}</p>}
        </section>
      ))}
    </div>
  );
}

function byName(left: StockItemView, right: StockItemView): number {
  return left.name.localeCompare(right.name);
}
