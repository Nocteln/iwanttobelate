<template>
  <div class="relative">
    <mgl-map :map-style="style" :center="center" :zoom="zoom" height="100vh">
      <mgl-navigation-control position="top-right" />
      <mgl-marker :coordinates="markerCoordinates"> </mgl-marker>
    </mgl-map>
    <div class="absolute top-4 left-4 z-10 bg-white p-2 rounded shadow">
      <!-- <input type="text" placeholder="Search location..." /> -->

      <SearchInput @select="onAddressSelected" />
    </div>
  </div>
</template>

<script setup>
import {
  MglMap,
  MglMarker,
  MglNavigationControl,
} from "@indoorequal/vue-maplibre-gl";
const config = useRuntimeConfig();

const style = `https://api.maptiler.com/maps/streets/style.json?key=${config.public.MapTilerApiKey}`;
let center = ref([0, 0]);
let markerCoordinates = ref(center);
let zoom = ref(14);

try {
  const position = await getGeolocation();
  center.value[0] = position.longitude;
  center.value[1] = position.latitude;
} catch (error) {
  console.error("Error getting geolocation:", error);
}

function getGeolocation() {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error("Geolocation is not supported by your browser"));
    } else {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          resolve({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          });
        },
        (error) => {
          reject(error);
        }
      );
    }
  });
}

const onAddressSelected = (coords) => {
  console.log("Coordonnées reçues :", coords);

  center.value = coords;

  zoom.value = 14;
  markerCoordinates.value = coords;
};
</script>

<style lang="css">
@import "maplibre-gl/dist/maplibre-gl.css";
</style>
