<template>
  <q-layout view="lHh Lpr fff" class="bg-grey-1">
    <q-header elevated class="bg-white text-grey-8" height-hint="64">
      <q-toolbar class="GPL__toolbar" style="height: 64px">
        <q-avatar>
          <img src="src/assets/ballot.ico">
        </q-avatar>
        <q-toolbar-title v-if="$q.screen.gt.sm" shrink class="row items-center no-wrap">
          <span class="q-ml-sm">Secure Vote</span>
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
                          label="Display Name"
                          lazy-rules
                          :rules="[ val => !!val || 'Please insert your token']"
                      />
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
                          :type="isPwd ? 'password' : 'text'"
                          v-model="password"
                          label="Password"
                          lazy-rules
                          :rules="[
              val => !!val || 'Please insert your password',
              val => val.length >= 8 || 'Password must be at least 8 characters long',
              val => val.match('^(?=(.*[a-z]){1,})(?=(.*[A-Z]){1,})(?=(.*[0-9]){1,})(?=(.*[!@#$%^&*()\\-__+.]){1,}).{8,}$') || 'Password must have upper and lower case characters, special characters and digits',
              val => val !== voteKey || 'Password must be different from vote key'
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
              val => val.length >= 12 || 'Voting key must be at least 12 characters long',
              val => val.match('^(?=(.*[a-z]){1,})(?=(.*[A-Z]){1,})(?=(.*[0-9]){1,})(?=(.*[!@#$%^&*()\\-__+.]){1,}).{8,}$') || 'Voting Key must have upper and lower case characters, special characters and digits',
              val => val !== password || 'Vote key must be different from password'
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
              val => val.length >= 12 || 'Voting key must be at least 16 characters long',
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
import {Cookies, QSpinnerGears, SessionStorage, useQuasar} from "quasar";
import {useRoute, useRouter} from "vue-router";
import {onMounted, ref} from "vue";
import axios from "axios";
import api_routes from '../../config/routes.config'
import generator from "generate-password";

export default {
  name: "PartialRegister",
  setup(){
    const $q = useQuasar()
    const router = useRouter();
    const route = useRoute();
    const displayName = ref(null)
    const password = ref(null)
    const passwordConfirm = ref(null)
    const voteKey = ref(null)
    const voteKeyConfirm = ref(null)
    const file = ref(null)
    const token = ref('')

    async function register() {
      const uri = `${api_routes.MAIN_URI}/users/register`
      const data = {
        display_name: displayName.value,
        password: password.value,
        sign_key: voteKey.value,
        image: file.value,
        token: token.value
      }
      return await axios.patch(uri, data, {
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
      token,
      onSubmit() {
        if(token.value) {
          $q.loading.show({
            message: 'Registration in progress, please wait...',
            spinner: QSpinnerGears,
          })
          register().then(function (response) {
            if(response.response) {
              if(response.response.status === 500) {
                $q.notify({
                  color: 'red-10',
                  textColor: 'white',
                  icon: 'cancel',
                  message: `An error has occurred while registering, please try again later`
                })
              }
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
            message: `Token is missing, please check if the uri is the same as the one sent to you via email`
          })
        }
      },

      onReset() {
        displayName.value = null
        password.value = null
        passwordConfirm.value = null
        voteKey.value = null
        voteKeyConfirm.value = null
        file.value = null
        token.value = null
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
        password.value = generator.generate({
          length: 8,
          numbers: true,
          symbols: true,
          exclude: '<>,;.:`´^~/|"',
          strict: true
        })
      },
      generateVoteKey() {
        voteKey.value = generator.generate({
          length: 12,
          numbers: true,
          symbols: true,
          exclude: '<>,;.:`´^~/|"',
          strict: true
        })
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

<style scoped>

</style>