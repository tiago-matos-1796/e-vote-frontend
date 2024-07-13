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
                  <div class="q-pa-md row justify-left items-start q-gutter-lg">
                    <div class="text-h6">Secure Vote Logs</div>
                    <q-btn color="deep-orange" :disable="loading" icon="report" label="Fraudulent elections"
                           @click="showFrauds"/>
                  </div>
                </q-card-section>
                <q-card-section>
                  <div class="q-pa-md">
                    <div class="q-gutter-y-md">
                      <q-card>
                        <q-tabs
                            v-model="tab"
                            dense
                            class="text-grey"
                            active-color="primary"
                            indicator-color="primary"
                            align="justify"
                            narrow-indicator
                        >
                          <q-tab name="internalLogs" label="Internal Logs"/>
                          <q-tab name="electionLogs" label="Election Logs"/>
                        </q-tabs>

                        <q-separator/>

                        <q-tab-panels v-model="tab" animated>
                          <q-tab-panel name="internalLogs">
                            <div class="q-pa-md">
                              <q-table
                                  flat bordered
                                  ref="tableRef"
                                  title=""
                                  :rows="rows"
                                  :columns="internalColumns"
                                  row-key="id"
                                  :filter="filter"
                                  :loading="loading"
                                  v-model:pagination="pagination"
                                  @request="onRequest"
                              >

                                <template v-slot:top-right>
                                  <q-input dense debounce="400" color="primary" v-model="filter"
                                           placeholder="Search log">
                                    <template v-slot:append>
                                      <q-icon name="search"/>
                                    </template>
                                  </q-input>
                                </template>

                              </q-table>
                            </div>
                          </q-tab-panel>

                          <q-tab-panel name="electionLogs">
                            <div class="q-pa-md">
                              <q-table
                                  flat bordered
                                  ref="electionTableRef"
                                  title=""
                                  :rows="electionRows"
                                  :columns="electionsColumns"
                                  row-key="id"
                                  binary-state-sort
                                  :loading="electionLoading"
                                  v-model:pagination="electionsPagination"
                              >
                                <template v-slot:top-right>
                                  <div class="gt-md">
                                  <div class="q-gutter-lg-x-md">
                                    <q-toggle v-model="toggleNone" @click="customSort" label="Show none"/>
                                    <q-toggle v-model="toggleLow" @click="customSort" label="Show low"/>
                                    <q-toggle v-model="toggleMedium" @click="customSort" label="Show medium"/>
                                    <q-toggle v-model="toggleHigh" @click="customSort" label="Show high"/>
                                    <q-input dense debounce="400" color="primary" v-model="search"
                                             placeholder="Search by election" @keyup.enter="customSort">
                                      <template v-slot:append>
                                        <q-icon name="close" @click="clearSearch" class="cursor-pointer"/>
                                        <q-icon name="search" @click="customSort" class="cursor-pointer"/>
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
                              </q-table>
                            </div>
                          </q-tab-panel>
                        </q-tab-panels>
                      </q-card>
                    </div>
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
            <img class="q-pl-md" src="src/assets/UAlg-ico.ico">
            <span class="q-ml-sm">UAlg Secure Vote</span>
          </q-toolbar-title>
        </q-toolbar>

        <q-list padding>
          <div v-if="permission">
            <q-item clickable class="GPL__drawer-item" @click="$router.push('elections')">
              <q-item-section avatar>
                <q-icon name="ballot"/>
              </q-item-section>
              <q-item-section>
                <q-item-label>Elections</q-item-label>
              </q-item-section>
            </q-item>

            <q-separator class="q-my-md"/>
          </div>
          <div v-if="permission === 'MANAGER' || permission === 'AUDITOR'">
            <q-item clickable class="GPL__drawer-item" @click="$router.push('election-manager')">
              <q-item-section avatar>
                <q-icon name="edit_document"/>
              </q-item-section>
              <q-item-section>
                <q-item-label>Election Manager</q-item-label>
              </q-item-section>
            </q-item>

            <q-separator class="q-my-md"/>
          </div>
          <div v-if="permission === 'AUDITOR'">
            <q-item clickable class="GPL__drawer-item" @click="$router.push('auditing')">
              <q-item-section avatar>
                <q-icon name="fact_check"/>
              </q-item-section>
              <q-item-section>
                <q-item-label>Auditing</q-item-label>
              </q-item-section>
            </q-item>

            <q-separator class="q-my-md"/>
          </div>
          <div v-if="permission === 'ADMIN'">
            <q-item clickable class="GPL__drawer-item" @click="$router.push('admin')">
              <q-item-section avatar>
                <q-icon name="admin_panel_settings"/>
              </q-item-section>
              <q-item-section>
                <q-item-label>Admin</q-item-label>
              </q-item-section>
            </q-item>

            <q-separator class="q-my-md"/>
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
  <q-dialog
      v-model="frauds"
      persistent
      full-width
  >
    <div class="flex flex-center column">
      <div id="parent" class="fit wrap justify-center items-start content-start"
           style="overflow: hidden;">
        <q-card class="no-border-radius">
          <q-toolbar>
            <q-toolbar-title><span class="text-weight-bold">Fraudulent Elections</span>
            </q-toolbar-title>
            <q-btn flat round dense icon="close" v-close-popup/>
          </q-toolbar>
          <q-card-section>
            <div class="q-pa-md">
              <q-table
                  flat bordered
                  :rows="fraudElections"
                  :columns="fraudColumns"
                  row-key="id"
                  v-model:pagination="fraudPagination"
                  :filter="filter"
                  :loading="fraudLoading"
                  binary-state-sort

              >
                <template v-slot:body="props">
                  <q-tr :props="props">
                    <q-td key="title" :props="props">
                      {{ props.row.title }}
                    </q-td>
                    <q-td key="startDate" :props="props">
                      {{ props.row.start_date }}
                    </q-td>
                    <q-td key="endDate" :props="props">
                      {{ props.row.end_date }}
                    </q-td>
                    <q-td key="actions" :props="props">
                      <q-btn square size="sm" name="deny" color="primary"
                             :disable="fraudLoading" label='' icon='do_not_disturb_off'
                             @click="showReason(props.row)">
                        <q-tooltip>
                          Deny fraud
                        </q-tooltip>
                      </q-btn>
                    </q-td>
                  </q-tr>
                </template>
              </q-table>
            </div>
          </q-card-section>
          <q-card-actions align="center">
            <q-btn label="Close" color="negative"
                   v-close-popup/>
          </q-card-actions>
        </q-card>
      </div>
    </div>
  </q-dialog>
  <q-dialog v-model="denyReason">
    <q-card>
      <q-card-section>
        <div class="text-h6">Please insert the reason for the denial of fraud of election {{ selectedFraud.title }}
        </div>
      </q-card-section>

      <q-card-section class="q-pt-none">
        <q-form
            class="q-gutter-md"
        >
          <q-input v-model="reason" type="email" filled label="Reason"
                   :rules="[ val => !!val || 'Field must not be empty']">
          </q-input>
        </q-form>
      </q-card-section>

      <q-card-actions align="right">
        <q-btn flat label="Confirm" color="primary" @click="denyFraud(selectedFraud)"/>
        <q-btn flat label="Cancel" color="negative" @click="denyReason=false;reason=''" v-close-popup/>
      </q-card-actions>
    </q-card>
  </q-dialog>
  <q-dialog v-model="filters">
    <q-card style="width: 100%" class="q-px-sm q-pb-md">
      <q-card-section>
        <div class="text-h6">Filters</div>
      </q-card-section>
      <q-item dense>
        <q-card-section>
          <q-toggle v-model="toggleNone" @click="customSort" label="Show none"/>
        </q-card-section>
        <q-card-section>
          <q-toggle v-model="toggleLow" @click="customSort" label="Show low"/>
        </q-card-section>
      </q-item>
      <q-item dense>
        <q-card-section>
          <q-toggle v-model="toggleMedium" @click="customSort" label="Show medium"/>
        </q-card-section>
        <q-card-section>
          <q-toggle v-model="toggleHigh" @click="customSort" label="Show high"/>
        </q-card-section>
      </q-item>
      <q-item dense>
        <q-card-section>
          <q-input dense debounce="400" color="primary" v-model="search"
                   placeholder="Search by election" @keyup.enter="customSort">
            <template v-slot:append>
              <q-icon name="close" @click="clearSearch" class="cursor-pointer"/>
              <q-icon name="search" @click="customSort" class="cursor-pointer"/>
            </template>
          </q-input>
        </q-card-section>
      </q-item>
    </q-card>
  </q-dialog>
