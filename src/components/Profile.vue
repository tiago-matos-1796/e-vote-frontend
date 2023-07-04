<template>
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
              <img src="https://cdn.quasar.dev/img/boy-avatar.png">
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
                        caption="John Doe"
                    >
                      <q-card>
                        <q-card-section>
                          <q-card>
                            <q-card-section>
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

                                <q-form
                                    @submit="onSubmitDelete"
                                    @reset="onResetDelete"
                                    class="q-gutter-md"
                                >
                                  <q-input
                                      filled
                                      clearable
                                      clear-icon="close"
                                      :type="isPwdDel ? 'password' : 'text'"
                                      v-model="passwordDelete"
                                      label="Password"
                                      hint="Please insert your password to confirm account deletion"
                                      lazy-rules
                                      :rules="[
              val => !!val || 'Please insert your password',
              val => val.length >= 8 || 'Password must be at least 8 characters long',
              val => val.match('^(?=(.*[a-z]){1,})(?=(.*[A-Z]){1,})(?=(.*[0-9]){1,})(?=(.*[!@#$%^&*()\\-__+.]){1,}).{8,}$') || 'Password must have upper and lower case characters, special characters and digits',
          ]"
                                  >
                                    <template v-slot:append>
                                      <q-icon
                                          :name="isPwdDel ? 'visibility_off' : 'visibility'"
                                          class="cursor-pointer"
                                          @click="isPwdDel = !isPwdDel"
                                      />
                                    </template>
                                  </q-input>
                                  <div>
                                    <q-btn label="Confirm deletion" icon="cancel" type="submit" color="negative"/>
                                    <q-btn label="Cancel" icon="close" type="reset" color="warning" class="q-ml-sm"/>
                                  </div>
                                </q-form>

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
            <img src="https://cdn.quasar.dev/img/boy-avatar.png">
          </q-avatar>

          <div class="text-subtitle1 q-mt-md q-mb-xs">John Doe</div>
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
import {ref} from "vue";
import {Cookies, Notify, SessionStorage, useQuasar} from "quasar";

export default {
  name: "Profile",
  setup() {
    const settings = ref(false)
    const $q = useQuasar()
    const displayName = ref('')
    const password = ref('')
    const passwordConfirm = ref('')
    const voteKey = ref('')
    const voteKeyConfirm = ref('')
    const passwordDelete = ref('')

    return {
      settings,
      openSettings() {
        settings.value = true
      },
      displayName,
      password,
      passwordConfirm,
      isPwd: ref(true),
      isPwdC: ref(true),
      submitChanges() {
        if (displayName.value.length > 0) {
          if (password.value.length > 0 && passwordConfirm.value.length > 0) {
            if (password.value === passwordConfirm.value) {
              if (password.value.length >= 8 && password.value.match('^(?=(.*[a-z]){1,})(?=(.*[A-Z]){1,})(?=(.*[0-9]){1,})(?=(.*[!@#$%^&*()\\-__+.]){1,}).{8,}$')) {
                console.log({displayName: displayName.value, password: password.value})
                Notify.create({
                  color: 'green-4',
                  textColor: 'white',
                  icon: 'check',
                  message: `Profile edited with success`
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
              console.log({displayName: displayName.value})
              Notify.create({
                color: 'green-4',
                textColor: 'white',
                icon: 'check',
                message: `Profile edited with success`
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
        displayName.value = '' // replace with value fetched from API
        password.value = ''
        passwordConfirm.value = ''
      },
      voteKey,
      voteKeyConfirm,
      isVk: ref(true),
      isVk1: ref(true),
      onSubmitKey() {
        console.log({voteKey: voteKey.value})
        Notify.create({
          color: 'green-4',
          textColor: 'white',
          icon: 'check',
          message: `Vote key changed with success`
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
      }
    }
  },
  methods: {
    logout() {
      SessionStorage.set('permission', '');
      Cookies.remove('token');
      this.$router.push('login');
    },
    onSubmitDelete() {
      console.log({password: this.passwordDelete})
      Notify.create({
        color: 'green-4',
        textColor: 'white',
        icon: 'check',
        message: `Account deleted with success`
      })
      SessionStorage.set('permission', '');
      Cookies.remove('token');
      this.$router.push('login');
    },
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