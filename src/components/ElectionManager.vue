<template>
  <div class="flex flex-center column">
    <div class="row bg-blue-grey-2" style="min-height: 400px; width: 80%; padding: 24px;">
      <div id="parent" class="fit wrap justify-center items-start content-start" style="overflow: hidden;">
        <div class=" bg-grey-6" style="overflow: auto;">
          <q-card class="no-border-radius">
            <q-card-section>
              <div class="q-pa-md q-gutter-sm">
                <q-btn color="green" :disable="loading" icon="add" label="Add election" @click="showElectionWindow" />
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
                    :filter="filter"
                    binary-state-sort
                    @request="onRequest"
                >
                  <template v-slot:top-right>
                    <q-space />
                    <q-input filled debounce="300" color="primary" v-model="filter">
                      <template v-slot:append>
                        <q-icon name="search" />
                      </template>
                    </q-input>
                  </template>
                  <template v-slot:body="props">
                    <q-tr :props="props">
                      <q-td key="title" :props="props">
                        {{props.row.title}}
                      </q-td>
                        <q-td key="startDate" :props="props">
                          {{props.row.startDate}}
                        </q-td>
                      <q-td key="endDate" :props="props">
                        {{props.row.endDate}}
                      </q-td>
                      <q-td key="actions" :props="props">
                        <q-btn square size="sm" name="edit" color="amber" label='' icon='edit' @click="openmodel(props.row)">
                          <q-tooltip>
                            Edit election
                          </q-tooltip>
                        </q-btn>
                        <q-btn square size="sm" name="delete" color="negative" label='' icon='delete' @click="deleteElection(props.row)">
                          <q-tooltip>
                            Delete election
                          </q-tooltip>
                        </q-btn>
                        <q-btn square size="sm" name="renew" color="secondary" label='' icon='key' @click="regenerateKey(props.row)">
                          <q-tooltip>
                            Regenerate election key
                          </q-tooltip>
                        </q-btn>
                        <q-btn square size="sm" name="results" color="primary" label='' icon='data_thresholding' @click="showResults(props.row)">
                          <q-tooltip>
                            Check election results
                          </q-tooltip>
                        </q-btn>
                        <q-btn square size="sm" name="results" color="info" label='' icon='summarize' @click="showElectionResults(props.row)">
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
                  <q-card class="bg-blue-grey-2 text-black">
                    <q-bar>
                      <div class="text-h6">Create new election</div>
                      <q-space />
                      <q-btn dense flat icon="close" v-close-popup>
                        <q-tooltip class="bg-white text-primary">Close</q-tooltip>
                      </q-btn>
                    </q-bar>
                    <q-card-section class="q-pt-none">
                      <div class="flex flex-center column">
                        <div class="row bg-blue-grey-2" style="min-height: 400px; width: 80%; padding: 24px;">
                          <div id="parent" class="fit wrap justify-center items-start content-start" style="overflow: hidden;">
                            <div class=" bg-grey-6" style="overflow: auto;">
                              <q-card class="no-border-radius">
                                <q-card-section>
                                  <div class="q-pa-md">
                                    <q-form
                                        class="q-gutter-md" style="min-width: 400px; padding: 24px;"
                                    >
                                      <q-input filled v-model="ph" label="Title" placeholder="Election title" hint="Election title"></q-input>
                                      <div class="row">
                                        <div class="col">
                                          <q-input v-model="date" filled type="date" hint="Election start date" />
                                        </div>
                                        <div class="col">
                                          <q-input v-model="time" filled type="time" hint="Election start time" />
                                        </div>
                                      </div>
                                      <div class="row">
                                        <div class="col">
                                          <q-input v-model="date" filled type="date" hint="Election end date" />
                                        </div>
                                        <div class="col">
                                          <q-input v-model="time" filled type="time" hint="Election end time" />
                                        </div>
                                      </div>
                                    </q-form>
                                    <q-table
                                        flat bordered
                                        title="Candidates"
                                        :rows="candidateRows"
                                        :columns="candidateColumns"
                                        row-key="id"
                                        :selected-rows-label="getSelectedString"
                                        selection="multiple"
                                        :selected="selected"
                                        @selection="onSelection"
                                        :filter="filter"
                                        :loading="loading"
                                    >

                                      <template v-slot:top-right>
                                        <q-btn color="green" :disable="loading" label="Add candidate" @click="newCandidate" />
                                        <q-btn class="q-ml-sm" color="negative" :disable="loading" label="Remove candidates" @click="removeRow" />
                                        <q-space />
                                      </template>

                                    </q-table>
                                    <q-table
                                        flat bordered
                                        title="Voters"
                                        :rows="voterRows"
                                        :columns="userColumns"
                                        row-key="id"
                                        :selected-rows-label="getSelectedString"
                                        selection="multiple"
                                        :selected="selected"
                                        @selection="onSelection"
                                        :filter="filter"
                                        :loading="loading"
                                    >

                                      <template v-slot:top-right>
                                        <q-btn color="green" :disable="loading" label="Add voter" @click="showVoterAdd" />
                                        <q-btn class="q-ml-sm" color="negative" :disable="loading" label="Remove voter" @click="removeRow" />
                                        <q-space />
                                      </template>
                                    </q-table>
                                  </div>
                                </q-card-section>
                                <q-card-actions align="center">
                                  <q-btn label="Create election" type="submit" color="primary"/>
                                  <q-btn label="Cancel" type="reset" color="negative" v-close-popup/>
                                </q-card-actions>
                              </q-card>
                            </div>
                          </div>
                        </div>
                      </div>
                    </q-card-section>
                  </q-card>
                </q-dialog>
                <q-dialog
                    v-model="alert"
                    persistent
                    :maximized="maximizedToggle"
                    transition-show="slide-up"
                    transition-hide="slide-down"
                >
                  <q-card class="bg-blue-grey-2 text-black">
                    <q-bar>
                      <div class="text-h6">Edit election {{selected_row.title}}</div>
                      <q-space />
                      <q-btn dense flat icon="close" v-close-popup>
                        <q-tooltip class="bg-white text-primary">Close</q-tooltip>
                      </q-btn>
                    </q-bar>
                    <q-card-section class="q-pt-none">
                      <div class="flex flex-center column">
                        <div class="row bg-blue-grey-2" style="min-height: 400px; width: 80%; padding: 24px;">
                          <div id="parent" class="fit wrap justify-center items-start content-start" style="overflow: hidden;">
                            <div class=" bg-grey-6" style="overflow: auto;">
                              <q-card class="no-border-radius">
                                <q-card-section>
                                  <div class="q-pa-md">
                                    <q-form
                                        class="q-gutter-md" style="min-width: 400px; padding: 24px;"
                                    >
                                      <q-input filled v-model="ph" label="Title" placeholder="Election title" hint="Election title"></q-input>
                                      <div class="row">
                                        <div class="col">
                                          <q-input v-model="date" filled type="date" hint="Election start date" />
                                        </div>
                                        <div class="col">
                                          <q-input v-model="time" filled type="time" hint="Election start time" />
                                        </div>
                                      </div>
                                      <div class="row">
                                        <div class="col">
                                          <q-input v-model="date" filled type="date" hint="Election end date" />
                                        </div>
                                        <div class="col">
                                          <q-input v-model="time" filled type="time" hint="Election end time" />
                                        </div>
                                      </div>
                                    </q-form>
                                    <q-table
                                        flat bordered
                                        title="Candidates"
                                        :rows="candidateRows"
                                        :columns="candidateColumns"
                                        row-key="id"
                                        :selected-rows-label="getSelectedString"
                                        selection="multiple"
                                        :selected="selected"
                                        @selection="onSelection"
                                        :filter="filter"
                                        :loading="loading"
                                    >

                                      <template v-slot:top-right>
                                        <q-btn color="green" :disable="loading" label="Add candidate" @click="newCandidate" />
                                        <q-btn class="q-ml-sm" color="negative" :disable="loading" label="Remove candidates" @click="removeRow" />
                                        <q-space />
                                      </template>

                                    </q-table>
                                    <q-table
                                        flat bordered
                                        title="Voters"
                                        :rows="voterRows"
                                        :columns="userColumns"
                                        row-key="id"
                                        :selected-rows-label="getSelectedString"
                                        selection="multiple"
                                        :selected="selected"
                                        @selection="onSelection"
                                        :filter="filter"
                                        :loading="loading"
                                    >

                                      <template v-slot:top-right>
                                        <q-btn color="green" :disable="loading" label="Add voter" @click="showVoterAdd" />
                                        <q-btn class="q-ml-sm" color="negative" :disable="loading" label="Remove voter" @click="removeRow" />
                                        <q-space />
                                      </template>
                                    </q-table>
                                    <q-table
                                        flat bordered
                                        title="Managers"
                                        :rows="managerRows"
                                        :columns="userColumns"
                                        row-key="id"
                                        :selected-rows-label="getSelectedString"
                                        selection="multiple"
                                        :selected="selected"
                                        @selection="onSelection"
                                        :filter="filter"
                                        :loading="loading"
                                    >

                                      <template v-slot:top-right>
                                        <q-btn color="green" :disable="loading" label="Add manager" @click="showManagerAdd" />
                                        <q-btn class="q-ml-sm" color="negative" :disable="loading" label="Remove manager" @click="removeRow" />
                                        <q-space />
                                      </template>
                                    </q-table>
                                  </div>
                                </q-card-section>
                                <q-card-actions align="center">
                                  <q-btn label="Confirm changes" type="submit" color="primary"/>
                                  <q-btn label="Cancel" type="reset" color="negative" v-close-popup/>
                                </q-card-actions>
                              </q-card>
                            </div>
                          </div>
                        </div>
                      </div>
                    </q-card-section>
                  </q-card>
                </q-dialog>
                <q-dialog v-model="deleteConfirm">
                  <q-card>
                    <q-card-section>
                      <div class="text-h6">Delete Election</div>
                    </q-card-section>

                    <q-card-section class="q-pt-none">
                      Are you sure you want to delete election {{selected_row}}?
                    </q-card-section>

                    <q-card-actions align="right">
                      <q-btn flat label="Confirm" color="primary" @click="deleteConfirm=false" v-close-popup />
                      <q-btn flat label="Cancel" color="negative" @click="deleteConfirm=false" v-close-popup />
                    </q-card-actions>
                  </q-card>
                </q-dialog>
                <q-dialog v-model="renewKey">
                  <q-card>
                    <q-card-section>
                      <div class="text-h6">Please insert the new election key for election {{selected_row}}</div>
                    </q-card-section>

                    <q-card-section class="q-pt-none">
                      <q-form
                          class="q-gutter-md"
                      >
                        <q-input v-model="password" type="password" filled hint="Election key">
                        </q-input>
                      </q-form>
                    </q-card-section>

                    <q-card-actions align="right">
                      <q-btn flat label="Confirm" color="primary" @click="renewKey=false" v-close-popup />
                      <q-btn flat label="Cancel" color="negative" @click="renewKey=false" v-close-popup />
                    </q-card-actions>
                  </q-card>
                </q-dialog>
                <q-dialog v-model="electionResults">
                  <q-card>
                    <q-card-section>
                      <div class="text-h6">Please insert the election key for election {{selected_row}}</div>
                    </q-card-section>

                    <q-card-section class="q-pt-none">
                      <q-form
                          class="q-gutter-md"
                      >
                        <q-input v-model="password" type="password" filled hint="Election key">
                        </q-input>
                      </q-form>
                    </q-card-section>

                    <q-card-actions align="right">
                      <q-btn flat label="Confirm" color="primary" @click="electionResults=false" v-close-popup />
                      <q-btn flat label="Cancel" color="negative" @click="electionResults=false" v-close-popup />
                    </q-card-actions>
                  </q-card>
                </q-dialog>
                <q-dialog v-model="addCandidate">
                  <q-card>
                    <q-card-section>
                      <div class="text-h6">Please insert the name of the new candidate</div>
                    </q-card-section>

                    <q-card-section class="q-pt-none">
                      <q-form
                          class="q-gutter-md"
                      >
                        <q-input v-model="candidateName" type="text" filled hint="Candidate name">
                        </q-input>
                      </q-form>
                    </q-card-section>

                    <q-card-actions align="right">
                      <q-btn flat label="Confirm" color="primary" @click="insertNewCandidate" v-close-popup />
                      <q-btn flat label="Cancel" color="negative" @click="addCandidate=false" v-close-popup />
                    </q-card-actions>
                  </q-card>
                </q-dialog>
                <q-dialog
                    v-model="newVoter"
                    persistent
                    full-width
                >
                  <div class="flex flex-center column">
                    <div id="parent" class="fit wrap justify-center items-start content-start" style="overflow: hidden;">
                      <q-card class="no-border-radius">
                        <q-toolbar>
                          <q-toolbar-title><span class="text-weight-bold">{{selected_row.title}}</span></q-toolbar-title>
                          <q-btn flat round dense icon="close" v-close-popup />
                        </q-toolbar>
                        <q-card-section>
                          <div class="q-pa-md">
                            <q-table
                                flat bordered
                                title="Users"
                                :rows="managerRows"
                                :columns="userColumns"
                                row-key="id"
                                :selected-rows-label="getSelectedString"
                                selection="multiple"
                                :selected="selected"
                                @selection="onSelection"
                                :filter="filter"
                                :loading="loading"
                            >
                            </q-table>
                          </div>
                        </q-card-section>
                        <q-card-actions align="center">
                          <q-btn label="Add selected voters" type="submit" color="primary"/>
                          <q-btn label="Cancel" type="reset" color="negative" v-close-popup/>
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
                    <div id="parent" class="fit wrap justify-center items-start content-start" style="overflow: hidden;">
                      <q-card class="no-border-radius">
                        <q-toolbar>
                          <q-toolbar-title><span class="text-weight-bold">{{selected_row.title}}</span></q-toolbar-title>
                          <q-btn flat round dense icon="close" v-close-popup />
                        </q-toolbar>
                        <q-card-section>
                          <div class="q-pa-md">
                            <q-table
                                flat bordered
                                title="Users"
                                :rows="managerRows"
                                :columns="userColumns"
                                row-key="id"
                                :selected-rows-label="getSelectedString"
                                selection="multiple"
                                :selected="selected"
                                @selection="onSelection"
                                :filter="filter"
                                :loading="loading"
                            >
                            </q-table>
                          </div>
                        </q-card-section>
                        <q-card-actions align="center">
                          <q-btn label="Add selected managers" type="submit" color="primary"/>
                          <q-btn label="Cancel" type="reset" color="negative" v-close-popup/>
                        </q-card-actions>
                      </q-card>
                    </div>
                  </div>
                </q-dialog>
                <q-dialog
                    v-model="electionResultsShow"
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
                                  <div class="q-pa-md">
                                    <q-table
                                        flat bordered
                                        title="Voters"
                                        :rows="voterResultsRows"
                                        :columns="voterColumns"
                                        row-key="email"
                                        :filter="filter"
                                        :loading="loading"
                                    >
                                    </q-table>
                                  </div>
                                </q-card-section>
                                <q-card-actions align="center">
                                  <q-btn label="Download PDF" color="primary" />
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
</template>

