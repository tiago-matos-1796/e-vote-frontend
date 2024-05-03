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
          <img src="src/assets/UAlg-ico.ico">
        </q-avatar>
        <q-toolbar-title v-if="$q.screen.gt.sm" shrink class="row items-center no-wrap">
          <span class="q-ml-sm">UAlg Secure Vote</span>
        </q-toolbar-title>

        <q-space/>

        <q-space/>

        <div class="q-gutter-sm row items-center no-wrap">
          <LocaleChanger></LocaleChanger>
          <q-btn v-if="$q.sessionStorage.getItem('permission')" round flat @click="openSettings">
            <q-avatar size="26px">
              <img :src="avatar">
            </q-avatar>
            <q-tooltip>{{ $t('account') }}</q-tooltip>
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
                  <div class="q-pa-md q-gutter-sm">
                    <q-btn color="primary" :disable="loading" icon="view_list" :label="$t('show-blacklist')"
                           @click="showBlacklist"/>
                  </div>
                  <div class="q-pa-md">
                    <q-table
                        flat bordered
                        ref="tableRef"
                        :title="$t('users')"
                        :rows="rows"
                        :columns="columns"
                        row-key="name"
                        v-model:pagination="pagination"
                        :loading="loading"
                        binary-state-sort
                        @request="onRequest"
                    >
                      <template v-slot:top-right>
                        <div class="gt-md">
                          <div class="q-gutter-lg-x-md">
                            <q-toggle v-model="toggleRegular" @click="customSort" :disable="loading"
                                      :label="$t('show-regular')"/>
                            <q-toggle v-model="toggleManager" @click="customSort" :disable="loading"
                                      :label="$t('show-manager')"/>
                            <q-toggle v-model="toggleAuditor" @click="customSort" :disable="loading"
                                      :label="$t('show-auditor')"/>
                            <q-toggle v-model="toggleAdmin" @click="customSort" :disable="loading" :label="$t('show-admin')"/>
                            <q-input dense debounce="400" color="primary" v-model="search" :disable="loading"
                                     :placeholder="$t('search-email')" @keyup.enter="customSort">
                              <template v-slot:append>
                                <q-icon name="close" @click="clearSearch" :disable="loading" class="cursor-pointer"/>
                                <q-icon name="search" @click="customSort" :disable="loading" class="cursor-pointer"/>
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
                              :aria-label="$t('filters')"
                              icon="tune"
                              class="q-mx-md"
                          />
                        </div>
                      </template>
                      <template v-slot:body="props">
                        <q-tr :props="props">
                          <q-td key="email" :props="props">
                            {{ props.row.email }}
                          </q-td>
                          <q-td key="display_name" :props="props">
                            {{ props.row.display_name }}
                          </q-td>
                          <q-td key="username" :props="props">
                            {{ props.row.username }}
                          </q-td>
                          <q-td key="permission" :props="props">
                            {{ props.row.permission }}
                          </q-td>
                          <q-td key="blocked" :props="props">
                            {{ props.row.blocked ? 'Yes' : 'No' }}
                          </q-td>
                          <q-td key="actions" :props="props">
                            <q-btn square size="sm" name="edit" color="primary" label='' icon='badge' :disable="loading"
                                   @click="changePermissions(props.row)">
                              <q-tooltip>
                                {{ $t('change-permission') }}
                              </q-tooltip>
                            </q-btn>
                            <q-btn square size="sm" name="block" :color=" props.row.blocked ? 'indigo' : 'deep-orange'"
                                   label='' :icon="props.row.blocked ? 'check_circle' : 'block' "
                                   :disable="loading"
                                   @click="props.row.blocked ? unblockUser(props.row) : blockUser(props.row)">
                              <q-tooltip>
                                {{ props.row.blocked ? $t('unblock-user') : $t('block-user') }}
                              </q-tooltip>
                            </q-btn>
                            <q-btn square size="sm" name="delete" color="negative" label='' icon='person_remove'
                                   :disable="loading"
                                   @click="deleteUser(props.row)">
                              <q-tooltip>
                                {{$t('remove-user')}}
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
                                  <q-select filled v-model="permissions" :options="options" :label="$t('choose-permission')"/>
                                </q-form>
                              </div>
                            </q-card-section>
                            <q-card-actions align="center">
                              <q-btn :label="$t('confirm-changes')" type="submit" color="primary"
                                     @click="submitPermissionChange(selected_row)"/>
                              <q-btn :label="$t('cancel')" type="reset" color="negative"
                                     @click="permissions=[];permission=false"/>
                            </q-card-actions>
                          </q-card>
                        </div>
                      </div>
                    </q-dialog>
                    <q-dialog v-model="deleteConfirm">
                      <q-card>
                        <q-card-section>
                          <div class="text-h6">{{ $t('remove-user') }}</div>
                        </q-card-section>

                        <q-card-section class="q-pt-none">
                          {{$t('remove-user-confirm') + " " + selected_row.username + "?"}}
                        </q-card-section>

                        <q-card-actions align="right">
                          <q-btn flat :label="$t('confirm')" color="primary" @click="submitUserDeletion(selected_row)"/>
                          <q-btn flat :label="$t('cancel')" color="negative" @click="deleteConfirm=false"/>
                        </q-card-actions>
                      </q-card>
                    </q-dialog>
                    <q-dialog v-model="blockConfirm">
                      <q-card>
                        <q-card-section>
                          <div class="text-h6">{{ $t('block-user') }}</div>
                        </q-card-section>

                        <q-card-section class="q-pt-none">
                          {{$t('block-confirm') + " " + selected_row.username + "?"}}
                        </q-card-section>

                        <q-card-actions align="right">
                          <q-btn flat :label="$t('confirm')" color="primary" @click="submitUserBlock(selected_row)"/>
                          <q-btn flat :label="$t('cancel')" color="negative" @click="blockConfirm=false"/>
                        </q-card-actions>
                      </q-card>
                    </q-dialog>
                    <q-dialog v-model="unblockConfirm">
                      <q-card>
                        <q-card-section>
                          <div class="text-h6">{{ $t('unblock-user') }}</div>
                        </q-card-section>

                        <q-card-section class="q-pt-none">
                          {{$t('unblock-confirm') + " " + selected_row.username + "?"}}
                        </q-card-section>

                        <q-card-actions align="right">
                          <q-btn flat :label="$t('confirm')" color="primary" @click="submitUserUnblock(selected_row)"/>
                          <q-btn flat :label="$t('cancel')" color="negative" @click="unblockConfirm=false"/>
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
          <q-btn v-if="userPermission" round flat color="grey-8" stack no-caps size="26px"
                 class="GPL__side-btn" @click="$router.push('elections')">
            <q-icon size="22px" name="ballot"/>
            <div class="GPL__side-btn__label">{{ $t('elections') }}</div>
          </q-btn>

          <q-btn v-if="userPermission === 'MANAGER' || userPermission === 'AUDITOR'" round flat color="grey-8" stack no-caps
                 size="26px" class="GPL__side-btn" @click="$router.push('election-manager')">
            <q-icon size="22px" name="edit_document"/>
            <div class="GPL__side-btn__label">{{ $t('election-manager') }}</div>
          </q-btn>

          <q-btn v-if="userPermission === 'AUDITOR'" round flat color="grey-8" stack no-caps
                 size="26px" class="GPL__side-btn" @click="$router.push('auditing')">
            <q-icon size="22px" name="fact_check"/>
            <div class="GPL__side-btn__label">{{ $t('auditing') }}</div>
          </q-btn>

          <q-btn v-if="userPermission === 'ADMIN'" round flat color="grey-8" stack no-caps
                 size="26px" class="GPL__side-btn" @click="$router.push('admin')">
            <q-icon size="22px" name="admin_panel_settings"/>
            <div class="GPL__side-btn__label">{{ $t('admin') }}</div>
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
          <div v-if="userPermission">
            <q-item clickable class="GPL__drawer-item" @click="$router.push('elections')">
              <q-item-section avatar>
                <q-icon name="ballot"/>
              </q-item-section>
              <q-item-section>
                <q-item-label>{{ $t('elections') }}</q-item-label>
              </q-item-section>
            </q-item>

            <q-separator class="q-my-md"/>
          </div>
          <div v-if="userPermission === 'MANAGER' || userPermission === 'AUDITOR'">
            <q-item clickable class="GPL__drawer-item" @click="$router.push('election-manager')">
              <q-item-section avatar>
                <q-icon name="edit_document"/>
              </q-item-section>
              <q-item-section>
                <q-item-label>{{ $t('election-manager') }}</q-item-label>
              </q-item-section>
            </q-item>

            <q-separator class="q-my-md"/>
          </div>
          <div v-if="userPermission === 'AUDITOR'">
            <q-item clickable class="GPL__drawer-item" @click="$router.push('auditing')">
              <q-item-section avatar>
                <q-icon name="fact_check"/>
              </q-item-section>
              <q-item-section>
                <q-item-label>{{$t('auditing')}}</q-item-label>
              </q-item-section>
            </q-item>

            <q-separator class="q-my-md"/>
          </div>
          <div v-if="userPermission === 'ADMIN'">
            <q-item clickable class="GPL__drawer-item" @click="$router.push('admin')">
              <q-item-section avatar>
                <q-icon name="admin_panel_settings"/>
              </q-item-section>
              <q-item-section>
                <q-item-label>{{ $t('admin') }}</q-item-label>
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
              :label="$t('profile')"
              push
              size="sm"
              v-close-popup
              @click="$router.push('profile')"
          />
          <q-btn
              color="negative"
              :label="$t('logout')"
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
      v-model="blacklist"
      persistent
      full-width
  >
    <div class="flex flex-center column">
      <div id="parent" class="fit wrap justify-center items-start content-start"
           style="overflow: hidden;">
        <q-card class="no-border-radius">
          <q-toolbar>
            <q-toolbar-title><span class="text-weight-bold">{{ $t('blacklist') }}</span>
            </q-toolbar-title>
            <q-btn flat round dense icon="close" v-close-popup/>
          </q-toolbar>
          <q-card-section>
            <div class="q-pa-md">
              <q-table
                  flat bordered
                  title="Emails"
                  :rows="blacklistRows"
                  :columns="blacklistColumns"
                  row-key="email"
                  selection="multiple"
                  v-model:selected="blacklistedEmails"
                  v-model:pagination="blacklistPagination"
                  :filter="filter"
                  :loading="blacklistLoading"
                  binary-state-sort

              >
                <template v-slot:top-right>
                  <div class="gt-md">
                    <q-btn color="green" :disable="blacklistLoading" :label="$t('add-blacklist')"
                           @click="showNewBlacklisted"/>
                    <q-btn class="q-ml-sm" color="negative" :disable="blacklistLoading"
                           :label="$t('remove-blacklist')" @click="removeBlacklisted"/>
                    <q-space/>
                  </div>
                  <div class="lt-lg">
                    <q-btn
                        color="green"
                        :disable="blacklistLoading"
                        @click="showNewBlacklisted"
                        :aria-label="$t('add-blacklist')"
                        icon="add_circle"
                        class="q-ml-sm"
                    />
                    <q-btn
                        color="negative"
                        :disable="blacklistLoading"
                        @click="removeBlacklisted"
                        :aria-label="$t('remove-blacklist')"
                        icon="cancel"
                        class="q-ml-sm"
                    />
                  </div>
                </template>
              </q-table>
            </div>
          </q-card-section>
          <q-card-actions align="center">
            <q-btn :label="$t('confirm-blacklist')" color="primary" @click="submitBlacklist"
                   v-close-popup/>
            <q-btn :label="$t('close')" color="negative"
                   v-close-popup/>
          </q-card-actions>
        </q-card>
      </div>
    </div>
  </q-dialog>
  <q-dialog v-model="addBlacklisted">
    <q-card>
      <q-card-section>
        <div class="text-h6">{{ $t('insert-blacklist') }}</div>
      </q-card-section>

      <q-card-section class="q-pt-none">
        <q-form
            class="q-gutter-md"
        >
          <q-input v-model="blacklistedEmail" type="email" filled :label="$t('email-to-blacklist')"
                   :rules="[ val => !!val || 'Field must not be empty']">
          </q-input>
        </q-form>
      </q-card-section>

      <q-card-actions align="right">
        <q-btn flat :label="$t('confirm')" color="primary" @click="insertBlacklisted"/>
        <q-btn flat :label="$t('cancel')" color="negative" @click="addBlacklisted=false" v-close-popup/>
      </q-card-actions>
    </q-card>
  </q-dialog>
  <q-dialog v-model="filters">
    <q-card style="width: 100%" class="q-px-sm q-pb-md">
      <q-card-section>
        <div class="text-h6">{{ $t('filters') }}</div>
      </q-card-section>
      <q-item dense>
        <q-card-section>
          <q-toggle v-model="toggleRegular" @click="customSort" :disable="loading"
                    :label="$t('show-regular')"/>
        </q-card-section>
        <q-card-section>
          <q-toggle v-model="toggleManager" @click="customSort" :disable="loading"
                    :label="$t('show-manager')"/>
        </q-card-section>
      </q-item>
      <q-item dense>
        <q-card-section>
          <q-toggle v-model="toggleAuditor" @click="customSort" :disable="loading"
                    :label="$t('show-auditor')"/>
        </q-card-section>
        <q-card-section>
          <q-toggle v-model="toggleAdmin" @click="customSort" :disable="loading" :label="$t('show-admin')"/>
        </q-card-section>
      </q-item>
      <q-item dense>
        <q-card-section>
          <q-input dense debounce="400" color="primary" v-model="search" :disable="loading"
                   :placeholder="$t('search-email')" @keyup.enter="customSort">
            <template v-slot:append>
              <q-icon name="close" @click="clearSearch" :disable="loading" class="cursor-pointer"/>
              <q-icon name="search" @click="customSort" :disable="loading" class="cursor-pointer"/>
            </template>
          </q-input>
        </q-card-section>
      </q-item>
    </q-card>
  </q-dialog>
