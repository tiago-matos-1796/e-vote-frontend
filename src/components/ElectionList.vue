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
              <img :src="`data:image/jpg;base64,${$q.sessionStorage.getItem('avatar')}`">
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
                  <div class="q-pa-md">
                    <q-table
                        flat bordered
                        ref="tableRef"
                        title="My Elections"
                        :rows="rows"
                        :columns="columns"
                        row-key="id"
                        v-model:pagination="pagination"
                        :loading="loading"
                        binary-state-sort
                        @request="onRequest"
                    >
                      <template v-slot:top-right>
                        <div class="q-gutter-lg-x-md">
                          <q-toggle v-model="toggleBefore" @click="customSort" :disable="loading" label="Show not started elections"/>
                          <q-toggle v-model="toggleDuring" @click="customSort" :disable="loading" label="Show ongoing elections"/>
                          <q-toggle v-model="toggleAfter" @click="customSort" :disable="loading" label="Show finished elections"/>
                          <q-input dense debounce="400" color="primary" v-model="search" :disable="loading"
                                   placeholder="Search by election title" @keyup.enter="customSort">
                            <template v-slot:append>
                              <q-icon name="close" @click="clearSearch" :disable="loading" class="cursor-pointer" />
                              <q-icon name="search" @click="customSort" :disable="loading" class="cursor-pointer"/>
                            </template>
                          </q-input>
                          <q-checkbox v-model="toVote" @click="customSort" :disable="loading" label="Show only elections yet to vote"/>
                          <q-checkbox v-model="hasResults" @click="customSort" :disable="loading"
                                      label="Show only elections with results"/>
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
                            <q-btn square size="sm" name="vote" color="primary" :disabled="canVote(props.row)  || loading" label=''
                                   icon='how_to_vote' @click="openBallot(props.row)">
                              <q-tooltip>
                                Vote
                              </q-tooltip>
                            </q-btn>
                            <q-btn square size="sm" name="results" color="info" :disabled="canSeeResults(props.row)  || loading"
                                   label=''
                                   icon='summarize' @click="showResults(props.row)">
                              <q-tooltip>
                                Show election results
                              </q-tooltip>
                            </q-btn>
                          </q-td>
                        </q-tr>
                      </template>
                    </q-table>
                    <q-dialog
                        v-model="ballot"
                        persistent
                        full-width
                    >
                      <ElectionBallot :id="electionId"></ElectionBallot>
                    </q-dialog>
                    <q-dialog
                        v-model="electionResults"
                        persistent
                        :maximized="maximizedToggle"
                        transition-show="slide-up"
                        transition-hide="slide-down"
                    >
                      <ElectionResultsUser :id="electionId" :title="electionTitle"></ElectionResultsUser>
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
            <img :src="`data:image/jpg;base64,${$q.sessionStorage.getItem('avatar')}`">
          </q-avatar>

          <div class="text-subtitle1 q-mt-md q-mb-xs">{{$q.sessionStorage.getItem('username')}}</div>
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
import {onMounted, ref} from 'vue'
import {ArcElement, Chart as ChartJS, Legend, Tooltip} from 'chart.js'
import {Cookies, SessionStorage} from "quasar";
import moment from 'moment'
import axios from "axios";
import {useRouter} from "vue-router";
import ElectionBallot from "@/components/ElectionBallot.vue";
import ElectionResultsUser from "./ElectionResultsUser.vue";

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
  {name: 'endDate', label: 'End Date', field: 'endDate', sortable: true},
  {name: 'actions', align: 'right', label: 'Actions', field: 'actions', sortable: false},
]

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

const resultsColumns = [
  {
    name: 'candidate',
    required: true,
    label: 'Candidate',
    align: 'left',
    field: row => row.candidate,
    format: val => `${val}`,
    sortable: true
  },
  {
    name: 'votes',
    required: true,
    label: 'Votes',
    align: 'right',
    field: row => row.votes,
    sortable: true,
  }
]

