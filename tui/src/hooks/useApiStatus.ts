import { useCallback, useEffect, useState } from "react";
import type { ApiStatus } from "../types.js";

export default function useApi(request: () => Promise<any>) {
  const [data, setData] = useState();
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
