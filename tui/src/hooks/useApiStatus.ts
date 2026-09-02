import { useCallback, useEffect, useState } from "react";
import type { ApiStatus } from "../types.js";

export default function useApi<T>(request: () => Promise<T>) {
  const [data, setData] = useState<T | undefined>();
  const [status, setStatus] = useState<ApiStatus>("loading");

  const fetchData = useCallback(() => {
    setStatus("loading");
    return request()
      .then((response) => {
        setData(response);
        setStatus("online");
        return response;
      })
      .catch((error) => {
        setStatus("offline");
        console.error(error);
        return undefined;
      });
  }, [request]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, status, refetch: fetchData };
}
