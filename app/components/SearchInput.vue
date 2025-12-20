<script setup ">
import { ref, watch } from "vue";

// On permet au parent de récupérer les coordonnées quand l'utilisateur clique
const emit = defineEmits(["select"]);

const query = ref("");
const results = ref([]);
const isLoading = ref(false);

// Fonction pour appeler l'API
const searchAddress = async () => {
  if (query.value.length < 4) return; // On attend 3 lettres pour chercher

  isLoading.value = true;
  try {
    // encodeURIComponent permet de gérer les espaces et accents
    const response = await fetch(
      `https://data.geopf.fr/geocodage/search/?q=${encodeURIComponent(
        query.value
      )}&limit=5`
    );
    const data = await response.json();
    // L'API renvoie du GeoJSON, les résultats sont dans "features"
    results.value = data.features;
  } catch (e) {
    console.error("Erreur API Adresse", e);
  } finally {
    isLoading.value = false;
  }
};

// On lance la recherche quand l'utilisateur tape (avec un petit délai "debounce" c'est mieux, mais faisons simple ici)
watch(query, () => {
  searchAddress();
});

// Quand on clique sur une proposition
const selectAddress = (feature) => {
  query.value = feature.properties.label; // On met le nom complet dans l'input
  results.value = []; 
  
  emit("select", feature.geometry.coordinates);
};

</script>

<template>
  <div class="absolute top-5 left-5 z-[1000] w-[300px]">
    <div class="relative">
      <input
        v-model="query"
        type="text"
        placeholder="Entrez une adresse..."
        class="w-full p-2.5 pr-10 rounded border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
      <button 
        class="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 p-1"
        title="Utiliser ma position"
      >
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-5 h-5">
          <path stroke-linecap="round" stroke-linejoin="round" d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
          <path stroke-linecap="round" stroke-linejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z" />
        </svg>
      </button>
    </div>

    <ul v-if="results?.length > 0" class="bg-white list-none p-0 m-0 border border-gray-300 border-t-0 rounded-b shadow-lg">
      <li
        v-for="feature in results"
        :key="feature.properties.id"
        @click="selectAddress(feature)"
        class="p-2.5 cursor-pointer border-b border-gray-100 last:border-b-0 hover:bg-gray-100"
      >
        {{ feature.properties.label }}
      </li>
    </ul>
  </div>
</template>


