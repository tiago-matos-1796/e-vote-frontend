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
                          :type="isPwd ? 'password' : 'text'"
                          v-model="password"
                          label="Password"
                          hint="Please insert your password"
                          lazy-rules
                          :rules="[
              val => !!val || 'Please insert your password',
              val => val.length >= 8 || 'Password must be at least 8 characters long',
              val => val.match('^(?=(.*[a-z]){1,})(?=(.*[A-Z]){1,})(?=(.*[0-9]){1,})(?=(.*[!@#$%^&*()\\-__+.]){1,}).{8,}$') || 'Password must have upper and lower case characters, special characters and digits',
          ]"
                      >
                        <template v-slot:append>
                          <q-icon
                              :name="isPwd ? 'visibility_off' : 'visibility'"
                              class="cursor-pointer"
                              @click="isPwd = !isPwd"
                          />
                        </template>
                      </q-input>
                      <q-input
                          filled
                          :type="isPwd1 ? 'password' : 'text'"
                          v-model="passwordConfirm"
                          label="Confirm password"
                          hint="Please insert your password"
                          lazy-rules
                          :rules="[
              val => !!val || 'Please confirm your password',
              val => val.length >= 8 || 'Password must be at least 8 characters long',
              val => val.match('^(?=(.*[a-z]){1,})(?=(.*[A-Z]){1,})(?=(.*[0-9]){1,})(?=(.*[!@#$%^&*()\\-__+.]){1,}).{8,}$') || 'Password must have upper and lower case characters, special characters and digits',
              val => val === password || 'Both passwords must be the same'
          ]"
                      >
                        <template v-slot:append>
                          <q-icon
                              :name="isPwd1 ? 'visibility_off' : 'visibility'"
                              class="cursor-pointer"
                              @click="isPwd1 = !isPwd1"
                          />
                        </template>
                      </q-input>

                      <div>
                        <q-btn label="Submit new password" type="submit" color="primary"/>
                        <q-btn label="Reset" color="negative" type="reset" flat class="q-ml-sm" />
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
import {useQuasar} from "quasar";
import {useRoute, useRouter} from 'vue-router'
import axios from "axios";

export default {
  name: "ForgotPassword",
  setup() {
    const $q = useQuasar()
    const password = ref(null)
    const passwordConfirm = ref(null)
    const router = useRouter()
    const route = useRoute()

    async function recoverPassword(password, token) {
      const uri = `http://localhost:8080/users/password-recovery/${token}`
      const data = {password: password}
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
    })

    return {
      password,
      passwordConfirm,
      isPwd: ref(true),
      isPwd1: ref(true),
      submit() {
        if(route.query.token) {
          recoverPassword(password.value, route.query.token).then(function (response) {
            if(response.code === "ERR_BAD_REQUEST") {
              $q.notify({
                color: 'red-10',
                textColor: 'white',
                icon: 'cancel',
                message: 'Token could not be verified'
              })
            } else {
              $q.notify({
                color: 'green-4',
                textColor: 'white',
                icon: 'check',
                message: 'Password changed with success'
              });
              router.push({name: 'Login'})
            }
          }).catch(function (error) {
            $q.notify({
              color: 'red-10',
              textColor: 'white',
              icon: 'cancel',
              message: 'An error has occurred, Please try again later'
            })
          })
        } else {
          $q.notify({
            color: 'red-10',
            textColor: 'white',
            icon: 'cancel',
            message: 'Token is missing, please check if the uri is the same as the one sent to you via email'
          })
        }
      },
      reset() {
          password.value = ''
          passwordConfirm.value = ''
      }
    }
  },
  methods: {
  }
}
</script>

<style scoped>

</style>