</template>

<script>
import {onMounted, ref} from 'vue'
import {Cookies, Notify, SessionStorage, useQuasar} from 'quasar'
import axios from "axios";
import {useRouter} from "vue-router";
import api_routes from "../../config/routes.config";
import LocaleChanger from "./Locale-Changer.vue";

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
  {name: 'display_name', align: 'center', label: 'Display Name', field: 'display_name', sortable: true},
  {name: 'username', align: 'center', label: 'Username', field: 'username', sortable: true},
  {name: 'permission', align: 'center', label: 'Permission', field: 'permission', sortable: true},
  {
    name: 'blocked',
    align: 'center',
    label: 'Blocked',
    field: 'blocked',
    sortable: true
  },
  {name: 'actions', align: 'right', label: 'Actions', field: 'actions', sortable: false},
]

const blacklistColumns = [{
  name: 'email', align: 'center', label: 'Email', field: 'email', sortable: true
}]

let originalRows = []

export default {
  name: 'Admin',
  components: {LocaleChanger},
  setup() {
    const $q = useQuasar()
    const router = useRouter();
    const tableRef = ref()
    const leftDrawerOpen = ref(false)
    const avatar = ref(null)
    const filter = ref('')
    const loading = ref(false)
    const settings = ref(false)
    const userPermission = ref('')
    const rows = ref([])
    const blacklistRows = ref([])
    const startRows = ref([])
    const permissions = ref(null)
    const permission = ref(false)
    const toggleRegular = ref(true)
    const toggleManager = ref(true)
    const toggleAuditor = ref(true)
    const toggleAdmin = ref(true)
    const search = ref('')
    const deleteConfirm = ref(false)
    const blockConfirm = ref(false)
    const unblockConfirm = ref(false)
    const blacklist = ref(false)
    const addBlacklisted = ref(false)
    const blacklistedEmail = ref('')
    const blacklistLoading = ref(false)
    const blacklistedEmails = ref([])
    const pagination = ref({
      sortBy: 'username',
      descending: false,
      page: 1,
      rowsPerPage: 5,
      rowsNumber: 10
    })
    const blacklistPagination = ref({
      sortBy: 'email',
      descending: false,
      page: 1,
      rowsPerPage: 5
    })

    function toggleLeftDrawer() {
      leftDrawerOpen.value = !leftDrawerOpen.value
    }

    async function getUsers() {
      const uri = `${api_routes.MAIN_URI}/users/user-list`
      return await axios.get(uri, {
        headers: {
          "Content-type": "application/json"
        },
        withCredentials: true
      }).then(function (response) {
        originalRows = response.data.users
        blacklistRows.value = response.data.blacklist
      }).catch(function (error) {
        if (error.response.status === 403 || error.response.status === 401) {
          router.push({name: 'AccessDenied'})
        } else {
          router.push({name: 'Error'})
        }
      })
    }

    async function changeUserPermission(id, permission) {
      const uri = `${api_routes.MAIN_URI}/users/admin/${id}`
      const data = {permission: permission}
      return await axios.patch(uri, data, {
        headers: {
          "Content-type": "application/json"
        },
        withCredentials: true
      }).then(function (response) {
        return response.data
      }).catch(function (error) {
        return error
      })
    }

    async function deleteUser(id) {
      const uri = `${api_routes.MAIN_URI}/users/admin/${id}`
      return await axios.delete(uri, {
        headers: {
          "Content-type": "application/json"
        },
        withCredentials: true
      }).then(function (response) {
        return response.data
      }).catch(function (error) {
        return error
      })
    }

    async function blockUser(id) {
      const uri = `${api_routes.MAIN_URI}/users/admin/block/${id}`
      return await axios.patch(uri, {}, {
        headers: {
          "Content-type": "application/json"
        },
        withCredentials: true
      }).then(function (response) {
        return response
      }).catch(function (error) {
        return error
      })
    }

    async function unblockUser(id) {
      const uri = `${api_routes.MAIN_URI}/users/admin/unblock/${id}`
      return await axios.patch(uri, {}, {
        headers: {
          "Content-type": "application/json"
        },
        withCredentials: true
      }).then(function (response) {
        return response
      }).catch(function (error) {
        return error
      })
    }

    async function blacklistEmails(data) {
      const uri = `${api_routes.MAIN_URI}/users//admin/blacklist`
      return await axios.post(uri, data, {
        headers: {
          "Content-type": "application/json"
        },
        withCredentials: true
      }).then(function (response) {
        return response
      }).catch(function (error) {
        return error
      })
    }

    function fetchFromServer(startRow, count, filter, sortBy, descending) {
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
    function getRowsNumberCount(filter) {
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
      userPermission.value = $q.sessionStorage.getItem('permission')
      getUsers()
      avatar.value = $q.sessionStorage.getItem('avatar') ? `${api_routes.AVATAR_URI}/${$q.sessionStorage.getItem('avatar')}` : `/src/assets/user-icon.jpg`
      tableRef.value.requestServerInteraction()
    })

    return {
      tableRef,
      userPermission,
      leftDrawerOpen,
      toggleLeftDrawer,
      filters: ref(false),
      filter,
      loading,
      pagination,
      blacklistPagination,
      columns,
      rows,
      avatar,
      settings,
      toggleRegular,
      toggleAuditor,
      toggleManager,
      toggleAdmin,
      search,
      startRows,
      blacklist,
      blacklistRows,
      blacklistColumns,
      addBlacklisted,
      blacklistedEmail,
      blacklistLoading,
      blacklistedEmails,
      openSettings() {
        settings.value = true
      },
      onRequest,
      permissions,
      options: ['REGULAR', 'MANAGER', 'AUDITOR', 'ADMIN'],
      maximizedToggle: ref(true),
      permission,
      selected_row: ref({}),
      deleteConfirm,
      blockConfirm,
      unblockConfirm,
      ph: ref(''),
      submitPermissionChange(row) {
        if (!permissions.value) {
          $q.notify({
            color: 'red-10',
            textColor: 'white',
            icon: 'cancel',
            message: 'Please choose a permission'
          })
        } else {
          loading.value = true
          setTimeout(() => {
            changeUserPermission(row.id, permissions.value).then(function (response) {
              if (row.id === $q.sessionStorage.getItem("id")) {
                $q.sessionStorage.set('permission', '');
                $q.sessionStorage.set('id', '');
                $q.sessionStorage.set('avatar', '');
                $q.cookies.remove('token');
                router.push({name: 'Login'})
              } else {
                $q.notify({
                  color: 'green-4',
                  textColor: 'white',
                  icon: 'check',
                  message: `Permission for user ${row.username} changed with success`
                })
                permissions.value = []
                permission.value = false
                getUsers()
                onRequest({filter: filter.value, pagination: pagination.value})
                loading.value = false
              }
            }).catch(function (error) {

            })
          }, 500)
        }
      },
      submitUserDeletion(row) {
        loading.value = true
        setTimeout(() => {
          deleteUser(row.id).then(function (response) {
            if (response.code) {
              if (response.code === 'ERR_BAD_REQUEST') {
                $q.notify({
                  color: 'red-10',
                  textColor: 'white',
                  icon: 'cancel',
                  message: 'Cannot delete user; User is voter in at least 1 election'
                })
                deleteConfirm.value = false
                loading.value = false
              }
              if (response.code === 'ERR_BAD_RESPONSE') {
                $q.notify({
                  color: 'red-10',
                  textColor: 'white',
                  icon: 'cancel',
                  message: 'An error has occurred, Please try again later'
                })
                deleteConfirm.value = false
                loading.value = false
              }
            } else {
              if (row.id === $q.sessionStorage.getItem("id")) {
                $q.sessionStorage.set('permission', '');
                $q.sessionStorage.set('id', '');
                $q.sessionStorage.set('avatar', '');
                $q.cookies.remove('token');
                router.push({name: 'Login'})
              } else {
                Notify.create({
                  color: 'green-4',
                  textColor: 'white',
                  icon: 'check',
                  message: `User ${row.username} deleted with success`
                })
                deleteConfirm.value = false;
                getUsers()
                onRequest({filter: filter.value, pagination: pagination.value})
                loading.value = false
              }
            }
          }).catch(function (error) {
            $q.notify({
              color: 'red-10',
              textColor: 'white',
              icon: 'cancel',
              message: 'An error has occurred, Please try again later'
            })
            deleteConfirm.value = false
            loading.value = false
          })
        }, 500)
      },
      submitUserBlock(row) {
        loading.value = true
        setTimeout(() => {
          blockUser(row.id).then(function (response) {
            if (response.code === 'ERR_BAD_REQUEST') {
              $q.notify({
                color: 'red-10',
                textColor: 'white',
                icon: 'cancel',
                message: 'Cannot block user; User is voter in at least 1 election'
              })
              blockConfirm.value = false
              loading.value = false
            } else {
              $q.notify({
                color: 'green-4',
                textColor: 'white',
                icon: 'check',
                message: `User ${row.username} blocked with success`
              })
              blockConfirm.value = false
              getUsers()
              onRequest({filter: filter.value, pagination: pagination.value})
              loading.value = false
            }
          }).catch(function (error) {
            $q.notify({
              color: 'red-10',
              textColor: 'white',
              icon: 'cancel',
              message: 'An error has occurred, Please try again later'
            })
            blockConfirm.value = false
            loading.value = false
          })
        }, 500)
      },
      submitUserUnblock(row) {
        loading.value = true
        setTimeout(() => {
          unblockUser(row.id).then(function (response) {
            $q.notify({
              color: 'green-4',
              textColor: 'white',
              icon: 'check',
              message: `User ${row.username} unblocked with success`
            })
            unblockConfirm.value = false
            getUsers()
            onRequest({filter: filter.value, pagination: pagination.value})
            loading.value = false
          }).catch(function (error) {
            $q.notify({
              color: 'red-10',
              textColor: 'white',
              icon: 'cancel',
              message: 'An error has occurred, Please try again later'
            })
            unblockConfirm.value = false
            loading.value = false
          })
        }, 500)
      },
      submitBlacklist() {
        loading.value = true
        blacklistEmails({blacklist: blacklistRows.value}).then(function (response) {
          $q.notify({
            color: 'green-4',
            textColor: 'white',
            icon: 'check',
            message: `Blacklist updated with success`
          })
          getUsers()
          onRequest({filter: filter.value, pagination: pagination.value})
        }).catch(function (error) {
          $q.notify({
            color: 'red-10',
            textColor: 'white',
            icon: 'cancel',
            message: 'An error has occurred, Please try again later'
          })
        }).finally(() => {
          loading.value = false
        })
      }
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
    blockUser(row) {
      this.selected_row = row;
      this.blockConfirm = true;
    },
    unblockUser(row) {
      this.selected_row = row;
      this.unblockConfirm = true;
    },
    customSort() {
      this.loading = true
      setTimeout(() => {
        let filteredRows = []
        const data = this.startRows
        if (this.toggleRegular) {
          const filtered = data.filter(obj =>
              obj.permission === 'REGULAR'
          )
          filteredRows.push(...filtered)
        }
        if (this.toggleAuditor) {
          const filtered = data.filter(obj =>
              obj.permission === 'AUDITOR'
          )
          filteredRows.push(...filtered)
        }
        if (this.toggleManager) {
          const filtered = data.filter(obj =>
              obj.permission === 'MANAGER'
          )
          filteredRows.push(...filtered)
        }
        if (this.toggleAdmin) {
          const filtered = data.filter(obj =>
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
    showBlacklist() {
      this.blacklist = true
    },
    showNewBlacklisted() {
      this.addBlacklisted = true
    },
    removeBlacklisted() {
      this.blacklistLoading = true
      setTimeout(() => {
        for (const be of this.blacklistedEmails) {
          const index = this.blacklistRows.findIndex(object => {
            return object.email === be.email;
          });
          this.blacklistRows.splice(index, 1);
        }
        this.blacklistedEmails = []
        this.blacklistLoading = false
      }, 500)
    },
    insertBlacklisted() {
      this.blacklistLoading = true
      setTimeout(() => {
        this.blacklistRows.push({email: this.blacklistedEmail})
        this.addBlacklisted = false
        this.blacklistedEmail = ''
        this.blacklistLoading = false
      }, 500)
      Notify.create({
        color: 'green-4',
        textColor: 'white',
        icon: 'check',
        message: `Email added to blacklist`
      })
    },
    logout() {
      SessionStorage.set('permission', '');
      SessionStorage.set('id', '');
      SessionStorage.set('avatar', '');
      SessionStorage.set('display', '');
      Cookies.remove('token');
      this.$router.push('login');
    }
  }
}
</script>

<style scoped>

</style>