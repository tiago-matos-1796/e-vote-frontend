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
                          v-model="displayName"
                          type="text"
                          label="Display Name"
                          lazy-rules
                          :rules="[ val => !!val || 'Please insert your display name']"
                      />

                      <q-input
                          filled
                          clear-icon="close"
                          v-model="email"
                          type="email"
                          label="Email"
                          lazy-rules
                          :rules="[ val => !!val || 'Please insert your email']"
                      />

                      <q-input
                          filled
                          clear-icon="close"
                          :type="isPwd ? 'password' : 'text'"
                          v-model="password"
                          label="Password"
                          lazy-rules
                          :rules="[
              val => !!val || 'Please insert your password',
              val => val.length >= 8 || 'Password must be at least 8 characters long',
              val => val.match('^(?=(.*[a-z]){1,})(?=(.*[A-Z]){1,})(?=(.*[0-9]){1,})(?=(.*[!@#$%^&*()\\-__+.]){1,}).{8,}$') || 'Password must have upper and lower case characters, special characters and digits',
          ]"
                      >
                        <template v-slot:append>
                          <q-icon
                              name="refresh"
                              class="cursor-pointer"
                              @click="generatePassword"
                          ><q-tooltip>
                            Generate password
                          </q-tooltip></q-icon>
                          <q-icon
                              :name="isPwd ? 'visibility_off' : 'visibility'"
                              class="cursor-pointer"
                              @click="isPwd = !isPwd"
                          />
                        </template>
                      </q-input>

                      <q-input
                          filled
                          clear-icon="close"
                          :type="isPwd1 ? 'password' : 'text'"
                          v-model="passwordConfirm"
                          label="Confirm password"
                          lazy-rules
                          :rules="[
              val => !!val || 'Please reinsert your password',
              val => val.length >= 8 || 'Password must be at least 8 characters long',
              val => val.match('^(?=(.*[a-z]){1,})(?=(.*[A-Z]){1,})(?=(.*[0-9]){1,})(?=(.*[!@#$%^&*()\\-__+.]){1,}).{8,}$') || 'Password must have upper and lower case characters, special characters and digits',
              val => val === password || 'Both password must be the same'
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

                      <q-input
                          filled
                          clear-icon="close"
                          :type="isVk ? 'password' : 'text'"
                          v-model="voteKey"
                          label="Voting Key"
                          lazy-rules
                          :rules="[
              val => !!val || 'Please insert your voting key',
              val => val.length === 16 || 'Voting key must be exactly 16 characters long',
              val => val.match('^(?=(.*[a-z]){1,})(?=(.*[A-Z]){1,})(?=(.*[0-9]){1,})(?=(.*[!@#$%^&*()\\-__+.]){1,}).{8,}$') || 'Voting Key must have upper and lower case characters, special characters and digits',
          ]"
                      >
                        <template v-slot:append>
                          <q-icon
                              name="refresh"
                              class="cursor-pointer"
                              @click="generateVoteKey"
                          ><q-tooltip>
                            Generate voting key
                          </q-tooltip></q-icon>
                          <q-icon
                              :name="isVk ? 'visibility_off' : 'visibility'"
                              class="cursor-pointer"
                              @click="isVk = !isVk"
                          />
                        </template>
                      </q-input>

                      <q-input
                          filled
                          clear-icon="close"
                          :type="isVk1 ? 'password' : 'text'"
                          v-model="voteKeyConfirm"
                          label="Confirm Voting Key"
                          lazy-rules
                          :rules="[
              val => !!val || 'Please reinsert your voting key',
              val => val.length === 16 || 'Voting key must be exactly 16 characters long',
              val => val.match('^(?=(.*[a-z]){1,})(?=(.*[A-Z]){1,})(?=(.*[0-9]){1,})(?=(.*[!@#$%^&*()\\-__+.]){1,}).{8,}$') || 'Voting Key must have upper and lower case characters, special characters and digits',
              val => val === voteKey || 'Both vote keys must be the same'
          ]"
                      >
                        <template v-slot:append>
                          <q-icon
                              :name="isVk1 ? 'visibility_off' : 'visibility'"
                              class="cursor-pointer"
                              @click="isVk1 = !isVk1"
                          />
                        </template>
                      </q-input>

                      <q-file
                          name="image_file"
                          v-model="file"
                          filled
                          clearable
                          clear-icon="close"
                          label="Select image (max: 1MB)"
                          accept=".jpg, .png, .svg"
                          max-file-size="1048576"
                          counter
                          max-files="1"
                          hint="*Optional"
                          @rejected="onRejected"
                      />


                      <div>
                        <q-btn label="Register" type="submit" color="primary"/>
                        <q-btn label="Reset" type="reset" color="negative" flat class="q-ml-sm"/>
                      </div>
                    </q-form>
                    <router-link to="login">Already have an account?</router-link>
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
import api_routes from '../../config/routes.config'

