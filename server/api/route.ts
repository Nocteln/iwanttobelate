import * as turf from "@turf/turf";

export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  const { start, end, mode } = body;

  const point1 = turf.point(start);
  const point2 = turf.point(end);

  const distance = turf.distance(point1, point2, { units: "kilometers" });
  const mid = turf.midpoint(point1, point2);

  // Réduire le détour pour rester sur les routes
  const detour = distance * 0.2; // Réduit de 0.7 à 0.2
  const bearing = turf.bearing(point1, point2);
  const detourBearing = bearing + 90;

  const detourPoint = turf.destination(mid, detour, detourBearing, {
    units: "kilometers",
  });
  const detourCoords = detourPoint.geometry.coordinates;

  const config = useRuntimeConfig();
  const apiKey = config.graphhopperApiKey;
  const url = new URL("https://graphhopper.com/api/1/route");
  url.searchParams.append("key", apiKey);
  url.searchParams.append("vehicle", mode || "car");
  url.searchParams.append("points_encoded", "false");

  url.searchParams.append("point", `${start[1]},${start[0]}`);
  url.searchParams.append("point", `${detourCoords[1]},${detourCoords[0]}`);
  url.searchParams.append("point", `${end[1]},${end[0]}`);
  try {
    console.log("GraphHopper URL:", url.toString());
    console.log("Detour coords:", detourCoords);
    const response = await fetch(url);
    const data = await response.json();

    console.log("GraphHopper response:", data);

    if (!response.ok || data.message) {
      console.error("GraphHopper error:", data);

      // Si le détour échoue, essayer sans détour (route directe)
      console.log("Trying direct route without detour...");
      const directUrl = new URL("https://graphhopper.com/api/1/route");
      directUrl.searchParams.append("key", apiKey);
      directUrl.searchParams.append("vehicle", mode || "car");
      directUrl.searchParams.append("points_encoded", "false");
      directUrl.searchParams.append("point", `${start[1]},${start[0]}`);
      directUrl.searchParams.append("point", `${end[1]},${end[0]}`);

      const directResponse = await fetch(directUrl);
      const directData = await directResponse.json();

      if (!directResponse.ok || directData.message) {
        return {
          error: "Error fetching route from GraphHopper API",
          details: directData.message || directData,
          status: directResponse.status,
        };
      }

      return {
        type: "Feature",
        geometry: directData.paths[0].points,
      };
    }

    if (!data.paths || !data.paths[0]) {
      return {
        error: "No route found",
        details: data,
      };
    }

    return {
      type: "Feature",
      geometry: data.paths[0].points,
    };
  } catch (error) {
    console.error("Catch error:", error);
    return {
      error: "Error fetching route from GraphHopper API",
      details: error.message,
    };
  }
});
