<template>
  <div class="locale-changer">
    <q-select rounded outlined dense v-model="$i18n.locale" :options="options" color="blue-12">
      <template v-slot:prepend>
        <q-icon :name="flags[$i18n.locale]"/>
      </template>
    </q-select>
  </div>
</template>

<script>
import {ref} from "vue";

export default {
  name: "Locale-Changer",
  setup() {
    return {
      options: ['en', 'pt', 'de', 'es', 'fr', 'it', 'nl'],
      flags: ref({
        en: "img:/icons/icon-en.png",
        pt: "img:/icons/icon-pt.png",
        de: "img:/icons/icon-de.png",
        es: "img:/icons/icon-es.png",
        fr: "img:/icons/icon-fr.png",
        it: "img:/icons/icon-it.png",
        nl: "img:/icons/icon-nl.png",
      })
    }
  }
}
</script>

<style scoped>

</style>