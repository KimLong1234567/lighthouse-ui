<template>
  <b-container>
    <b-row>
      <b-col>
        <PrintLabelsRouter />
        <h1>Print Control plate labels</h1>
        <p class="lead"></p>

        <!-- TODO: GPL-828 - better in a component of its own? -->
        <p>
          <b-alert :show="isError" dismissible variant="danger">
            {{ alertMessage }}
          </b-alert>
          <b-alert :show="isSuccess" dismissible variant="success">
            {{ alertMessage }}
          </b-alert>
          <b-alert :show="isBusy" dismissible variant="warning">
            {{ alertMessage }}
          </b-alert>
        </p>
        <p>
          <label for="selectPrinter"> Which printer would you like to use? </label>
          <b-form-select id="selectPrinter" v-model="printer" :options="printers"></b-form-select>
        </p>
        <p>
          <label for="numberOfBarcodes"> How may labels would you like to print? </label>
          <b-form-input
            id="numberOfBarcodes"
            v-model="numberOfBarcodes"
            type="number"
            value="1"
            min="1"
          ></b-form-input>
        </p>
        <p>
          <label for="barcode">Please scan the control plate barcode?</label>
          <b-form-input id="barcode" v-model="barcode" type="text"></b-form-input>
        </p>
        <p class="text-right">
          <b-button
            id="printLabels"
            block
            size="lg"
            variant="success"
            :disabled="isBusy || !isValid"
            @click="printLabels"
          >
            Print labels
            <b-spinner v-show="isBusy" small></b-spinner>
          </b-button>
        </p>
      </b-col>
    </b-row>
  </b-container>
</template>

<script>
import statuses from '@/modules/statuses'
import Sprint from '@/modules/sprint_general_labels'
import config from '@/nuxt.config'
import PrintLabelsRouter from '@/components/PrintLabelsRouter'

export default {
  components: {
    PrintLabelsRouter,
  },
  props: {
    printers: {
      type: Array,
      default() {
        // TODO: GPL-828 - Can we get this list from SPrint instead of setting it in config
        return config.publicRuntimeConfig.printers.split(',')
      },
    },
  },
  data() {
    return {
      status: statuses.Idle,
      alertMessage: '',
      printer: this.printers[0],
      numberOfBarcodes: '1',
      barcode: '',
    }
  },
  computed: {
    // TODO: GPL-828 - abstract and create functions dynamically.
    isIdle() {
      return this.status === statuses.Idle
    },
    isSuccess() {
      return this.status === statuses.Success
    },
    isError() {
      return this.status === statuses.Error
    },
    isBusy() {
      return this.status === statuses.Busy
    },
    isValid() {
      return this.barcode.length > 0
    },
  },
  methods: {
    setStatus(status, message) {
      this.status = statuses[status]
      this.alertMessage = message
    },
    multiplyBarcodes() {
      return Array.from({ length: this.numberOfBarcodes }, () => this.barcode)
    },
    async printLabels() {
      const barcodes = this.multiplyBarcodes()
      const labelFields = Sprint.createLabelFields({
        barcodes,
        text: 'Control',
      })
      const response = await Sprint.printLabels({
        labelFields,
        printer: this.printer,
      })

      if (response.success) {
        this.setStatus('Success', response.message)
      } else {
        this.setStatus('Error', response.error)
      }
    },
  },
}
</script>

<style></style>
