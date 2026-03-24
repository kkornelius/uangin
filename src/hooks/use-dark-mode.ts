import { useState, useEffect } from "react";

export function useDarkMode() {
  const [dark, setDark] = useState(() => {
    if (typeof window === "undefined") return false;
    return localStorage.getItem("cashflow_dark") === "true";
  });

  useEffect(() => {
    document.documentElement.classList.toggle("dark", dark);
    localStorage.setItem("cashflow_dark", String(dark));
  }, [dark]);

  return [dark, () => setDark((d) => !d)] as const;
}