</template>

<script>
import {onMounted, ref} from 'vue'
import {Cookies, Notify, SessionStorage, useQuasar} from "quasar";
import axios from "axios";
import api_routes from "../../config/routes.config";
import {useRouter} from "vue-router";

const electionsColumns = [
  {
    name: 'election_title',
    required: true,
    label: 'Election',
    align: 'left',
    field: row => row.election_title,
    format: val => `${val}`,
    sortable: true
  },
  {name: 'log', align: 'center', label: 'Log', field: 'log', sortable: true},
  {name: 'log_creation', label: 'Created at', field: 'log_creation', sortable: true},
  {name: 'severity', label: 'Severity', field: 'severity', sortable: true}
]

const internalColumns = [
  {name: 'log', align: 'center', label: 'Log', field: 'log', sortable: true},
  {name: 'log_creation', label: 'Created at', field: 'log_creation', sortable: true},
]

const fraudColumns = [
  {name: 'title', align: 'left', label: 'Election', field: 'title', sortable: true},
  {name: 'startDate', align: 'center', label: 'Start Date', field: 'startDate', sortable: true},
  {name: 'endDate', align: 'center', label: 'End Date', field: 'endDate', sortable: true},
  {name: 'actions', align: 'right', label: 'Actions', field: 'actions', sortable: false},
]

