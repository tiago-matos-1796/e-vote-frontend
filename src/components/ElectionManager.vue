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
                  <div class="q-pa-md q-gutter-sm">
                    <q-btn color="green" :disable="loading" icon="add" label="Add election"
                           @click="showElectionWindow"/>
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
                        binary-state-sort
                    >
                      <template v-slot:top-right>
                        <div class="q-gutter-lg-x-md">
                          <q-toggle v-model="toggleBefore" @click="customSortMain" :disable="loading" label="Show not started elections"/>
                          <q-toggle v-model="toggleDuring" @click="customSortMain" :disable="loading" label="Show ongoing elections"/>
                          <q-toggle v-model="toggleAfter" @click="customSortMain" :disable="loading" label="Show finished elections"/>
                          <q-input dense debounce="400" color="primary" v-model="searchMain" :disable="loading"
                                   placeholder="Search by election title" @keyup.enter="customSortMain">
                            <template v-slot:append>
                              <q-icon name="close" @click="clearSearchMain" :disable="loading" class="cursor-pointer"/>
                              <q-icon name="search" @click="customSortMain" :disable="loading" class="cursor-pointer"/>
                            </template>
                          </q-input>
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
                            <q-btn square size="sm" name="edit" color="amber"
                                   :disable="isAfterStart(props.row.startDate) || loading" label='' icon='edit'
                                   @click="openmodel(props.row)">
                              <q-tooltip>
                                Edit election
                              </q-tooltip>
                            </q-btn>
                            <q-btn square size="sm" name="delete" color="negative"
                                   :disable="isAfterStart(props.row.startDate) || loading" label='' icon='delete'
                                   @click="deleteElection(props.row)">
                              <q-tooltip>
                                Delete election
                              </q-tooltip>
                            </q-btn>
                            <q-btn square size="sm" name="renew" color="secondary"
                                   :disable="isAfterStart(props.row.startDate) || loading" label='' icon='key'
                                   @click="regenerateKey(props.row)">
                              <q-tooltip>
                                Regenerate election key
                              </q-tooltip>
                            </q-btn>
                            <q-btn square size="sm" name="renew" color="positive"
                                   :disable="canStatus(props.row.startDate, props.row.endDate) || loading" label=''
                                   icon='query_stats' @click="openElectionStatus(props.row)">
                              <q-tooltip>
                                Check election status
                              </q-tooltip>
                            </q-btn>
                            <q-btn square size="sm" name="results" color="primary"
                                   :disable="isAfterEnd(props.row.endDate) || loading" label='' icon='data_thresholding'
                                   @click="showResults(props.row)">
                              <q-tooltip>
                                Check election results
                              </q-tooltip>
                            </q-btn>
                            <q-btn square size="sm" name="results" color="info" :disable="hasResults(props.row.results) || loading"
                                   label='' icon='summarize' @click="showElectionResults(props.row)">
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
                                      <q-card class="no-border-radius">
                                        <q-card-section><div class="text-h6">Election Details</div></q-card-section>
                                        <q-card-section>
                                          <div class="q-pa-md">
                                            <q-form
                                                class="q-gutter-md" style="min-width: 400px; padding: 24px;"
                                            >
                                              <q-input filled v-model="electionTitle" label="Title"
                                                       placeholder="Election title" hint="Election title"
                                                       :rules="[ val => !!val || 'Election title must not be empty']"
                                              ></q-input>

                                              <div class="row">
                                                <div class="col">
                                                  <q-input filled v-model="startDate" label="Start date and time"
                                                           hint="Start date and time">
                                                    <template v-slot:prepend>
                                                      <q-icon name="event" class="cursor-pointer">
                                                        <q-popup-proxy cover transition-show="scale"
                                                                       transition-hide="scale">
                                                          <q-date v-model="startDate" mask="YYYY-MM-DD HH:mm"
                                                                  :options="startDateOptions">
                                                            <div class="row items-center justify-end">
                                                              <q-btn v-close-popup label="Close" color="primary" flat/>
                                                            </div>
                                                          </q-date>
                                                        </q-popup-proxy>
                                                      </q-icon>
                                                    </template>

                                                    <template v-slot:append>
                                                      <q-icon name="access_time" class="cursor-pointer">
                                                        <q-popup-proxy cover transition-show="scale"
                                                                       transition-hide="scale">
                                                          <q-time v-model="startDate" mask="YYYY-MM-DD HH:mm" format24h>
                                                            <div class="row items-center justify-end">
                                                              <q-btn v-close-popup label="Close" color="primary" flat/>
                                                            </div>
                                                          </q-time>
                                                        </q-popup-proxy>
                                                      </q-icon>
                                                    </template>
                                                  </q-input>
                                                </div>
                                                <div class="col">
                                                  <q-input filled v-model="endDate" label="End date and time"
                                                           hint="End date and time" :disable="allowEndDate"
                                                           :rules="[ val => confirmDates(val, 'INSERT') || 'End date must be after start date']">
                                                    <template v-slot:prepend>
                                                      <q-icon name="event" class="cursor-pointer">
                                                        <q-popup-proxy cover transition-show="scale"
                                                                       transition-hide="scale">
                                                          <q-date v-model="endDate" mask="YYYY-MM-DD HH:mm"
                                                                  :options="endDateOptions">
                                                            <div class="row items-center justify-end">
                                                              <q-btn v-close-popup label="Close" color="primary" flat/>
                                                            </div>
                                                          </q-date>
                                                        </q-popup-proxy>
                                                      </q-icon>
                                                    </template>

                                                    <template v-slot:append>
                                                      <q-icon name="access_time" class="cursor-pointer">
                                                        <q-popup-proxy cover transition-show="scale"
                                                                       transition-hide="scale">
                                                          <q-time v-model="endDate" mask="YYYY-MM-DD HH:mm" format24h>
                                                            <div class="row items-center justify-end">
                                                              <q-btn v-close-popup label="Close" color="primary" flat/>
                                                            </div>
                                                          </q-time>
                                                        </q-popup-proxy>
                                                      </q-icon>
                                                    </template>
                                                  </q-input>
                                                </div>
                                              </div>
                                              <q-input filled v-model="electionKey" label="Election Key"
                                                       placeholder="Election Key" hint="Election Key" clear-icon="close"
                                                       :type="isPwd ? 'password' : 'text'"
                                                       :rules="[ val => !!val || 'Election key must not be empty' ,val => val.length >= 16 || 'Election key must be 16 characters long',
              val => val.match('^(?=(.*[a-z]){1,})(?=(.*[A-Z]){1,})(?=(.*[0-9]){1,})(?=(.*[!@#$%^&*()\\-__+.]){1,}).{8,}$') || 'Election key must have upper and lower case characters, special characters and digits',]"
                                              >
                                                <template v-slot:append>
                                                  <q-icon
                                                      :name="isPwd ? 'visibility_off' : 'visibility'"
                                                      class="cursor-pointer"
                                                      @click="isPwd = !isPwd"
                                                  />
                                                </template>
                                              </q-input>
                                              <q-input filled v-model="electionKey1" label="Confirm Election Key"
                                                       placeholder="Election Key" hint="Confirm Election Key"
                                                       clear-icon="close"
                                                       :type="isPwd1 ? 'password' : 'text'"
                                                       :rules="[ val => !!val || 'Election key must not be empty', val => val.length >= 16 || 'Election key must be 16 characters long',
              val => val.match('^(?=(.*[a-z]){1,})(?=(.*[A-Z]){1,})(?=(.*[0-9]){1,})(?=(.*[!@#$%^&*()\\-__+.]){1,}).{8,}$') || 'Election key must have upper and lower case characters, special characters and digits', val => val === electionKey || 'Election key must be the same as above']"
                                              >
                                                <template v-slot:append>
                                                  <q-icon
                                                      :name="isPwd1 ? 'visibility_off' : 'visibility'"
                                                      class="cursor-pointer"
                                                      @click="isPwd1 = !isPwd1"
                                                  />
                                                </template>
                                              </q-input>
                                            </q-form>
                                          </div>
                                        </q-card-section>
                                      </q-card>
                                      <q-card class="no-border-radius">
                                        <q-card-section><div class="text-h6">Candidates</div></q-card-section>
                                        <q-card-section>
                                          <div class="q-pa-md">
                                            <q-table
                                                flat bordered
                                                title=""
                                                :rows="candidateRows"
                                                :columns="candidateColumns"
                                                row-key="id"
                                                :selected-rows-label="getSelectedString"
                                                selection="multiple"
                                                v-model:selected="selectedCandidates"
                                                :loading="candidateLoading"
                                                binary-state-sort
                                            >
                                              <template v-slot:top-right>
                                                <q-btn color="green" :disable="candidateLoading" label="Add candidate"
                                                       @click="newCandidate"/>
                                                <q-btn class="q-ml-sm" color="negative" :disable="candidateLoading"
                                                       label="Remove candidates" @click="removeCandidate"/>
                                                <q-space/>
                                              </template>
                                              <template v-slot:body="props">
                                                <q-tr :props="props">
                                                  <q-td>
                                                    <q-checkbox v-model="props.selected"/>
                                                  </q-td>
                                                  <q-td key="name" :props="props">
                                                    {{ props.row.name }}
                                                    <q-popup-edit v-model="props.row.name" v-slot="scope">
                                                      <q-input v-model="scope.value" dense autofocus counter
                                                               @keyup.enter="scope.set"></q-input>
                                                    </q-popup-edit>
                                                  </q-td>
                                                </q-tr>
                                              </template>
                                            </q-table>
                                          </div>
                                        </q-card-section>
                                      </q-card>
                                      <q-card class="no-border-radius">
                                        <q-card-section><div class="text-h6">Voters</div></q-card-section>
                                        <q-card-section>
                                          <div class="q-pa-md">
                                            <q-table
                                                flat bordered
                                                title=""
                                                :rows="voterRows"
                                                :columns="userColumns"
                                                row-key="id"
                                                :selected-rows-label="getSelectedString"
                                                selection="multiple"
                                                v-model:selected="selectedVoters"
                                                :filter="filter"
                                                :loading="voterLoading"
                                                binary-state-sort
                                            >

                                              <template v-slot:top-right>
                                                <q-btn color="green" :disable="voterLoading" label="Add voter"
                                                       @click="showVoterAdd"/>
                                                <q-btn class="q-ml-sm" color="negative" :disable="voterLoading"
                                                       label="Remove voter" @click="removeVoters"/>
                                                <q-space/>
                                              </template>
                                            </q-table>
                                          </div>
                                        </q-card-section>
                                      </q-card>
                                    </q-card-section>
                                    <q-card-actions align="center">
                                      <q-btn label="Create election" @click="createElection" color="primary"/>
                                      <q-btn label="Cancel" type="reset" color="negative" @click="undoElection"
                                             v-close-popup/>
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
                        v-model="editElection"
                        persistent
                        :maximized="maximizedToggle"
                        transition-show="slide-up"
                        transition-hide="slide-down"
                    >
                      <q-card class="bg-blue-grey-2 text-black">
                        <q-bar>
                          <div class="text-h6">Edit election {{ selected_row.title }}</div>
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
                                      <div class="q-pa-md">
                                        <q-card class="no-border-radius">
                                          <q-card-section><div class="text-h6">Election Details</div></q-card-section>
                                          <q-card-section>
                                            <div class="q-pa-md">
                                              <q-form
                                                  class="q-gutter-md" style="min-width: 400px; padding: 24px;"
                                              >
                                                <q-input filled v-model="editElectionTitle" label="Title"
                                                         placeholder="Election title" hint="Election title"
                                                         :rules="[ val => !!val || 'Election title must not be empty']"
                                                ></q-input>

                                                <div class="row">
                                                  <div class="col">
                                                    <q-input filled v-model="editStartDate" label="Start date and time"
                                                             hint="Start date and time">
                                                      <template v-slot:prepend>
                                                        <q-icon name="event" class="cursor-pointer">
                                                          <q-popup-proxy cover transition-show="scale"
                                                                         transition-hide="scale">
                                                            <q-date v-model="editStartDate" mask="YYYY-MM-DD HH:mm"
                                                                    :options="startDateOptions">
                                                              <div class="row items-center justify-end">
                                                                <q-btn v-close-popup label="Close" color="primary" flat/>
                                                              </div>
                                                            </q-date>
                                                          </q-popup-proxy>
                                                        </q-icon>
                                                      </template>

                                                      <template v-slot:append>
                                                        <q-icon name="access_time" class="cursor-pointer">
                                                          <q-popup-proxy cover transition-show="scale"
                                                                         transition-hide="scale">
                                                            <q-time v-model="editStartDate" mask="YYYY-MM-DD HH:mm" format24h>
                                                              <div class="row items-center justify-end">
                                                                <q-btn v-close-popup label="Close" color="primary" flat/>
                                                              </div>
                                                            </q-time>
                                                          </q-popup-proxy>
                                                        </q-icon>
                                                      </template>
                                                    </q-input>
                                                  </div>
                                                  <div class="col">
                                                    <q-input filled v-model="editEndDate" label="End date and time"
                                                             hint="End date and time" :disable="allowEditEndDate"
                                                             :rules="[ val => confirmDates(val, 'EDIT') || 'End date must be after start date']">
                                                      <template v-slot:prepend>
                                                        <q-icon name="event" class="cursor-pointer">
                                                          <q-popup-proxy cover transition-show="scale"
                                                                         transition-hide="scale">
                                                            <q-date v-model="editEndDate" mask="YYYY-MM-DD HH:mm"
                                                                    :options="endDateOptions">
                                                              <div class="row items-center justify-end">
                                                                <q-btn v-close-popup label="Close" color="primary" flat/>
                                                              </div>
                                                            </q-date>
                                                          </q-popup-proxy>
                                                        </q-icon>
                                                      </template>

                                                      <template v-slot:append>
                                                        <q-icon name="access_time" class="cursor-pointer">
                                                          <q-popup-proxy cover transition-show="scale"
                                                                         transition-hide="scale">
                                                            <q-time v-model="editEndDate" mask="YYYY-MM-DD HH:mm" format24h>
                                                              <div class="row items-center justify-end">
                                                                <q-btn v-close-popup label="Close" color="primary" flat/>
                                                              </div>
                                                            </q-time>
                                                          </q-popup-proxy>
                                                        </q-icon>
                                                      </template>
                                                    </q-input>
                                                  </div>
                                                </div>
                                              </q-form>
                                            </div>
                                          </q-card-section>
                                        </q-card>
                                        <q-card class="no-border-radius">
                                          <q-card-section><div class="text-h6">Candidates</div></q-card-section>
                                          <q-card-section>
                                            <div class="q-pa-md">
                                              <q-table
                                                  flat bordered
                                                  title=""
                                                  :rows="editCandidateRows"
                                                  :columns="candidateColumns"
                                                  row-key="id"
                                                  :selected-rows-label="getSelectedString"
                                                  selection="multiple"
                                                  v-model:selected="editSelectedCandidates"
                                                  :filter="filter"
                                                  :loading="editCandidateLoading"
                                                  binary-state-sort
                                              >

                                                <template v-slot:top-right>
                                                  <q-btn color="green" :disable="editCandidateLoading" label="Add candidate"
                                                         @click="showEditNewCandidate"/>
                                                  <q-btn class="q-ml-sm" color="negative" :disable="editCandidateLoading"
                                                         label="Remove candidates" @click="editRemoveCandidate"/>
                                                  <q-space/>
                                                </template>
                                                <template v-slot:body="props">
                                                  <q-tr :props="props">
                                                    <q-td>
                                                      <q-checkbox v-model="props.selected"/>
                                                    </q-td>
                                                    <q-td key="name" :props="props">
                                                      {{ props.row.name }}
                                                      <q-popup-edit v-model="props.row.name" v-slot="scope">
                                                        <q-input v-model="scope.value" dense autofocus counter
                                                                 @keyup.enter="scope.set"></q-input>
                                                      </q-popup-edit>
                                                    </q-td>
                                                  </q-tr>
                                                </template>

                                              </q-table>
                                            </div>
                                          </q-card-section>
                                        </q-card>
                                        <q-card class="no-border-radius">
                                          <q-card-section><div class="text-h6">Voters</div></q-card-section>
                                          <q-card-section>
                                            <div class="q-pa-md">
                                              <q-table
                                                  flat bordered
                                                  title=""
                                                  :rows="editVoterRows"
                                                  :columns="userColumns"
                                                  row-key="id"
                                                  :selected-rows-label="getSelectedString"
                                                  selection="multiple"
                                                  v-model:selected="editSelectedVoters"
                                                  :filter="filter"
                                                  :loading="editVoterLoading"
                                                  binary-state-sort
                                              >

                                                <template v-slot:top-right>
                                                  <q-btn color="green" :disable="editVoterLoading" label="Add voter"
                                                         @click="editShowVoterAdd"/>
                                                  <q-btn class="q-ml-sm" color="negative" :disable="editVoterLoading"
                                                         label="Remove voter" @click="editRemoveVoters"/>
                                                  <q-space/>
                                                </template>
                                              </q-table>
                                            </div>
                                          </q-card-section>
                                        </q-card>
                                        <q-card class="no-border-radius">
                                          <q-card-section><div class="text-h6">Managers</div></q-card-section>
                                          <q-card-section>
                                            <div class="q-pa-md">
                                              <q-table
                                                  flat bordered
                                                  title=""
                                                  :rows="managerRows"
                                                  :columns="userColumns"
                                                  row-key="id"
                                                  :selected-rows-label="getSelectedString"
                                                  selection="multiple"
                                                  v-model:selected="selectedManager"
                                                  :filter="filter"
                                                  :loading="managerLoading"
                                                  binary-state-sort
                                              >

                                                <template v-slot:top-right>
                                                  <q-btn color="green" :disable="managerLoading" label="Add manager"
                                                         @click="showManagerAdd"/>
                                                  <q-btn class="q-ml-sm" color="negative" :disable="managerLoading"
                                                         label="Remove manager" @click="editRemoveManagers"/>
                                                  <q-space/>
                                                </template>
                                              </q-table>
                                            </div>
                                          </q-card-section>
                                        </q-card>
                                      </div>
                                    </q-card-section>
                                    <q-card-actions align="center">
                                      <q-btn label="Confirm changes" type="submit" color="primary"
                                             @click="confirmElectionEdit(selected_row.id)"/>
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
                          Are you sure you want to delete election {{ selected_row.title }}?
                        </q-card-section>

                        <q-card-actions align="right">
                          <q-btn flat label="Confirm" color="primary" @click="removeElection(selected_row.id)"
                                 v-close-popup/>
                          <q-btn flat label="Cancel" color="negative" @click="deleteConfirm=false" v-close-popup/>
                        </q-card-actions>
                      </q-card>
                    </q-dialog>
                    <q-dialog v-model="renewKey">
                      <q-card>
                        <q-card-section>
                          <div class="text-h6">Please insert the new election key for election
                            {{ selected_row.title }}
                          </div>
                        </q-card-section>

                        <q-card-section class="q-pt-none">
                          <q-form
                              class="q-gutter-md"
                          >
                            <q-input v-model="newElectionKey" filled hint="New election key"
                                     :type="hideKey ? 'password' : 'text'"
                                     :rules="[ val => !!val || 'Election key must not be empty' ,val => val.length >= 16 || 'Election key must be 16 characters long',
              val => val.match('^(?=(.*[a-z]){1,})(?=(.*[A-Z]){1,})(?=(.*[0-9]){1,})(?=(.*[!@#$%^&*()\\-__+.]){1,}).{8,}$') || 'Election key must have upper and lower case characters, special characters and digits',]"
                            >
                              <template v-slot:append>
                                <q-icon
                                    :name="hideKey ? 'visibility_off' : 'visibility'"
                                    class="cursor-pointer"
                                    @click="hideKey = !hideKey"
                                />
                              </template>
                            </q-input>
                            <q-input v-model="newElectionKey1" filled hint="Confirm new election key"
                                     :type="hideKey1 ? 'password' : 'text'"
                                     :rules="[ val => !!val || 'Election key must not be empty', val => val.length >= 16 || 'Election key must be 16 characters long',
              val => val.match('^(?=(.*[a-z]){1,})(?=(.*[A-Z]){1,})(?=(.*[0-9]){1,})(?=(.*[!@#$%^&*()\\-__+.]){1,}).{8,}$') || 'Election key must have upper and lower case characters, special characters and digits', val => val === newElectionKey || 'Election key must be the same as above']"
                            >
                              <template v-slot:append>
                                <q-icon
                                    :name="hideKey1 ? 'visibility_off' : 'visibility'"
                                    class="cursor-pointer"
                                    @click="hideKey1 = !hideKey1"
                                />
                              </template>
                            </q-input>
                          </q-form>
                        </q-card-section>

                        <q-card-actions align="right">
                          <q-btn flat label="Confirm" color="primary" @click="renewElectionKey(selected_row.id)"/>
                          <q-btn flat label="Cancel" color="negative" @click="newElectionKey='';renewKey=false"/>
                        </q-card-actions>
                      </q-card>
                    </q-dialog>
                    <q-dialog v-model="electionResults">
                      <q-card>
                        <q-card-section>
                          <div class="text-h6">Please insert the election key for election {{ selected_row.title }}
                          </div>
                        </q-card-section>

                        <q-card-section class="q-pt-none">
                          <q-form
                              class="q-gutter-md"
                          >
                            <q-input v-model="resultsElectionKey" filled hint="Election key"
                                     :type="hideResultsKey ? 'password' : 'text'"
                                     :rules="[ val => !!val || 'Election key must not be empty', val => val.length >= 16 || 'Election key must be 16 characters long',
              val => val.match('^(?=(.*[a-z]){1,})(?=(.*[A-Z]){1,})(?=(.*[0-9]){1,})(?=(.*[!@#$%^&*()\\-__+.]){1,}).{8,}$') || 'Election key must have upper and lower case characters, special characters and digits']"
                            >
                              <template v-slot:append>
                                <q-icon
                                    :name="hideResultsKey ? 'visibility_off' : 'visibility'"
                                    class="cursor-pointer"
                                    @click="hideResultsKey = !hideResultsKey"
                                />
                              </template>
                            </q-input>
                          </q-form>
                        </q-card-section>

                        <q-card-actions align="right">
                          <q-btn flat label="Confirm" color="primary" @click="countElectionResults(selected_row.id)"/>
                          <q-btn flat label="Cancel" color="negative"
                                 @click="resultsElectionKey='';electionResults=false"/>
                        </q-card-actions>
                      </q-card>
                    </q-dialog>
                    <q-dialog
                        v-model="electionStatus"
                        persistent
                        :maximized="maximizedToggle"
                        transition-show="slide-up"
                        transition-hide="slide-down"
                    >
                      <q-card class="bg-blue-grey-2 text-black">
                        <q-bar>
                          <div class="text-h6">{{ selected_row.title }} status</div>
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
                                          </div>
                                          <div class="col">
                                            <q-card
                                                class="my-card"
                                            >
                                              <q-card-section>
                                                <div class="text-h6">Submitted Votes</div>
                                              </q-card-section>

                                              <q-card-section class="q-pt-none">
                                                <Pie :data="statusData" :options="statusOptions"/>
                                              </q-card-section>
                                            </q-card>
                                          </div>
                                          <div class="col">
                                          </div>
                                        </div>
                                      </div>
                                      <div class="q-pa-md">
                                        <q-table
                                            flat bordered
                                            title="Voters"
                                            :rows="statusRows"
                                            :columns="voterColumns"
                                            row-key="email"
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
                    <q-dialog v-model="addCandidate">
                      <q-card>
                        <q-card-section>
                          <div class="text-h6">Please insert the name of the new candidate</div>
                        </q-card-section>

                        <q-card-section class="q-pt-none">
                          <q-form
                              class="q-gutter-md"
                          >
                            <q-input v-model="candidateName" type="text" filled hint="Candidate name"
                                     :rules="[ val => !!val || 'Candidate name must not be empty']">
                            </q-input>
                            <q-file
                                v-model="candidateImage"
                                label="Choose image (max 2MB)"
                                filled
                                counter
                                accept=".jpg, .png, .svg, image/*"
                                max-file-size="2097152"
                                @rejected="rejectCandidateImage"
                            />
                          </q-form>
                        </q-card-section>

                        <q-card-actions align="right">
                          <q-btn flat label="Confirm" color="primary" @click="insertNewCandidate" v-close-popup/>
                          <q-btn flat label="Cancel" color="negative" @click="addCandidate=false" v-close-popup/>
                        </q-card-actions>
                      </q-card>
                    </q-dialog>
                    <q-dialog v-model="editAddCandidate">
                      <q-card>
                        <q-card-section>
                          <div class="text-h6">Please insert the name of the new candidate</div>
                        </q-card-section>

                        <q-card-section class="q-pt-none">
                          <q-form
                              class="q-gutter-md"
                          >
                            <q-input v-model="editCandidateName" type="text" filled hint="Candidate name"
                                     :rules="[ val => !!val || 'Candidate name must not be empty']">
                            </q-input>
                            <q-file
                                v-model="editCandidateImage"
                                label="Choose image (max 2MB)"
                                filled
                                counter
                                accept=".jpg, .png, .svg, image/*"
                                max-file-size="2097152"
                                @rejected="rejectCandidateImage"
                            />
                          </q-form>
                        </q-card-section>

                        <q-card-actions align="right">
                          <q-btn flat label="Confirm" color="primary" @click="editInsertNewCandidate" v-close-popup/>
                          <q-btn flat label="Cancel" color="negative" @click="editAddCandidate=false" v-close-popup/>
                        </q-card-actions>
                      </q-card>
                    </q-dialog>
                    <q-dialog
                        v-model="newVoter"
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
                                    flat bordered
                                    title="Users"
                                    :rows="userRows"
                                    :columns="userColumns"
                                    row-key="id"
                                    :selected-rows-label="getSelectedString"
                                    selection="multiple"
                                    v-model:selected="newVoterSelected"
                                    :filter="filter"
                                    :loading="newVoterLoading"
                                    binary-state-sort
                                >
                                </q-table>
                              </div>
                            </q-card-section>
                            <q-card-actions align="center">
                              <q-btn label="Add selected voters" type="submit" color="primary" @click="insertNewVoter"/>
                              <q-btn label="Cancel" type="reset" color="negative" @click="this.newVoterSelected = []"
                                     v-close-popup/>
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
                                    flat bordered
                                    title="Users"
                                    :rows="userManagerRows"
                                    :columns="userColumns"
                                    row-key="id"
                                    :selected-rows-label="getSelectedString"
                                    selection="multiple"
                                    v-model:selected="newManagerSelected"
                                    :filter="filter"
                                    :loading="newManagerLoading"
                                    binary-state-sort
                                >
                                </q-table>
                              </div>
                            </q-card-section>
                            <q-card-actions align="center">
                              <q-btn label="Add selected voters" type="submit" color="primary"
                                     @click="editInsertNewManager"/>
                              <q-btn label="Cancel" type="reset" color="negative" @click="this.newManagerSelected = []"
                                     v-close-popup/>
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
                                      <q-btn label="Download XLS" color="secondary"/>
                                      <q-btn label="Download PDF" color="primary"/>
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
                    <q-dialog
                        v-model="editNewVoter"
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
                                    flat bordered
                                    title="Users"
                                    :rows="editUserRows"
                                    :columns="userColumns"
                                    row-key="id"
                                    :selected-rows-label="getSelectedString"
                                    selection="multiple"
                                    v-model:selected="editNewVoterSelected"
                                    :filter="filter"
                                    :loading="editNewVoterLoading"
                                    binary-state-sort
                                >
                                </q-table>
                              </div>
                            </q-card-section>
                            <q-card-actions align="center">
                              <q-btn label="Add selected voters" type="submit" color="primary"
                                     @click="editInsertNewVoter"/>
                              <q-btn label="Cancel" type="reset" color="negative" @click="this.newVoterSelected = []"
                                     v-close-popup/>
                            </q-card-actions>
                          </q-card>
                        </div>
                      </div>
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
import {ArcElement, Chart as ChartJS, Legend, Tooltip} from 'chart.js'
import {Pie} from 'vue-chartjs'
import moment from 'moment'
import {v1} from 'uuid'

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
  {name: 'endDate', align: 'center', label: 'End Date', field: 'endDate', sortable: true},
  {name: 'actions', align: 'right', label: 'Actions', field: 'actions', sortable: false},
]

