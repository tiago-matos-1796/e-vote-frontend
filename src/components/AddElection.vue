<template>
  <q-card class="bg-blue-grey-2 text-black">
    <q-bar>
      <div class="text-h6">Create new election</div>
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
                  <q-card class="no-border-radius">
                    <q-card-section>
                      <div class="text-h6">Election Details</div>
                    </q-card-section>
                    <q-card-section>
                      <div class="q-pa-md">
                        <q-form
                            class="q-gutter-md" style="min-width: 400px; padding: 24px;"
                        >
                          <q-input filled v-model="electionTitle" label="Title"
                                   placeholder="Election title" hint="Election title"
                                   :rules="[ val => !!val || 'Election title must not be empty']"
                          ></q-input>

                          <div class="row">
                            <div class="col">
                              <q-input filled v-model="startDate" label="Start date and time"
                                       hint="Start date and time">
                                <template v-slot:prepend>
                                  <q-icon name="event" class="cursor-pointer">
                                    <q-popup-proxy cover transition-show="scale"
                                                   transition-hide="scale">
                                      <q-date v-model="startDate" mask="YYYY-MM-DD HH:mm"
                                              :options="startDateOptions">
                                        <div class="row items-center justify-end">
                                          <q-btn v-close-popup label="Close" color="primary" flat/>
                                        </div>
                                      </q-date>
                                    </q-popup-proxy>
                                  </q-icon>
                                </template>

                                <template v-slot:append>
                                  <q-icon name="access_time" class="cursor-pointer">
                                    <q-popup-proxy cover transition-show="scale"
                                                   transition-hide="scale">
                                      <q-time v-model="startDate" mask="YYYY-MM-DD HH:mm" format24h>
                                        <div class="row items-center justify-end">
                                          <q-btn v-close-popup label="Close" color="primary" flat/>
                                        </div>
                                      </q-time>
                                    </q-popup-proxy>
                                  </q-icon>
                                </template>
                              </q-input>
                            </div>
                            <div class="col">
                              <q-input filled v-model="endDate" label="End date and time"
                                       hint="End date and time" :disable="allowEndDate"
                                       :rules="[ val => confirmDates(val) || 'End date must be after start date']">
                                <template v-slot:prepend>
                                  <q-icon name="event" class="cursor-pointer">
                                    <q-popup-proxy cover transition-show="scale"
                                                   transition-hide="scale">
                                      <q-date v-model="endDate" mask="YYYY-MM-DD HH:mm"
                                              :options="endDateOptions">
                                        <div class="row items-center justify-end">
                                          <q-btn v-close-popup label="Close" color="primary" flat/>
                                        </div>
                                      </q-date>
                                    </q-popup-proxy>
                                  </q-icon>
                                </template>

                                <template v-slot:append>
                                  <q-icon name="access_time" class="cursor-pointer">
                                    <q-popup-proxy cover transition-show="scale"
                                                   transition-hide="scale">
                                      <q-time v-model="endDate" mask="YYYY-MM-DD HH:mm" format24h>
                                        <div class="row items-center justify-end">
                                          <q-btn v-close-popup label="Close" color="primary" flat/>
                                        </div>
                                      </q-time>
                                    </q-popup-proxy>
                                  </q-icon>
                                </template>
                              </q-input>
                            </div>
                          </div>
                          <q-input filled v-model="electionKey" label="Election Key"
                                   placeholder="Election Key" hint="Election Key" clear-icon="close"
                                   :type="isPwd ? 'password' : 'text'"
                                   :rules="[ val => !!val || 'Election key must not be empty' ,val => val.length >= 16 || 'Election key must be 16 characters long',
              val => val.match('^(?=(.*[a-z]){1,})(?=(.*[A-Z]){1,})(?=(.*[0-9]){1,})(?=(.*[!@#$%^&*()\\-__+.]){1,}).{8,}$') || 'Election key must have upper and lower case characters, special characters and digits',]"
                          >
                            <template v-slot:append>
                              <q-icon
                                  :name="isPwd ? 'visibility_off' : 'visibility'"
                                  class="cursor-pointer"
                                  @click="isPwd = !isPwd"
                              />
                            </template>
                          </q-input>
                          <q-input filled v-model="electionKey1" label="Confirm Election Key"
                                   placeholder="Election Key" hint="Confirm Election Key"
                                   clear-icon="close"
                                   :type="isPwd1 ? 'password' : 'text'"
                                   :rules="[ val => !!val || 'Election key must not be empty', val => val.length >= 16 || 'Election key must be 16 characters long',
              val => val.match('^(?=(.*[a-z]){1,})(?=(.*[A-Z]){1,})(?=(.*[0-9]){1,})(?=(.*[!@#$%^&*()\\-__+.]){1,}).{8,}$') || 'Election key must have upper and lower case characters, special characters and digits', val => val === electionKey || 'Election key must be the same as above']"
                          >
                            <template v-slot:append>
                              <q-icon
                                  :name="isPwd1 ? 'visibility_off' : 'visibility'"
                                  class="cursor-pointer"
                                  @click="isPwd1 = !isPwd1"
                              />
                            </template>
                          </q-input>
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
                            :rows="candidateRows"
                            :columns="candidateColumns"
                            row-key="id"
                            :selected-rows-label="getSelectedString"
                            selection="multiple"
                            v-model:selected="selectedCandidates"
                            :loading="candidateLoading"
                            binary-state-sort
                        >
                          <template v-slot:top-right>
                            <q-btn color="green" :disable="candidateLoading" label="Add candidate"
                                   @click="newCandidate"/>
                            <q-btn class="q-ml-sm" color="negative" :disable="candidateLoading"
                                   label="Remove candidates" @click="removeCandidate"/>
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
                                {{ props.row.image ? props.row.image.name : "No image" }}
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
                            :rows="voterRows"
                            :columns="userColumns"
                            row-key="id"
                            :selected-rows-label="getSelectedString"
                            selection="multiple"
                            v-model:selected="selectedVoters"
                            :filter="filter"
                            :loading="voterLoading"
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
                            <q-btn color="green" :disable="voterLoading" label="Add voter"
                                   @click="showVoterAdd"/>
                            <q-btn class="q-ml-sm" color="negative" :disable="voterLoading"
                                   label="Remove voter" @click="removeVoters"/>
                            <q-space/>
                          </template>
                        </q-table>
                      </div>
                    </q-card-section>
                  </q-card>
                </q-card-section>
                <q-card-actions align="center">
                  <q-btn label="Create election" @click="createElection" color="primary"/>
                  <q-btn label="Cancel" class="close" type="reset" color="negative" @click="undoElection"
                        v-close-popup />
                </q-card-actions>
              </q-card>
            </div>
          </div>
        </div>
      </div>
    </q-card-section>
  </q-card>
  <q-dialog v-model="addCandidate">
    <q-card>
      <q-card-section>
        <div class="text-h6">Please insert a new candidate</div>
      </q-card-section>

      <q-card-section class="q-pt-none">
        <q-form
            class="q-gutter-md"
        >
          <q-input v-model="candidateName" type="text" filled hint="Candidate name"
                   :rules="[ val => !!val || 'Candidate name must not be empty']">
          </q-input>
          <q-file
              v-model="candidateImage"
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
        <q-btn flat label="Confirm" color="primary" @click="insertNewCandidate" v-close-popup/>
        <q-btn flat label="Cancel" color="negative" @click="addCandidate=false" v-close-popup/>
      </q-card-actions>
    </q-card>
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
          <q-input v-model="editCandidateName" type="text" filled hint="Candidate name"
                   :rules="[ val => !!val || 'Candidate name must not be empty']">
          </q-input>
          <q-file
              v-model="editCandidateImage"
              label="Choose image (max 2MB)"
              filled
              counter
              clearable
              accept=".jpg, .png, .svg, image/*"
              max-file-size="2097152"
              @rejected="rejectCandidateImage"
          />
        </q-form>
      </q-card-section>

      <q-card-actions align="right">
        <q-btn flat label="Confirm" color="primary" @click="editCandidate"/>
        <q-btn flat label="Cancel" color="negative" @click="addCandidate=false" v-close-popup/>
      </q-card-actions>
    </q-card>
  </q-dialog>
  <q-dialog
      v-model="newVoter"
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
                  ref="votersTableRef"
                  :rows="userRows"
                  :columns="userColumns"
                  row-key="id"
                  :selected-rows-label="getSelectedString"
                  selection="multiple"
                  v-model:selected="newVoterSelected"
                  v-model:pagination="pagination"
                  :filter="filter"
                  :loading="newVoterLoading"
                  binary-state-sort

              >
              </q-table>
            </div>
          </q-card-section>
          <q-card-actions align="center">
            <q-btn label="Add selected voters" type="submit" color="primary" @click="insertNewVoter"/>
            <q-btn label="Cancel" type="reset" color="negative" @click="this.newVoterSelected = []"
                   v-close-popup/>
          </q-card-actions>
        </q-card>
      </div>
    </div>
  </q-dialog>
