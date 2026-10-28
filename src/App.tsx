import { APITester } from "./APITester";
import styles from "./App.module.css";
import "./index.css";
import logo from "./logo.svg";
import reactLogo from "./react.svg";

export function App() {
  return (
    <div className={styles.app}>
      <div className={styles.logoContainer}>
        <img src={logo} alt="Bun Logo" className={styles.bunLogo} />
        <img src={reactLogo} alt="React Logo" className={styles.reactLogo} />
      </div>

      <h1>Bun + React</h1>
      <p>
        Edit <code>src/App.tsx</code> and save to test HMR
      </p>
      <APITester />
    </div>
  );
}

export default App;