let rows = [
  {id: 1, title: 'Election1', startDate: '13-02-2023 00:00', endDate: '15-06-2032 00:00', voted: true, results: null},
  {
    id: 2,
    title: 'Ice cream sandwich',
    startDate: '13-02-2023 00:00',
    endDate: '15-06-2032 00:00',
    voted: true,
    results: null
  },
  {id: 3, title: 'Eclair', startDate: '13-02-2023 00:00', endDate: '15-06-2032 00:00', voted: false, results: null},
  {id: 4, title: 'Cupcake', startDate: '13-02-2023 00:00', endDate: '15-06-2032 00:00', voted: false, results: null},
  {id: 5, title: 'Election2', startDate: '13-07-2023 00:00', endDate: '15-06-2032 00:00', voted: false, results: null},
  {
    id: 6,
    title: 'Election3',
    startDate: '13-05-2023 00:00',
    endDate: '15-06-2023 00:00',
    voted: true,
    results: '{a:1,b:2}'
  }
]

const candidateColumns = [
  {
    name: 'name',
    required: true,
    label: 'Name',
    align: 'center',
    field: row => row.name,
    format: val => `${val}`,
    sortable: true
  }
]

const userColumns = [
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

const userRows = [
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

const statusRows = [
  {displayName: 'A', email: 'a@a.a', voted: true},
  {displayName: 'B', email: 'b@b.b', voted: true},
  {displayName: 'C', email: 'c@c.c', voted: false},
  {displayName: 'D', email: 'd@d.d', voted: false},
  {displayName: 'E', email: 'e@e.e', voted: false},
  {displayName: 'F', email: 'f@f.f', voted: false},
  {displayName: 'G', email: 'g@g.g', voted: false},
]

const statusData = {
  labels: ['Voted', 'Yet to vote'],
  datasets: [
    {
      backgroundColor: ['#416db8', '#b64b3c'],
      data: [2, 5]
    }
  ]
}

const statusOptions = {
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
  setup() {
    const $q = useQuasar()
    const tableRef = ref()
    const candidateRows = ref([])
    const filter = ref('')
    const loading = ref(false)
    const startRows = rows
    const candidateLoading = ref(false)
    const selected = ref([])
    const selectedCandidates = ref([])
    const voterLoading = ref(false)
    const newVoterSelected = ref([])
    const newVoterLoading = ref(false)
    const selectedVoters = ref([])
    const voterRows = ref([])
    const settings = ref(false)
    const startDate = ref('')
    const allowEndDate = ref(true)
    const minEndDate = ref('')
    const allowEditEndDate = ref(true)
    const editCandidateRows = ref([
      {id: 1, name: 'candidate1'},
      {id: 2, name: 'candidate2'},
      {id: 3, name: 'candidate3'},
      {id: 4, name: 'candidate4'}
    ])
    const editVoterRows = ref([
      {id: 1, displayName: 'A', email: 'a@a.a'},
      {id: 2, displayName: 'B', email: 'b@b.b'},
      {id: 3, displayName: 'C', email: 'c@c.c'},
    ])
    const editUserRows = ref([
      {id: 4, displayName: 'D', email: 'd@d.d'},
      {id: 5, displayName: 'E', email: 'e@e.e'}
    ])
    const editSelectedCandidates = ref([])
    const editCandidateLoading = ref(false)
    const editNewVoterSelected = ref([])
    const editNewVoterLoading = ref(false)
    const editSelectedVoters = ref([])
    const editVoterLoading = ref(false)
    const managerRows = ref([
      {id: 1, displayName: 'Manager1', email: 'manager1@man.man'},
      {id: 2, displayName: 'Manager2', email: 'manager2@man.man'}
    ])
    const userManagerRows = ref([
      {id: 3, displayName: 'Manager3', email: 'manager3@man.man'},
      {id: 4, displayName: 'Manager4', email: 'manager4@man.man'}
    ])
    const newManagerSelected = ref([])
    const newManagerLoading = ref(false)
    const managerLoading = ref(false)
    const selectedManager = ref([])
    const newElectionKey = ref('')
    const toggleBefore = ref(true)
    const toggleDuring = ref(true)
    const toggleAfter = ref(true)
    const searchMain = ref('')
    const searchCandidate = ref('')
    const pagination = ref({
      sortBy: 'title',
      descending: false,
      page: 1,
      rowsPerPage: 5,
    })

    function confirmDates(date, type) {
      if (date.length === 0) {
        return true;
      } else {
        if (type === 'INSERT') {
          return moment(this.startDate).isBefore(date)
        }
        if (type === 'EDIT') {
          return moment(this.editStartDate).isBefore(date)
        }
      }
    }

    function isAfterStart(date) {
      return moment().isAfter(moment(date, 'DD-MM-YYYY HH:mm'));
    }

    function isAfterEnd(date) {
      return !moment().isAfter(moment(date, 'DD-MM-YYYY HH:mm'));
    }

    function hasResults(results) {
      return !results;
    }

    function canStatus(start, end) {
      return !(moment().isAfter(moment(start, 'DD-MM-YYYY HH:mm')) && moment().isBefore(moment(end, 'DD-MM-YYYY HH:mm')));
    }

    return {
      tableRef,
      filter,
      loading,
      pagination,
      columns,
      rows,
      startRows,
      candidateColumns,
      candidateRows,
      selected,
      isAfterStart,
      isAfterEnd,
      canStatus,
      hasResults,
      getSelectedString() {
        return selected.value.length === 0 ? '' : `${selected.value.length} record${selected.value.length > 1 ? 's' : ''} selected of ${candidateRows.length}`
      },
      userColumns,
      userRows,
      managerRows,
      toggleBefore,
      toggleDuring,
      toggleAfter,
      searchMain,
      searchCandidate,
      newVoter: ref(false),
      newManager: ref(false),
      candidateName: ref(null),
      addCandidate: ref(false),
      maximizedToggle: ref(true),
      confirmDates,
      editElection: ref(false),
      newElection: ref(false),
      selected_row: ref({}),
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
      settings,
      electionTitle: ref(''),
      startDate,
      startDateOptions(date) {
        const today = moment().format('YYYY/MM/DD')
        return date >= today
      },
      minEndDate,
      endDate: ref(''),
      allowEndDate,
      endDateOptions(date) {
        const minDate = moment().format('YYYY/MM/DD')
        return date >= minDate
      },
      electionKey: ref(null),
      electionKey1: ref(null),
      isPwd: ref(true),
      isPwd1: ref(true),
      openSettings() {
        settings.value = true
      },
      candidateImage: ref(null),
      rejectCandidateImage() {
        $q.notify({
          type: 'negative',
          message: `Invalid image, please make sure the image is in accepted format (jpeg, png, svg) and has a size of up to 2MB`
        })
      },
      selectedCandidates,
      candidateLoading,
      removeCandidate() {
        candidateLoading.value = true
        setTimeout(() => {
          for (const sc of selectedCandidates.value) {
            const index = candidateRows.value.findIndex(object => {
              return object.id === sc.id;
            });
            candidateRows.value.splice(index, 1)
          }
          selectedCandidates.value = []
          candidateLoading.value = false
        }, 500)
      },
      newVoterSelected,
      newVoterLoading,
      voterRows,
      voterLoading,
      selectedVoters,
      removeVoters() {
        voterLoading.value = true
        setTimeout(() => {
          for (const sv of selectedVoters.value) {
            const index = voterRows.value.findIndex(object => {
              return object.id === sv.id;
            });
            voterRows.value.splice(index, 1);
            userRows.push(sv)
          }
          selectedVoters.value = []
          voterLoading.value = false
        }, 500)
      },
      editElectionTitle: ref(''),
      editStartDate: ref(''),
      editEndDate: ref(''),
      allowEditEndDate,
      editCandidateRows,
      editSelectedCandidates,
      editCandidateLoading,
      editAddCandidate: ref(false),
      editCandidateName: ref(null),
      editCandidateImage: ref(null),
      editRemoveCandidate() {
        editCandidateLoading.value = true
        setTimeout(() => {
          for (const sc of editSelectedCandidates.value) {
            const index = editCandidateRows.value.findIndex(object => {
              return object.id === sc.id;
            });
            editCandidateRows.value.splice(index, 1)
          }
          editSelectedCandidates.value = []
          editCandidateLoading.value = false
        }, 500)
      },
      editVoterRows,
      editNewVoter: ref(false),
      editUserRows,
      editNewVoterSelected,
      editNewVoterLoading,
      editSelectedVoters,
      editVoterLoading,
      editRemoveVoters() {
        editVoterLoading.value = true
        setTimeout(() => {
          for (const esv of editSelectedVoters.value) {
            const index = editVoterRows.value.findIndex(object => {
              return object.id === esv.id;
            });
            editVoterRows.value.splice(index, 1);
            editUserRows.value.push(esv)
          }
          editSelectedVoters.value = []
          editVoterLoading.value = false
        }, 500)
      },
      userManagerRows,
      newManagerSelected,
      newManagerLoading,
      managerLoading,
      selectedManager,
      editRemoveManagers() {
        managerLoading.value = true
        setTimeout(() => {
          for (const sm of selectedManager.value) {
            const index = managerRows.value.findIndex(object => {
              return object.id === sm.id;
            });
            managerRows.value.splice(index, 1)
            userManagerRows.value.push(sm)
          }
          selectedManager.value = []
          managerLoading.value = false
        }, 500)
      },
      newElectionKey,
      newElectionKey1: ref(''),
      hideKey: ref(true),
      hideKey1: ref(true),
      hideResultsKey: ref(true),
      resultsElectionKey: ref(''),
      electionStatus: ref(false),
      statusOptions,
      statusData,
      statusRows
    }
  },
  watch: {
    startDate: function (value) {
      this.allowEndDate = value
      this.minEndDate = moment(value).format('YYYY/MM/DD')
    },
    editStartDate: function (value) {
      this.allowEditEndDate = value
    }
  },
  computed: {},
  methods: {
    openmodel(row) {
      this.selected_row = row;
      this.editElectionTitle = row.title;
      this.editStartDate = row.startDate;
      this.editEndDate = row.endDate;
      this.editElection = true;
    },
    deleteElection(row) {
      this.selected_row = row;
      this.deleteConfirm = true;
    },
    regenerateKey(row) {
      this.selected_row = row;
      this.renewKey = true;
    },
    showResults(row) {
      this.selected_row = row;
      this.electionResults = true;
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
    showEditNewCandidate() {
      this.editAddCandidate = true
    },
    editShowVoterAdd() {
      this.editNewVoter = true
    },
    insertNewCandidate() {
      this.candidateLoading = true
      const candidateName = this.candidateName;
      this.candidateRows.push({id: v1(), name: candidateName});
      this.candidateName = '';
      this.addCandidate = false;
      this.candidateLoading = false
    },
    editInsertNewCandidate() {
      this.editCandidateLoading = true
      setTimeout(() => {
        const name = this.editCandidateName
        this.editCandidateRows.push({id: v1(), name: name})
        this.editCandidateName = ''
        this.editAddCandidate = false
        this.editCandidateLoading = false
      }, 500)
    },
    insertNewVoter() {
      this.newVoterLoading = true
      setTimeout(() => {
        for (const nv of this.newVoterSelected) {
          const index = this.userRows.findIndex(object => {
            return object.id === nv.id;
          });
          this.userRows.splice(index, 1)
          this.voterRows.push(nv);
        }
        this.newVoterSelected = []
        this.newVoterLoading = false
      }, 500)
      this.newVoter = false
    },
    editInsertNewVoter() {
      this.editNewVoterLoading = true
      setTimeout(() => {
        for (const env of this.editNewVoterSelected) {
          const index = this.editVoterRows.findIndex(object => {
            return object.id === env.id;
          });
          this.editUserRows.splice(index, 1)
          this.editVoterRows.push(env)
        }
        this.editNewVoterSelected = []
        this.editNewVoterLoading = false
      }, 500)
      this.editNewVoter = false
    },
    editInsertNewManager() {
      this.managerLoading = true
      setTimeout(() => {
        for (const ms of this.newManagerSelected) {
          const index = this.userManagerRows.findIndex(object => {
            return object.id === ms.id;
          });
          this.userManagerRows.splice(index, 1)
          this.managerRows.push(ms)
        }
        this.newManagerSelected = []
        this.managerLoading = false
      }, 500)
      this.newManager = false
    },
    showElectionResults(row) {
      this.selected_row = row;
      this.electionResultsShow = true;
    },
    logout() {
      SessionStorage.set('permission', '');
      Cookies.remove('token');
      this.$router.push('login');
    },
    createElection() {
      const title = this.electionTitle
      const start = this.startDate
      const end = this.endDate
      const key = this.electionKey
      const keyConfirm = this.electionKey1
      const candidates = []
      const voters = []
      for (const candidate of this.candidateRows) {
        candidates.push({name: candidate.name})
      }
      for (const voter of this.voterRows) {
        voters.push(voter)
      }
      if (key !== null && key === keyConfirm && moment(start).isBefore(moment(end))) {
        this.newElection = false
        this.loading = true
        setTimeout(() => {
          console.log({title, start, end, key, candidates, voters})
          Notify.create({
            color: 'green-4',
            textColor: 'white',
            icon: 'check',
            message: 'Election created with success'
          })
          this.undoElection()
          this.loading = false
        })
      } else {
        Notify.create({
          color: 'red-10',
          textColor: 'white',
          icon: 'cancel',
          message: 'Cannot create election; Errors are present'
        })
      }
    },
    undoElection() {
      this.electionTitle = ''
      this.startDate = ''
      this.endDate = ''
      this.electionKey = null
      this.electionKey1 = null
      this.candidateRows = []
      this.voterRows = []
    },
    confirmElectionEdit(id) {
      const title = this.editElectionTitle
      const startDate = this.editStartDate
      const endDate = this.editEndDate
      const candidates = this.editCandidateRows
      const voters = this.editVoterRows
      const managers = this.managerRows
      if (moment(startDate, 'DD-MM-YYYY HH:mm').isBefore(moment(endDate, 'DD-MM-YYYY HH:mm'))) {
        if (title.length > 0) {
          if (managers.length > 0) {
            console.log({id, title, startDate, endDate, candidates, voters, managers})
            Notify.create({
              color: 'green-4',
              textColor: 'white',
              icon: 'check',
              message: `Election ${title} edited with success`
            })
            this.editElection = false;
          } else {
            Notify.create({
              color: 'red-10',
              textColor: 'white',
              icon: 'cancel',
              message: 'Cannot create election; Election must have at least 1 manager'
            })
          }
        } else {
          Notify.create({
            color: 'red-10',
            textColor: 'white',
            icon: 'cancel',
            message: 'Cannot create election; Please insert an election title'
          })
        }
      } else {
        Notify.create({
          color: 'red-10',
          textColor: 'white',
          icon: 'cancel',
          message: 'Cannot edit election; Election start date is not before end date'
        })
      }
    },
    removeElection(id) {
      console.log(id)
      this.deleteConfirm = false
    },
    renewElectionKey(id) {
      const key = this.newElectionKey
      const confirmKey = this.newElectionKey1
      if (key === confirmKey) {
        console.log({id, key})
        Notify.create({
          color: 'green-4',
          textColor: 'white',
          icon: 'check',
          message: `Election key changed with success`
        })
        this.renewKey = false
      } else {
        Notify.create({
          color: 'red-10',
          textColor: 'white',
          icon: 'cancel',
          message: 'Cannot change election key; Both fields must have the same value'
        })
      }
    },
    countElectionResults(id) {
      const key = this.resultsElectionKey
      if (key.length === 16) {
        if (key.match('^(?=(.*[a-z]){1,})(?=(.*[A-Z]){1,})(?=(.*[0-9]){1,})(?=(.*[!@#$%^&*()\\-__+.]){1,}).{8,}$')) {
          console.log({id, key})
          Notify.create({
            color: 'green-4',
            textColor: 'white',
            icon: 'check',
            message: `Election results counted with success`
          })
          this.electionResults = false
        } else {
          Notify.create({
            color: 'red-10',
            textColor: 'white',
            icon: 'cancel',
            message: 'Cannot count election results; Election key must have upper and lower case characters, special characters and digits'
          })
        }
      } else {
        Notify.create({
          color: 'red-10',
          textColor: 'white',
          icon: 'cancel',
          message: 'Cannot count election results; Election key must be 16 characters long'
        })
      }
    },
    openElectionStatus(row) {
      this.selected_row = row
      this.electionStatus = true
    },
    customSortMain() {
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
        if (this.searchMain) {
          filteredRows = filteredRows.filter(obj =>
              obj.title.toLowerCase().includes(this.searchMain.toLowerCase())
          )
        }
        this.rows = filteredRows
        this.loading = false
      }, 500)
    },
    clearSearchMain() {
      this.searchMain = ''
      this.customSortMain()
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