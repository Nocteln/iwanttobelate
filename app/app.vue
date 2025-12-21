<template>
  <div class="relative">
    <mgl-map :map-style="style" :center="center" :zoom="zoom" height="100vh">
      <mgl-navigation-control position="top-right" />
      <mgl-marker v-if="markerCoordinates" :coordinates="markerCoordinates">
      </mgl-marker>
    </mgl-map>

    <div class="absolute top-4 left-4 z-10 flex flex-col gap-2 w-80">
      <div v-if="arrivalCoords" class="bg-white p-3 rounded-lg shadow-lg">
        <DepartureInput
          @select="onDepartureSelected"
          @getPos="() => onGetPosition('departure')"
        />
      </div>
      <div class="bg-white p-3 rounded-lg shadow-lg">
        <ArrivalInput
          @select="onArrivalSelected"
          @getPos="() => onGetPosition('arrival')"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
const config = useRuntimeConfig();

const style = `https://api.maptiler.com/maps/streets/style.json?key=${config.public.MapTilerApiKey}`;
let center = ref([0, 0]);
let markerCoordinates = ref(null);
let zoom = ref(0);
let arrivalCoords = ref(null);
let departureCoords = ref(null);

const routeGeoJSON = ref(null);

async function onGetPosition(type) {
  try {
    const position = await getGeolocation();
    const coords = [position.longitude, position.latitude];

    if (type === "arrival") {
      onArrivalSelected(coords);
    } else if (type === "departure") {
      onDepartureSelected(coords);
    }
  } catch (error) {
    console.error("Error getting geolocation:", error);
    alert("Unable to retrieve your location.");
  }
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

const onDepartureSelected = async (coords) => {
  console.log("Départ sélectionné :", coords);
  center.value = coords;
  zoom.value = 14;
  markerCoordinates.value = coords;
  departureCoords.value = coords;

  console.log(
    "Calcul de l'itinéraire de",
    departureCoords.value,
    "à",
    arrivalCoords.value
  );

  const { data } = await fetch("/api/route", {
    method: "POST",
    body: {
      from: departureCoords.value,
      to: arrivalCoords.value,
      mode: "car",
    },
  });

  if (data?.value) {
    routeGeoJSON.value = data.value;
    console.log("Itinéraire reçu :", routeGeoJSON.value);
  } else {
    console.error("Erreur lors de la récupération de l'itinéraire");
  }
};

const onArrivalSelected = (coords) => {
  console.log("Arrivée sélectionnée :", coords);
  arrivalCoords.value = coords;
  center.value = coords;
  zoom.value = 14;
  markerCoordinates.value = coords;
};
</script>

<style lang="css">
@import "maplibre-gl/dist/maplibre-gl.css";
</style>
