<template>
  <q-layout view="lHh Lpr fff" class="bg-grey-1">
    <q-header elevated class="bg-white text-grey-8" height-hint="64">
      <q-toolbar class="GPL__toolbar" style="height: 64px">
        <q-btn
            v-if="$q.sessionStorage.getItem('permission')"
            flat
            dense
            round
            @click="toggleLeftDrawer"
            aria-label="Menu"
            icon="menu"
            class="q-mx-md"
        />
        <q-avatar>
          <img src="src/assets/ballot.ico">
        </q-avatar>
        <q-toolbar-title v-if="$q.screen.gt.sm" shrink class="row items-center no-wrap">
          <span class="q-ml-sm">Secure Vote</span>
        </q-toolbar-title>

        <q-space/>

        <q-space/>

        <div class="q-gutter-sm row items-center no-wrap">
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
        <div class="row bg-blue-grey-2" style="min-height: 400px; width: 95%; padding: 24px;">
          <div id="parent" class="fit wrap justify-center items-start content-start" style="overflow: hidden;">
            <div class=" bg-grey-6" style="overflow: auto;">
              <q-card class="no-border-radius">
                <q-card-section>
                  <div class="q-pa-md q-gutter-sm">
                    <q-btn color="green" :disable="loading" icon="add" label="Add election" v-if="$q.sessionStorage.getItem('permission') === 'MANAGER'"
                           @click="showElectionWindow"/>
                  </div>
                  <div class="q-pa-md">
                    <q-table
                        flat bordered
                        ref="tableRef"
                        title="Elections"
                        :rows="rows"
                        :columns="columns"
                        row-key="id"
                        v-model:pagination="pagination"
                        :loading="loading"
                        binary-state-sort
                        :filter="filter"
                        @request="onRequest"
                    >
                      <template v-slot:top-right>
                        <div class="gt-md">
                          <div class="q-gutter-lg-x-md">
                            <q-toggle v-model="toggleBefore" @click="customSortMain" :disable="loading"
                                      label="Show not started elections"/>
                            <q-toggle v-model="toggleDuring" @click="customSortMain" :disable="loading"
                                      label="Show ongoing elections"/>
                            <q-toggle v-model="toggleAfter" @click="customSortMain" :disable="loading"
                                      label="Show finished elections"/>
                            <q-input dense debounce="400" color="primary" v-model="searchMain" :disable="loading"
                                     placeholder="Search by election title" @keyup.enter="customSortMain">
                              <template v-slot:append>
                                <q-icon name="close" @click="clearSearchMain" :disable="loading" class="cursor-pointer"/>
                                <q-icon name="search" @click="customSortMain" :disable="loading" class="cursor-pointer"/>
                              </template>
                            </q-input>
                          </div>
                        </div>
                        <div class="lt-lg">
                          <q-btn
                              flat
                              dense
                              round
                              @click="filters = true"
                              aria-label="Filters"
                              icon="tune"
                              class="q-mx-md"
                          />
                        </div>
                      </template>
                      <template v-slot:body="props">
                        <q-tr :props="props">
                          <q-td key="title" :props="props">
                            {{ props.row.title }}
                          </q-td>
                          <q-td key="startDate" :props="props">
                            {{ props.row.startDate }}
                          </q-td>
                          <q-td key="endDate" :props="props">
                            {{ props.row.endDate }}
                          </q-td>
                          <q-td key="actions" :props="props">
                            <q-btn square size="sm" name="edit" color="amber" v-if="$q.sessionStorage.getItem('permission') === 'MANAGER'"
                                   :disable="isAfterStart(props.row.startDate) || loading" label='' icon='edit'
                                   @click="openmodel(props.row)">
                              <q-tooltip>
                                Edit election
                              </q-tooltip>
                            </q-btn>
                            <q-btn square size="sm" name="delete" color="negative" v-if="$q.sessionStorage.getItem('permission') === 'MANAGER'"
                                   :disable="isAfterStart(props.row.startDate) || loading" label='' icon='delete'
                                   @click="deleteElection(props.row)">
                              <q-tooltip>
                                Delete election
                              </q-tooltip>
                            </q-btn>
                            <q-btn square size="sm" name="renew" color="secondary" v-if="$q.sessionStorage.getItem('permission') === 'MANAGER'"
                                   :disable="isAfterStart(props.row.startDate) || loading" label='' icon='key'
                                   @click="regenerateKey(props.row)">
                              <q-tooltip>
                                Regenerate election key
                              </q-tooltip>
                            </q-btn>
                            <q-btn square size="sm" name="renew" color="positive"
                                   :disable="canStatus(props.row.startDate, props.row.endDate) || loading" label=''
                                   icon='query_stats' @click="openElectionStatus(props.row)">
                              <q-tooltip>
                                Show election status
                              </q-tooltip>
                            </q-btn>
                            <q-btn square size="sm" name="results" color="primary" v-if="$q.sessionStorage.getItem('permission') === 'MANAGER'"
                                   :disable="isAfterEnd(props.row.endDate) || loading" label='' icon='data_thresholding'
                                   @click="showResults(props.row)">
                              <q-tooltip>
                                {{ hasResults(props.row.results) ? 'Tally election votes' : 'Tally election votes again' }}
                              </q-tooltip>
                            </q-btn>
                            <q-btn square size="sm" name="results" color="info"
                                   :disable="hasResults(props.row.results) || loading"
                                   label='' icon='summarize' @click="showElectionResults(props.row)">
                              <q-tooltip>
                                Show election results
                              </q-tooltip>
                            </q-btn>
                          </q-td>
                        </q-tr>
                      </template>

                    </q-table>
                    <q-dialog
                        v-model="newElection"
                        persistent
                        :maximized="maximizedToggle"
                        transition-show="slide-up"
                        transition-hide="slide-down"
                    >
                      <AddElection @close-add="closeNewElection"></AddElection>
                    </q-dialog>
                    <q-dialog
                        v-model="editElection"
                        persistent
                        :maximized="maximizedToggle"
                        transition-show="slide-up"
                        transition-hide="slide-down"
                    >
                      <EditElection :id="electionId" @close-edit="closeEditElection"></EditElection>
                    </q-dialog>
                    <q-dialog v-model="deleteConfirm">
                      <q-card>
                        <q-card-section>
                          <div class="text-h6">Delete Election</div>
                        </q-card-section>

                        <q-card-section class="q-pt-none">
                          Are you sure you want to delete election {{ selected_row.title }}?
                        </q-card-section>

                        <q-card-actions align="right">
                          <q-btn flat label="Confirm" color="primary" @click="removeElection(selected_row.id)"
                                 v-close-popup/>
                          <q-btn flat label="Cancel" color="negative" @click="deleteConfirm=false" v-close-popup/>
                        </q-card-actions>
                      </q-card>
                    </q-dialog>
                    <q-dialog v-model="renewKey">
                      <q-card>
                        <q-card-section>
                          <div class="text-h6">Please insert the new election key for election
                            {{ selected_row.title }}
                          </div>
                        </q-card-section>

                        <q-card-section class="q-pt-none">
                          <q-form
                              class="q-gutter-md"
                          >
                            <q-input v-model="newElectionKey" filled label="New election key" hint="A password manager is recommended to safeguard this key"
                                     :type="hideKey ? 'password' : 'text'"
                                     :rules="[ val => !!val || 'Election key must not be empty' ,val => val.length >= 12 || 'Election key must be at least 12 characters long',
              val => val.match('^(?=(.*[a-z]){1,})(?=(.*[A-Z]){1,})(?=(.*[0-9]){1,})(?=(.*[!@#$%^&*()\\-__+.]){1,}).{8,}$') || 'Election key must have upper and lower case characters, special characters and digits',]"
                            >
                              <template v-slot:append>
                                <q-icon
                                    name="refresh"
                                    class="cursor-pointer"
                                    @click="generateElectionKey"
                                ><q-tooltip>
                                  Generate election key
                                </q-tooltip></q-icon>
                                <q-icon
                                    :name="hideKey ? 'visibility_off' : 'visibility'"
                                    class="cursor-pointer"
                                    @click="hideKey = !hideKey"
                                />
                              </template>
                            </q-input>
                            <q-input v-model="newElectionKey1" filled label="Confirm new election key"
                                     :type="hideKey1 ? 'password' : 'text'"
                                     :rules="[ val => !!val || 'Election key must not be empty', val => val.length >= 12 || 'Election key must be at least 12 characters long',
              val => val.match('^(?=(.*[a-z]){1,})(?=(.*[A-Z]){1,})(?=(.*[0-9]){1,})(?=(.*[!@#$%^&*()\\-__+.]){1,}).{8,}$') || 'Election key must have upper and lower case characters, special characters and digits', val => val === newElectionKey || 'Election key must be the same as above']"
                            >
                              <template v-slot:append>
                                <q-icon
                                    :name="hideKey1 ? 'visibility_off' : 'visibility'"
                                    class="cursor-pointer"
                                    @click="hideKey1 = !hideKey1"
                                />
                              </template>
                            </q-input>
                          </q-form>
                        </q-card-section>

                        <q-card-actions align="right">
                          <q-btn flat label="Confirm" color="primary" @click="renewElectionKey(selected_row.id)"/>
                          <q-btn flat label="Cancel" color="negative" @click="newElectionKey='';newElectionKey1='';renewKey=false;"/>
                        </q-card-actions>
                      </q-card>
                    </q-dialog>
                    <q-dialog v-model="electionResults">
                      <q-card>
                        <q-card-section>
                          <div class="text-h6">Please insert the election key for election {{ selected_row.title }}
                          </div>
                        </q-card-section>

                        <q-card-section class="q-pt-none">
                          <q-form
                              class="q-gutter-md"
                          >
                            <q-input v-model="resultsElectionKey" filled label="Election key"
                                     :type="hideResultsKey ? 'password' : 'text'"
                                     :rules="[ val => !!val || 'Election key must not be empty', val => val.length >= 12 || 'Election key must be at least 12 characters long',
              val => val.match('^(?=(.*[a-z]){1,})(?=(.*[A-Z]){1,})(?=(.*[0-9]){1,})(?=(.*[!@#$%^&*()\\-__+.]){1,}).{8,}$') || 'Election key must have upper and lower case characters, special characters and digits']"
                            >
                              <template v-slot:append>
                                <q-icon
                                    :name="hideResultsKey ? 'visibility_off' : 'visibility'"
                                    class="cursor-pointer"
                                    @click="hideResultsKey = !hideResultsKey"
                                />
                              </template>
                            </q-input>
                          </q-form>
                        </q-card-section>

                        <q-card-actions align="right">
                          <q-btn flat label="Confirm" color="primary" @click="countElectionResults(selected_row.id)"/>
                          <q-btn flat label="Cancel" color="negative"
                                 @click="resultsElectionKey='';electionResults=false"/>
                        </q-card-actions>
                      </q-card>
                    </q-dialog>
                    <q-dialog
                        v-model="electionStatus"
                        persistent
                        :maximized="maximizedToggle"
                        transition-show="slide-up"
                        transition-hide="slide-down"
                    >
                      <ElectionStatus :id="electionId" :title="electionTitle"></ElectionStatus>
                    </q-dialog>
                    <q-dialog
                        v-model="electionResultsShow"
                        persistent
                        :maximized="maximizedToggle"
                        transition-show="slide-up"
                        transition-hide="slide-down"
                    >
                      <ElectionResults :id="electionId" :title="electionTitle"></ElectionResults>
                    </q-dialog>
                  </div>
                </q-card-section>
              </q-card>
            </div>
          </div>
        </div>
      </div>
      <q-page-sticky v-if="$q.screen.gt.sm" expand position="left">
        <div class="fit q-pt-xl q-px-sm column">
          <q-btn v-if="permission" round flat color="grey-8" stack no-caps size="26px"
                 class="GPL__side-btn" @click="$router.push('elections')">
            <q-icon size="22px" name="ballot"/>
            <div class="GPL__side-btn__label">Elections</div>
          </q-btn>

          <q-btn v-if="permission === 'MANAGER' || permission === 'AUDITOR'" round flat color="grey-8" stack no-caps
                 size="26px" class="GPL__side-btn" @click="$router.push('election-manager')">
            <q-icon size="22px" name="edit_document"/>
            <div class="GPL__side-btn__label">Election Manager</div>
          </q-btn>

          <q-btn v-if="permission === 'AUDITOR'" round flat color="grey-8" stack no-caps
                 size="26px" class="GPL__side-btn" @click="$router.push('auditing')">
            <q-icon size="22px" name="fact_check"/>
            <div class="GPL__side-btn__label">Auditing</div>
          </q-btn>

          <q-btn v-if="permission === 'ADMIN'" round flat color="grey-8" stack no-caps
                 size="26px" class="GPL__side-btn" @click="$router.push('admin')">
            <q-icon size="22px" name="admin_panel_settings"/>
            <div class="GPL__side-btn__label">Admin</div>
          </q-btn>
        </div>
      </q-page-sticky>
    </q-page-container>
    <q-drawer
        v-model="leftDrawerOpen"
        bordered
        behavior="mobile"
        @click="leftDrawerOpen = false"
    >
      <q-scroll-area class="fit">
        <q-toolbar class="GPL__toolbar">
          <q-toolbar-title class="row items-center text-grey-8">
            <img class="q-pl-md" src="src/assets/ballot.ico">
            <span class="q-ml-sm">Secure Vote</span>
          </q-toolbar-title>
        </q-toolbar>

        <q-list padding>
          <div v-if="permission">
            <q-item clickable class="GPL__drawer-item" @click="$router.push('elections')">
              <q-item-section avatar>
                <q-icon name="ballot" />
              </q-item-section>
              <q-item-section>
                <q-item-label>Elections</q-item-label>
              </q-item-section>
            </q-item>

            <q-separator class="q-my-md" />
          </div>
          <div v-if="permission === 'MANAGER' || permission === 'AUDITOR'">
            <q-item clickable class="GPL__drawer-item" @click="$router.push('election-manager')">
              <q-item-section avatar>
                <q-icon name="edit_document" />
              </q-item-section>
              <q-item-section>
                <q-item-label>Election Manager</q-item-label>
              </q-item-section>
            </q-item>

            <q-separator class="q-my-md" />
          </div>
          <div v-if="permission === 'AUDITOR'">
            <q-item clickable class="GPL__drawer-item" @click="$router.push('auditing')">
              <q-item-section avatar>
                <q-icon name="fact_check" />
              </q-item-section>
              <q-item-section>
                <q-item-label>Auditing</q-item-label>
              </q-item-section>
            </q-item>

            <q-separator class="q-my-md" />
          </div>
          <div v-if="permission === 'ADMIN'">
            <q-item clickable class="GPL__drawer-item" @click="$router.push('admin')">
              <q-item-section avatar>
                <q-icon name="admin_panel_settings" />
              </q-item-section>
              <q-item-section>
                <q-item-label>Admin</q-item-label>
              </q-item-section>
            </q-item>

            <q-separator class="q-my-md" />
          </div>

        </q-list>
      </q-scroll-area>
    </q-drawer>
  </q-layout>
  <q-dialog v-model="settings" position="right">
    <q-card style="width: 350px">

      <q-card-section class="row items-center no-wrap">
        <div class="column items-center">
          <q-avatar size="72px">
            <img :src="avatar">
          </q-avatar>

          <div class="text-subtitle1 q-mt-md q-mb-xs">{{ $q.sessionStorage.getItem('display') }}</div>
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
  <q-dialog v-model="filters">
    <q-card style="width: 100%" class="q-px-sm q-pb-md">
      <q-card-section>
        <div class="text-h6">Filters</div>
      </q-card-section>
      <q-item dense>
        <q-card-section>
          <q-toggle v-model="toggleBefore" @click="customSortMain" :disable="loading"
                    label="Show not started elections"/>
        </q-card-section>
        <q-card-section>
          <q-toggle v-model="toggleDuring" @click="customSortMain" :disable="loading"
                    label="Show ongoing elections"/>
        </q-card-section>
      </q-item>
      <q-item dense>
        <q-card-section>
          <q-toggle v-model="toggleAfter" @click="customSortMain" :disable="loading"
                    label="Show finished elections"/>
        </q-card-section>
        <q-card-section>
          <q-input dense debounce="400" color="primary" v-model="searchMain" :disable="loading"
                   placeholder="Search by election title" @keyup.enter="customSortMain">
            <template v-slot:append>
              <q-icon name="close" @click="clearSearchMain" :disable="loading" class="cursor-pointer"/>
              <q-icon name="search" @click="customSortMain" :disable="loading" class="cursor-pointer"/>
            </template>
          </q-input>
        </q-card-section>
      </q-item>
    </q-card>
  </q-dialog>
