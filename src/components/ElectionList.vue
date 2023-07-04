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
                                        <q-separator/>
                                        <q-list dense>
                                          <q-item v-for="col in props.cols.filter(col => col.name !== 'title')"
                                                  :key="col.name">
                                            <q-item-section>
                                              <q-item-label>{{ col.label }}</q-item-label>
                                            </q-item-section>
                                            <q-item-section side>
                                              <q-item-label caption>{{ col.value }}</q-item-label>
                                            </q-item-section>
                                          </q-item>
                                        </q-list>
                                      </q-card>
                                    </div>
                                  </template>

                                </q-table>
                              </div>
                            </q-card-section>
                            <q-card-actions align="center">
                              <q-btn label="Vote" type="submit" color="primary" @click="voteConfirm(selected)"
                                     v-close-popup/>
                              <q-btn label="Cancel" type="reset" color="negative" v-close-popup/>
                            </q-card-actions>
                          </q-card>
                        </div>
                      </div>
                    </q-dialog>
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
                            <q-input v-model="signatureKey" filled hint="Vote key"
                                     :type="hideSignKey ? 'password' : 'text'"
                                     :rules="[ val => !!val || 'Election key must not be empty', val => val.length >= 16 || 'Vote key must be 16 characters long',
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
                    <q-dialog
                        v-model="electionResults"
                        persistent
                        :maximized="maximizedToggle"
                        transition-show="slide-up"
                        transition-hide="slide-down"
                    >
                      <q-card class="bg-blue-grey-2 text-black">
                        <q-bar>
                          <div class="text-h6">Results for election {{ selected_row.title }}</div>
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
                                      <div class="q-pa-md example-row-equal-width">
                                        <div class="row">
                                          <div class="col">
                                            <q-card
                                                class="my-card"
                                            >
                                              <q-card-section>
                                                <div class="text-h6">Votes</div>
                                              </q-card-section>

                                              <q-card-section class="q-pt-none">
                                                <Pie :data="chartData" :options="chartOptions"/>
                                              </q-card-section>
                                            </q-card>

                                          </div>
                                          <div class="col">
                                            <q-card
                                                class="my-card"
                                            >
                                              <q-card-section>
                                                <div class="text-h6">Abstention</div>
                                              </q-card-section>

                                              <q-card-section class="q-pt-none">
                                                <Pie :data="abstainData" :options="abstainOptions"/>
                                              </q-card-section>
                                            </q-card>

                                          </div>
                                        </div>
                                      </div>
                                      <div class="q-pa-md">
                                        <q-table
                                            flat bordered
                                            title="Results"
                                            :rows="resultsRows"
                                            :columns="resultsColumns"
                                            row-key="candidate"
                                            :filter="filter"
                                            :loading="loading"
                                        >
                                        </q-table>
                                      </div>
                                    </q-card-section>
                                    <q-card-actions align="center">
                                      <q-btn label="Close" color="negative" v-close-popup/>
                                    </q-card-actions>
                                  </q-card>
                                </div>
                              </div>
                            </div>
                          </div>
                        </q-card-section>
                      </q-card>
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
import {ref} from 'vue'
import {ArcElement, Chart as ChartJS, Legend, Tooltip} from 'chart.js'
import {Pie} from 'vue-chartjs'
import {Cookies, Notify, SessionStorage} from "quasar";
import moment from 'moment'

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

let rows = [
  {
    id: 1,
    title: 'Election1',
    startDate: '13-02-2023 00:00',
    endDate: '15-06-2023 00:00',
    voted: true,
    results: '{a:1, b:2}'
  },
  {
    id: 2,
    title: 'Ice cream sandwich',
    startDate: '13-02-2023 00:00',
    endDate: '15-06-2032 00:00',
    voted: true,
    results: null
  },
  {
    id: 3,
    title: 'Eclair',
    startDate: '13-02-2023 00:00',
    endDate: '15-06-2032 00:00',
    voted: false,
    results: null
  },
  {
    id: 4,
    title: 'Cupcake',
    startDate: '13-02-2023 00:00',
    endDate: '15-06-2023 00:00',
    voted: false,
    results: '{a:1, b:2}'
  },
  {id: 5, title: 'Election2', startDate: '13-06-2023 00:00', endDate: '19-06-2023 00:00', voted: false, results: null},
  {id: 6, title: 'Election3', startDate: '22-06-2023 00:00', endDate: '22-06-2023 23:59', voted: false, results: null},
  {id: 7, title: 'Election4', startDate: '22-07-2023 00:00', endDate: '22-08-2023 23:59', voted: false, results: null}
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

const candidateRows = [
  {id: 1, name: 'candidate1', image: ''},
  {id: 2, name: 'candidate2', image: ''},
  {id: 3, name: 'candidate3', image: ''}
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

export default {
  name: 'ElectionList',
  components: {
    Pie
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
    const startRows = rows
    const pagination = ref({
      sortBy: 'title',
      descending: false,
      page: 1,
      rowsPerPage: 5,
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
      candidateRows,
      candidateColumns,
      resultsRows,
      resultsColumns,
      chartData,
      chartOptions,
      abstainData,
      abstainOptions,
      electionResults: ref(false),
      maximizedToggle: ref(true),
      sign: ref(false),
      selected: ref([]),
      selected_row: ref({}),
      ballot: ref(false),
      vote: ref(false),
      settings,
      openSettings() {
        settings.value = true
      },
      hideSignKey: ref(true),
      signatureKey: ref('')
    }
  },
  methods: {
    openBallot(row) {
      this.selected_row = row;
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
    voteConfirm(selected) {
      this.selected = selected;
      this.sign = true;
    },
    submitVote(id) {
      this.loading = true
      setTimeout(() => {
        const vote = this.selected.length > 0 ? this.selected[0].id : "blank" // to be encrypted
        const key = this.signatureKey
        console.log({id, vote, key})
        Notify.create({
          color: 'green-4',
          textColor: 'white',
          icon: 'check',
          message: `Vote submitted with success. Thank you!`
        })
        this.sign = false
        this.loading = false
      }, 500)
    },
    showResults(row) {
      this.selected_row = row;
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
              obj.voted === false
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