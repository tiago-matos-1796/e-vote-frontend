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
                          <q-tab name="mails" label="Internal Logs"/>
                          <q-tab name="alarms" label="Election Logs"/>
                        </q-tabs>

                        <q-separator/>

                        <q-tab-panels v-model="tab" animated>
                          <q-tab-panel name="mails">
                            <div class="q-pa-md">
                              <q-table
                                  flat bordered
                                  :rows="internalRows"
                                  :columns="internalColumns"
                                  row-key="name"
                                  :sort-method="customSort"
                                  binary-state-sort
                              />
                            </div>
                          </q-tab-panel>

                          <q-tab-panel name="alarms">
                            <div class="q-pa-md">
                              <q-table
                                  flat bordered
                                  :rows="electionRows"
                                  :columns="electionsColumns"
                                  :filter="filter"
                                  :filter-method="customFilter"
                                  row-key="name"
                                  :sort-method="customSort"
                                  binary-state-sort
                              >
                                <template v-slot:top>
                                  <div style="width: 100%" class="row">
                                    <div class="col-9">
                                      <q-toggle v-model="filterToggle.none" val="none" label="Show Breakfast"/>
                                      <q-toggle v-model="filterToggle.low" val="low" label="Show Lunch"/>
                                      <q-toggle v-model="filterToggle.medium" val="medium" label="Show Dinner"/>
                                      <q-toggle v-model="showAll" val="showAll" label="Show All"/>
                                    </div>
                                    <div class="col-3">
                                      <q-input dense debounce="400" color="primary" v-model="search">
                                        <template v-slot:append>
                                          <q-icon name="search"/>
                                        </template>
                                      </q-input>
                                    </div>
                                  </div>
                                </template>
                              </q-table>
                              {{ filter }}
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

const electionRows = [
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
    createdBy: 'admin'
  },
  {
    id: 2,
    log: 'Permission changed from REGULAR to MANAGER',
    createdAt: '23/05/2023',
    createdBy: 'admin'
  },
  {
    id: 3,
    log: 'Permission changed from MANAGER to AUDITOR',
    createdAt: '23/05/2023',
    createdBy: 'admin'
  }
]
export default {
  name: "Auditing",

  setup() {
    const settings = ref(false)
    return {
      settings,
      openSettings() {
        settings.value = true
      },
      tab: ref('mails'),
      electionsColumns,
      electionRows,
      internalColumns,
      internalRows,
      filterToggle: {
        none: true,
        low: true,
        medium: true
      },
      search: '',

      customSort(rows, sortBy, descending) {
        const data = [...rows]

        if (sortBy) {
          data.sort((a, b) => {
            const x = descending ? b : a
            const y = descending ? a : b

            if (sortBy === 'election') {
              // string sort
              return x[sortBy] > y[sortBy] ? 1 : x[sortBy] < y[sortBy] ? -1 : 0
            } else {
              // numeric sort
              return parseFloat(x[sortBy]) - parseFloat(y[sortBy])
            }
          })
        }

        return data
      }
    }
  },
  computed: {
    showAll: {
      get: function () {
        console.log(this.filterToggle)
        return this.filterToggle.none && this.filterToggle.low && this.filterToggle.medium
      },
      set: function (newValue) {
        this.filterToggle.none = newValue
        this.filterToggle.low = newValue
        this.filterToggle.medium = newValue
      }
    },
    filter() {
      return {
        search: this.search,
        none: this.filterToggle.none,
        low: this.filterToggle.low,
        medium: this.filterToggle.medium,
      }
    }
  },
  methods: {
    customFilter(rows, terms) {
      // rows contain the entire data
      // terms contains whatever you have as filter

      console.log(terms, rows)

      const lowerSearch = terms.search ? terms.search.toLowerCase() : ""

      const filteredRows = rows.filter(
          (row, i) => {

            let ans = false

            //Gather toggle conditions
            let c1 = this.filterToggle.none && row.severity === "NONE"
            let c2 = this.filterToggle.low && row.severity === "LOW"
            let c3 = this.filterToggle.medium && row.severity === "MEDIUM"

            //Gather search condition


            //Assume true in case there is no search
            let s1 = true

            //If search term exists, convert to lower case and see which rows contain it
            if (lowerSearch !== "") {
              s1 = false
              //Get the values
              let s1_values = Object.values(row)
              //Convert to lowercase
              let s1_lower = s1_values.map(x => x.toString().toLowerCase())

              for (let val = 0; val < s1_lower.length; val++) {
                if (s1_lower[val].includes(lowerSearch)) {
                  s1 = true
                  break
                }
              }
            }

            //assume row doesn't match
            ans = false

            //check if any of the conditions match
            if ((c1 && s1) || (c2 && s1) || (c3 && s1)) {
              ans = true
            }

            return ans

          })


      return filteredRows
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