</template>

<script>
import {onMounted, ref} from 'vue'
import {Cookies, Notify, QSpinnerGears, SessionStorage, useQuasar} from 'quasar'
import {ArcElement, Chart as ChartJS, Legend, Tooltip} from 'chart.js'
import moment from 'moment'
import axios from "axios";
import AddElection from "@/components/AddElection.vue";
import EditElection from "@/components/EditElection.vue";
import ElectionStatus from "./ElectionStatus.vue";
import ElectionResults from "./ElectionResults.vue";
import {useRouter} from "vue-router";
import api_routes from "../../config/routes.config";
import generator from "generate-password";

const router = useRouter();

ChartJS.register(ArcElement, Tooltip, Legend)

const columns = [
  {
    name: 'title',
    required: true,
    label: 'Title',
    align: 'left',
    field: row => row.title,
    format: val => `${val}`,
    sortable: true
  },
  {name: 'startDate', align: 'center', label: 'Start Date', field: 'startDate', sortable: true},
  {name: 'endDate', align: 'center', label: 'End Date', field: 'endDate', sortable: true},
  {name: 'actions', align: 'right', label: 'Actions', field: 'actions', sortable: false},
]

const candidateColumns = [
  {
    name: 'name',
    required: true,
    label: 'Name',
    align: 'center',
    field: row => row.name,
    format: val => `${val}`,
    sortable: true
  }
]

