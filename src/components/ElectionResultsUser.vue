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
                            <div class="text-h6">Abstention</div>
                          </q-card-section>
                          <pie-chart :data="abstentionData"></pie-chart>
                          <q-card-section class="q-pt-none" align="center">
                          </q-card-section>
                        </q-card>

                      </div>
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
</template>

<script>
import {onMounted, ref} from "vue";
import axios from "axios";
import api_routes from '../../config/routes.config'

export default {
  name: "ElectionResultsUser",
  props: {
    id: String,
    title: String
  },
  setup(props) {
    const loading = ref(false)
    const resultsRows = ref([])
    const abstentionData = ref(null)
    const voteData = ref(null)

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
      const uri = `${api_routes.MAIN_URI}/vote/results/user/${props.id}`
      return await axios.get(uri, {
        headers: {
          "Content-type": "application/json"
        },
        withCredentials: true
      }).then(function (response) {
        resultsRows.value = response.data.candidates
        abstentionData.value = response.data.abstention
        voteData.value = response.data.voteData
      }).catch(function (error) {

      })
    }

    onMounted(() => {
      getResults()
    })

    return {
      resultsRows,
      resultsColumns,
      voterColumns,
      loading,
      pagination,
      abstentionData,
      voteData
    }
  }
}
</script>

<style scoped>

</style>