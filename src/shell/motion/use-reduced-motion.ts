import { useEffect, useState } from "react";

/** True when the person asked the system to keep motion still. */
export function useReducedMotion(): boolean {
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");

    function apply(): void {
      setReduced(query.matches);
    }

    apply();
    query.addEventListener("change", apply);

    return () => {
      query.removeEventListener("change", apply);
    };
  }, []);

  return reduced;
}
