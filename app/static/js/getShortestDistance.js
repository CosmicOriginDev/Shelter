export function getShortestDistance(items, userLat, userLng, N) {
    const R = 6371; // Earth radius in km

    function toRad(deg) {
        return deg * Math.PI / 180;
    }

    function haversine(lat1, lng1, lat2, lng2) {
        const dLat = toRad(lat2 - lat1);
        const dLng = toRad(lng2 - lng1);

        const a =
            Math.sin(dLat / 2) ** 2 +
            Math.cos(toRad(lat1)) *
            Math.cos(toRad(lat2)) *
            Math.sin(dLng / 2) ** 2;

        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

        return R * c; // distance in km
    }

    return items
        .map(([id, lat, lng]) => ({
            id,
            distance: haversine(userLat, userLng, lat, lng)
        }))
        .sort((a, b) => a.distance - b.distance)
        .slice(0, N)
        .map(item => item.id);
}