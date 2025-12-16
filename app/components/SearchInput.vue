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
  results.value = []; // On vide la liste

  // IMPORTANT : L'API renvoie [Longitude, Latitude]
  // C'est exactement l'ordre qu'attend MapLibre !
  emit("select", feature.geometry.coordinates);
};

</script>

<template>
  <div class="search-container">
    <input
      v-model="query"
      type="text"
      placeholder="Entrez une adresse..."
      class="search-input"
    />

    <ul v-if="results?.length > 0" class="results-list">
      <li
        v-for="feature in results"
        :key="feature.properties.id"
        @click="selectAddress(feature)"
      >
        {{ feature.properties.label }}
      </li>
    </ul>
  </div>
</template>

<style scoped>
/* Un peu de style rapide */
.search-container {
  position: absolute;
  top: 20px;
  left: 20px;
  z-index: 1000; /* Pour passer au dessus de la carte */
  width: 300px;
}
.search-input {
  width: 100%;
  padding: 10px;
  border-radius: 4px;
  border: 1px solid #ccc;
}
.results-list {
  background: white;
  list-style: none;
  padding: 0;
  margin: 0;
  border: 1px solid #ccc;
  border-top: none;
}
.results-list li {
  padding: 10px;
  cursor: pointer;
  border-bottom: 1px solid #eee;
}
.results-list li:hover {
  background-color: #f0f0f0;
}
</style>
