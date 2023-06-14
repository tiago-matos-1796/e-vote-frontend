<template>
  <q-layout view="lHh Lpr fff" class="bg-grey-1">
    <q-header elevated class="bg-white text-grey-8" height-hint="64">
      <q-toolbar class="GPL__toolbar" style="height: 64px">

        <q-toolbar-title v-if="$q.screen.gt.sm" shrink  class="row items-center no-wrap">
          <span class="q-ml-sm">UAlg Secure Vote</span>
        </q-toolbar-title>

        <q-space />

        <q-space />

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
                                          <q-input filled v-model="electionTitle" label="Title" placeholder="Election title" hint="Election title"
                                                   :rules="[ val => !!val || 'Election title must not be empty']"
                                          ></q-input>

                                          <div class="row">
                                            <div class="col">
                                              <q-input filled v-model="startDate" label="Start date and time" hint="Start date and time">
                                                <template v-slot:prepend>
                                                  <q-icon name="event" class="cursor-pointer">
                                                    <q-popup-proxy cover transition-show="scale" transition-hide="scale">
                                                      <q-date v-model="startDate" mask="YYYY-MM-DD HH:mm" :options="startDateOptions">
                                                        <div class="row items-center justify-end">
                                                          <q-btn v-close-popup label="Close" color="primary" flat />
                                                        </div>
                                                      </q-date>
                                                    </q-popup-proxy>
                                                  </q-icon>
                                                </template>

                                                <template v-slot:append>
                                                  <q-icon name="access_time" class="cursor-pointer">
                                                    <q-popup-proxy cover transition-show="scale" transition-hide="scale">
                                                      <q-time v-model="startDate" mask="YYYY-MM-DD HH:mm" format24h>
                                                        <div class="row items-center justify-end">
                                                          <q-btn v-close-popup label="Close" color="primary" flat />
                                                        </div>
                                                      </q-time>
                                                    </q-popup-proxy>
                                                  </q-icon>
                                                </template>
                                              </q-input>
                                            </div>
                                            <div class="col">
                                              <q-input filled v-model="endDate" label="End date and time" hint="End date and time" :disable="allowEndDate" :rules="[ val => confirmDates(val) || 'End date must be after start date']">
                                                <template v-slot:prepend>
                                                  <q-icon name="event" class="cursor-pointer">
                                                    <q-popup-proxy cover transition-show="scale" transition-hide="scale">
                                                      <q-date v-model="endDate" mask="YYYY-MM-DD HH:mm" :options="endDateOptions">
                                                        <div class="row items-center justify-end">
                                                          <q-btn v-close-popup label="Close" color="primary" flat />
                                                        </div>
                                                      </q-date>
                                                    </q-popup-proxy>
                                                  </q-icon>
                                                </template>

                                                <template v-slot:append>
                                                  <q-icon name="access_time" class="cursor-pointer">
                                                    <q-popup-proxy cover transition-show="scale" transition-hide="scale">
                                                      <q-time v-model="endDate" mask="YYYY-MM-DD HH:mm" format24h>
                                                        <div class="row items-center justify-end">
                                                          <q-btn v-close-popup label="Close" color="primary" flat />
                                                        </div>
                                                      </q-time>
                                                    </q-popup-proxy>
                                                  </q-icon>
                                                </template>
                                              </q-input>
                                            </div>
                                          </div>
                                        </q-form>
                                        <q-table
                                            flat bordered
                                            title="Candidates"
                                            :rows="candidateRows"
                                            :columns="candidateColumns"
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
                                          <template v-slot:body="props">
                                            <q-tr :props="props">
                                              <q-td>
                                                <q-checkbox v-model="props.selected" />
                                              </q-td>
                                              <q-td key="name" :props="props">
                                                {{props.row.name}}
                                                <q-popup-edit v-model="props.row.name" v-slot="scope">
                                                  <q-input v-model="scope.value" dense autofocus counter @keyup.enter="scope.set"></q-input>
                                                </q-popup-edit>
                                              </q-td>
                                            </q-tr>
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
                                      <q-btn label="Create election" @click="createElection" color="primary"/>
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
      <q-page-sticky v-if="$q.screen.gt.sm" expand position="left">
        <div class="fit q-pt-xl q-px-sm column">
          <q-btn v-if="$q.sessionStorage.getItem('permission')" round flat color="grey-8" stack no-caps size="26px" class="GPL__side-btn" @click="$router.push('elections')">
            <q-icon size="22px" name="ballot" />
            <div class="GPL__side-btn__label">Elections</div>
          </q-btn>

          <q-btn v-if="$q.sessionStorage.getItem('permission') === 'MANAGER'" round flat color="grey-8" stack no-caps size="26px" class="GPL__side-btn" @click="$router.push('election-manager')">
            <q-icon size="22px" name="edit_document" />
            <div class="GPL__side-btn__label">Election Manager</div>
          </q-btn>

          <q-btn v-if="$q.sessionStorage.getItem('permission') === 'AUDITOR'" round flat color="grey-8" stack no-caps size="26px" class="GPL__side-btn" @click="$router.push('auditing')">
            <q-icon size="22px" name="fact_check" />
            <div class="GPL__side-btn__label">Auditing</div>
            <q-badge floating color="red" text-color="white" style="top: 8px; right: 16px">
              1
            </q-badge>
          </q-btn>

          <q-btn v-if="$q.sessionStorage.getItem('permission') === 'ADMIN'" round flat color="grey-8" stack no-caps size="26px" class="GPL__side-btn" @click="$router.push('admin')">
            <q-icon size="22px" name="admin_panel_settings" />
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
import { ref, onMounted } from 'vue'
import {SessionStorage, useQuasar} from 'quasar'
import addElection from '@/components/AddElection.vue'
import {Chart as ChartJS, ArcElement, Tooltip, Legend} from 'chart.js'
import {Pie} from 'vue-chartjs'
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
    align: 'center',
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
    const settings = ref(false)
    const startDate = ref('')
    const allowEndDate = ref(true)
    const minEndDate = ref('')
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

    function confirmDates(date) {
      if(date.length === 0) {
        return true;
      } else {
        return moment(this.startDate).isBefore(date)
      }
    }

    return {
      tableRef,
      filter,
      loading,
      pagination,
      columns,
      rows,
      candidateColumns,
      candidateRows: ref(candidateRows),
      userColumns,
      voterRows,
      managerRows,
      newVoter: ref(false),
      newManager: ref(false),
      candidateName: ref(null),
      addCandidate: ref(false),
      maximizedToggle: ref(true),
      AddElection,
      confirmDates,
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
      settings,
      electionTitle: ref(''),
      startDate,
      startDateOptions(date) {
        const today = moment().add(1, 'day').format('YYYY/MM/DD')
        return date > today
      },
      minEndDate,
      endDate: ref(''),
      allowEndDate,
      endDateOptions(date) {
          const minDate = moment().add(1, 'day').format('YYYY/MM/DD')
          return date > minDate
      },
      openSettings() {
        settings.value = true
      },
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
  watch: {
    startDate: function (value) {
        this.allowEndDate = value
        this.minEndDate = moment(value).add(2, 'days').format('YYYY/MM/DD')
    }
  },
  computed: {
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
    logout() {
      SessionStorage.set('permission', '');
      this.$router.push('login');
    },
    createElection() {
      const start = this.startDate
      const end = this.endDate
      console.log({start, end})
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