const userColumns = [
  {
    name: 'displayName',
    required: true,
    label: 'Display Name',
    align: 'center',
    field: row => row.displayName,
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

const userRows = [
  {id: 1, displayName: 'A', email: 'a@a.a'},
  {id: 2, displayName: 'B', email: 'b@b.b'},
  {id: 3, displayName: 'C', email: 'c@c.c'},
]

const abstainData = {
  labels: ['Votes', 'Abstention'],
  datasets: [
    {
      backgroundColor: ['#41B883', '#E46651'],
      data: [40, 10]
    }
  ]
}
const abstainOptions = {
  responsive: true,
  maintainAspectRatio: false
}

const chartData = {
  labels: ['candidate1', 'candidate2', 'candidate3'],
  datasets: [
    {
      backgroundColor: ['#41B883', '#E46651', '#00D8FF'],
      data: [13, 17, 10]
    }
  ]
}
const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
}

let originalRows = []


export default {
  name: 'ElectionManager',
  components: {
    ElectionResults,
    ElectionStatus,
    EditElection,
    AddElection,
  },
  setup() {
    const $q = useQuasar()
    const router = useRouter()
    const permission = ref('')
    const tableRef = ref()
    const leftDrawerOpen = ref(false)
    const filter = ref('')
    const loading = ref(false)
    const rows = ref([])
    const startRows = ref([])
    const selected = ref([])
    const settings = ref(false)
    const avatar = ref(null)
    const electionId = ref('')
    const electionTitle = ref('')
    const renewKey = ref(false)
    const newElectionKey = ref('')
    const newElectionKey1 = ref('')
    const toggleBefore = ref(true)
    const toggleDuring = ref(true)
    const toggleAfter = ref(true)
    const searchMain = ref('')
    const searchCandidate = ref('')
    const deleteConfirm = ref(false)
    const resultsElectionKey = ref('')
    const electionResults = ref(false)
    const newElection = ref(false)
    const editElection = ref(false)
    const pagination = ref({
      sortBy: 'title',
      descending: false,
      page: 1,
      rowsPerPage: 5,
      rowsNumber: 10
    })

    function toggleLeftDrawer () {
      leftDrawerOpen.value = !leftDrawerOpen.value
    }

    function confirmDates(date, type) {
      if (date.length === 0) {
        return true;
      } else {
        if (type === 'INSERT') {
          return moment(this.startDate).isBefore(date)
        }
        if (type === 'EDIT') {
          return moment(this.editStartDate).isBefore(date)
        }
      }
    }

    function isAfterStart(date) {
      return moment().isAfter(moment(date, 'DD-MM-YYYY HH:mm'));
    }

    function isAfterEnd(date) {
      return !moment().isAfter(moment(date, 'DD-MM-YYYY HH:mm'));
    }

    function hasResults(results) {
      return !results;
    }

    function canStatus(start, end) {
      return !(moment().isAfter(moment(start, 'DD-MM-YYYY HH:mm')) && moment().isBefore(moment(end, 'DD-MM-YYYY HH:mm')));
    }

    async function getElections() {
      const uri = `${api_routes.MAIN_URI}/elections/manager`
      try {
        return await axios.get(uri, {
          headers: {
            "Content-type": "application/json"
          },
          withCredentials: true
        }).then(function (response) {
          originalRows = response.data
        }).catch(function (error) {
          if (error.response.status === 403 || error.response.status === 401) {
            router.push({name: 'AccessDenied'})
          } else {
            router.push({name: 'Error'})
          }
        })
      } catch (err) {
        console.log(err)
      }
    }

    async function electionDelete(id) {
      const uri = `${api_routes.MAIN_URI}/elections/${id}`
      return await axios.delete(uri, {
        headers: {
          "Content-type": "application/json"
        },
        withCredentials: true
      }).then(function (response) {
        deleteConfirm.value = false
        $q.notify({
          color: 'green-4',
          textColor: 'white',
          icon: 'check',
          message: `Election deleted with success`
        })
        getElections()
        onRequest({filter: filter.value, pagination: pagination.value})
      }).catch(function (error) {
        if(error.response.status === 400) {
          deleteConfirm.value = false
          $q.notify({
            color: 'red-10',
            textColor: 'white',
            icon: 'cancel',
            message: 'Error deleting election; Please try again later'
          })
        } else {
          if (error.response.status === 403 || error.response.status === 401) {
            router.push({name: 'AccessDenied'})
          } else {
            router.push({name: 'Error'})
          }
        }
      })
    }

    async function regenerateKey(id, key) {
      const uri = `${api_routes.MAIN_URI}/elections/${id}`;
      const data = {key: key};
      return await axios.patch(uri, data, {
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

    async function countVotes(id, data) {
      const uri = `${api_routes.MAIN_URI}/vote/count/${id}`
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

    function fetchFromServer(startRow, count, filter, sortBy, descending) {
      const data = filter
          ? originalRows.filter(row => row.title.includes(filter))
          : originalRows.slice()

      // handle sortBy
      if (sortBy) {
        const sortFn = (descending
                ? (a, b) => (a[sortBy] > b[sortBy] ? -1 : a[sortBy] < b[sortBy] ? 1 : 0)
                : (a, b) => (a[sortBy] > b[sortBy] ? 1 : a[sortBy] < b[sortBy] ? -1 : 0)
        )
        data.sort(sortFn)
      }

      return data.slice(startRow, startRow + count)
    }

    // emulate 'SELECT count(*) FROM ...WHERE...'
    function getRowsNumberCount(filter) {
      if (!filter) {
        return originalRows.length
      }
      let count = 0
      originalRows.forEach(treat => {
        if (treat.name.includes(filter)) {
          ++count
        }
      })
      return count
    }

    function onRequest(props) {
      const {page, rowsPerPage, sortBy, descending} = props.pagination
      const filter = props.filter

      loading.value = true

      // emulate server
      setTimeout(() => {
        // update rowsCount with appropriate value
        pagination.value.rowsNumber = getRowsNumberCount(filter)

        // get all rows if "All" (0) is selected
        const fetchCount = rowsPerPage === 0 ? pagination.value.rowsNumber : rowsPerPage

        // calculate starting row of data
        const startRow = (page - 1) * rowsPerPage

        // fetch data from "server"
        const returnedData = fetchFromServer(startRow, fetchCount, filter, sortBy, descending)

        // clear out existing data and add new
        rows.value.splice(0, rows.value.length, ...returnedData)
        startRows.value.splice(0, rows.value.length, ...returnedData)

        // don't forget to update local pagination object
        pagination.value.page = page
        pagination.value.rowsPerPage = rowsPerPage
        pagination.value.sortBy = sortBy
        pagination.value.descending = descending

        // ...and turn of loading indicator
        loading.value = false
      }, 500)
    }

    onMounted(() => {
      permission.value = $q.sessionStorage.getItem('permission')
      getElections()
      avatar.value = $q.sessionStorage.getItem('avatar') ? `${api_routes.AVATAR_URI}/${$q.sessionStorage.getItem('avatar')}` : `/src/assets/user-icon.jpg`
      tableRef.value.requestServerInteraction()
    })

    return {
      tableRef,
      permission,
      leftDrawerOpen,
      toggleLeftDrawer,
      filters: ref(false),
      filter,
      loading,
      pagination,
      columns,
      rows,
      startRows,
      candidateColumns,
      selected,
      avatar,
      isAfterStart,
      isAfterEnd,
      canStatus,
      hasResults,
      onRequest,
      userColumns,
      userRows,
      toggleBefore,
      toggleDuring,
      toggleAfter,
      searchMain,
      searchCandidate,
      maximizedToggle: ref(true),
      confirmDates,
      editElection,
      newElection,
      selected_row: ref({}),
      deleteConfirm,
      ph: ref(''),
      renewKey,
      electionResults,
      electionResultsShow: ref(false),
      chartData,
      chartOptions,
      abstainData,
      abstainOptions,
      settings,
      openSettings() {
        settings.value = true
      },
      newElectionKey,
      newElectionKey1,
      hideKey: ref(true),
      hideKey1: ref(true),
      hideResultsKey: ref(true),
      resultsElectionKey,
      electionStatus: ref(false),
      electionId,
      electionTitle,
      removeElection(id) {
        electionDelete(id)
      },
      renewElectionKey(id) {
        const key = newElectionKey.value
        const confirmKey = newElectionKey1.value
        if (key === confirmKey) {
          $q.loading.show({
            message: 'Key regeneration in progress, please wait...',
            spinner: QSpinnerGears,
          })
          setTimeout(() => {
            regenerateKey(id, key).then(response => {
              if(response.response) {
                if(response.response.status === 400) {
                  $q.loading.hide()
                  $q.notify({
                    color: 'red-10',
                    textColor: 'white',
                    icon: 'cancel',
                    message: 'Cannot change key; Election is ongoing or has already finished'
                  })
                }
                if(response.response.status === 401) {
                  $q.loading.hide()
                  router.push({name: 'AccessDenied'})
                }
                if(response.response.status === 500) {
                  $q.loading.hide()
                  $q.notify({
                    color: 'red-10',
                    textColor: 'white',
                    icon: 'cancel',
                    message: 'An error has occurred; Please try again later'
                  })
                } else {
                  $q.loading.hide()
                  $q.notify({
                    color: 'red-10',
                    textColor: 'white',
                    icon: 'cancel',
                    message: 'An error has occurred; Please try again later'
                  })
                }
              } else {
                newElectionKey.value = null
                newElectionKey1.value = null
                $q.loading.hide()
                $q.notify({
                  color: 'green-4',
                  textColor: 'white',
                  icon: 'check',
                  message: `Election key changed with success`
                })
                renewKey.value = false
              }
            }).catch(error => {
              $q.notify({
                color: 'red-10',
                textColor: 'white',
                icon: 'cancel',
                message: 'An error has occurred; Please try again later'
              })
            })
          }, 500)
        } else {
          $q.notify({
            color: 'red-10',
            textColor: 'white',
            icon: 'cancel',
            message: 'Cannot change election key; Both fields must have the same value'
          })
        }
      },
      countElectionResults(id) {
        const key = resultsElectionKey.value
        if (key.length >= 12) {
          if (key.match('^(?=(.*[a-z]){1,})(?=(.*[A-Z]){1,})(?=(.*[0-9]){1,})(?=(.*[!@#$%^&*()\\-__+.]){1,}).{8,}$')) {
            const data = {key: key}
            $q.loading.show({
              message: 'Tallying election votes, please wait...',
              spinner: QSpinnerGears,
            })
            countVotes(id, data).then(function (response) {
              if (response.response) {
                if(response.response.status === 400) {
                  electionResults.value = false
                  resultsElectionKey.value = ''
                  Notify.create({
                    color: 'red-10',
                    textColor: 'white',
                    icon: 'cancel',
                    message: 'Cannot tally election votes; Please try again later'
                  })
                } else {
                  Notify.create({
                    color: 'red-10',
                    textColor: 'white',
                    icon: 'cancel',
                    message: 'Cannot tally election votes; Election key is not correct'
                  })
                }
              } else {
                if(response.data) {
                  if(response.data.detection) {
                    Notify.create({
                      color: 'green-4',
                      textColor: 'white',
                      icon: 'check',
                      message: `Election votes tallied with success`
                    })
                    Notify.create({
                      color: 'red-10',
                      textColor: 'white',
                      icon: 'warning',
                      message: 'Possible fraud detected; Audit is recommended'
                    })
                  } else {
                    Notify.create({
                      color: 'green-4',
                      textColor: 'white',
                      icon: 'check',
                      message: `Election votes tallied with success`
                    })
                  }
                }
                resultsElectionKey.value = ''
                electionResults.value = false
                loading.value = true
                setTimeout(() => {
                  getElections()
                  onRequest({filter: filter.value, pagination: pagination.value})
                }, 500)
                loading.value = false
              }
            }).catch(function (error) {
              Notify.create({
                color: 'red-10',
                textColor: 'white',
                icon: 'cancel',
                message: 'Cannot tally election votes; Please try again later'
              })
            }).finally(() => {
              $q.loading.hide()
            })
          } else {
            Notify.create({
              color: 'red-10',
              textColor: 'white',
              icon: 'cancel',
              message: 'Cannot tally election votes; Election key must have upper and lower case characters, special characters and digits'
            })
          }
        } else {
          Notify.create({
            color: 'red-10',
            textColor: 'white',
            icon: 'cancel',
            message: 'Cannot tally election votes; Election key must be at least 12 characters long'
          })
        }
      },
      closeNewElection() {
        newElection.value = false
        $q.notify({
          color: 'green-4',
          textColor: 'white',
          icon: 'check',
          message: 'Election created with success'
        })
        loading.value = true
        setTimeout(() => {
          getElections()
          onRequest({filter: filter.value, pagination: pagination.value})
        }, 500)
        loading.value = false
      },
      closeEditElection() {
        editElection.value = false
        $q.notify({
          color: 'green-4',
          textColor: 'white',
          icon: 'check',
          message: 'Election edited with success'
        })
        loading.value = true
        setTimeout(() => {
          getElections()
          onRequest({filter: filter.value, pagination: pagination.value})
        }, 500)
        loading.value = false
      },
      generateElectionKey() {
        newElectionKey.value = generator.generate({
          length: 12,
          numbers: true,
          symbols: true,
          exclude: '<>,;.:`´^~/|"',
          strict: true
        })
      }
    }
  },
  watch: {},
  methods: {
    openmodel(row) {
      this.selected_row = row;
      this.electionId = row.id;
      this.editElection = true;
    },
    deleteElection(row) {
      this.selected_row = row;
      this.deleteConfirm = true;
    },
    regenerateKey(row) {
      this.selected_row = row;
      this.renewKey = true;
    },
    showResults(row) {
      this.selected_row = row;
      this.electionId = row.id;
      this.electionResults = true;
    },
    showElectionWindow() {
      this.newElection = true;
    },
    showElectionResults(row) {
      this.selected_row = row;
      this.electionId = row.id;
      this.electionTitle = row.title
      this.electionResultsShow = true;
    },
    logout() {
      SessionStorage.set('permission', '');
      SessionStorage.set('id', '');
      SessionStorage.set('avatar', '');
      SessionStorage.set('display', '');
      Cookies.remove('token');
      this.$router.push('login');
    },
    openElectionStatus(row) {
      this.selected_row = row
      this.electionId = row.id;
      this.electionTitle = row.title
      this.electionStatus = true
    },
    customSortMain() {
      this.loading = true
      setTimeout(() => {
        let filteredRows = []
        const today = moment()
        const data = this.startRows
        if (this.toggleBefore) {
          const filtered = data.filter(obj =>
              moment(obj.startDate, 'DD-MM-YYYY HH:mm').isAfter(today)
          )
          filteredRows.push(...filtered)
        }
        if (this.toggleDuring) {
          const filtered = data.filter(obj =>
              today.isBetween(moment(obj.startDate, 'DD-MM-YYYY HH:mm'), moment(obj.endDate, 'DD-MM-YYYY HH:mm'))
          )
          filteredRows.push(...filtered)
        }
        if (this.toggleAfter) {
          const filtered = data.filter(obj =>
              moment(obj.endDate, 'DD-MM-YYYY HH:mm').isBefore(today)
          )
          filteredRows.push(...filtered)
        }
        if (this.searchMain) {
          filteredRows = filteredRows.filter(obj =>
              obj.title.toLowerCase().includes(this.searchMain.toLowerCase())
          )
        }
        this.rows = filteredRows
        this.loading = false
      }, 500)
    },
    clearSearchMain() {
      this.searchMain = ''
      this.customSortMain()
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