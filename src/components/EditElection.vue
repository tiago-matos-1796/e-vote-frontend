<template>
  <q-card class="bg-blue-grey-2 text-black">
    <q-bar>
      <div class="text-h6">Edit election {{ editElectionTitle }}</div>
      <q-space/>
      <q-btn dense flat icon="close" v-close-popup>
        <q-tooltip class="bg-white text-primary">Close</q-tooltip>
      </q-btn>
    </q-bar>
    <q-card-section class="q-pt-none">
      <div class="flex flex-center column">
        <div class="row bg-blue-grey-2" style="min-height: 400px; width: 80%; padding: 24px;">
          <div id="parent" class="fit wrap justify-center items-start content-start"
               style="overflow: hidden;">
            <div class=" bg-grey-6" style="overflow: auto;">
              <q-card class="no-border-radius">
                <q-card-section>
                  <div class="q-pa-md">
                    <q-card class="no-border-radius">
                      <q-card-section>
                        <div class="text-h6">Election Details</div>
                      </q-card-section>
                      <q-card-section>
                        <div class="q-pa-md">
                          <q-form
                              class="q-gutter-md" style="min-width: 400px; padding: 24px;"
                          >
                            <q-input filled v-model="editElectionTitle" label="Election title"
                                     placeholder="Election title"
                                     :rules="[ val => !!val || 'Election title must not be empty']"
                            ></q-input>

                            <div class="row">
                              <div class="col">
                                <q-input filled v-model="editStartDate" label="Start date and time">
                                  <template v-slot:prepend>
                                    <q-icon name="event" class="cursor-pointer">
                                      <q-popup-proxy cover transition-show="scale"
                                                     transition-hide="scale">
                                        <q-date v-model="editStartDate" mask="YYYY-MM-DD HH:mm"
                                                :options="startDateOptions">
                                          <div class="row items-center justify-end">
                                            <q-btn v-close-popup label="Close" color="primary"
                                                   flat/>
                                          </div>
                                        </q-date>
                                      </q-popup-proxy>
                                    </q-icon>
                                  </template>

                                  <template v-slot:append>
                                    <q-icon name="access_time" class="cursor-pointer">
                                      <q-popup-proxy cover transition-show="scale"
                                                     transition-hide="scale">
                                        <q-time v-model="editStartDate" mask="YYYY-MM-DD HH:mm"
                                                format24h>
                                          <div class="row items-center justify-end">
                                            <q-btn v-close-popup label="Close" color="primary"
                                                   flat/>
                                          </div>
                                        </q-time>
                                      </q-popup-proxy>
                                    </q-icon>
                                  </template>
                                </q-input>
                              </div>
                              <div class="col">
                                <q-input filled v-model="editEndDate" label="End date and time"
                                         :disable="allowEditEndDate"
                                         :rules="[ val => confirmDates(val) || 'End date must be after start date']">
                                  <template v-slot:prepend>
                                    <q-icon name="event" class="cursor-pointer">
                                      <q-popup-proxy cover transition-show="scale"
                                                     transition-hide="scale">
                                        <q-date v-model="editEndDate" mask="YYYY-MM-DD HH:mm"
                                                :options="endDateOptions">
                                          <div class="row items-center justify-end">
                                            <q-btn v-close-popup label="Close" color="primary"
                                                   flat/>
                                          </div>
                                        </q-date>
                                      </q-popup-proxy>
                                    </q-icon>
                                  </template>

                                  <template v-slot:append>
                                    <q-icon name="access_time" class="cursor-pointer">
                                      <q-popup-proxy cover transition-show="scale"
                                                     transition-hide="scale">
                                        <q-time v-model="editEndDate" mask="YYYY-MM-DD HH:mm"
                                                format24h>
                                          <div class="row items-center justify-end">
                                            <q-btn v-close-popup label="Close" color="primary"
                                                   flat/>
                                          </div>
                                        </q-time>
                                      </q-popup-proxy>
                                    </q-icon>
                                  </template>
                                </q-input>
                              </div>
                            </div>
                          </q-form>
                        </div>
                      </q-card-section>
                    </q-card>
                    <q-card class="no-border-radius">
                      <q-card-section>
                        <div class="text-h6">Candidates</div>
                      </q-card-section>
                      <q-card-section>
                        <div class="q-pa-md">
                          <q-table
                              flat bordered
                              title=""
                              :rows="editCandidateRows"
                              :columns="candidateColumns"
                              row-key="id"
                              selection="multiple"
                              v-model:selected="editSelectedCandidates"
                              :filter="filter"
                              :loading="editCandidateLoading"
                              binary-state-sort
                          >

                            <template v-slot:top-right>
                              <q-btn color="green" :disable="editCandidateLoading"
                                     label="Add candidate"
                                     @click="showEditNewCandidate"/>
                              <q-btn class="q-ml-sm" color="negative"
                                     :disable="editCandidateLoading"
                                     label="Remove candidates" @click="editRemoveCandidate"/>
                              <q-space/>
                            </template>
                            <template v-slot:body="props">
                              <q-tr :props="props">
                                <q-td>
                                  <q-checkbox v-model="props.selected"/>
                                </q-td>
                                <q-td key="name" :props="props">
                                  {{ props.row.name }}
                                </q-td>
                                <q-td key="image" :props="props">
                                  {{ props.row.image ? typeof props.row.image === 'string' ? props.row.image : props.row.image.name : "No image" }}
                                </q-td>
                                <q-td key="actions" :props="props">
                                  <q-btn square size="sm" name="edit" color="amber" icon='edit'
                                         :disable="candidateLoading"
                                         @click="openCandidateEdit(props.row)">
                                    <q-tooltip>
                                      Edit candidate
                                    </q-tooltip>
                                  </q-btn>
                                </q-td>
                              </q-tr>
                            </template>

                          </q-table>
                        </div>
                      </q-card-section>
                    </q-card>
                    <q-card class="no-border-radius">
                      <q-card-section>
                        <div class="text-h6">Voters</div>
                      </q-card-section>
                      <q-card-section>
                        <div class="q-pa-md">
                          <q-table
                              flat bordered
                              title=""
                              :rows="editVoterRows"
                              :columns="userColumns"
                              row-key="id"
                              selection="multiple"
                              v-model:selected="editSelectedVoters"
                              :filter="filter"
                              :loading="editVoterLoading"
                              binary-state-sort
                          >

                            <template v-slot:top-left>
                              <q-file ref="file" style="display: none" v-model="voterCSV" max-file-size="2048" accept=".csv"
                                      @rejected="onRejected"></q-file>
                              <q-btn
                                  color="positive"
                                  icon-right="unarchive"
                                  label="Import voters from csv"
                                  @click="importCSV"
                              />
                              <q-btn
                                  class="q-ml-sm"
                                  color="primary"
                                  icon-right="archive"
                                  label="Export voters to csv"
                                  @click="exportTable"
                              />
                            </template>
                            <template v-slot:top-right>
                              <q-btn color="green" :disable="editVoterLoading" label="Add voter"
                                     @click="editShowVoterAdd"/>
                              <q-btn class="q-ml-sm" color="negative" :disable="editVoterLoading"
                                     label="Remove voter" @click="editRemoveVoters"/>
                              <q-space/>
                            </template>
                          </q-table>
                        </div>
                      </q-card-section>
                    </q-card>
                    <q-card class="no-border-radius">
                      <q-card-section>
                        <div class="text-h6">Managers</div>
                      </q-card-section>
                      <q-card-section>
                        <div class="q-pa-md">
                          <q-table
                              flat bordered
                              title=""
                              :rows="managerRows"
                              :columns="userColumns"
                              row-key="id"
                              selection="multiple"
                              v-model:selected="selectedManager"
                              :filter="filter"
                              :loading="managerLoading"
                              binary-state-sort
                          >

                            <template v-slot:top-right>
                              <q-btn color="green" :disable="managerLoading" label="Add manager"
                                     @click="showManagerAdd"/>
                              <q-btn class="q-ml-sm" color="negative" :disable="managerLoading"
                                     label="Remove manager" @click="editRemoveManagers"/>
                              <q-space/>
                            </template>
                          </q-table>
                        </div>
                      </q-card-section>
                    </q-card>
                  </div>
                </q-card-section>
                <q-card-actions align="center">
                  <q-btn label="Confirm changes" type="submit" color="primary"
                         @click="confirmElectionEdit(id)"/>
                  <q-btn label="Cancel" type="reset" color="negative" v-close-popup/>
                </q-card-actions>
              </q-card>
            </div>
          </div>
        </div>
      </div>
    </q-card-section>
  </q-card>
  <q-dialog v-model="editAddCandidate">
    <q-card>
      <q-card-section>
        <div class="text-h6">Please insert the name of the new candidate</div>
      </q-card-section>

      <q-card-section class="q-pt-none">
        <q-form
            class="q-gutter-md"
        >
          <q-input v-model="editCandidateName" type="text" filled hint="Candidate name"
                   :rules="[ val => !!val || 'Candidate name must not be empty']">
          </q-input>
          <q-file
              v-model="editCandidateImage"
              label="Choose image (max 2MB)"
              filled
              counter
              accept=".jpg, .png, .svg, image/*"
              max-file-size="2097152"
              @rejected="rejectCandidateImage"
          />
        </q-form>
      </q-card-section>

      <q-card-actions align="right">
        <q-btn flat label="Confirm" color="primary" @click="editInsertNewCandidate" v-close-popup/>
        <q-btn flat label="Cancel" color="negative" @click="editAddCandidate=false" v-close-popup/>
      </q-card-actions>
    </q-card>
  </q-dialog>
  <q-dialog
      v-model="editNewVoter"
      persistent
      full-width
  >
    <div class="flex flex-center column">
      <div id="parent" class="fit wrap justify-center items-start content-start"
           style="overflow: hidden;">
        <q-card class="no-border-radius">
          <q-toolbar>
            <q-toolbar-title><span class="text-weight-bold">{{ selected_row.title }}</span>
            </q-toolbar-title>
            <q-btn flat round dense icon="close" v-close-popup/>
          </q-toolbar>
          <q-card-section>
            <div class="q-pa-md">
              <q-table
                  flat bordered
                  title="Users"
                  :rows="editUserRows"
                  :columns="userColumns"
                  row-key="id"
                  selection="multiple"
                  v-model:selected="editNewVoterSelected"
                  :filter="filter"
                  :loading="editNewVoterLoading"
                  binary-state-sort
              >
              </q-table>
            </div>
          </q-card-section>
          <q-card-actions align="center">
            <q-btn label="Add selected voters" type="submit" color="primary"
                   @click="editInsertNewVoter"/>
            <q-btn label="Cancel" type="reset" color="negative" @click="this.newVoterSelected = []"
                   v-close-popup/>
          </q-card-actions>
        </q-card>
      </div>
    </div>
  </q-dialog>
  <q-dialog
      v-model="newManager"
      persistent
      full-width
  >
    <div class="flex flex-center column">
      <div id="parent" class="fit wrap justify-center items-start content-start"
           style="overflow: hidden;">
        <q-card class="no-border-radius">
          <q-toolbar>
            <q-toolbar-title><span class="text-weight-bold">{{ selected_row.title }}</span>
            </q-toolbar-title>
            <q-btn flat round dense icon="close" v-close-popup/>
          </q-toolbar>
          <q-card-section>
            <div class="q-pa-md">
              <q-table
                  flat bordered
                  title="Users"
                  :rows="userManagerRows"
                  :columns="userColumns"
                  row-key="id"
                  selection="multiple"
                  v-model:selected="newManagerSelected"
                  :filter="filter"
                  :loading="newManagerLoading"
                  binary-state-sort
              >
              </q-table>
            </div>
          </q-card-section>
          <q-card-actions align="center">
            <q-btn label="Add selected voters" type="submit" color="primary"
                   @click="editInsertNewManager"/>
            <q-btn label="Cancel" type="reset" color="negative" @click="this.newManagerSelected = []"
                   v-close-popup/>
          </q-card-actions>
        </q-card>
      </div>
    </div>
  </q-dialog>
  <q-dialog v-model="editCandidateDialog">
    <q-card>
      <q-card-section>
        <div class="text-h6">Please edit candidate</div>
      </q-card-section>

      <q-card-section class="q-pt-none">
        <q-form
            class="q-gutter-md"
        >
          <q-input v-model="candidateName" type="text" filled hint="Candidate name"
                   :rules="[ val => !!val || 'Candidate name must not be empty']">
          </q-input>
          <q-toggle v-model="editImage" label="Change image?"><q-tooltip>
            Toggle to change or remove current image
          </q-tooltip></q-toggle>
          <q-file
              v-model="candidateImage"
              label="Choose image (max 2MB)"
              filled
              counter
              clearable
              :disable="!editImage"
              :hide-hint="!editImage"
              hint="Leave empty to remove image"
              accept=".jpg, .png, .svg, image/*"
              max-file-size="2097152"
              @rejected="rejectCandidateImage"
          />
        </q-form>
      </q-card-section>

      <q-card-actions align="right">
        <q-btn flat label="Confirm" color="primary" @click="editCandidate"/>
        <q-btn flat label="Cancel" color="negative" @click="editCandidateDialog=false; editImage=false" v-close-popup/>
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script>
import {onMounted, ref} from "vue";
import moment from "moment/moment";
import {exportFile, Notify, useQuasar} from "quasar";
import {v1} from "uuid";
import axios from "axios";
import {useRouter} from "vue-router";
import api_routes from '../../config/routes.config'

