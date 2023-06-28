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
                  <div class="text-h6">Secure Vote Logs</div>
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
                                  title=""
                                  :rows="internalRows"
                                  :columns="internalColumns"
                                  row-key="name"
                                  :filter="filter"
                                  :loading="loading"
                                  :pagination="pagination"
                              >

                                <template v-slot:top-right>
                                  <q-input dense debounce="400" color="primary" v-model="filter" placeholder="Search by row">
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
                                  title=""
                                  :rows="electionRows"
                                  :columns="electionsColumns"
                                  row-key="name"
                                  binary-state-sort
                                  :loading="electionLoading"
                                  :pagination="pagination"
                              >
                                <template v-slot:top-right>
                                  <div class="q-gutter-lg-x-md">
                                    <q-toggle v-model="toggleNone" @click="customSort" label="Show none"/>
                                    <q-toggle v-model="toggleLow" @click="customSort" label="Show low"/>
                                    <q-toggle v-model="toggleMedium" @click="customSort" label="Show medium"/>
                                    <q-toggle v-model="toggleHigh" @click="customSort" label="Show high"/>
                                    <q-input dense debounce="400" color="primary" v-model="search"
                                             placeholder="Search by election" @keyup.enter="customSort">
                                      <template v-slot:append>
                                        <q-icon name="close" @click="clearSearch" class="cursor-pointer" />
                                        <q-icon name="search" @click="customSort" class="cursor-pointer"/>
                                      </template>
                                    </q-input>
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
import {Cookies, SessionStorage} from "quasar";

const electionsColumns = [
  {
    name: 'election',
    required: true,
    label: 'Election',
    align: 'left',
    field: row => row.election,
    format: val => `${val}`,
    sortable: true
  },
  {name: 'log', align: 'center', label: 'Log', field: 'log', sortable: true},
  {name: 'createdAt', label: 'Created at', field: 'createdAt', sortable: true},
  {name: 'severity', label: 'Severity', field: 'severity', sortable: true}
]

const internalColumns = [
  {name: 'log', align: 'center', label: 'Log', field: 'log', sortable: true},
  {name: 'createdAt', label: 'Created at', field: 'createdAt', sortable: true},
  {name: 'createdBy', label: 'Created by', field: 'createdBy', sortable: true}
]

let electionRows = [
  {
    id: 1,
    election: 'Election1',
    log: 'Election created',
    createdAt: '23/05/2023',
    severity: 'NONE'
  },
  {
    id: 2,
    election: 'Election1',
    log: 'Vote submitted',
    createdAt: '24/05/2023',
    severity: 'NONE'
  },
  {
    id: 3,
    election: 'Election1',
    log: 'Vote submitted',
    createdAt: '24/05/2023',
    severity: 'NONE'
  },
  {
    id: 4,
    election: 'Election1',
    log: 'Signature not validated',
    createdAt: '24/05/2023',
    severity: 'HIGH'
  },
  {
    id: 5,
    election: 'Election1',
    log: 'Duplicated vote',
    createdAt: '24/05/2023',
    severity: 'LOW'
  },
  {
    id: 6,
    election: 'Election1',
    log: 'Hash not validated',
    createdAt: '24/05/2023',
    severity: 'MEDIUM'
  },
  {
    id: 7,
    election: 'Election2',
    log: 'Election created',
    createdAt: '24/05/2023',
    severity: 'NONE'
  },
  {
    id: 8,
    election: 'Election2',
    log: 'Signature not validated',
    createdAt: '24/05/2023',
    severity: 'HIGH'
  }
]

const internalRows = [
  {
    id: 1,
    log: 'Permission changed from REGULAR to ADMIN',
    createdAt: '23/05/2023',
    createdBy: 'admin1'
  },
  {
    id: 2,
    log: 'Permission changed from REGULAR to MANAGER',
    createdAt: '23/05/2023',
    createdBy: 'admin1'
  },
  {
    id: 3,
    log: 'Permission changed from MANAGER to AUDITOR',
    createdAt: '23/05/2023',
    createdBy: 'admin1'
  },
  {
    id: 4,
    log: 'Permission changed from REGULAR to MANAGER',
    createdAt: '23/06/2023',
    createdBy: 'admin2'
  },
  {
    id: 5,
    log: 'Permission changed from MANAGER to AUDITOR',
    createdAt: '23/06/2023',
    createdBy: 'admin2'
  }
]
export default {
  name: "Auditing",

  setup() {
    const settings = ref(false)
    const internalFilter = ref('')
    const loading = ref(false)
    const filter = ref('')
    const toggleNone = ref(true)
    const toggleLow = ref(true)
    const toggleMedium = ref(true)
    const toggleHigh = ref(true)
    const search = ref('')
    const electionLoading = ref(false)

    return {
      settings,
      openSettings() {
        settings.value = true
      },
      tab: ref('internalLogs'),
      electionsColumns,
      electionRows,
      internalColumns,
      internalRows,
      loading,
      electionLoading,
      filter,
      pagination: ref({
        sortBy: 'createdAt',
        descending: true,
        page: 1,
        rowPerPage: 10
      }),
      toggleNone,
      toggleLow,
      toggleMedium,
      toggleHigh,
      internalFilter,
      search,
    }
  },
  computed: {},
  methods: {
    customSort (rows, sortBy, descending) {
      this.electionLoading = true
      setTimeout(() => {
        let filteredRows = []
        if(this.toggleNone) {
          const filtered = electionRows.filter(obj =>
              obj.severity === 'NONE'
          )
          filteredRows.push(...filtered)
        }
        if(this.toggleLow) {
          const filtered = electionRows.filter(obj =>
              obj.severity === 'LOW'
          )
          filteredRows.push(...filtered)
        }
        if(this.toggleMedium) {
          const filtered = electionRows.filter(obj =>
              obj.severity === 'MEDIUM'
          )
          filteredRows.push(...filtered)
        }
        if(this.toggleHigh) {
          const filtered = electionRows.filter(obj =>
              obj.severity === 'HIGH'
          )
          filteredRows.push(...filtered)
        }
        if(this.search) {
          filteredRows = filteredRows.filter(obj =>
              obj.election.toLowerCase().includes(this.search.toLowerCase())
          )
        }
        this.electionRows = filteredRows
        this.electionLoading = false
      }, 500)

    },
    clearSearch() {
      this.search = ''
      this.customSort()
    },
    logout() {
      SessionStorage.set('permission', '');
      Cookies.remove('token'); // TODO add cookie options
      this.$router.push('login');
    },
  }
}
</script>

<style scoped>

</style>