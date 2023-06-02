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
                    <q-input borderless dense debounce="300" v-model="filter" placeholder="Search">
                      <template v-slot:append>
                        <q-icon name="search" />
                      </template>
                    </q-input>
                  </template>

                </q-table>
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
    name: 'desc',
    required: true,
    label: 'Title',
    align: 'left',
    field: row => row.title,
    format: val => `${val}`,
    sortable: true
  },
  { name: 'startDate', align: 'center', label: 'Start Date', field: 'startDate', sortable: true },
  { name: 'endDate', label: 'End Date', field: 'endDate', sortable: true },
]

const originalRows = [
  { id: 1, title: 'Election1', startDate: '13-02-2023', endDate: '15-06-2032', voted: true },
  { id: 2, title: 'Ice cream sandwich', startDate: '13-02-2023', endDate: '15-06-2032', voted: true},
  { id: 3, title: 'Eclair', startDate: '13-02-2023', endDate: '15-06-2032', voted: false },
  { id: 4, title: 'Cupcake', startDate: '13-02-2023', endDate: '15-06-2032', voted: false }
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

      onRequest
    }
  }
}
</script>
