import { useState } from "react";
import { useTranslation } from "react-i18next";
import type { StockItemView, StockLocation } from "../../../domain/domain.types";
import { ApiError, createStock, removeStock, saveStock } from "../../api";
import { queries } from "../../cache/queries";
import { useCached } from "../../cache/use-cached";
import { RowsSkeleton } from "../skeleton/skeletons";
import app from "../../app.module.css";
import { CloseIcon, ForwardIcon, PlusIcon } from "../shell/icons";
import { AddStockItem } from "./add-stock";
import { StockRow } from "./stock-row";
import styles from "./stock.module.css";

const LOCATIONS: StockLocation[] = ["fridge", "freezer", "pantry", "spices"];

/** The shared fridge, freezer, pantry and spices, one place at a time, plus the way into Quick check. */
export function StockScreen({ go }: { go: (path: string) => void }) {
  const { t } = useTranslation();
  const cached = useCached(queries.stock);
  const items = cached.data ?? [];
  const setItems = (update: (current: StockItemView[]) => StockItemView[]) =>
    cached.set((current) => update(current ?? []));
  const loaded = cached.data !== undefined;
  const [location, setLocation] = useState<StockLocation>("fridge");
  const [adding, setAdding] = useState(false);
  const [saveError, setErrorCode] = useState<string | null>(null);
  const errorCode = saveError ?? (cached.failed ? "save_failed" : null);

  async function add(draft: Omit<StockItemView, "id">): Promise<boolean> {
    setErrorCode(null);

    try {
      const saved = await createStock(draft);
      setItems((current) => [...current, saved].sort(byName));

      return true;
    } catch (error) {
      setErrorCode(error instanceof ApiError ? error.code : "save_failed");

      return false;
    }
  }

  function change(item: StockItemView): void {
    setErrorCode(null);
    const previous = items;
    setItems((current) => current.map((entry) => (entry.id === item.id ? item : entry)));
    void saveStock(item).catch((error: unknown) => {
      setItems(() => previous);
      setErrorCode(error instanceof ApiError ? error.code : "save_failed");
    });
  }

  function remove(itemId: string): void {
    setErrorCode(null);
    const previous = items;
    setItems((current) => current.filter((entry) => entry.id !== itemId));
    void removeStock(itemId).catch(() => {
      setItems(() => previous);
      setErrorCode("save_failed");
    });
  }

  const shown = items.filter((item) => item.location === location);

  return (
    <div className={app.page}>
      <header className={app.header}>
        <div className={app.headerText}>
          <p className={app.eyebrow}>{t("stock.lead")}</p>
          <h1 className={app.title}>{t("stock.title")}</h1>
        </div>
        <button
          type="button"
          className={app.iconButtonDark}
          aria-label={adding ? t("stock.cancel") : t("stock.addItem")}
          aria-expanded={adding}
          onClick={() => setAdding(!adding)}
        >
          {adding ? <CloseIcon size={22} strokeWidth={2.4} /> : <PlusIcon size={22} strokeWidth={2.5} />}
        </button>
      </header>

      {adding ? (
        <AddStockItem
          location={location}
          onAdd={async (draft) => {
            if (await add(draft)) {
              setAdding(false);
            }
          }}
        />
      ) : (
        <a
          href="/guess"
          className={styles.quickCheck}
          onClick={(event) => {
            event.preventDefault();
            go("/guess");
          }}
        >
          <span className={styles.cards} aria-hidden="true">
            <span />
            <span />
          </span>
          <span className={app.rowText}>
            <span className={styles.quickTitle}>{t("stock.quickCheck")}</span>
            <span className={styles.quickSub}>{t("stock.quickCheckSub")}</span>
          </span>
          <span className={styles.forward}>
            <ForwardIcon size={20} strokeWidth={2.4} />
          </span>
        </a>
      )}

      <div className={styles.tabs} role="tablist" aria-label={t("stock.where")}>
        {LOCATIONS.map((entry) => (
          <button
            key={entry}
            type="button"
            role="tab"
            className={styles.tab}
            aria-selected={location === entry}
            onClick={() => setLocation(entry)}
          >
            {t(`stock.locations.${entry}`)}
            <span className={styles.count}>
              {items.filter((item) => item.location === entry && hasIt(item)).length}
            </span>
          </button>
        ))}
      </div>

      {errorCode ? (
        <p className={app.alert} role="alert">
          {errorCode === "bad_item" ? t("stock.badItem") : t("stock.saveFailed")}
        </p>
      ) : null}

      {!loaded && !cached.failed ? <RowsSkeleton rows={6} /> : null}
      {loaded && shown.length === 0 ? <p className={app.empty}>{t("stock.empty")}</p> : null}
      {shown.length > 0 ? (
        <ul className={`${app.list} ${app.card}`}>
          {shown.map((item) => (
            <StockRow key={item.id} item={item} onChange={change} onRemove={remove} />
          ))}
        </ul>
      ) : null}
    </div>
  );
}

function hasIt(item: StockItemView): boolean {
  return item.location === "spices" ? item.present === true : (item.amount ?? 0) > 0;
}

function byName(left: StockItemView, right: StockItemView): number {
  return left.name.localeCompare(right.name);
}
