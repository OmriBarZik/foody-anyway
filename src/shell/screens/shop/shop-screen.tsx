import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import { useTranslation } from "react-i18next";
import { parseIngredientLine } from "../../../library/parse-ingredient-line";
import type { ShopItemView } from "../../../shop/shop.types";
import { ApiError } from "../../api";
import app from "../../app.module.css";
import { createShopItem, fetchShop, removeShopItem } from "../../client/household-api";
import { CheckIcon, PlusIcon } from "../shell/icons";
import styles from "./shop.module.css";

/** The shared shopping list. One field adds "2 lemons"; ticking an item off removes it from the list. */
export function ShopScreen() {
  const { t } = useTranslation();
  const [items, setItems] = useState<ShopItemView[]>([]);
  const [bought, setBought] = useState<ShopItemView[]>([]);
  const [draft, setDraft] = useState("");
  const [loaded, setLoaded] = useState(false);
  const [errorCode, setErrorCode] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    void fetchShop()
      .then((next) => {
        if (active) {
          setItems(next);
          setLoaded(true);
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
    const parsed = parseIngredientLine(draft);

    if (!parsed) {
      return;
    }

    setErrorCode(null);
    void createShopItem({ name: parsed.name, amount: parsed.amount, unit: parsed.unit })
      .then((next) => {
        setItems(next);
        setDraft("");
      })
      .catch((error: unknown) => setErrorCode(error instanceof ApiError ? error.code : "save_failed"));
  }

  function tick(item: ShopItemView): void {
    setErrorCode(null);
    setItems((current) => current.filter((entry) => entry.id !== item.id));
    setBought((current) => [item, ...current]);
    void removeShopItem(item.id).catch(() => {
      setBought((current) => current.filter((entry) => entry.id !== item.id));
      setItems((current) => [item, ...current]);
      setErrorCode("save_failed");
    });
  }

  return (
    <div className={app.page}>
      <header className={app.headerText}>
        <p className={app.eyebrow}>{loaded ? t("shop.left", { count: items.length }) : " "}</p>
        <h1 className={app.title}>{t("shop.title")}</h1>
      </header>

      <form className={styles.add} onSubmit={submit}>
        <input
          className={app.field}
          value={draft}
          placeholder={t("shop.addPlaceholder")}
          aria-label={t("shop.add")}
          onChange={(event) => setDraft(event.target.value)}
        />
        <button type="submit" className={styles.addButton} aria-label={t("shop.add")}>
          <PlusIcon size={22} strokeWidth={2.5} />
        </button>
      </form>

      {errorCode ? (
        <p className={app.alert} role="alert">
          {errorCode === "bad_item" ? t("shop.badItem") : t("shop.saveFailed")}
        </p>
      ) : null}

      {loaded && items.length === 0 && bought.length === 0 ? <p className={app.empty}>{t("shop.empty")}</p> : null}

      {items.length + bought.length > 0 ? (
        <ul className={`${app.list} ${app.card}`}>
          {items.map((item) => (
            <ShopLine key={item.id} item={item} done={false} onTick={() => tick(item)} />
          ))}
          {bought.map((item) => (
            <ShopLine key={item.id} item={item} done onTick={() => undefined} />
          ))}
        </ul>
      ) : null}
    </div>
  );
}

function ShopLine({ item, done, onTick }: { item: ShopItemView; done: boolean; onTick: () => void }) {
  const { t } = useTranslation();
  const amount = [item.amount, item.unit].filter((part) => part !== null && part !== "").join(" ");

  return (
    <li>
      <button
        type="button"
        role="checkbox"
        aria-checked={done}
        aria-disabled={done}
        className={styles.line}
        onClick={done ? undefined : onTick}
      >
        <span className={styles.box} data-done={done ? "true" : "false"}>
          {done ? <CheckIcon size={16} strokeWidth={3.2} /> : null}
        </span>
        <span className={app.rowText}>
          <span className={styles.name} data-done={done ? "true" : "false"}>
            {item.name}
          </span>
          <span className={app.rowSub}>{item.recipeId ? t("shop.forRecipe") : t("shop.byHand")}</span>
        </span>
        {amount ? <span className={styles.amount}>{amount}</span> : null}
      </button>
    </li>
  );
}
