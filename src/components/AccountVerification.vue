<template>
  <q-layout view="lHh Lpr fff" class="bg-grey-1">
    <q-header elevated class="bg-white text-grey-8" height-hint="64">
      <q-toolbar class="GPL__toolbar" style="height: 64px">

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
                    <div class="text-h4">{{text}}</div>
                  </div>
                </q-card-section>
                <q-card-section vertical align="center">
                  <div class="q-ma-xl" style="max-width: 500px">
                    <router-link to @click="goToLogin">
                      <div class="text-h5">Return to login</div>
                    </router-link>
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
import {useRoute, useRouter} from 'vue-router'
import {onMounted, ref} from "vue";
import axios from "axios";
import {useQuasar} from "quasar";

export default {
  name: "AccountVerification",
  setup() {
    const $q = useQuasar()
    const route = useRoute()
    const router = useRouter()
    const text = ref('')

    async function verify(token) {
      const uri = `http://localhost:8080/users/verify/${token}`
      return await axios.patch(uri, {}, {
        headers: {
          "Content-type": "application/json"
        }
      }).then(function (response) {
        text.value = 'Your account has successfully been activated'
      }).catch(function (error) {
        text.value = 'Could not verify your account, make sure to use correct link sent to you via email'
      })
    }

    onMounted(() => {
      if($q.sessionStorage.has('id')) {
        if($q.sessionStorage.getItem('id').length > 0) {
          router.push('elections')
        }
      }
      verify(route.params.token)
    })

    return {
      text,
      goToLogin() {
        router.push({name: 'Login'})
      }
    }
  }
}
</script>

<style scoped>

</style>