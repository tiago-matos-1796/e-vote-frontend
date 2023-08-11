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
              <q-card class="no-border-radius">
                <q-card-section>
                  <div class="q-pa-md" style="max-width: 400px">

                    <q-form
                        @submit="onSubmit"
                        @reset="onReset"
                        class="q-gutter-md"
                    >
                      <q-input
                          filled
                          clear-icon="close"
                          v-model="email"
                          type="email"
                          label="Email"
                          lazy-rules
                          hint="Please insert your email"
                          :rules="[ val => !!val || 'Please insert your email']"
                      />

                      <q-input
                          filled
                          clear-icon="close"
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

                      <div>
                        <q-btn label="Login" type="submit" color="primary"/>
                        <q-btn label="Reset" type="reset" color="negative" flat class="q-ml-sm"/>
                      </div>
                    </q-form>
                    <p>
                      <router-link to="register">Don't have an account?</router-link>
                    </p>
                    <p>
                      <router-link to="forgot-password">Forgot your password?</router-link>
                    </p>
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
import {Cookies, QSpinnerGears, SessionStorage, useQuasar} from 'quasar'
import {onMounted, ref} from 'vue'
import {useRouter} from 'vue-router'
import axios from "axios";


export default {
  name: 'Login',

  setup() {
    const $q = useQuasar()
    const router = useRouter();
    const settings = ref(false)
    const email = ref(null)
    const password = ref(null)

    async function login() {
      const uri = 'http://localhost:8080/users/login'
      const data = {
        email: email.value,
        password: password.value
      }
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
      password,
      isPwd: ref(true),
      settings,
      openSettings() {
        settings.value = true
      },
      onSubmit() {
        $q.loading.show({
          message: 'Authentication in progress, please wait...',
          spinner: QSpinnerGears,
        })
        login().then(function (response) {
          if(response.response) {
            if(response.response.status === 406) {
              $q.notify({
                color: 'red-10',
                textColor: 'white',
                icon: 'cancel',
                message: `Your account is not yet active, please check your inbox for the activation email`
              })
            }
            if(response.response.status === 403) {
              $q.notify({
                color: 'red-10',
                textColor: 'white',
                icon: 'cancel',
                message: `Your account is temporarily unavailable, please try again later`
              })
            }
            if(response.response.status === 400) {
              $q.notify({
                color: 'red-10',
                textColor: 'white',
                icon: 'cancel',
                message: `Email and/or password wrong`
              })
            }
          } else {
            $q.sessionStorage.set('permission', response.data.permissions);
           $q.sessionStorage.set('id', response.data.id);
           $q.sessionStorage.set('avatar', response.data.image);
           $q.sessionStorage.set('username', response.data.username);
           /*$q.cookies.set('token', response.data.token, { // production
             httpOnly: true,
             secure: true
           });*/
            $q.cookies.set('token', response.data.token);
            $q.notify({
              color: 'green-4',
              textColor: 'white',
              icon: 'check',
              message: 'Authenticated with success'
            });
            router.push({name: 'Elections'});
          }
        }).catch(function (error) {
          if (!error.response) {
            $q.notify({
              color: 'red-10',
              textColor: 'white',
              icon: 'cancel',
              message: `An error has occurred while logging in, please try again later`
            })
          } else {
            $q.notify({
              color: 'red-10',
              textColor: 'white',
              icon: 'cancel',
              message: `Email and/or password is wrong`
            })
          }
        }).finally(() => {
          $q.loading.hide()
        })
      },
      onReset() {
        email.value = null
        password.value = null
      }
    }
  },
  methods: {
    logout() {
      const store = useAuthStore();
      SessionStorage.set('permission', '');
      SessionStorage.set('id', '');
      SessionStorage.set('avatar', '');
      SessionStorage.set('username', '');
      Cookies.remove('token');
      store.logOut();
      this.$router.push('login');
    }
  }
}
</script>

<style lang="sass">
.GPL

  &__toolbar
    height: 64px

  &__toolbar-input
    width: 35%

  &__drawer-item
    line-height: 24px
    border-radius: 0 24px 24px 0
    margin-right: 12px

    .q-item__section--avatar
      padding-left: 12px

      .q-icon
        color: #5f6368

    .q-item__label:not(.q-item__label--caption)
      color: #3c4043
      letter-spacing: .01785714em
      font-size: .875rem
      font-weight: 500
      line-height: 1.25rem

    &--storage
      border-radius: 0
      margin-right: 0
      padding-top: 24px
      padding-bottom: 24px

  &__side-btn
    &__label
      font-size: 12px
      line-height: 24px
      letter-spacing: .01785714em
      font-weight: 500

  @media (min-width: 1024px)
    &__page-container
      padding-left: 94px
</style>