<script>
import { ref, onMounted } from 'vue'
import {useQuasar} from 'quasar'
import addElection from '@/components/AddElection.vue'
import {Chart as ChartJS, ArcElement, Tooltip, Legend} from 'chart.js'
import {Pie} from 'vue-chartjs'

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
  { name: 'startDate', align: 'center', label: 'Start Date', field: 'startDate', sortable: true },
  { name: 'endDate', align: 'center', label: 'End Date', field: 'endDate', sortable: true },
  { name: 'actions', align: 'right',label: 'Actions', field: 'actions', sortable: false },
]

const originalRows = [
  { id: 1, title: 'Election1', startDate: '13-02-2023', endDate: '15-06-2032', voted: true },
  { id: 2, title: 'Ice cream sandwich', startDate: '13-02-2023', endDate: '15-06-2032', voted: true},
  { id: 3, title: 'Eclair', startDate: '13-02-2023', endDate: '15-06-2032', voted: false },
  { id: 4, title: 'Cupcake', startDate: '13-02-2023', endDate: '15-06-2032', voted: false }
]

const candidateColumns = [
  {
    name: 'name',
    required: true,
    label: 'Name',
    align: 'left',
    field: row => row.name,
    format: val => `${val}`,
    sortable: true
  }
]

const candidateRows = [
  {id: 1, name: 'candidate1'},
  {id: 2, name: 'candidate2'},
  {id: 3, name: 'candidate3'},
  {id: 4, name: 'candidate4'}
]

