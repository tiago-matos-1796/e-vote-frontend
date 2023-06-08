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

                  <div>
                    <q-btn label="Submit" type="submit" color="primary"/>
                    <q-btn label="Reset" type="reset" color="primary" flat class="q-ml-sm" />
                  </div>
                </q-form>
                <router-link to="register">Don't have an account?</router-link>
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
  name: 'Login',
  setup () {
    const $q = useQuasar()

    const email = ref(null)
    const password = ref(null)

    return {
      email,
      password,
      isPwd: ref(true),

      onSubmit () {
        $q.notify({
          color: 'green-4',
          textColor: 'white',
          icon: 'cloud_done',
          message: 'Submitted'
        });
        $q.sessionStorage.set('token', 'aaaaaaaabbbbbb');
        $q.sessionStorage.set('permission', 'MANAGER');
        this.$router.push('elections');
        location.reload();
      },

      onReset () {
        email.value = null
        password.value = null
      }
    }
  }
}
</script>

<style scoped>

</style>