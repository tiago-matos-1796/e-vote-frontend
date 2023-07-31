<template xmlns="http://www.w3.org/1999/html">
  <q-layout view="lHh Lpr fff" class="bg-grey-1">
    <q-header elevated class="bg-white text-grey-8" height-hint="64">
      <q-toolbar class="GPL__toolbar" style="height: 64px">

        <q-toolbar-title v-if="$q.screen.gt.sm" shrink class="row items-center no-wrap">
          <span class="q-ml-sm">UAlg Secure Vote</span>
        </q-toolbar-title>

        <q-space/>

        <q-space/>

        <div class="q-gutter-sm row items-center no-wrap">
          <q-btn v-if="$q.sessionStorage.getItem('permission')" round dense flat color="grey-8" icon="notifications">
            <q-badge color="red" text-color="white" floating>
              2
            </q-badge>
            <q-tooltip>Notifications</q-tooltip>
          </q-btn>
          <q-btn v-if="$q.sessionStorage.getItem('permission')" round flat @click="openSettings">
            <q-avatar size="26px">
              <img :src="avatar">
            </q-avatar>
            <q-tooltip>Account</q-tooltip>
          </q-btn>
        </div>
      </q-toolbar>
    </q-header>

    <q-page-container class="GPL__page-container">
      <div class="flex flex-center column">
        <div class="row bg-blue-grey-2" style="min-height: 400px; width: 80%; padding: 24px;">
          <div id="parent" class="fit wrap justify-center items-start content-start" style="overflow: hidden;">
            <div class=" bg-grey-6" style="overflow: auto;">
              <q-card class="no-border-radius">
                <q-card-section>
                  <q-list bordered class="rounded-borders">
                    <q-expansion-item
                        expand-separator
                        icon="perm_identity"
                        label="Account settings"
                        :caption="oldDisplayName"
                    >
                      <q-card>
                        <q-card-section>
                          <q-card>
                            <q-card-section>
                              <div class="q-pa-md row justify-center">
                                <q-avatar size="100px" font-size="52px" color="teal" text-color="white">
                                  <img :src="avatar"/>
                                </q-avatar>
                              </div>
                              <div class="q-pa-md">

                                <q-form
                                    class="q-gutter-md"
                                >
                                  <q-input
                                      filled
                                      clearable
                                      clear-icon="close"
                                      v-model="displayName"
                                      type="text"
                                      label="Display Name"
                                      lazy-rules
                                      hint="New display name"
                                      :rules="[ val => !!val || 'Please insert your new display name']"
                                  />

                                  <q-input
                                      filled
                                      clearable
                                      clear-icon="close"
                                      :type="isPwd ? 'password' : 'text'"
                                      v-model="password"
                                      label="New password"
                                      hint="New password"
                                      lazy-rules
                                      :rules="[
              val => !!val || 'Please insert your new password',
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
                                      clearable
                                      clear-icon="close"
                                      :type="isPwdC ? 'password' : 'text'"
                                      v-model="passwordConfirm"
                                      label="Reinsert new password"
                                      hint="Reinsert new password"
                                      lazy-rules
                                      :rules="[
              val => !!val || 'Please reinsert your new password',
              val => val.length >= 8 || 'Password must be at least 8 characters long',
              val => val.match('^(?=(.*[a-z]){1,})(?=(.*[A-Z]){1,})(?=(.*[0-9]){1,})(?=(.*[!@#$%^&*()\\-__+.]){1,}).{8,}$') || 'Password must have upper and lower case characters, special characters and digits',
              val => val === password || 'Both fields must be the same'
          ]"
                                  >
                                    <template v-slot:append>
                                      <q-icon
                                          :name="isPwdC ? 'visibility_off' : 'visibility'"
                                          class="cursor-pointer"
                                          @click="isPwdC = !isPwdC"
                                      />
                                    </template>
                                  </q-input>
                                  <q-toggle v-model="editImage" label="Change avatar?">
                                    <q-tooltip>
                                      Toggle to change or remove current avatar
                                    </q-tooltip>
                                  </q-toggle>
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
                                      :disable="!editImage"
                                      :hide-hint="!editImage"
                                      hint="Leave empty to remove avatar"
                                      @rejected="onRejected"
                                  />
                                  <div>
                                    <q-btn label="Confirm changes" icon="edit" color="primary" @click="submitChanges"/>
                                    <q-btn label="Cancel" icon="close" color="negative" class="q-ml-sm"
                                           @click="cancelChanges"/>
                                  </div>
                                </q-form>

                              </div>
                            </q-card-section>
                          </q-card>
                        </q-card-section>
                      </q-card>
                    </q-expansion-item>

                    <q-expansion-item
                        expand-separator
                        icon="key"
                        label="Regenerate signature key"
                    >
                      <q-card>
                        <q-card-section>
                          <q-card>
                            <q-card-section>
                              <div class="q-pa-md">

                                <q-form
                                    @submit="onSubmitKey"
                                    @reset="onResetKey"
                                    class="q-gutter-md"
                                >
                                  <q-input
                                      filled
                                      clearable
                                      clear-icon="close"
                                      :type="isVk ? 'password' : 'text'"
                                      v-model="voteKey"
                                      label="New voting key"
                                      hint="New voting key"
                                      lazy-rules
                                      :rules="[
              val => !!val || 'Please insert your voting key',
              val => val.length === 16 || 'Voting key must be exactly 16 characters long',
              val => val.match('^(?=(.*[a-z]){1,})(?=(.*[A-Z]){1,})(?=(.*[0-9]){1,})(?=(.*[!@#$%^&*()\\-__+.]){1,}).{8,}$') || 'Voting Key must have upper and lower case characters, special characters and digits',
          ]"
                                  >
                                    <template v-slot:append>
                                      <q-icon
                                          :name="isVk ? 'visibility_off' : 'visibility'"
                                          class="cursor-pointer"
                                          @click="isVk = !isVk"
                                      />
                                    </template>
                                  </q-input>
                                  <q-input
                                      filled
                                      clearable
                                      clear-icon="close"
                                      :type="isVk1 ? 'password' : 'text'"
                                      v-model="voteKeyConfirm"
                                      label="Reinsert new voting key"
                                      hint="Reinsert new voting key"
                                      lazy-rules
                                      :rules="[
              val => !!val || 'Please reinsert your voting key',
              val => val.length === 16 || 'Voting key must be exactly 16 characters long',
              val => val.match('^(?=(.*[a-z]){1,})(?=(.*[A-Z]){1,})(?=(.*[0-9]){1,})(?=(.*[!@#$%^&*()\\-__+.]){1,}).{8,}$') || 'Voting Key must have upper and lower case characters, special characters and digits',
              val => val === voteKey || 'Key must the same in both fields'
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
                                  <div>
                                    <q-btn label="Confirm changes" icon="edit" type="submit" color="primary"/>
                                    <q-btn label="Cancel" icon="close" type="reset" color="negative" class="q-ml-sm"/>
                                  </div>
                                </q-form>

                              </div>
                            </q-card-section>
                          </q-card>
                        </q-card-section>
                      </q-card>
                    </q-expansion-item>

                    <q-expansion-item
                        expand-separator
                        icon="cancel"
                        label="Delete account"
                        header-class="text-red"
                    >
                      <q-card>
                        <q-card-section>
                          <q-card>
                            <q-card-section>
                              <div class="q-pa-md">

                                <q-btn label="Delete account" icon="cancel" color="negative" @click="deleteConfirmDialog"/>

                              </div>
                            </q-card-section>
                          </q-card>
                        </q-card-section>
                      </q-card>
                    </q-expansion-item>
                  </q-list>
                </q-card-section>
              </q-card>
            </div>
          </div>
        </div>
      </div>
      <q-dialog v-model="deleteConfirm">
        <q-card>
          <q-card-section>
            <div class="text-h6">Delete account</div>
          </q-card-section>

          <q-card-section class="q-pt-none">
            Are you sure you want to delete your account?
          </q-card-section>

          <q-card-actions align="right">
            <q-btn flat label="Confirm" color="primary" @click="onSubmitDelete"/>
            <q-btn flat label="Cancel" color="negative" @click="deleteConfirm=false"/>
          </q-card-actions>
        </q-card>
      </q-dialog>
      <q-page-sticky v-if="$q.screen.gt.sm" expand position="left">
        <div class="fit q-pt-xl q-px-sm column">
          <q-btn v-if="$q.sessionStorage.getItem('permission')" round flat color="grey-8" stack no-caps size="26px"
                 class="GPL__side-btn" @click="$router.push('elections')">
            <q-icon size="22px" name="ballot"/>
            <div class="GPL__side-btn__label">Elections</div>
          </q-btn>

          <q-btn v-if="$q.sessionStorage.getItem('permission') === 'MANAGER'" round flat color="grey-8" stack no-caps
                 size="26px" class="GPL__side-btn" @click="$router.push('election-manager')">
            <q-icon size="22px" name="edit_document"/>
            <div class="GPL__side-btn__label">Election Manager</div>
          </q-btn>

          <q-btn v-if="$q.sessionStorage.getItem('permission') === 'AUDITOR'" round flat color="grey-8" stack no-caps
                 size="26px" class="GPL__side-btn" @click="$router.push('auditing')">
            <q-icon size="22px" name="fact_check"/>
            <div class="GPL__side-btn__label">Auditing</div>
            <q-badge floating color="red" text-color="white" style="top: 8px; right: 16px">
              1
            </q-badge>
          </q-btn>

          <q-btn v-if="$q.sessionStorage.getItem('permission') === 'ADMIN'" round flat color="grey-8" stack no-caps
                 size="26px" class="GPL__side-btn" @click="$router.push('admin')">
            <q-icon size="22px" name="admin_panel_settings"/>
            <div class="GPL__side-btn__label">Admin</div>
          </q-btn>
        </div>
      </q-page-sticky>
    </q-page-container>
  </q-layout>
  <q-dialog v-model="settings" position="right">
    <q-card style="width: 350px">

      <q-card-section class="row items-center no-wrap">
        <div class="column items-center">
          <q-avatar size="72px">
            <img :src="avatar">
          </q-avatar>

          <div class="text-subtitle1 q-mt-md q-mb-xs">{{ displayName }}</div>
          <q-btn
              color="primary"
              label="Profile"
              push
              size="sm"
              v-close-popup
              @click="$router.push('profile')"
          />
          <q-btn
              color="negative"
              label="Logout"
              push
              size="sm"
              v-close-popup
              @click="logout"
          />
        </div>
      </q-card-section>
    </q-card>
  </q-dialog>
