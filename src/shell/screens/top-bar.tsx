import type { UserView } from "../../domain/domain.types";
import styles from "../app.module.css";

/** The wordmark and the household name. Personal choices live on Settings. */
export function TopBar({ user }: { user: UserView }) {
  return (
    <header className={styles.top}>
      <div>
        <h1 className={styles.brand}>Foody</h1>
        <div className={styles.brandRule} />
        <p className={styles.household}>{user.household.name}</p>
      </div>
    </header>
  );
}
