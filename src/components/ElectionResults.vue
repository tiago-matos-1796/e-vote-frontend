<template>
  <q-card class="bg-blue-grey-2 text-black">
    <q-bar>
      <div class="text-h6">Results for election {{ title }}</div>
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
                          <pie-chart :data="voteData"></pie-chart>
                          <q-card-section class="q-pt-none">

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
                          <pie-chart :data="abstentionData"></pie-chart>
                          <q-card-section class="q-pt-none" align="center">
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
                        v-model:pagination="pagination"
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
                  <q-btn label="Download XLS" color="secondary" @click="getXls"/>
                  <q-btn label="Download PDF" color="primary" @click="getPdf"/>
                  <q-btn label="Close" color="negative" v-close-popup/>
                </q-card-actions>
              </q-card>
            </div>
          </div>
        </div>
      </div>
    </q-card-section>
  </q-card>
</template>

<script>
import {onMounted, ref} from "vue";
import axios from "axios";
import {QSpinnerGears, useQuasar} from "quasar";

export default {
  name: "ElectionResults",
  props: {
    id: String,
    title: String
  },
  setup(props) {
    const $q = useQuasar()
    const loading = ref(false)
    const voterResultsRows = ref([])
    const resultsRows = ref([])
    const abstentionData = ref(null)
    const voteData = ref(null)
    const pdf = ref(null)
    const xlsx = ref(null)

    const resultsColumns = [
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
        name: 'votes',
        required: true,
        label: 'Votes',
        align: 'right',
        field: row => row.votes,
        sortable: true,
      }
    ]

    const voterColumns = [
      {
        name: 'display_name',
        required: true,
        label: 'Display Name',
        align: 'center',
        field: row => row.display_name,
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
    const pagination = ref({
      sortBy: 'votes',
      descending: true,
      page: 1,
      rowsPerPage: 5
    })

    async function getResults() {
      const uri = `http://localhost:8080/vote/results/${props.id}`
      return await axios.get(uri, {
        headers: {
          "Content-type": "application/json"
        },
        withCredentials: true
      }).then(function (response) {
        voterResultsRows.value = response.data.voters
        resultsRows.value = response.data.candidates
        abstentionData.value = response.data.abstention
        voteData.value = response.data.voteData
        pdf.value = response.data.pdf
        xlsx.value = response.data.xlsx
      }).catch(function (error) {

      })
    }

    async function exportPdf() {
      const uri = `http://localhost:8080/exports/pdf/${pdf.value}`
      return await axios.get(uri, {
        withCredentials: true,
        responseType: 'blob',
      }).then(function (response) {
        const downloadUrl = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement('a');
        link.href = downloadUrl;
        link.setAttribute('download', 'report.pdf'); //any other extension
        document.body.appendChild(link);
        link.click();
        link.remove();
        return response
      }).catch(function (error) {
        return error
      })
    }

    async function exportXls() {
      const uri = `http://localhost:8080/exports/xlsx/${xlsx.value}`
      return await axios.get(uri, {
        withCredentials: true,
        responseType: 'blob',
      }).then(function (response) {
        console.log(response)
        const downloadUrl = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement('a');
        link.href = downloadUrl;
        link.setAttribute('download', 'report.xlsx'); //any other extension
        document.body.appendChild(link);
        link.click();
        link.remove();
        return response
      }).catch(function (error) {
        return error
      })
    }

    onMounted(() => {
      getResults()
    })

    return {
      voterResultsRows,
      resultsRows,
      resultsColumns,
      voterColumns,
      loading,
      pagination,
      abstentionData,
      voteData,
      getPdf() {
        $q.loading.show({
          message: 'Creating PDF document, please wait...',
          spinner: QSpinnerGears,
        })
        exportPdf().then(() => {
          $q.notify({
            color: 'green-4',
            textColor: 'white',
            icon: 'check',
            message: 'PDF document created with success'
          })
        }).catch(() => {
          $q.notify({
            color: 'red-10',
            textColor: 'white',
            icon: 'cancel',
            message: `Error creating PDF document, please try again later`
          })
        }).finally(() => {
          $q.loading.hide()
        })
      },
      getXls() {
        $q.loading.show({
          message: 'Creating XLS document, please wait...',
          spinner: QSpinnerGears,
        })
        exportXls().then(() => {
          $q.notify({
            color: 'green-4',
            textColor: 'white',
            icon: 'check',
            message: 'XLS document created with success'
          })
        }).catch(() => {
          $q.notify({
            color: 'red-10',
            textColor: 'white',
            icon: 'cancel',
            message: `Error creating XLS document, please try again later`
          })
        }).finally(() => {
          $q.loading.hide()
        })
      }
    }
  }
}
</script>

<style scoped>

</style>