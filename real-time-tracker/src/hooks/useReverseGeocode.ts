import { useEffect, useState } from 'react';

// Simple in-memory cache
const geocodeCache: Record<string, string> = {};

function getCacheKey(lat: number, lng: number) {
  return `${lat.toFixed(4)},${lng.toFixed(4)}`;
}

export function useReverseGeocode(lat?: number, lng?: number) {
  const [location, setLocation] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (lat === undefined || lng === undefined) {
      setLocation(null);
      return;
    }
    const key = getCacheKey(lat, lng);
    if (geocodeCache[key]) {
      setLocation(geocodeCache[key]);
      return;
    }
    setLoading(true);
    fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=10&addressdetails=1`,
      {
        headers: {
          'User-Agent': 'real-time-logistics-tracker/1.0',
        },
      }
    )
      .then((res) => res.json())
      .then((data) => {
        const displayName = data.display_name || 'Unknown location';
        geocodeCache[key] = displayName;
        setLocation(displayName);
      })
      .catch(() => {
        setLocation('Unknown location');
      })
      .finally(() => setLoading(false));
  }, [lat, lng]);

  return { location, loading };
} 