export default {
  name: 'Register',
  setup() {
    const $q = useQuasar()
    const router = useRouter();
    const settings = ref(false)
    const displayName = ref(null)
    const email = ref(null)
    const password = ref(null)
    const passwordConfirm = ref(null)
    const voteKey = ref(null)
    const voteKeyConfirm = ref(null)
    const file = ref(null)

    async function register() {
      const uri = `${api_routes.MAIN_URI}/users/`
      const data = {
        email: email.value,
        display_name: displayName.value,
        password: password.value,
        sign_key: voteKey.value,
        image: file.value
      }
      return await axios.post(uri, data, {
        headers: {
          "Content-type": "multipart/form-data"
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
      displayName,
      email,
      password,
      passwordConfirm,
      isPwd: ref(true),
      isPwd1: ref(true),
      voteKey,
      voteKeyConfirm,
      isVk: ref(true),
      isVk1: ref(true),
      file,
      filesImages: ref(null),
      filesMaxSize: ref(null),
      filesMaxTotalSize: ref(null),
      filesMaxNumber: ref(null),
      settings,
      openSettings() {
        settings.value = true
      },
      onSubmit() {
        $q.loading.show({
          message: 'Registration in progress, please wait...',
          spinner: QSpinnerGears,
        })
        register().then(function (response) {
          if(response.data) {
            $q.notify({
              color: 'green-4',
              textColor: 'white',
              icon: 'check',
              message: 'An email has been sent to you to verify the registration, please check your inbox'
            })
            router.push('login')
          } else {
            $q.notify({
              color: 'red-10',
              textColor: 'white',
              icon: 'cancel',
              message: `An error has occurred while registering, please try again later`
            })
          }
        }).catch(function (error) {
          if (!error.response) {
            $q.notify({
              color: 'red-10',
              textColor: 'white',
              icon: 'cancel',
              message: `An error has occurred while registering, please try again later`
            })
          } else {
            if (error.toJSON().status === 409) {
              $q.notify({
                color: 'red-10',
                textColor: 'white',
                icon: 'cancel',
                message: `Error: Email is already registered`
              })
            } else {
              $q.notify({
                color: 'red-10',
                textColor: 'white',
                icon: 'cancel',
                message: `An error has occurred while registering, please try again later`
              })
              
            }
          }
        }).finally(() => {
          $q.loading.hide()
        })
      },

      onReset() {
        displayName.value = null
        email.value = null
        password.value = null
        passwordConfirm.value = null
        voteKey.value = null
        voteKeyConfirm.value = null
        file.value = null
      },
      onRejected(rejectedEntries) {
        $q.notify({
          color: 'red-10',
          textColor: 'white',
          icon: 'cancel',
          message: `${rejectedEntries.length} file(s) did not pass validation constraints`
        })
      },
      generatePassword() {
        let strongPassword = new RegExp(
            "(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[^A-Za-z0-9])(?=.{8,})"
        );
        const characters = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!#$%^&()_+-=[]{}|?~"
        let key = ""
        for(let i = 0; i < 12; i++) {
          const rand = Math.floor(Math.random() * characters.length)
          key += characters[rand]
        }
        if(strongPassword.test(key)) {
          password.value = key
        }
      },
      generateVoteKey() {
        let strongPassword = new RegExp(
            "(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[^A-Za-z0-9])(?=.{8,})"
        );
        const characters = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!#$%^&()_+-=[]{}|?~"
        let key = ""
        for(let i = 0; i < 16; i++) {
          const rand = Math.floor(Math.random() * characters.length)
          key += characters[rand]
        }
        if(strongPassword.test(key)) {
          voteKey.value = key
        }
      }
    }
  },
  methods: {
    logout() {
      SessionStorage.set('permission', '');
      SessionStorage.set('id', '');
      SessionStorage.set('avatar', '');
      SessionStorage.set('username', '');
      Cookies.remove('token');
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