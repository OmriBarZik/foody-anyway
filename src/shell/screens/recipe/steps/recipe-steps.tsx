import { useEffect, useMemo, useState } from "react";
import type { RecipeView } from "../../../../domain/domain.types";
import type { IngredientLine, IngredientTerm } from "../recipe.types";
import { IngredientWord } from "./ingredient-word";
import { splitStep } from "./step-parts";
import styles from "./steps.module.css";

/**
 * The numbered steps. Words that name an ingredient get a dotted underline;
 * hovering, tapping or long-pressing one shows its amount, so nobody has to go back to the list.
 */
export function RecipeSteps({ recipe, lines }: { recipe: RecipeView; lines: IngredientLine[] }) {
  const [open, setOpen] = useState<string | null>(null);
  const steps = useMemo(() => {
    const terms: IngredientTerm[] = recipe.ingredients.map((ingredient, index) => ({
      index,
      names: [ingredient.name, ingredient.nameEn, ingredient.nameHe, lines[index]?.name].filter(
        (name): name is string => Boolean(name),
      ),
    }));

    return recipe.steps.map((step) => ({ order: step.order, parts: splitStep({ text: step.text, terms }) }));
  }, [recipe, lines]);

  useEffect(() => {
    if (open === null) {
      return;
    }

    function onPointer(event: PointerEvent): void {
      if (!(event.target instanceof Element) || !event.target.closest("[data-ingredient-word]")) {
        setOpen(null);
      }
    }

    function onKey(event: KeyboardEvent): void {
      if (event.key === "Escape") {
        setOpen(null);
      }
    }

    document.addEventListener("pointerdown", onPointer);
    document.addEventListener("keydown", onKey);

    return () => {
      document.removeEventListener("pointerdown", onPointer);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <ol className={styles.steps}>
      {steps.map((step, stepIndex) => (
        <li key={`${step.order}-${stepIndex}`} className={styles.step}>
          <span className={styles.number} aria-hidden="true">
            {stepIndex + 1}
          </span>
          <p className={styles.text}>
            {step.parts.map((part, partIndex) => {
              const key = `${stepIndex}-${partIndex}`;
              const line = part.kind === "ingredient" ? lines[part.index] : undefined;

              if (part.kind === "text" || !line) {
                return <span key={key}>{part.text}</span>;
              }

              return (
                <IngredientWord
                  key={key}
                  id={`word-${key}`}
                  text={part.text}
                  line={line}
                  open={open === key}
                  onOpen={() => setOpen(key)}
                  onClose={() => setOpen((current) => (current === key ? null : current))}
                />
              );
            })}
          </p>
        </li>
      ))}
    </ol>
  );
}
