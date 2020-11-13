import axios from 'axios'
import PlateBarcode from '@/modules/plate_barcode'
import config from '@/nuxt.config'

const query = `mutation printRequest($printRequest: PrintRequest!, $printer: String!) {
  print(printRequest: $printRequest, printer: $printer) {
    jobId
  }`

const headers = {
  headers: {
    'Content-Type': 'application/json'
  }
}

// Will create a new layout object for a print job
// Requires barcode which will be used for barcode and text field
const createLayout = (barcode) => ({
  barcodeFields: [
    {
      x: 16,
      y: 1,
      cellWidth: 0.2,
      barcodeType: 'code39',
      value: barcode,
      height: 5
    }
  ],
  textFields: [
    {
      x: 3,
      y: 3,
      value: barcode,
      font: 'proportional',
      fontSize: 1.7
    },
    {
      x: 57,
      y: 3,
      value: 'LHTR',
      font: 'proportional',
      fontSize: 1.7
    }
  ]
})

// TODO: currently this is just a placeholder for creating barcodes
// n = number of barcodes
// e.g. if n = 3 returns ['DN111111', 'DN111111', 'DN111111']
const createBarcodes = (n) => [...Array(n)].map((barcode) => 'DN111111')

/* 
  Creates the print request body
  A query can have multiple layouts
  the number of layouts is dependent on the numberOfBarcodes
  the printer must be specified
*/
const createPrintRequestBody = ({ barcodes, printer }) => ({
  query,
  printer,
  printRequest: {
    // creates n barcodes and then turns each barcode into a layout
    layouts: barcodes.map((barcode) => createLayout(barcode))
  }
})

/*
  accepts numberOfBarcodes and printer
  creates the barcodes via a call to plate barcpde
  will create the print request body
  and send a request to sprint to print labels
*/
const printLabels = async ({ numberOfBarcodes, printer }) => {
  try {
    const barcodes = await PlateBarcode.createBarcodes(numberOfBarcodes)
    const payload = createPrintRequestBody({ barcodes, printer })

    await axios.post(
      config.privateRuntimeConfig.sprintBaseURL,
      payload,
      headers
    )
    return {
      success: true,
      // not sure if this is the best way to highlight partial failure. It is an edge case but dont
      // want to add too much complexity to the code for something that will happen once in a blue moon
      message: `successfully printed ${barcodes.length} of ${numberOfBarcodes} labels to ${printer}`
    }
  } catch (error) {
    return {
      success: false,
      error
    }
  }
}

const Sprint = {
  createLayout,
  createPrintRequestBody,
  createBarcodes,
  printLabels,
  headers
}

export default Sprint