</template>

<script>
import {onMounted, ref} from "vue";
import moment from "moment";
import {EventBus, exportFile, Notify, useQuasar} from "quasar";
import {v1} from "uuid";
import axios from "axios";
import {useRouter} from "vue-router";

export default {
  name: 'AddElection',
  setup() {
    const router = useRouter();
    const $q = useQuasar()
    const bus = new EventBus()
    const votersTableRef = ref()
    const filter = ref('')
    const startDate = ref('')
    const allowEndDate = ref(true)
    const candidateRows = ref([])
    const selected = ref([])
    const editCandidateName = ref('')
    const editCandidateImage = ref(null)
    const editCandidateId = ref('')
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
    const selectedCandidates = ref([])
    const candidateLoading = ref(false)
    const voterRows = ref([])
    const minEndDate = ref('')
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
    const selectedVoters = ref([])
    const voterLoading = ref(false)
    const userRows = ref([])
    const newVoterSelected = ref([])
    const newVoterLoading = ref(false)
    const editCandidateDialog = ref(false)
    const voterCSV = ref(null)
    const pagination = ref({
      sortBy: 'email',
      descending: false,
      page: 1,
      rowsPerPage: 5
    })

    function confirmDates(date) {
      if (date.length === 0) {
        return true;
      } else {
        return moment(this.startDate).isBefore(date)
      }
    }

    async function getUsers() {
      const uri = 'http://localhost:8080/users/user-list'
      try {
        return await axios.get(uri, {
          headers: {
            "Content-type": "application/json"
          },
          withCredentials: true
        }).then(function (response) {
          for (const user of response.data) {
            userRows.value.push(user)
          }
        }).catch(function (error) {
          console.log(error)
        })
      } catch (err) {
        console.log(err)
      }
    }

    function wrapCsvValue (val, formatFn, row) {
      let formatted = formatFn !== void 0
          ? formatFn(val, row)
          : val

      formatted = formatted === void 0 || formatted === null
          ? ''
          : String(formatted)

      formatted = formatted.split('"').join('""')
      /**
       * Excel accepts \n and \r in strings, but some other CSV parsers do not
       * Uncomment the next two lines to escape new lines
       */
      // .split('\n').join('\\n')
      // .split('\r').join('\\r')

      return `"${formatted}"`
    }

    onMounted(() => {
      // get initial data from server (1st page)
      getUsers()
    })

    return {
      votersTableRef,
      pagination,
      filter,
      electionTitle: ref(''),
      startDate,
      startDateOptions(date) {
        const today = moment().format('YYYY/MM/DD')
        return date >= today
      },
      endDate: ref(''),
      allowEndDate,
      confirmDates,
      endDateOptions(date) {
        const minDate = moment().format('YYYY/MM/DD')
        return date >= minDate
      },
      electionKey: ref(null),
      electionKey1: ref(null),
      isPwd: ref(true),
      isPwd1: ref(true),
      candidateRows,
      candidateColumns,
      editCandidateDialog,
      editCandidateName,
      editCandidateImage,
      editCandidateId,
      selected,
      getSelectedString() {
        return selected.value.length === 0 ? '' : `${selected.value.length} record${selected.value.length > 1 ? 's' : ''} selected of ${candidateRows.length}`
      },
      selectedCandidates,
      candidateLoading,
      voterRows,
      userColumns,
      selectedVoters,
      voterLoading,
      userRows,
      voterCSV,
      addCandidate: ref(false),
      newVoter: ref(false),
      candidateName: ref(null),
      candidateImage: ref(null),
      minEndDate,
      rejectCandidateImage() {
        $q.notify({
          type: 'negative',
          message: `Invalid image, please make sure the image is in accepted format (jpeg, png, svg) and has a size of up to 2MB`
        })
      },
      selected_row: ref({}),
      newVoterSelected,
      newVoterLoading,
      removeCandidate() {
        candidateLoading.value = true
        setTimeout(() => {
          for (const sc of selectedCandidates.value) {
            const index = candidateRows.value.findIndex(object => {
              return object.id === sc.id;
            });
            candidateRows.value.splice(index, 1)
          }
          selectedCandidates.value = []
          candidateLoading.value = false
        }, 500)
      },
      removeVoters() {
        voterLoading.value = true
        setTimeout(() => {
          for (const sv of selectedVoters.value) {
            const index = voterRows.value.findIndex(object => {
              return object.id === sv.id;
            });
            voterRows.value.splice(index, 1);
            userRows.value.push(sv)
          }
          selectedVoters.value = []
          voterLoading.value = false
        }, 500)
      },
      exportTable () {
        // naive encoding to csv format
        const content = [userColumns.map(col => wrapCsvValue(col.label))].concat(
            voterRows.value.map(row => userColumns.map(col => wrapCsvValue(
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
    startDate: function (value) {
      this.allowEndDate = value
      this.minEndDate = moment(value).format('YYYY/MM/DD')
    },
    voterCSV: function (value) {
      if (value !== null) {
        this.addVotersFromCSV(value)
      }
    }
  },
  methods: {
    newCandidate() {
      this.addCandidate = true;
    },
    showVoterAdd() {
      this.newVoter = true;
    },
    insertNewCandidate() {
      this.candidateLoading = true
      setTimeout(() => {
        const candidateName = this.candidateName;
        const candidateImage = this.candidateImage;
        this.candidateRows.push({id: v1(), name: candidateName, image: candidateImage});
        this.candidateName = '';
        this.candidateImage = null;
        this.addCandidate = false;
        this.candidateLoading = false
      }, 500)
    },
    openCandidateEdit(row) {
      this.editCandidateDialog = true
      this.editCandidateName = row.name
      this.editCandidateImage = row.image
      this.editCandidateId = row.id
    },
    editCandidate() {
      if (this.editCandidateName.length > 0) {
        this.candidateLoading = true
        setTimeout(() => {
          const index = this.candidateRows.findIndex((obj => obj.id === this.editCandidateId));
          this.candidateRows[index].name = this.editCandidateName;
          this.candidateRows[index].image = this.editCandidateImage ? this.editCandidateImage : null;
          this.editCandidateDialog = false
          this.candidateLoading = false
        })
      }
    },
    insertNewVoter() {
      this.newVoterLoading = true
      setTimeout(() => {
        for (const nv of this.newVoterSelected) {
          const index = this.userRows.findIndex(object => {
            return object.id === nv.id;
          });
          this.userRows.splice(index, 1)
          this.voterRows.push(nv);
        }
        this.newVoterSelected = []
        this.newVoterLoading = false
      }, 500)
      this.newVoter = false
    },
    createElection() {
      let data = new FormData();
      data.append('title', this.electionTitle)
      data.append('start_date', this.startDate)
      data.append('end_date', this.endDate)
      data.append('key', this.electionKey)
      const start = this.startDate
      const end = this.endDate
      const key = this.electionKey
      const keyConfirm = this.electionKey1
      for (const candidate of this.candidateRows) {
        data.append('candidates[]', JSON.stringify({name: candidate.name, image: candidate.image ? candidate.image.name : null}))
        if(candidate.image) {
          data.append('images', candidate.image)
        }
      }
      for (const voter of this.voterRows) {
        data.append('voters[]', voter.id)
      }
      if (this.candidateRows.length === 0) {
        Notify.create({
          color: 'red-10',
          textColor: 'white',
          icon: 'cancel',
          message: 'Cannot create election; Election must have at least 1 candidate'
        })
      } else {
        if (key !== null && key === keyConfirm && moment(start).isBefore(moment(end))) {
          this.newElection = false
          this.loading = true
          setTimeout(() => {
            const uri = 'http://localhost:8080/elections/'
            axios.post(uri, data, {
              headers: {
                "Content-type": "multipart/form-data"
              },
              withCredentials: true
            }).then(function (response) {
              Notify.create({
                color: 'green-4',
                textColor: 'white',
                icon: 'check',
                message: 'Election created with success'
              })
            }).catch(function (error) {
              if(error.response.status === 406) {
                Notify.create({
                  color: 'red-10',
                  textColor: 'white',
                  icon: 'cancel',
                  message: 'Cannot create election; Candidate images must have unique names'
                })
              } else {
                Notify.create({
                  color: 'red-10',
                  textColor: 'white',
                  icon: 'cancel',
                  message: 'Cannot create election; Errors are present'
                })
              }
            })
          }, 500)
        } else {
          Notify.create({
            color: 'red-10',
            textColor: 'white',
            icon: 'cancel',
            message: 'Cannot create election; Errors are present'
          })
        }
      }
    },
    undoElection() {
      this.electionTitle = ''
      this.startDate = ''
      this.endDate = ''
      this.electionKey = null
      this.electionKey1 = null
      this.candidateRows = []
      this.voterRows = []
    },
    importCSV() {
      this.$refs.file.pickFiles();
    },
    addVotersFromCSV(file) {
      this.voterLoading = true
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
            const user = this.userRows.find(x => x.email === r.email)
            if(user) {
              const index = this.userRows.findIndex(object => {
                return object.id === user.id;
              });
              this.userRows.splice(index, 1);
              this.voterRows.push(user)
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
      this.voterLoading = false
    }
  }
}
</script>