import app from "../../app.module.css";
import styles from "./skeleton.module.css";

/** Grey stand-ins shaped like the real screens, shown until the first answer arrives. */

function count(total: number): number[] {
  return Array.from({ length: total }, (_unused, index) => index);
}

/** Title block with an optional round button on the side. */
export function HeaderSkeleton({ withButton = true }: { withButton?: boolean }) {
  return (
    <div className={styles.header}>
      <div className={styles.headerText}>
        <span className={styles.eyebrow} />
        <span className={styles.title} />
      </div>
      {withButton ? <span className={styles.circle} /> : null}
    </div>
  );
}

/** Recipe cards in the library grid. */
export function CardGridSkeleton({ cards = 6 }: { cards?: number }) {
  return (
    <div className={styles.grid} aria-hidden="true">
      {count(cards).map((index) => (
        <div key={index} className={styles.card}>
          <span className={styles.cardImage} />
          <span className={styles.line} />
          <span className={styles.lineShort} />
        </div>
      ))}
    </div>
  );
}

/** Rows in a white list card, like stock, shopping and members. */
export function RowsSkeleton({ rows = 5, thumbs = false }: { rows?: number; thumbs?: boolean }) {
  return (
    <div className={styles.list} aria-hidden="true">
      {count(rows).map((index) => (
        <div key={index} className={styles.row}>
          {thumbs ? <span className={styles.square} /> : null}
          <span className={styles.rowText}>
            <span className={styles.line} style={{ width: `${70 - ((index * 13) % 30)}%` }} />
            <span className={styles.lineShort} style={{ width: "30%" }} />
          </span>
        </div>
      ))}
    </div>
  );
}

/** A row of pill tabs. */
export function TabsSkeleton({ tabs = 4 }: { tabs?: number }) {
  return (
    <div className={styles.tabs} aria-hidden="true">
      {count(tabs).map((index) => (
        <span key={index} className={styles.pill} />
      ))}
    </div>
  );
}

/** The ideas page: a big ready card and a few rows. */
export function IdeasSkeleton() {
  return (
    <>
      <span className={styles.sectionTitle} />
      <span className={styles.bigCard} />
      <RowsSkeleton rows={3} thumbs />
    </>
  );
}

/** A recipe: photo, title, chips and ingredient rows. */
export function RecipeSkeleton() {
  return (
    <div className={styles.page} aria-busy="true">
      <span className={styles.hero} />
      <div className={styles.heroBody}>
        <span className={styles.heroTitle} />
        <span className={styles.lineShort} />
        <div className={styles.chips}>
          <span className={styles.chip} />
          <span className={styles.chip} />
          <span className={styles.chip} />
        </div>
        <TabsSkeleton tabs={2} />
        <RowsSkeleton rows={6} />
      </div>
    </div>
  );
}

/** The whole library page, used while the account loads. */
export function LibrarySkeleton() {
  return (
    <div className={`${app.page} ${styles.page}`} aria-busy="true">
      <HeaderSkeleton />
      <span className={styles.field} />
      <span className={styles.sectionTitle} />
      <CardGridSkeleton />
    </div>
  );
}

/** A plain bar where the bottom navigation will be. */
export function NavSkeleton() {
  return (
    <div className={styles.nav} aria-hidden="true">
      <div className={styles.navInner}>
        {count(5).map((index) => (
          <span key={index} className={styles.navDot} />
        ))}
      </div>
    </div>
  );
}
