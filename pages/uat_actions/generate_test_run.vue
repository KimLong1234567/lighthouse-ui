<template>
  <b-container>
    <UATActionsRouter />

    <h1 class="mt-3">UAT Actions</h1>

    <AlertDialog id="alert" ref="alert"></AlertDialog>

    <b-card title="Generate Test Run">
      <b-card-text>
        Select the number of plates you want to generate test data for with the number of positive
        samples per plate. You can add additional sets of plates up to a maximum of
        {{ maxNumberOfPlates }}.
      </b-card-text>
      <b-card-text>
        The
        <em>Generate</em> button will start the creation of the data, and you will be automatically
        taken to the label printing screen when it is done.
      </b-card-text>

      <b-form v-if="!totalPlatesReached" id="platesSpecForm" inline>
        <label class="mr-sm-2" for="numberOfPlates">Number of plates</label>
        <b-form-select
          id="numberOfPlates"
          v-model="form.numberOfPlates"
          class="mb-2 mr-sm-2 mb-sm-0"
          :options="numberOfPlatesOptions()"
        ></b-form-select>

        <label class="mr-sm-2" for="numberOfPositives">Number of positive samples</label>
        <b-form-select
          id="numberOfPositives"
          v-model="form.numberOfPositives"
          class="mb-2 mr-sm-2 mb-sm-0"
          :options="numberOfPositivesOptions()"
        ></b-form-select>

        <b-button
          id="addButton"
          variant="outline-primary"
          :disabled="isBusy || totalPlates >= maxNumberOfPlates"
          @click="add"
          >Add</b-button
        >
      </b-form>

      <b-card v-else id="maximumPlateMessage">
        <span class="font-weight-bold">Maximum number of plates reached</span>
      </b-card>

      <br />
      <b-table striped hover :items="plateSpecs"></b-table>

      <b-row align-v="end" align-h="between">
        <b-col>
          Total plates:
          <span :style="totalPlatesReached ? { color: 'red' } : { color: 'black' }"
            >{{ totalPlates }}/{{ maxNumberOfPlates }}</span
          >
        </b-col>

        <b-col cols="6" md="auto">
          <b-button
            id="resetButton"
            v-b-modal.resetModal
            variant="outline-danger"
            class="mr-2"
            :disabled="isBusy"
            >Reset</b-button
          >

          <b-modal
            id="resetModal"
            ref="modal"
            title="Reset Confirmation"
            :static="true"
            @ok="resetPlateSpecs"
          >
            <p class="my-4">Are you sure you want to reset?</p>
          </b-modal>

          <b-button
            id="generateTestRunButton"
            variant="outline-success"
            :disabled="isBusy || !isValid"
            @click="generateTestRun"
          >
            Generate test run
            <b-spinner v-show="isBusy" id="busySpinner" small></b-spinner>
          </b-button>
        </b-col>
      </b-row>
    </b-card>
  </b-container>
</template>

<script>
import lighthouse from '@/modules/lighthouse_service'
import AlertDialog from '@/components/AlertDialog'
import UATActionsRouter from '@/components/UATActionsRouter'
import statuses from '@/modules/statuses'

const MAX_NUMBER_OF_POSITIVES = 96
const MAX_NUMBER_OF_PLATES = 200

function initialFormState() {
  return {
    numberOfPlates: 1,
    numberOfPositives: 0,
  }
}

export default {
  name: 'GenerateTestRun',
  components: {
    AlertDialog,
    UATActionsRouter,
  },
  data() {
    return {
      status: statuses.Idle,
      form: initialFormState(),
      addToDart: false,
      plateSpecs: [],
      maxNumberOfPlates: MAX_NUMBER_OF_PLATES,
      maxNumberOfPositives: MAX_NUMBER_OF_POSITIVES,
    }
  },
  computed: {
    totalPlates() {
      return this.plateSpecs.reduce(function (acc, obj) {
        return acc + obj.numberOfPlates
      }, 0)
    },
    isBusy() {
      return this.status === statuses.Busy
    },
    isValid() {
      return this.totalPlates > 0 && this.totalPlates <= this.maxNumberOfPlates
    },
    totalPlatesReached() {
      return this.totalPlates === this.maxNumberOfPlates
    },
  },
  methods: {
    numberOfPositivesOptions() {
      return Array.from({ length: this.maxNumberOfPositives + 1 }, (v, i) => i) // 0 - 96
    },
    numberOfPlatesOptions() {
      return Array.from({ length: this.maxNumberOfPlates - this.totalPlates }, (v, i) => i + 1) // e.g default: 1-200
    },
    add() {
      this.plateSpecs.push({
        numberOfPlates: this.form.numberOfPlates,
        numberOfPositives: this.form.numberOfPositives,
      })
      Object.assign(this.$data.form, initialFormState())
    },
    resetPlateSpecs() {
      this.plateSpecs = []
    },
    async generateTestRun() {
      this.status = statuses.Busy
      const response = await lighthouse.generateTestRun(this.plateSpecs)
      if (response.success) {
        this.status = statuses.Idle
        this.$router.push({ path: `/uat_actions/test_runs/${response.runId}` })
      } else {
        this.status = statuses.Idle
        this.showAlert(response.error, 'danger')
      }
    },
    showAlert(message, type) {
      return this.$refs.alert.show(message, type)
    },
  },
}
</script>

<style scoped lang="scss"></style>
