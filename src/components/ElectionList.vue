<template>
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
                        <q-btn square size="sm" name="edit" color="primary" :disabled="props.row.voted" label='' icon='how_to_vote' @click="openBallot(props.row)">
                          <q-tooltip>
                            Vote
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
                    <div id="parent" class="fit wrap justify-center items-start content-start" style="overflow: hidden;">
                      <q-card class="no-border-radius">
                        <q-toolbar>
                          <q-toolbar-title><span class="text-weight-bold">{{selected_row.title}}</span></q-toolbar-title>
                          <q-btn flat round dense icon="close" v-close-popup />
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
                                  <q-card bordered flat :class="props.selected ? ($q.dark.isActive ? 'bg-grey-9' : 'bg-grey-2') : ''">
                                    <q-card-section>
                                      <q-checkbox dense v-model="props.selected" :label="props.row.name" />
                                    </q-card-section>
                                    <q-separator />
                                    <q-list dense>
                                      <q-item v-for="col in props.cols.filter(col => col.name !== 'title')" :key="col.name">
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
                          <q-btn label="Vote" type="submit" color="primary" @click="voteConfirm(selected)" v-close-popup/>
                          <q-btn label="Cancel" type="reset" color="negative" v-close-popup/>
                        </q-card-actions>
                      </q-card>
                    </div>
                  </div>
                </q-dialog>
                <q-dialog v-model="sign">
                  <q-card>
                    <q-card-section>
                      <div class="text-h6">Please confirm your vote {{selected.length > 0 ? selected : "Blank"}}</div>
                    </q-card-section>

                    <q-card-section class="q-pt-none">
                      <q-form
                          class="q-gutter-md"
                      >
                        <q-input v-model="password" type="password" filled hint="Vote key" :rules="[ val => val && val.length > 0 || 'Please insert your vote key']">
                        </q-input>
                      </q-form>
                    </q-card-section>

                    <q-card-actions align="right">
                      <q-btn flat label="Confirm" color="primary" @click="sign=false" v-close-popup />
                      <q-btn flat label="Cancel" color="negative" @click="sign=false" v-close-popup />
                    </q-card-actions>
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
  { name: 'endDate', label: 'End Date', field: 'endDate', sortable: true },
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

export default {
  name: 'ElectionList',
  setup () {
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
          ? originalRows.filter(row => row.name.includes(filter))
          : originalRows.slice()

      // handle sortBy
      if (sortBy) {
        const sortFn = sortBy === 'desc'
            ? (descending
                    ? (a, b) => (a.name > b.name ? -1 : a.name < b.name ? 1 : 0)
                    : (a, b) => (a.name > b.name ? 1 : a.name < b.name ? -1 : 0)
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

    return {
      tableRef,
      filter,
      loading,
      pagination,
      columns,
      rows,
      candidateRows,
      candidateColumns,
      sign: ref(false),
      selected: ref([]),
      selected_row: ref({}),
      ballot: ref(false),
      vote: ref(false),
      onRequest
    }
  },
  methods: {
    openBallot(row) {
      this.selected_row = row;
      this.ballot = true;
    },
    voteConfirm(selected) {
      this.selected = selected;
      this.sign=true;
    }
  }
}
</script>
