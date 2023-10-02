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
              <q-card class="no-border-radius">
                <q-card-section>
                  <div class="q-pa-md" style="max-width: 400px">

                    <q-form
                        @submit="onSubmit"
                        @reset="onReset"
                        class="q-gutter-md"
                        enctype="multipart/form-data"
                    >
                      <q-input
                          filled
                          clear-icon="close"
                          v-model="token"
                          type="text"
                          label="Token"
                          lazy-rules
                          :rules="[ val => !!val || 'Please insert your token']"
                      />

                      <div>
                        <q-btn label="Register" type="submit" color="primary"/>
                        <q-btn label="Reset" type="reset" color="negative" flat class="q-ml-sm"/>
                      </div>
                    </q-form>
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
import {QSpinnerGears, useQuasar} from "quasar";
import api_routes from '../../config/routes.config'

export default {
  name: "AccountVerification",
  setup() {
    const $q = useQuasar()
    const route = useRoute()
    const router = useRouter()
    const text = ref('')
    const token = ref('')

    async function verify(data) {
      const uri = `${api_routes.MAIN_URI}/users/verify/`
      return await axios.patch(uri, data, {
        headers: {
          "Content-type": "application/json"
        }
      }).then(function (response) {
        return response
      }).catch(function (error) {
        return error
      })
    }

    onMounted(() => {
      if($q.sessionStorage.has('id')) {
        if($q.sessionStorage.getItem('id').length > 0) {
          router.push('elections')
        }
      }
      if(route.query.token) {
        console.log(route.query)
        verify(route.query.token)
      } else {
        text.value = 'Could not verify your account, make sure to use correct link sent to you via email'
      }

    })

    return {
      text,
      token,
      goToLogin() {
        router.push({name: 'Login'})
      },
      onSubmit() {
        if(token.value) {
          const data = {token: token.value}
          $q.loading.show({
            message: 'Verification in progress, please wait...',
            spinner: QSpinnerGears,
          })
          verify(data).then(function (response) {
            if(response.response) {
              $q.notify({
                color: 'red-10',
                textColor: 'white',
                icon: 'cancel',
                message: `Token does not exist`
              })
            } else {
              $q.notify({
                color: 'green-4',
                textColor: 'white',
                icon: 'check',
                message: 'Registered with success'
              })
              router.push({name: 'Login'})
            }
          }).catch(function (error) {
            $q.notify({
              color: 'red-10',
              textColor: 'white',
              icon: 'cancel',
              message: `An error has occurred while registering, please try again later`
            })
          }).finally(() => {
            $q.loading.hide()
          })
        } else {
          $q.notify({
            color: 'red-10',
            textColor: 'white',
            icon: 'cancel',
            message: `Token is missing, please insert the token sent to you via email`
          })
        }
      },

      onReset() {
        token.value = null
      },
    }
  }
}
</script>

<style scoped>

</style>