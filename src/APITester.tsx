import { useRef, type FormEvent } from "react";
import styles from "./APITester.module.css";

export function APITester() {
  const responseInputRef = useRef<HTMLTextAreaElement>(null);

  const testEndpoint = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    try {
      const form = e.currentTarget;
      const formData = new FormData(form);
      const endpoint = formData.get("endpoint") as string;
      const url = new URL(endpoint, location.href);
      const method = formData.get("method") as string;
      const res = await fetch(url, { method });

      const data: unknown = await res.json();
      responseInputRef.current!.value = JSON.stringify(data, null, 2);
    } catch (error) {
      responseInputRef.current!.value = String(error);
    }
  };

  return (
    <div className={styles.apiTester}>
      <form onSubmit={testEndpoint} className={styles.endpointRow}>
        <select name="method" className={styles.method}>
          <option value="GET">GET</option>
          <option value="PUT">PUT</option>
        </select>
        <input
          type="text"
          name="endpoint"
          defaultValue="/api/hello"
          className={styles.urlInput}
          placeholder="/api/hello"
        />
        <button type="submit" className={styles.sendButton}>
          Send
        </button>
      </form>
      <textarea
        ref={responseInputRef}
        readOnly
        placeholder="Response will appear here..."
        className={styles.responseArea}
      />
    </div>
  );
}
