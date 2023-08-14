<template>
  <q-layout view="lHh Lpr fff" class="bg-grey-1">
    <q-header elevated class="bg-white text-grey-8" height-hint="64">
      <q-toolbar class="GPL__toolbar" style="height: 64px">
        <q-avatar>
          <img src="src/assets/UAlg-ico.ico">
        </q-avatar>
        <q-toolbar-title v-if="$q.screen.gt.sm" shrink class="row items-center no-wrap">
          <span class="q-ml-sm">UAlg Secure Vote</span>
        </q-toolbar-title>

        <q-space/>

        <q-space/>
      </q-toolbar>
    </q-header>
    <q-page-container class="GPL__page-container">
      <div class="flex flex-center column">
        <div class="row bg-blue-grey-2" style="min-height: 400px; width: 80%; padding: 24px;">
          <div id="parent" class="fit row wrap justify-center items-start content-start" style="overflow: hidden;">
            <div class=" bg-grey-6" style="overflow: auto;">
              <q-card class="no-border-radius" style="min-height: 400px">
                <q-card-section vertical align="center">
                  <div class="q-ma-xl" style="max-width: 500px">
                    <div class="text-h2" style="color: darkred">Error</div>
                  </div>
                </q-card-section>
                <q-card-section vertical align="center">
                  <div class="q-ma-xl" style="max-width: 500px">
                    <div class="text-h4">An error has occurred, please try again later</div>
                  </div>
                </q-card-section>
              </q-card>
            </div>
          </div>
        </div>
      </div>
    </q-page-container>
  </q-layout>
</template>

<script>
export default {
  name: "Error"
}
</script>

<style scoped>

</style>