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
                        class="q-gutter-md"
                        @submit="submit"
                        @reset="reset"
                    >

                      <q-input
                          filled
                          clearable
                          clear-icon="close"
                          v-model="email"
                          type="email"
                          label="Email"
                          lazy-rules
                          :rules="[ val => !!val || 'Please insert your email']"
                      />

                      <div>
                        <q-btn label="Send email" type="submit" color="primary"/>
                        <q-btn label="Reset" color="negative" type="reset" flat class="q-ml-sm"/>
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
import {onMounted, ref} from "vue";
import {useQuasar} from "quasar"
import {useRouter} from 'vue-router'
import axios from "axios";
import api_routes from '../../config/routes.config'

export default {
  name: "ForgotPassword",
  setup() {
    const $q = useQuasar()
    const email = ref(null)
    const router = useRouter()

    async function forgotPassword(email) {
      const uri = `${api_routes.MAIN_URI}/users/forgot-password`
      const data = {email: email}
      return await axios.post(uri, data, {
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
    })

    return {
      email,
      submit() {
        forgotPassword(email.value).then(function (response) {
          if(response.code === "ERR_BAD_REQUEST") {
            $q.notify({
              color: 'red-10',
              textColor: 'white',
              icon: 'cancel',
              message: 'The inserted email does not exist'
            })
          } else {
            $q.notify({
              color: 'green-4',
              textColor: 'white',
              icon: 'check',
              message: 'An email has been sent with details about password recovery'
            });
            router.push('login')
          }
        }).catch(function (error) {
          $q.notify({
            color: 'red-10',
            textColor: 'white',
            icon: 'cancel',
            message: 'An error has occurred, Please try again later'
          })
        })
      },
      reset() {
        email.value = ''
      }
    }
  }
}
</script>

<style scoped>

</style>