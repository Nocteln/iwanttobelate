import * as turf from "@turf/turf";

export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  const { start, end, mode } = body;

  const point1 = turf.point(start);
  const point2 = turf.point(end);

  const distance = turf.distance(point1, point2, { units: "kilometers" });
  const mid = turf.midpoint(point1, point2);

  const detour = distance * 0.7;
  const bearing = turf.bearing(point1, point2);
  const detourBearing = bearing + 90;

  const detourPoint = turf.destination(mid, detour, detourBearing, {
    units: "kilometers",
  });
  const detourCoords = detourPoint.geometry.coordinates;

  const apiKey = process.env.GRAPHHOPPER_API_KEY;
  const url = `https://graphhopper.com/api/1/route?point=${start[1]},${start[0]}&point=${detourCoords[1]},${detourCoords[0]}&point=${end[1]},${end[0]}&vehicle=${mode}&locale=en&key=${apiKey}&points_encoded=false`;

  try {
    const response = await fetch(url);
    const data = await response.json();
    return {
      type: "Feature",
      geometry: data.paths[0].points,
    };
  } catch (error) {
    return { error: "Error fetching route from GraphHopper API" };
  }
});
