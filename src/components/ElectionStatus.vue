<template>
  <q-card class="bg-blue-grey-2 text-black">
    <q-bar>
      <div class="text-h6">{{title}} status</div>
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
                            <pie-chart :data="graphData"></pie-chart>
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
</template>

<script lang="js">
import {onMounted, ref} from "vue";
import axios from "axios";
import api_routes from '../../config/routes.config'

export default {
  name: "ElectionStatus",
  components: {

  },
  props: {
    id: String,
    title: String
  },
  setup(props) {
    const loading = ref(false)
    const statusRows = ref([])
    const graphData = ref([])

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

    async function getStatus(id) {
      const uri = `${api_routes.MAIN_URI}/vote/status/${id}`;
      return await axios.get(uri, {
        headers: {
          "Content-type": "application/json"
        },
        withCredentials: true
      }).then(function (response) {
        statusRows.value = response.data.voters
        graphData.value = response.data.data
      }).catch(function (error) {

      })
    }

    onMounted(() => {
      getStatus(props.id)
    })

    return {
      graphData,
      statusRows,
      voterColumns,
      loading,
    }
  }
}
</script>

<style scoped>

</style>