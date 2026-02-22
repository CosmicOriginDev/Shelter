export function getNearestN(shelters, userLat, userLng, N) {
    const R = 6371; // km
    const toRad = (deg) => (deg * Math.PI) / 180;
  
    function haversine(lat1, lng1, lat2, lng2) {
      const dLat = toRad(lat2 - lat1);
      const dLng = toRad(lng2 - lng1);
  
      const a =
        Math.sin(dLat / 2) ** 2 +
        Math.cos(toRad(lat1)) *
          Math.cos(toRad(lat2)) *
          Math.sin(dLng / 2) ** 2;
  
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
      return R * c;
    }
  
    return (shelters ?? [])
      .map((s) => {
        const lat = Number(s.latitude);
        const lng = Number(s.longitude);
        const distKm =
          Number.isFinite(lat) && Number.isFinite(lng)
            ? haversine(userLat, userLng, lat, lng)
            : Number.POSITIVE_INFINITY;
        return { shelter: s, distKm };
      })
      .sort((a, b) => a.distKm - b.distKm)
      .slice(0, Math.max(0, N | 0))
      .map((x) => x.shelter);
  }