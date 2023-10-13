<template>
  <div class="flex flex-center column">
    <div id="parent" class="fit wrap justify-center items-start content-start"
         style="overflow: hidden;">
      <q-card class="no-border-radius">
        <q-toolbar>
          <q-toolbar-title><span class="text-weight-bold">{{electionTitle}}</span>
          </q-toolbar-title>
          <q-btn flat round dense icon="close" v-close-popup/>
        </q-toolbar>
        <q-card-section>
          <div class="q-pa-md">
            <q-table
                :rows="candidateRows"
                :columns="candidateColumns"
                row-key="id"
                selection="single"
                v-model:selected="selected"
                :filter="filter"
                rows-per-page-options="0"
                grid
                hide-header
            >
              <template v-slot:item="props">
                <div
                    class="q-pa-xs col-xs-12 col-sm-6 col-md-4 col-lg-3 grid-style-transition"
                    :style="props.selected ? 'transform: scale(0.95);' : ''"
                >
                  <q-card bordered flat
                          :class="props.selected ? ($q.dark.isActive ? 'bg-grey-9' : 'bg-grey-2') : ''">
                    <q-card-section>
                      <q-checkbox dense v-model="props.selected" :label="props.row.name"/>
                    </q-card-section>
                    <div v-if="props.row.image !== null">
                    <q-separator/>
                    <q-list dense>
                      <q-item>
                        <q-item-section class="row justify-center items-center">
                          <q-item-label><img :src="`${imageRoute}/${props.row.image}`"></q-item-label>
                        </q-item-section>
                      </q-item>
                    </q-list>
                    </div>
                  </q-card>
                </div>
              </template>

            </q-table>
          </div>
        </q-card-section>
        <q-card-actions align="center">
          <q-btn label="Vote" type="submit" color="primary" @click="voteConfirm(selected)"
                 />
          <q-btn label="Cancel" type="reset" color="negative" v-close-popup/>
        </q-card-actions>
      </q-card>
    </div>
  </div>
  <q-dialog v-model="sign">
    <q-card>
      <q-card-section>
        <div class="text-h6">Please confirm your
          {{ selected.length > 0 ? `vote on candidate ${selected[0].name}` : `blank vote` }}
        </div>
      </q-card-section>

      <q-card-section class="q-pt-none">
        <q-form
            class="q-gutter-md"
        >
          <q-input v-model="signatureKey" filled label="Voting key"
                   :type="hideSignKey ? 'password' : 'text'"
                   :rules="[ val => !!val || 'Vote key must not be empty', val => val.length >= 12 || 'Vote key must be at least 12 characters long',
              val => val.match('^(?=(.*[a-z]){1,})(?=(.*[A-Z]){1,})(?=(.*[0-9]){1,})(?=(.*[!@#$%^&*()\\-__+.]){1,}).{8,}$') || 'Vote key must have upper and lower case characters, special characters and digits']"
          >
            <template v-slot:append>
              <q-icon
                  :name="hideSignKey ? 'visibility_off' : 'visibility'"
                  class="cursor-pointer"
                  @click="hideSignKey = !hideSignKey"
              />
            </template>
          </q-input>
        </q-form>
      </q-card-section>

      <q-card-actions align="right">
        <q-btn flat label="Confirm" color="primary" @click="submitVote(selected_row.id)"/>
        <q-btn flat label="Cancel" color="negative" @click="selected=[];signatureKey='';sign=false"/>
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script>

import axios from "axios";
import {useRouter} from "vue-router";
import {onMounted, ref} from "vue";
import {Notify, useQuasar} from "quasar";
import crypto from 'crypto-browserify'
import {Buffer} from 'buffer/'
import api_routes from "../../config/routes.config"; // <-- no typo here ("/")

globalThis.Buffer = Buffer


export default {
  name: "ElectionBallot",
  props: {
    id: String
  },
  setup(props, context) {
    const $q = useQuasar()
    const electionKey = ref('')
    const router = useRouter();
    const signature = ref('')
    const sign = ref(false)
    const selected = ref([])
    const electionTitle = ref('')
    const candidateRows = ref([])
    const imageRoute = ref(api_routes.CANDIDATE_IMAGE_URI)
    const candidateColumns = [
      {
        name: 'name',
        required: true,
        label: 'Candidate',
        align: 'left',
        field: row => row.name,
        format: val => `${val}`,
        sortable: true
      },
      {
        name: 'image',
        label: 'Image',
      }
    ]
    const signatureKey = ref('')
    async function getBallot(id) {
      const uri = `${api_routes.MAIN_URI}/elections/${id}`
        return await axios.get(uri, {
          headers: {
            "Content-type": "application/json"
          },
          withCredentials: true
        }).then(function (response) {
          candidateRows.value = response.data.candidates
          electionTitle.value = response.data.title
          electionKey.value = response.data.election_key
        }).catch(function (error) {
          if(error.response.status === 400) {
            context.emit('closeBallotError')
          } else {
            if(error.response.status === 403 || error.response.status === 401) {
              router.push({name: 'AccessDenied'})
            } else {
              router.push({name: 'Error'})
            }
          }
        })
    }

    async function getSignature(data) {
      const uri = `${api_routes.MAIN_URI}/elections/signature`
      return await axios.post(uri, data, {
        headers: {
          "Content-type": "application/json"
        },
        withCredentials: true
      }).then(function (response) {
        return response.data
      }).catch(function (error) {
        return error
      });
    }

    async function submitVote(id, data) {
      const uri = `${api_routes.MAIN_URI}/vote/${id}`
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

    function encrypt(data, publicKey) {
      return crypto.publicEncrypt(
              Buffer.from(publicKey, "base64").toString("utf8"),
              Buffer.from(data)
          )
          .toString("base64");
    }

    onMounted(() => {
      getBallot(props.id)
    })

    return {
      candidateRows,
      candidateColumns,
      selected,
      sign,
      signatureKey,
      signature,
      imageRoute,
      hideSignKey: ref(true),
      electionTitle,
      selected_row: ref({}),
      submitVote(id) {
        setTimeout(() => {
          const vote = selected.value.length > 0 ? selected.value[0].id : "blank"
          const key = signatureKey.value
          const encryptedVote = encrypt(vote, electionKey.value)
          const data = {data: encryptedVote, key: key}
          getSignature(data).then(response => {
            if(response.response) {
              if(response.response.status === 400) {
                context.emit('closeBallotError')
              }
            } else {
              submitVote(props.id, {vote: encryptedVote, signature: response.signature, hash: response.hash, key: key}).then(response => {
                if(response.response) {
                  if(response.response.status === 500) {
                    context.emit('closeBallotError')
                  }
                } else {
                  context.emit('closeBallot')
                }
              }).catch(error => {
                Notify.create({
                  color: 'red-10',
                  textColor: 'white',
                  icon: 'cancel',
                  message: 'Cannot submit vote, cannot create signature'
                })
              })
            }
          }).catch(error => {
            Notify.create({
              color: 'red-10',
              textColor: 'white',
              icon: 'cancel',
              message: 'Cannot submit vote, cannot create signature'
            })
          })
          sign.value = false
        }, 500)
      },
    }
  },
  methods: {
    voteConfirm(selected) {
      this.selected = selected;
      this.sign = true;
    }
  }
}
</script>

<style scoped>

</style>