</template>

<script>
import {onMounted, ref} from "vue";
import {Cookies, Notify, SessionStorage, useQuasar} from "quasar";
import axios from "axios";
import api_routes from '../../config/routes.config'
import {useRouter} from "vue-router";

export default {
  name: "Profile",
  setup() {
    const settings = ref(false)
    const $q = useQuasar()
    const image = ref(null)
    const router = useRouter();
    const file = ref('')
    const avatar = ref('')
    const displayName = ref('')
    const oldDisplayName = ref('')
    const password = ref('')
    const passwordConfirm = ref('')
    const voteKey = ref('')
    const voteKeyConfirm = ref('')
    const passwordDelete = ref('')
    const editImage = ref(false)
    const deleteConfirm = ref(false)

    async function getProfile() {
      const uri = `http://localhost:8080/users/profile`
      return await axios.get(uri, {
        headers: {
          "Content-type": "application/json"
        },
        withCredentials: true
      }).then(function (response) {
        displayName.value = response.data.display_name
        oldDisplayName.value = response.data.display_name
        avatar.value = response.data.image ? `${api_routes.AVATAR_URI}/${response.data.image}` : `${api_routes.API_IMAGE_URI}/user-icon.jpg`
      }).catch(function (error) {
        if(error.response.status === 403 || error.response.status === 401) {
          router.push({name: 'AccessDenied'})
        } else {
          router.push({name: 'Error'})
        }
      })
    }

    async function editProfile(data) {
      const uri = `http://localhost:8080/users/${$q.sessionStorage.getItem('id')}`
      return await axios.put(uri, data, {
        headers: {
          "Content-type": "multipart/form-data"
        },
        withCredentials: true
      }).then(function (response) {
        return response
      }).catch(function (error) {
        return error
      })
    }

    async function regenKeys(data) {
      const uri = `http://localhost:8080/users/key`
      return await axios.post(uri, data, {
        headers: {
          "Content-type": "application/json"
        },
        withCredentials: true
      }).then(function (response) {
        return response
      }).catch(function (error) {
        return error
      })
    }

    async function deleteProfile() {
      const uri = `http://localhost:8080/users/${$q.sessionStorage.getItem('id')}`
      return await axios.delete(uri, {
        headers: {
          "Content-type": "application/json"
        },
        withCredentials: true
      }).then(function (response) {
        return response
      }).catch(function (error) {
        return error
      })
    }


    onMounted(() => {
      getProfile()
    })

    return {
      settings,
      openSettings() {
        settings.value = true
      },
      avatar,
      displayName,
      oldDisplayName,
      password,
      passwordConfirm,
      editImage,
      file,
      deleteConfirm,
      isPwd: ref(true),
      isPwdC: ref(true),
      onRejected(rejectedEntries) {
        $q.notify({
          color: 'red-10',
          textColor: 'white',
          icon: 'cancel',
          message: `${rejectedEntries.length} file(s) did not pass validation constraints`
        })
      },
      submitChanges() {
        const data = {
          displayName: displayName.value,
          password: password.value,
          avatar: editImage.value,
          image: file.value
        }
        if (displayName.value.length > 0) {
          if (password.value.length > 0 && passwordConfirm.value.length > 0) {
            if (password.value === passwordConfirm.value) {
              if (password.value.length >= 8 && password.value.match('^(?=(.*[a-z]){1,})(?=(.*[A-Z]){1,})(?=(.*[0-9]){1,})(?=(.*[!@#$%^&*()\\-__+.]){1,}).{8,}$')) {
                editProfile(data).then(function (response) {
                  displayName.value = response.data.display_name
                  oldDisplayName.value = response.data.display_name
                  avatar.value = response.data.image ? `${api_routes.AVATAR_URI}/${response.data.image}` : `${api_routes.API_IMAGE_URI}/user-icon.jpg`
                  Notify.create({
                    color: 'green-4',
                    textColor: 'white',
                    icon: 'check',
                    message: `Profile edited with success`
                  })
                })
              } else {
                Notify.create({
                  color: 'red-10',
                  textColor: 'white',
                  icon: 'cancel',
                  message: 'Cannot edit profile; Password must follow rules'
                })
              }
            } else {
              Notify.create({
                color: 'red-10',
                textColor: 'white',
                icon: 'cancel',
                message: 'Cannot edit profile; Both password fields must be the same'
              })
            }
          } else {
            if ((password.value.length > 0 && passwordConfirm.value.length === 0) || (password.value.length === 0 && passwordConfirm.value.length > 0)) {
              Notify.create({
                color: 'red-10',
                textColor: 'white',
                icon: 'cancel',
                message: 'Cannot edit profile; Both password fields must be filled'
              })
            } else {
              editProfile(data).then(function (response) {
                console.log(response.data)
                displayName.value = response.data.display_name
                oldDisplayName.value = response.data.display_name
                avatar.value = response.data.image ? `${api_routes.AVATAR_URI}/${response.data.image}` : `${api_routes.API_IMAGE_URI}/user-icon.jpg`
                Notify.create({
                  color: 'green-4',
                  textColor: 'white',
                  icon: 'check',
                  message: `Profile edited with success`
                })
              })
            }
          }
        } else {
          Notify.create({
            color: 'red-10',
            textColor: 'white',
            icon: 'cancel',
            message: 'Cannot edit profile; Display name must not be empty'
          })
        }
      },
      cancelChanges() {
        displayName.value = oldDisplayName.value
        password.value = ''
        passwordConfirm.value = ''
      },
      voteKey,
      voteKeyConfirm,
      isVk: ref(true),
      isVk1: ref(true),
      onSubmitKey() {
        const data = {key: voteKey.value}
        regenKeys(data).then(function (response) {
          Notify.create({
            color: 'green-4',
            textColor: 'white',
            icon: 'check',
            message: `Vote key changed with success`
          })
        })
      },
      onResetKey() {
        voteKey.value = ''
        voteKeyConfirm.value = ''
      },
      isPwdDel: ref(true),
      passwordDelete,
      onResetDelete() {
        passwordDelete.value = ''
      },
      onSubmitDelete() {
        deleteProfile().then(function (response) {
          Notify.create({
            color: 'green-4',
            textColor: 'white',
            icon: 'check',
            message: `Account deleted with success`
          })
          SessionStorage.set('permission', '');
          Cookies.remove('token');
          router.push({name: 'Login'});
        })
      },
    }
  },
  methods: {
    logout() {
      SessionStorage.set('permission', '');
      Cookies.remove('token');
      this.$router.push('login');
    },
    deleteConfirmDialog() {
      this.deleteConfirm = true
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