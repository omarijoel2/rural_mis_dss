import { useEffect, useRef, useCallback, useState } from 'react';
import { telemetryWS } from '@/lib/api';

interface TelemetryData {
  tag_id: number;
  tag: string;
  value: string | number;
  timestamp: string;
  unit?: string;
}

export function useTelemetryWebSocket(tagIds: number[] = []) {
  const [measurements, setMeasurements] = useState<Record<number, TelemetryData>>({});
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const subscribedTags = useRef<Set<number>>(new Set());

  const handleMessage = useCallback((data: any) => {
    if (data.type === 'measurement' && data.tag_id) {
      setMeasurements((prev) => ({
        ...prev,
        [data.tag_id]: {
          tag_id: data.tag_id,
          tag: data.tag,
          value: data.value,
          timestamp: data.timestamp || new Date().toISOString(),
          unit: data.unit,
        },
      }));
    }
  }, []);

  const handleError = useCallback((err: any) => {
    setError(err);
    setIsConnected(false);
  }, []);

  // Initial connection
  useEffect(() => {
    telemetryWS.connect(handleMessage, handleError);
    setIsConnected(true);

    return () => {
      telemetryWS.disconnect();
    };
  }, [handleMessage, handleError]);

  // Subscribe/unsubscribe to tags
  useEffect(() => {
    if (!isConnected || tagIds.length === 0) return;

    const tagsToSubscribe = tagIds.filter((id) => !subscribedTags.current.has(id));
    const tagsToUnsubscribe = Array.from(subscribedTags.current).filter((id) => !tagIds.includes(id));

    if (tagsToSubscribe.length > 0) {
      telemetryWS.subscribe(tagsToSubscribe);
      tagsToSubscribe.forEach((id) => subscribedTags.current.add(id));
    }

    if (tagsToUnsubscribe.length > 0) {
      telemetryWS.unsubscribe(tagsToUnsubscribe);
      tagsToUnsubscribe.forEach((id) => subscribedTags.current.delete(id));
    }
  }, [tagIds, isConnected]);

  return {
    measurements,
    isConnected,
    error,
  };
}
