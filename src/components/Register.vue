<template>
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
                      clearable
                      clear-icon="close"
                      v-model="displayName"
                      type="text"
                      label="Display Name *"
                      lazy-rules
                      hint="Please insert your display name"
                      :rules="[ val => !!val || 'Please insert your display name']"
                  />

                  <q-input
                      filled
                      clearable
                      clear-icon="close"
                      v-model="email"
                      type="email"
                      label="Email *"
                      lazy-rules
                      hint="Please insert your email"
                      :rules="[ val => !!val || 'Please insert your email']"
                  />

                  <q-input
                      filled
                      clearable
                      clear-icon="close"
                      :type="isPwd ? 'password' : 'text'"
                      v-model="password"
                      label="Password *"
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
                      clearable
                      clear-icon="close"
                      :type="isPwd ? 'password' : 'text'"
                      v-model="passwordConfirm"
                      label="Password *"
                      hint="Please reinsert your password"
                      lazy-rules
                      :rules="[
              val => !!val || 'Please reinsert your password',
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
                      :type="isVk ? 'password' : 'text'"
                      v-model="voteKey"
                      label="Voting Key *"
                      hint="Please insert your voting key"
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
                      :type="isVk ? 'password' : 'text'"
                      v-model="voteKeyConfirm"
                      label="Voting Key *"
                      hint="Please reinsert your voting key"
                      lazy-rules
                      :rules="[
              val => !!val || 'Please reinsert your voting key',
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

                  <q-file
                      name="image_file"
                      v-model="file"
                      filled
                      clearable
                      clear-icon="close"
                      label="Select image"
                      accept=".jpg, .png"
                      max-files="1"
                      hint="*Optional"
                      @rejected="onRejected"
                  />


                  <div>
                    <q-btn label="Submit" type="submit" color="primary"/>
                    <q-btn label="Reset" type="reset" color="primary" flat class="q-ml-sm" />
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
</template>

<script>
import { useQuasar } from 'quasar'
import { ref } from 'vue'

export default {
  name: 'Register',
  setup () {
    const $q = useQuasar()

    const email = ref(null)
    const password = ref(null)
    const voteKey = ref(null)
    const file = ref(null)

    return {
      email,
      password,
      isPwd: ref(true),
      voteKey,
      isVk: ref(true),
      file,
      filesImages: ref(null),
      filesMaxSize: ref(null),
      filesMaxTotalSize: ref(null),
      filesMaxNumber: ref(null),

      onSubmit () {
        $q.notify({
          color: 'green-4',
          textColor: 'white',
          icon: 'cloud_done',
          message: 'Submitted'
        })
      },

      onReset () {
        email.value = null
        password.value = null
        file.value = null
        voteKey.value = null
      },
      onRejected (rejectedEntries) {
        $q.notify({
          type: 'negative',
          message: `${rejectedEntries.length} file(s) did not pass validation constraints`
        })
      }
    }
  }
}
</script>

<style scoped>

</style>