export default {
  name: "EditElection",
  props: {
    id: String
  },
  emits: [''],
  setup(props) {
    const $q = useQuasar()
    const router = useRouter();
    const allowEditEndDate = ref(true)
    const editElectionTitle = ref('')
    const editStartDate = ref('')
    const editEndDate = ref('')
    const editCandidateRows = ref([])
    const candidateColumns = [
      {
        name: 'name',
        required: true,
        label: 'Name',
        align: 'center',
        field: row => row.name,
        format: val => `${val}`,
        sortable: true
      },
      {
        name: 'image',
        required: true,
        label: 'Image',
        align: 'center',
        field: row => row.image,
        format: val => `${val}`,
        sortable: false
      },
      {name: 'actions', align: 'right', label: 'Actions', field: 'actions', sortable: false},
    ]
    const editSelectedCandidates = ref([])
    const editCandidateLoading = ref(false)
    const editVoterRows = ref([])
    const userColumns = [
      {
        name: 'display_name',
        required: true,
        label: 'Display Name',
        align: 'center',
        field: row => row.display_name,
        format: val => `${val}`,
        sortable: true
      },
      {
        name: 'email',
        required: true,
        label: 'Email',
        align: 'center',
        field: row => row.email,
        format: val => `${val}`,
        sortable: true
      }
    ]
    const editSelectedVoters = ref([])
    const editVoterLoading = ref(false)
    const managerRows = ref([])
    const selectedManager = ref([])
    const managerLoading = ref(false)
    const editUserRows = ref([])
    const editNewVoterSelected = ref([])
    const editNewVoterLoading = ref(false)
    const newVoterSelected = ref([])
    const userManagerRows = ref([])
    const newManagerSelected = ref([])
    const newManagerLoading = ref(false)
    const candidateLoading = ref(false)
    const editCandidateDialog = ref(false)
    const candidateName = ref('')
    const candidateImage = ref(null)
    const editCandidateId = ref('')
    const editNewVoter = ref(false)
    const newManager = ref(false)
    const editAddCandidate = ref(false)
    const editCandidateName = ref(null)
    const editCandidateImage = ref(null)
    const editImage = ref(false)
    const voterCSV = ref(null)

    function confirmDates(date) {
      if (date.length === 0) {
        return true;
      } else {
        return moment(this.editStartDate).isBefore(date)
      }
    }

    async function getElection(id) {
      const uri = `${api_routes.MAIN_URI}/elections/manager/${id}`
      return await axios.get(uri, {
        headers: {
          "Content-type": "application/json"
        },
        withCredentials: true
      }).then(function (response) {
        editElectionTitle.value = response.data.title
        editStartDate.value = response.data.startDate
        editEndDate.value = response.data.endDate
        editCandidateRows.value = response.data.candidates
        editVoterRows.value = response.data.voters
        editUserRows.value = response.data.nonVoters
        managerRows.value = response.data.managers
        userManagerRows.value = response.data.nonManagers
      }).catch(function (error) {
        if (error.response.status === 403 || error.response.status === 401) {
          router.push({name: 'AccessDenied'})
        } else {
          router.push({name: 'Error'})
        }
      })
    }

    function wrapCsvValue (val, formatFn, row) {
      let formatted = formatFn !== void 0
          ? formatFn(val, row)
          : val

      formatted = formatted === void 0 || formatted === null
          ? ''
          : String(formatted)

      formatted = formatted.split('"').join('""')

      return `"${formatted}"`
    }

    onMounted(() => {
      getElection(props.id)
    })
    return {
      editElectionTitle,
      editStartDate,
      startDateOptions(date) {
        const today = moment().format('YYYY/MM/DD')
        return date >= today
      },
      editEndDate,
      allowEditEndDate,
      confirmDates,
      endDateOptions(date) {
        const minDate = moment().format('YYYY/MM/DD')
        return date >= minDate
      },
      editCandidateRows,
      candidateColumns,
      editSelectedCandidates,
      editCandidateLoading,
      editAddCandidate,
      editImage,
      editRemoveCandidate() {
        editCandidateLoading.value = true
        setTimeout(() => {
          for (const sc of editSelectedCandidates.value) {
            const index = editCandidateRows.value.findIndex(object => {
              return object.id === sc.id;
            });
            editCandidateRows.value.splice(index, 1)
          }
          editSelectedCandidates.value = []
          editCandidateLoading.value = false
        }, 500)
      },
      editVoterRows,
      userColumns,
      editSelectedVoters,
      editVoterLoading,
      editRemoveVoters() {
        editVoterLoading.value = true
        setTimeout(() => {
          for (const esv of editSelectedVoters.value) {
            const index = editVoterRows.value.findIndex(object => {
              return object.id === esv.id;
            });
            editVoterRows.value.splice(index, 1);
            editUserRows.value.push(esv)
          }
          editSelectedVoters.value = []
          editVoterLoading.value = false
        }, 500)
      },
      managerRows,
      selectedManager,
      managerLoading,
      newManager,
      editRemoveManagers() {
        managerLoading.value = true
        setTimeout(() => {
          for (const sm of selectedManager.value) {
            const index = managerRows.value.findIndex(object => {
              return object.id === sm.id;
            });
            managerRows.value.splice(index, 1)
            userManagerRows.value.push(sm)
          }
          selectedManager.value = []
          managerLoading.value = false
        }, 500)
      },
      editCandidateName,
      editCandidateImage,
      rejectCandidateImage() {
        $q.notify({
          type: 'negative',
          message: `Invalid image, please make sure the image is in accepted format (jpeg, png, svg) and has a size of up to 2MB`
        })
      },
      candidateName,
      candidateImage,
      editInsertNewCandidate() {
        editCandidateLoading.value = true
        setTimeout(() => {
          const name = editCandidateName.value
          const image = editCandidateImage.value
          editCandidateRows.value.push({id: v1(), name: name, image: image, new: true})
          editCandidateName.value = ''
          editCandidateImage.value = null
          editAddCandidate.value = false
          editCandidateLoading.value = false
        }, 500)
      },
      editNewVoter,
      editUserRows,
      editNewVoterSelected,
      editNewVoterLoading,
      editInsertNewVoter() {
        editNewVoterLoading.value = true
        setTimeout(() => {
          for (const env of editNewVoterSelected.value) {
            const index = editUserRows.value.findIndex(object => {
              return object.id === env.id;
            });
            editUserRows.value.splice(index, 1)
            editVoterRows.value.push(env)
          }
          editNewVoterSelected.value = []
          editNewVoterLoading.value = false
        }, 500)
        editNewVoter.value = false
      },
      newVoterSelected,
      userManagerRows,
      newManagerSelected,
      newManagerLoading,
      candidateLoading,
      editCandidateDialog,
      editCandidateId,
      editInsertNewManager() {
        managerLoading.value = true
        setTimeout(() => {
          for (const ms of newManagerSelected.value) {
            const index = userManagerRows.value.findIndex(object => {
              return object.id === ms.id;
            });
            userManagerRows.value.splice(index, 1)
            managerRows.value.push(ms)
          }
          newManagerSelected.value = []
          managerLoading.value = false
        }, 500)
        newManager.value = false
      },
      selected_row: ref({}),
      voterCSV,
      exportTable () {
        // naive encoding to csv format
        const content = [userColumns.map(col => wrapCsvValue(col.label))].concat(
            editVoterRows.value.map(row => userColumns.map(col => wrapCsvValue(
                typeof col.field === 'function'
                    ? col.field(row)
                    : row[ col.field === void 0 ? col.name : col.field ],
                col.format,
                row
            )).join(','))
        ).join('\r\n')

        const status = exportFile(
            `voters.csv`,
            content,
            'text/csv'
        )

        if (status !== true) {
          $q.notify({
            message: 'Browser denied file download...',
            color: 'negative',
            icon: 'warning'
          })
        }
      },
      onRejected () {
        $q.notify({
          type: 'negative',
          message: 'Please upload only CSV files with maximum size of 2MB'
        })
      }
    }
  },
  watch: {
    editStartDate: function (value) {
      this.allowEditEndDate = value
    },
    voterCSV: function (value) {
      if(value !== null) {
        this.addVotersFromCSV(value)
      }
    }
  },
  methods: {
    showEditNewCandidate() {
      this.editAddCandidate = true
    },
    editShowVoterAdd() {
      this.editNewVoter = true
    },
    showManagerAdd() {
      this.newManager = true;
    },
    confirmElectionEdit(id) {
      let data = new FormData();
      data.append('title', this.editElectionTitle)
      data.append('startDate', this.editStartDate)
      data.append('endDate', this.editEndDate)
      const title = this.editElectionTitle
      const startDate = this.editStartDate
      const endDate = this.editEndDate
      for(const candidate of this.editCandidateRows) {
          if(candidate.image) {
            if(typeof candidate.image === 'string') {
              data.append('candidates[]', JSON.stringify({id: candidate.id, name: candidate.name, image: candidate.image}))
            } else {
              if(candidate.hasOwnProperty('new')) {
                data.append('candidates[]', JSON.stringify({name: candidate.name, image: candidate.image.name}))
                data.append('images', candidate.image)
              } else {
                data.append('candidates[]', JSON.stringify({id: candidate.id, name: candidate.name, image: candidate.image.name}))
                data.append('images', candidate.image)
              }
            }
          } else {
            if(candidate.hasOwnProperty('new')) {
              data.append('candidates[]', JSON.stringify({name: candidate.name, image: null}))
            } else {
              data.append('candidates[]', JSON.stringify({id: candidate.id, name: candidate.name, image: null}))
            }
          }
      }
      for (const voter of this.editVoterRows) {
        data.append('voters[]', voter.id)
      }
      const managers = this.managerRows
      for (const manager of this.managerRows) {
        data.append('managers[]', manager.id)
      }
      if (moment(startDate, 'DD-MM-YYYY HH:mm').isBefore(moment(endDate, 'DD-MM-YYYY HH:mm'))) {
        if (title.length > 0) {
          if (managers.length > 0) {
            const uri = `${api_routes.MAIN_URI}/elections/${id}`
            return axios.put(uri, data, {
              headers: {
                "Content-type": "multipart/form-data"
              },
              withCredentials: true
            }).then(response => {
              this.$emit('closeEdit')
            }).catch(function (error) {
              Notify.create({
                color: 'red-10',
                textColor: 'white',
                icon: 'cancel',
                message: 'An error has occurred while editing the election; Please try again later'
              })
            })
          } else {
            Notify.create({
              color: 'red-10',
              textColor: 'white',
              icon: 'cancel',
              message: 'Cannot edit election; Election must have at least 1 manager'
            })
          }
        } else {
          Notify.create({
            color: 'red-10',
            textColor: 'white',
            icon: 'cancel',
            message: 'Cannot edit election; Please insert an election title'
          })
        }
      } else {
        Notify.create({
          color: 'red-10',
          textColor: 'white',
          icon: 'cancel',
          message: 'Cannot edit election; Election start date is not before end date'
        })
      }
    },
    openCandidateEdit(row) {
      this.editCandidateDialog = true
      this.candidateName = row.name
      this.candidateImage = null
      this.editCandidateId = row.id
    },
    editCandidate() {
      if (this.candidateName.length > 0) {
        this.candidateLoading = true
        setTimeout(() => {
          const index = this.editCandidateRows.findIndex((obj => obj.id === this.editCandidateId));
          this.editCandidateRows[index].name = this.candidateName;
          if(this.editImage) {
            this.editCandidateRows[index].image = this.candidateImage ? this.candidateImage : null;
          }
          this.editCandidateDialog = false
          this.editImage = false
          this.candidateLoading = false
        })
      }
    },
    importCSV() {
      this.$refs.file.pickFiles();
    },
    addVotersFromCSV(file) {
      this.editNewVoterLoading = true
      setTimeout(() => {
        const reader = new FileReader()
        reader.readAsText(file)
        reader.onload = () => {
          const csv = reader.result
          const rows = csv.split("\r")
          const result = []
          const properties = []
          for(const h of rows[0].split(",")) {
            properties.push(h.split(" ").join("_").toLowerCase().replaceAll('"', ''))
          }
          for(let i = 1; i < rows.length; i++) {
            let obj = {}
            const values = rows[i].split(",")
            for(let j = 0; j < properties.length; j++) {
              obj[properties[j]] = values[j].replaceAll('"', '').replaceAll("\n", '')
            }
            result.push(obj)
          }
          for(const r of result) {
            const user = this.editUserRows.find(x => x.email === r.email)
            if(user) {
              const index = this.editUserRows.findIndex(object => {
                return object.id === user.id;
              });
              this.editUserRows.splice(index, 1);
              this.editVoterRows.push(user)
            }
          }
        }
        this.voterCSV = null
        Notify.create({
          color: 'green-4',
          textColor: 'white',
          icon: 'check',
          message: `Added voters from csv`
        })
      }, 500)
      this.editNewVoterLoading = false
    }
  }
}
</script>

<style scoped>

</style>