import { useCallback, useEffect, useRef, useState } from "react";
import {
  getAlerts,
  getCameras,
  subscribeToCctv,
  type Camera,
  type CctvAlert,
} from "./cctv-service";

export function useCctv() {
  const [cameras, setCameras] = useState<Camera[]>([]);
  const [alerts, setAlerts] = useState<CctvAlert[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const request = useRef(0);
  const refresh = useCallback(async () => {
    const id = ++request.current;
    try {
      const [nextCameras, nextAlerts] = await Promise.all([getCameras(), getAlerts()]);
      if (id !== request.current) return;
      setCameras(nextCameras);
      setAlerts(nextAlerts);
      setError(false);
    } catch {
      if (id === request.current) setError(true);
    } finally {
      if (id === request.current) setLoading(false);
    }
  }, []);
  useEffect(() => {
    void refresh();
    const unsubscribe = subscribeToCctv(refresh);
    return () => {
      request.current += 1;
      unsubscribe();
    };
  }, [refresh]);
  return {
    cameras,
    alerts,
    loading,
    error,
    retry: () => {
      setLoading(true);
      void refresh();
    },
    activeCount: alerts.filter((alert) => !alert.acknowledged).length,
  };
}