const internalRows = []

let originalRows = []

export default {
  name: "Auditing",

  setup() {
    const $q = useQuasar()
    const router = useRouter();
    const permission = ref('')
    const tableRef = ref()
    const leftDrawerOpen = ref(false)
    const electionTableRef = ref()
    const settings = ref(false)
    const avatar = ref(null)
    const internalFilter = ref('')
    const loading = ref(false)
    const fraudLoading = ref(false)
    const filter = ref('')
    const toggleNone = ref(true)
    const rows = ref([])
    const startRows = ref([])
    const electionRows = ref([])
    const startElectionRows = ref([])
    const toggleLow = ref(true)
    const toggleMedium = ref(true)
    const toggleHigh = ref(true)
    const search = ref('')
    const electionLoading = ref(false)
    const frauds = ref(false)
    const fraudElections = ref([])
    const denyReason = ref(false)
    const selectedFraud = ref(null)
    const reason = ref('')
    const pagination = ref({
      sortBy: 'log_creation',
      descending: true,
      page: 1,
      rowPerPage: 10,
      rowsNumber: 10
    })
    const electionsPagination = ref({
      sortBy: 'log_creation',
      descending: true,
      page: 1,
      rowPerPage: 10
    })
    const fraudPagination = ref({
      sortBy: 'title',
      descending: true,
      page: 1,
      rowPerPage: 10
    })

    function toggleLeftDrawer() {
      leftDrawerOpen.value = !leftDrawerOpen.value
    }

    async function getLogs() {
      const uri = `${api_routes.MAIN_URI}/log`
      return await axios.get(uri, {
        headers: {
          "Content-type": "application/json"
        },
        withCredentials: true
      }).then(function (response) {
        originalRows = response.data.internal_logs
        electionRows.value = response.data.election_logs
        startElectionRows.value = response.data.election_logs
      }).catch(function (error) {
        if (error.response.status === 403 || error.response.status === 401) {
          router.push({name: 'AccessDenied'})
        } else {
          router.push({name: 'Error'})
        }
      })
    }

    async function getFrauds() {
      const uri = `${api_routes.MAIN_URI}/elections/fraud`
      return await axios.get(uri, {
        headers: {
          "Content-type": "application/json"
        },
        withCredentials: true
      }).then(response => {
        fraudElections.value = response.data
      }).catch(error => {
        if (error.response.status === 403 || error.response.status === 401) {
          router.push({name: 'AccessDenied'})
        } else {
          router.push({name: 'Error'})
        }
      })
    }

    async function denyElectionFraud(id, reason) {
      const uri = `${api_routes.MAIN_URI}/elections//fraud/${id}`
      return await axios.patch(uri, {reason: reason}, {
        headers: {
          "Content-type": "application/json"
        },
        withCredentials: true
      }).then(response => {
        return response
      }).catch(error => {
        return error
      })
    }

    function fetchFromServer(startRow, count, filter, sortBy, descending) {
      const data = filter
          ? originalRows.filter(row => row.log.includes(filter))
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
        if (treat.log.includes(filter)) {
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
      getLogs()
      getFrauds()
      avatar.value = $q.sessionStorage.getItem('avatar') ? `${api_routes.AVATAR_URI}/${$q.sessionStorage.getItem('avatar')}` : `/src/assets/user-icon.jpg`
      tableRef.value.requestServerInteraction()
    })

    return {
      tableRef,
      permission,
      electionTableRef,
      leftDrawerOpen,
      toggleLeftDrawer,
      filters: ref(false),
      settings,
      filter,
      pagination,
      electionsPagination,
      avatar,
      frauds,
      denyReason,
      openSettings() {
        settings.value = true
      },
      tab: ref('internalLogs'),
      electionsColumns,
      electionRows,
      internalColumns,
      internalRows,
      fraudColumns,
      fraudPagination,
      fraudLoading,
      fraudElections,
      selectedFraud,
      reason,
      rows,
      loading,
      electionLoading,
      toggleNone,
      toggleLow,
      toggleMedium,
      toggleHigh,
      internalFilter,
      search,
      onRequest,
      customSort() {
        electionLoading.value = true
        setTimeout(() => {
          electionRows.value = startElectionRows.value
          const data = electionRows.value
          let filteredRows = []
          if (toggleNone.value) {
            const filtered = data.filter(obj =>
                obj.severity === 'NONE'
            )
            filteredRows.push(...filtered)
          }
          if (toggleLow.value) {
            const filtered = data.filter(obj =>
                obj.severity === 'LOW'
            )
            filteredRows.push(...filtered)
          }
          if (toggleMedium.value) {
            const filtered = data.filter(obj =>
                obj.severity === 'MEDIUM'
            )
            filteredRows.push(...filtered)
          }
          if (toggleHigh.value) {
            const filtered = data.filter(obj =>
                obj.severity === 'HIGH'
            )
            filteredRows.push(...filtered)
          }
          if (search.value) {
            filteredRows = filteredRows.filter(obj =>
                obj.election_title.toLowerCase().includes(search.value.toLowerCase())
            )
          }
          electionRows.value = filteredRows
          electionLoading.value = false
        }, 500)

      },
      denyFraud(row) {
        if(reason.value.length > 0) {
          loading.value = true
          setTimeout(() => {
            denyElectionFraud(row.id, reason.value).then(response => {
              reason.value = ''
              denyReason.value = false
              frauds.value = false
              Notify.create({
                color: 'green-4',
                textColor: 'white',
                icon: 'check',
                message: `${row.title}'s fraud denied with success`
              })
              getLogs()
              onRequest({filter: filter.value, pagination: pagination.value})
            }).catch(error => {
              $q.notify({
                color: 'red-10',
                textColor: 'white',
                icon: 'cancel',
                message: 'An error has occurred, Please try again later'
              })
            })
          }, 500)
          loading.value = false
        }
      }
    }
  },
  computed: {},
  methods: {
    clearSearch() {
      this.search = ''
      this.customSort()
    },
    showFrauds() {
      this.frauds = true
    },
    showReason(row) {
      this.denyReason = true
      this.selectedFraud = row
    },
    logout() {
      SessionStorage.set('permission', '');
      SessionStorage.set('id', '');
      SessionStorage.set('avatar', '');
      SessionStorage.set('display', '');
      Cookies.remove('token');
      this.$router.push('login');
    },
  }
}
</script>

<style scoped>

</style>