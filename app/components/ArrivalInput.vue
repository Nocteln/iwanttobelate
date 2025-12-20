<script setup>
import { ref, watch } from "vue";

const emit = defineEmits(["select", "getPos"]);

const query = ref("");
const results = ref([]);
const isLoading = ref(false);
const isSelecting = ref(false);

const searchAddress = async () => {
  if (query.value.length < 4) {
    results.value = [];
    return;
  }
  if (isSelecting.value) return;

  isLoading.value = true;
  try {
    const response = await fetch(
      `https://data.geopf.fr/geocodage/search/?q=${encodeURIComponent(
        query.value
      )}&limit=5`
    );
    const data = await response.json();
    results.value = data.features;
  } catch (e) {
    console.error("Erreur API Adresse", e);
  } finally {
    isLoading.value = false;
  }
};

watch(query, () => {
  if (!isSelecting.value) {
    searchAddress();
  }
  isSelecting.value = false;
});

const selectAddress = (feature) => {
  isSelecting.value = true;
  query.value = feature.properties.label;
  results.value = [];
  emit("select", feature.geometry.coordinates);
};

function requestGeolocation() {
  isSelecting.value = true;
  query.value = "📍 Position actuelle";
  results.value = [];
  emit("getPos");
}
</script>

<template>
  <div class="relative w-full">
    <div class="relative">
      <input
        v-model="query"
        type="text"
        placeholder="🎯 Adresse d'arrivée"
        class="w-full p-2.5 pr-10 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
      />
      <button
        class="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-blue-600 p-1 transition-colors"
        title="Utiliser ma position"
        @click="requestGeolocation"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          stroke-width="1.5"
          stroke="currentColor"
          class="w-5 h-5"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"
          />
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z"
          />
        </svg>
      </button>
    </div>

    <ul
      v-if="results?.length > 0"
      class="absolute top-full mt-1 w-full bg-white list-none p-0 m-0 border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto z-50"
    >
      <li
        v-for="feature in results"
        :key="feature.properties.id"
        @click="selectAddress(feature)"
        class="p-2.5 cursor-pointer border-b border-gray-100 last:border-b-0 hover:bg-blue-50 text-sm transition-colors"
      >
        {{ feature.properties.label }}
      </li>
    </ul>
  </div>
</template>
