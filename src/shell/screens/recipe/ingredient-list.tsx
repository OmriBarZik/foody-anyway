import { useTranslation } from "react-i18next";
import type { IngredientLine } from "./recipe.types";
import styles from "./recipe.module.css";

/** Ingredients with amounts, marked in the kitchen or out once the stock has loaded. */
export function IngredientList({ lines }: { lines: IngredientLine[] }) {
  const { t } = useTranslation();
  const known = lines.some((line) => line.have !== null);

  return (
    <>
      <ul className={styles.ingredients}>
        {lines.map((line) => (
          <li key={line.index} className={styles.ingredient}>
            {line.have === null ? null : (
              <span
                className={line.have ? styles.dotHave : styles.dotOut}
                role="img"
                aria-label={line.have ? t("recipe.inStock") : t("recipe.outOfStock")}
              />
            )}
            <span className={styles.ingredientName}>{line.name}</span>
            {line.amount ? <span className={styles.ingredientAmount}>{line.amount}</span> : null}
          </li>
        ))}
      </ul>
      {known ? (
        <p className={styles.legend}>
          <span>
            <span className={styles.dotHave} aria-hidden="true" />
            {t("recipe.inStock")}
          </span>
          <span>
            <span className={styles.dotOut} aria-hidden="true" />
            {t("recipe.outOfStock")}
          </span>
        </p>
      ) : null}
    </>
  );
}
