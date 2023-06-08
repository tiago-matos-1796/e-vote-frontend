<template>
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
                              :type="isPwd ? 'password' : 'text'"
                              v-model="password"
                              label="Reinsert new password"
                              hint="Reinsert new password"
                              lazy-rules
                              :rules="[
              val => !!val || 'Please reinsert your new password',
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
                            <q-btn label="Confirm changes" icon="edit" type="submit" color="primary"/>
                            <q-btn label="Cancel" icon="close" type="reset" color="negative" class="q-ml-sm" />
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
                                @submit="onSubmit"
                                @reset="onReset"
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
                                  :type="isVk ? 'password' : 'text'"
                                  v-model="voteKey"
                                  label="Reinsert new voting key"
                                  hint="Reinsert new voting key"
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
                              <div>
                                <q-btn label="Confirm changes" icon="edit" type="submit" color="primary"/>
                                <q-btn label="Cancel" icon="close" type="reset" color="negative" class="q-ml-sm" />
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
                                    @submit="onSubmit"
                                    @reset="onReset"
                                    class="q-gutter-md"
                                >
                                  <q-input
                                      filled
                                      clearable
                                      clear-icon="close"
                                      :type="isPwd ? 'password' : 'text'"
                                      v-model="password"
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
                                          :name="isPwd ? 'visibility_off' : 'visibility'"
                                          class="cursor-pointer"
                                          @click="isPwd = !isPwd"
                                      />
                                    </template>
                                  </q-input>
                                  <div>
                                    <q-btn label="Confirm deletion" icon="cancel" type="submit" color="negative"/>
                                    <q-btn label="Cancel" icon="close" type="reset" color="warning" class="q-ml-sm" />
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
</template>

<script>
export default {
  name: "Profile"
}
</script>

<style scoped>

</style>