const resultsRows = [
  {candidate: 'candidate1', votes: 13},
  {candidate: 'candidate2', votes: 17},
  {candidate: 'candidate3', votes: 10},
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
  name: 'ElectionList',
  components: {
    ElectionResultsUser,
    ElectionBallot,
  },
  setup() {
    const tableRef = ref()
    const filter = ref('')
    const loading = ref(false)
    const settings = ref(false)
    const toggleBefore = ref(true)
    const toggleDuring = ref(true)
    const toggleAfter = ref(true)
    const search = ref('')
    const toVote = ref(false)
    const hasResults = ref(false)
    const rows = ref([])
    const startRows = ref([])
    const electionId = ref('')
    const electionTitle = ref('')
    const pagination = ref({
      sortBy: 'title',
      descending: false,
      page: 1,
      rowsPerPage: 5,
      rowsNumber:10
    })

    async function getElections() {
      const uri = 'http://localhost:8080/elections/voter'
      try {
        return await axios.get(uri, {
          headers: {
            "Content-type": "application/json"
          },
          withCredentials: true
        }).then(function (response) {
          originalRows = response.data
        }).catch(function (error) {
          if(error.response.status === 403 || error.response.status === 401) {
            router.push({name: 'AccessDenied'})
          } else {
            router.push({name: 'Error'})
          }
        })
      } catch (err) {
        console.log(err)
      }
    }

    function fetchFromServer (startRow, count, filter, sortBy, descending) {
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
    function getRowsNumberCount (filter) {
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

    function onRequest (props) {
      const { page, rowsPerPage, sortBy, descending } = props.pagination
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
      // get initial data from server (1st page)
      getElections()
      tableRef.value.requestServerInteraction()
    })

    return {
      tableRef,
      filter,
      loading,
      pagination,
      columns,
      rows,
      startRows,
      toggleBefore,
      toggleDuring,
      toggleAfter,
      search,
      toVote,
      hasResults,
      candidateColumns,
      resultsRows,
      resultsColumns,
      chartData,
      chartOptions,
      abstainData,
      abstainOptions,
      electionId,
      electionTitle,
      onRequest,
      electionResults: ref(false),
      maximizedToggle: ref(true),
      selected: ref([]),
      selected_row: ref({}),
      ballot: ref(false),
      vote: ref(false),
      settings,
      openSettings() {
        settings.value = true
      }
    }
  },
  methods: {
    openBallot(row) {
      this.selected_row = row;
      this.electionId = row.id;
      this.ballot = true;
    },
    canVote(row) {
      if (row.voted) {
        return true
      }
      if (moment().isBefore(moment(row.startDate, 'DD-MM-YYYY HH:mm'))) {
        return true
      }
      if (moment().isAfter(moment(row.endDate, 'DD-MM-YYYY HH:mm'))) {
        return true
      }
    },
    canSeeResults(row) {
      if (moment().isAfter(moment(row.endDate, 'DD-MM-YYYY HH:mm'))) {
        return !row.results;
      } else {
        return true
      }
    },
    showResults(row) {
      this.selected_row = row;
      this.electionId = row.id;
      this.electionTitle = row.title
      this.electionResults = true;
    },
    customSort() {
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
        if (this.search) {
          filteredRows = filteredRows.filter(obj =>
              obj.title.toLowerCase().includes(this.search.toLowerCase())
          )
        }
        if (this.toVote) {
          filteredRows = filteredRows.filter(obj =>
              obj.voted === null
          )
        }
        if (this.hasResults) {
          filteredRows = filteredRows.filter(obj =>
              obj.results !== null
          )
        }
        this.rows = filteredRows
        this.loading = false
      }, 500)
    },
    clearSearch() {
      this.search = ''
      this.customSort()
    },
    logout() {
      SessionStorage.set('permission', '');
      Cookies.remove('token');
      this.$router.push('login');
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