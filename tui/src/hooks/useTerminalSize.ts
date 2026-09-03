import process from "node:process";
import { useEffect, useState } from "react";

export default function useTerminalSize() {
  const [size, setSize] = useState({
    columns: process.stdout.columns,
    rows: process.stdout.rows,
  });

  useEffect(() => {
    const onResize = () =>
      setSize({ columns: process.stdout.columns, rows: process.stdout.rows });
    process.stdout.on("resize", onResize);
    return () => {
      process.stdout.off("resize", onResize);
    };
  }, []);

  return size;
}