const userColumns= [
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

const voterRows = [
  {id: 1, displayName: 'A', email: 'a@a.a'},
  {id: 2, displayName: 'B', email: 'b@b.b'},
  {id: 3, displayName: 'C', email: 'c@c.c'},
]

const voterColumns = [
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
  },
  {
    name: 'voted',
    required: true,
    label: 'Voted',
    align: 'center',
    field: row => row.voted,
    format: val => `${val ? 'yes' : 'no'}`,
    sortable: true
  }
]

const voterResultsRows = [
  {displayName: 'A', email: 'a@a.a', voted: true},
  {displayName: 'B', email: 'b@b.b', voted: true},
  {displayName: 'C', email: 'c@c.c', voted: false},
]

const managerRows = [
  {id: 1, displayName: 'Manager1', email: 'manager1@man.man'},
  {id: 2, displayName: 'Manager2', email: 'manager2@man.man'}
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
  name: 'ElectionManager',
  components: {
    Pie
  },
  setup () {
    const $q = useQuasar()
    const tableRef = ref()
    const rows = ref([])
    const filter = ref('')
    const loading = ref(false)
    const pagination = ref({
      sortBy: 'desc',
      descending: false,
      page: 1,
      rowsPerPage: 3,
      rowsNumber: 10
    })

    // emulate ajax call
    // SELECT * FROM ... WHERE...LIMIT...
    function fetchFromServer (startRow, count, filter, sortBy, descending) {
      const data = filter
          ? originalRows.filter(row => row.title.includes(filter))
          : originalRows.slice()

      // handle sortBy
      if (sortBy) {
        const sortFn = sortBy === 'desc'
            ? (descending
                    ? (a, b) => (a.title > b.title ? -1 : a.title < b.title ? 1 : 0)
                    : (a, b) => (a.title > b.title ? 1 : a.title < b.title ? -1 : 0)
            )
            : (descending
                    ? (a, b) => (parseFloat(b[ sortBy ]) - parseFloat(a[ sortBy ]))
                    : (a, b) => (parseFloat(a[ sortBy ]) - parseFloat(b[ sortBy ]))
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
        if (treat.title.includes(filter)) {
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

        // don't forget to update local pagination object
        pagination.value.page = page
        pagination.value.rowsPerPage = rowsPerPage
        pagination.value.sortBy = sortBy
        pagination.value.descending = descending

        // ...and turn of loading indicator
        loading.value = false
      }, 1500)
    }

    onMounted(() => {
      // get initial data from server (1st page)
      tableRef.value.requestServerInteraction()
    })

    function AddElection () {
       $q.dialog({
         component: addElection,
         componentProps: {},
         cancel: true,
         persistent: true
       }).onOk(data => {

       })
    }

    return {
      tableRef,
      filter,
      loading,
      pagination,
      columns,
      rows,
      candidateColumns,
      candidateRows,
      userColumns,
      voterRows,
      managerRows,
      newVoter: ref(false),
      newManager: ref(false),
      candidateName: ref(null),
      addCandidate: ref(false),
      maximizedToggle: ref(true),
      AddElection,
      onRequest,
      alert:ref(false),
      newElection: ref(false),
      selected_row:ref({}),
      deleteConfirm: ref(false),
      ph: ref(''),
      renewKey: ref(false),
      electionResults: ref(false),
      electionResultsShow: ref(false),
      resultsRows,
      resultsColumns,
      chartData,
      chartOptions,
      abstainData,
      abstainOptions,
      voterColumns,
      voterResultsRows,
      addRow () {
        loading.value = true
        setTimeout(() => {
          const
              index = Math.floor(Math.random() * (rows.value.length + 1)),
              row = originalRows[ Math.floor(Math.random() * originalRows.length) ]

          if (rows.value.length === 0) {
            rowCount.value = 0
          }

          row.id = ++rowCount.value
          const newRow = { ...row } // extend({}, row, { name: `${row.name} (${row.__count})` })
          rows.value = [ ...rows.value.slice(0, index), newRow, ...rows.value.slice(index) ]
          loading.value = false
        }, 500)
      },

      removeRow () {
        loading.value = true
        setTimeout(() => {
          const index = Math.floor(Math.random() * rows.value.length)
          rows.value = [ ...rows.value.slice(0, index), ...rows.value.slice(index + 1) ]
          loading.value = false
        }, 500)
      }
    }
  },
  methods: {
    openmodel(row){
      this.selected_row = row;
      this.ph = row.title;
      this.alert=true;
    },
    deleteElection(row) {
      this.selected_row = row.id;
      this.deleteConfirm=true;
    },
    regenerateKey(row) {
      this.selected_row = row.title;
      this.renewKey=true;
    },
    showResults(row) {
      this.selected_row = row.title;
      this.electionResults=true;
    },
    newCandidate() {
      this.addCandidate = true;
    },
    showVoterAdd() {
      this.newVoter = true;
    },
    showManagerAdd() {
      this.newManager = true;
    },
    showElectionWindow() {
      this.newElection = true;
    },
    insertNewCandidate() {
      const candidateName = this.candidateName;
      this.candidateRows.push({id: 5, name: candidateName});
      this.addCandidate = false;
    },
    showElectionResults(row) {
      this.selected_row = row;
      this.electionResultsShow = true;
    },
  }
}
</script>
