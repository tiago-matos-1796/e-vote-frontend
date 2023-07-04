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
                        title="Users"
                        :rows="rows"
                        :columns="columns"
                        row-key="name"
                        v-model:pagination="pagination"
                        :loading="loading"
                        binary-state-sort
                    >
                      <template v-slot:top-right>
                        <div class="q-gutter-lg-x-md">
                          <q-toggle v-model="toggleRegular" @click="customSort" :disable="loading" label="Show regular"/>
                          <q-toggle v-model="toggleManager" @click="customSort" :disable="loading" label="Show manager"/>
                          <q-toggle v-model="toggleAuditor" @click="customSort" :disable="loading" label="Show auditor"/>
                          <q-toggle v-model="toggleAdmin" @click="customSort" :disable="loading" label="Show admin"/>
                          <q-input dense debounce="400" color="primary" v-model="search" :disable="loading"
                                   placeholder="Search by email" @keyup.enter="customSort">
                            <template v-slot:append>
                              <q-icon name="close" @click="clearSearch" :disable="loading" class="cursor-pointer" />
                              <q-icon name="search" @click="customSort" :disable="loading" class="cursor-pointer"/>
                            </template>
                          </q-input>
                        </div>
                      </template>
                      <template v-slot:body="props">
                        <q-tr :props="props">
                          <q-td key="email" :props="props">
                            {{ props.row.email }}
                          </q-td>
                          <q-td key="displayName" :props="props">
                            {{ props.row.displayName }}
                          </q-td>
                          <q-td key="username" :props="props">
                            {{ props.row.username }}
                          </q-td>
                          <q-td key="permission" :props="props">
                            {{ props.row.permission }}
                          </q-td>
                          <q-td key="actions" :props="props">
                            <q-btn square size="sm" name="edit" color="primary" label='' icon='badge' :disable="loading"
                                   @click="changePermissions(props.row)">
                              <q-tooltip>
                                Change permission
                              </q-tooltip>
                            </q-btn>
                            <q-btn square size="sm" name="delete" color="negative" label='' icon='person_remove' :disable="loading"
                                   @click="deleteUser(props.row)">
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
                        <div id="parent" class="fit wrap justify-center items-start content-start"
                             style="overflow: hidden;">
                          <q-card class="no-border-radius">
                            <q-card-section>
                              <div class="q-pa-md">
                                <q-form
                                    class="q-gutter-md" style="min-width: 400px; padding: 24px;"
                                >
                                  <q-select filled v-model="permissions" :options="options" label="Choose permission"/>
                                </q-form>
                              </div>
                            </q-card-section>
                            <q-card-actions align="center">
                              <q-btn label="Confirm changes" type="submit" color="primary"
                                     @click="submitPermissionChange(selected_row)"/>
                              <q-btn label="Cancel" type="reset" color="negative"
                                     @click="permissions=[];permission=false"/>
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
                          Are you sure you want to remove user {{ selected_row.username }}?
                        </q-card-section>

                        <q-card-actions align="right">
                          <q-btn flat label="Confirm" color="primary" @click="submitUserDeletion(selected_row)"/>
                          <q-btn flat label="Cancel" color="negative" @click="deleteConfirm=false"/>
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
import {Cookies, Notify, SessionStorage, useQuasar} from 'quasar'
import {useAuthStore} from "@/stores/auth";

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
  {name: 'displayName', align: 'center', label: 'Display Name', field: 'displayName', sortable: true},
  {name: 'username', align: 'center', label: 'Username', field: 'username', sortable: true},
  {name: 'permission', align: 'center', label: 'Permission', field: 'permission', sortable: true},
  {name: 'actions', align: 'right', label: 'Actions', field: 'actions', sortable: false},
]

let rows = [
  {id: 1, email: 'a@a.a', displayName: 'A', username: 'a', permission: 'REGULAR'},
  {id: 2, email: 'b@b.b', displayName: 'B', username: 'b', permission: 'REGULAR'},
  {id: 3, email: 'c@c.c', displayName: 'C', username: 'c', permission: 'AUDITOR'},
  {id: 4, email: 'd@d.d', displayName: 'D', username: 'd', permission: 'MANAGER'},
  {id: 5, email: 'e@e.e', displayName: 'E', username: 'e', permission: 'ADMIN'}
]

export default {
  name: 'Admin',
  setup() {
    const $q = useQuasar()
    const tableRef = ref()
    const filter = ref('')
    const loading = ref(false)
    const settings = ref(false)
    const toggleRegular = ref(true)
    const toggleManager = ref(true)
    const toggleAuditor = ref(true)
    const toggleAdmin = ref(true)
    const search = ref('')
    const pagination = ref({
      sortBy: 'username',
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
      settings,
      toggleRegular,
      toggleAuditor,
      toggleManager,
      toggleAdmin,
      search,
      openSettings() {
        settings.value = true
      },
      permissions: ref(null),
      options: ['REGULAR', 'MANAGER', 'AUDITOR', 'ADMIN'],
      maximizedToggle: ref(true),
      permission: ref(false),
      selected_row: ref({}),
      deleteConfirm: ref(false),
      ph: ref(''),
    }
  },
  methods: {
    changePermissions(row) {
      this.selected_row = row;
      this.ph = row.title;
      this.permission = true;
    },
    deleteUser(row) {
      this.selected_row = row;
      this.deleteConfirm = true;
    },
    submitPermissionChange(row) {
      this.loading = true
      setTimeout(() => {
        console.log({id: row.id, permission: this.permissions})
        Notify.create({
          color: 'green-4',
          textColor: 'white',
          icon: 'check',
          message: `Permission for user ${row.username} changed with success`
        })
        this.permissions = []
        this.permission = false
        this.loading = false
      }, 500)
    },
    submitUserDeletion(row) {
      this.loading = true
      setTimeout(() => {
        console.log({id: row.id})
        Notify.create({
          color: 'green-4',
          textColor: 'white',
          icon: 'check',
          message: `User ${row.username} deleted with success`
        })
        this.deleteConfirm = false;
        this.loading = false
      }, 500)
    },
    customSort() {
      this.loading = true
      setTimeout(() => {
        let filteredRows = []
        if (this.toggleRegular) {
          const filtered = rows.filter(obj =>
              obj.permission === 'REGULAR'
          )
          filteredRows.push(...filtered)
        }
        if (this.toggleAuditor) {
          const filtered = rows.filter(obj =>
              obj.permission === 'AUDITOR'
          )
          filteredRows.push(...filtered)
        }
        if (this.toggleManager) {
          const filtered = rows.filter(obj =>
              obj.permission === 'MANAGER'
          )
          filteredRows.push(...filtered)
        }
        if (this.toggleAdmin) {
          const filtered = rows.filter(obj =>
              obj.permission === 'ADMIN'
          )
          filteredRows.push(...filtered)
        }
        if (this.search) {
          filteredRows = filteredRows.filter(obj =>
              obj.email.toLowerCase().includes(this.search.toLowerCase())
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
      const store = useAuthStore();
      SessionStorage.set('permission', '');
      Cookies.remove('token');
      store.logOut();
      this.$router.push('login');
    }
  }
}
</script>

<style scoped>

</style>