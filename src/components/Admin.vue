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
                    title="Users"
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
                      <q-td key="email" :props="props">
                        {{props.row.email}}
                      </q-td>
                      <q-td key="displayName" :props="props">
                        {{props.row.displayName}}
                      </q-td>
                      <q-td key="username" :props="props">
                        {{props.row.username}}
                      </q-td>
                      <q-td key="actions" :props="props">
                        <q-btn square size="sm" name="edit" color="primary" label='' icon='badge' @click="changePermissions(props.row)">
                          <q-tooltip>
                            Change permission
                          </q-tooltip>
                        </q-btn>
                        <q-btn square size="sm" name="delete" color="negative" label='' icon='person_remove' @click="deleteElection(props.row)">
                          <q-tooltip>
                            Remove user
                          </q-tooltip>
                        </q-btn>
                      </q-td>
                    </q-tr>
                  </template>
                </q-table>
                <q-dialog
                    v-model="permission"
                    persistent
                >
                      <div class="flex flex-center column">
                          <div id="parent" class="fit wrap justify-center items-start content-start" style="overflow: hidden;">
                              <q-card class="no-border-radius">
                                <q-card-section>
                                  <div class="q-pa-md">
                                    <q-form
                                        class="q-gutter-md" style="min-width: 400px; padding: 24px;"
                                    >
                                      <q-select filled v-model="permissions" :options="options" label="Choose permission" />
                                    </q-form>
                                  </div>
                                </q-card-section>
                                <q-card-actions align="center">
                                  <q-btn label="Confirm changes" type="submit" color="primary" @click="" v-close-popup/>
                                  <q-btn label="Cancel" type="reset" color="negative" v-close-popup/>
                                </q-card-actions>
                              </q-card>
                            </div>
                          </div>
                </q-dialog>
                <q-dialog v-model="deleteConfirm">
                  <q-card>
                    <q-card-section>
                      <div class="text-h6">Remove User</div>
                    </q-card-section>

                    <q-card-section class="q-pt-none">
                      Are you sure you want to remove user {{selected_row}}?
                    </q-card-section>

                    <q-card-actions align="right">
                      <q-btn flat label="Confirm" color="primary" @click="deleteConfirm=false" v-close-popup />
                      <q-btn flat label="Cancel" color="negative" @click="deleteConfirm=false" v-close-popup />
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
import {useQuasar} from 'quasar'
import addElection from '@/components/AddElection.vue'

const columns = [
  {
    name: 'email',
    required: true,
    label: 'Email',
    align: 'left',
    field: row => row.email,
    format: val => `${val}`,
    sortable: true
  },
  { name: 'displayName', align: 'center', label: 'Display Name', field: 'displayName', sortable: true },
  { name: 'username', align: 'center', label: 'Username', field: 'username', sortable: true },
  { name: 'actions', align: 'right',label: 'Actions', field: 'actions', sortable: false },
]

const originalRows = [
  { id: 1, email: 'a@a.a', displayName: 'A', username: 'a', blocked: false },
  { id: 2, email: 'b@b.b', displayName: 'B', username: 'b', blocked: true},
  { id: 3, email: 'c@c.c', displayName: 'C', username: 'c', blocked: false },
  { id: 4, email: 'd@d.d', displayName: 'D', username: 'd', blocked: false }
]

export default {
  name: 'Admin',
  setup() {
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
    function fetchFromServer(startRow, count, filter, sortBy, descending) {
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
                    ? (a, b) => (parseFloat(b[sortBy]) - parseFloat(a[sortBy]))
                    : (a, b) => (parseFloat(a[sortBy]) - parseFloat(b[sortBy]))
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
        if (treat.title.includes(filter)) {
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

    function AddElection() {
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
      permissions: ref(null),
      options: ['REGULAR', 'MANAGER', 'AUDITOR', 'ADMIN'],
      maximizedToggle: ref(true),
      AddElection,
      onRequest,
      permission: ref(false),
      selected_row: ref({}),
      deleteConfirm: ref(false),
      ph: ref(''),
      renewKey: ref(false),
      electionResults: ref(false),
      addRow() {
        loading.value = true
        setTimeout(() => {
          const
              index = Math.floor(Math.random() * (rows.value.length + 1)),
              row = originalRows[Math.floor(Math.random() * originalRows.length)]

          if (rows.value.length === 0) {
            rowCount.value = 0
          }

          row.id = ++rowCount.value
          const newRow = {...row} // extend({}, row, { name: `${row.name} (${row.__count})` })
          rows.value = [...rows.value.slice(0, index), newRow, ...rows.value.slice(index)]
          loading.value = false
        }, 500)
      },

      removeRow() {
        loading.value = true
        setTimeout(() => {
          const index = Math.floor(Math.random() * rows.value.length)
          rows.value = [...rows.value.slice(0, index), ...rows.value.slice(index + 1)]
          loading.value = false
        }, 500)
      },
    }
  },
  methods: {
    changePermissions(row) {
      this.selected_row = row;
      this.ph = row.title;
      this.permission = true;
    },
    deleteElection(row) {
      this.selected_row = row.username;
      this.deleteConfirm = true;
    },
    regenerateKey(row) {
      this.selected_row = row.title;
      this.renewKey = true;
    },
    showResults(row) {
      this.selected_row = row.title;
      this.electionResults = true;
    }
  }
}
</script>

<style scoped>

</style>