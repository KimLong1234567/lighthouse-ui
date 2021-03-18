// Lighthouse Service Module

import config from '@/nuxt.config'
import axios from 'axios'

const handlePromise = async (promise) => {
  let rawResponse
  try {
    rawResponse = await promise
  } catch (resp) {
    rawResponse = resp.response.data
  }
  return rawResponse
}

// Accepts a list of barcodes in the moduleOptions
// Send a POST request to the Lighthouse service API to create each plate
// Return list of responses
const createPlatesFromBarcodes = async ({ barcodes }) => {
  const promises = barcodes.map((barcode) => {
    const url = `${config.privateRuntimeConfig.lighthouseBaseURL}/plates/new`
    return axios.post(url, { barcode })
  })

  const responses = await Promise.all(promises.map((promise) => handlePromise(promise)))
  return responses
}

// Accepts a list of barcodes in the moduleOptions
// Send a GET request to the Lighthouse service API
const findPlatesFromBarcodes = async ({ barcodes }) => {
  const url = `${config.privateRuntimeConfig.lighthouseBaseURL}/plates`
  try {
    const response = await axios.get(url, {
      params: { barcodes },
    })
    return { success: true, ...response.data }
  } catch (error) {
    return { success: false, error }
  }
}

const getImports = async () => {
  try {
    const response = await axios.get(
      `${config.privateRuntimeConfig.lighthouseBaseURL}/imports?max_results=10000`
    )
    return {
      success: true,
      data: response.data,
    }
  } catch (error) {
    return {
      success: false,
      error,
    }
  }
}

// Delete list of reports using full filenames
const deleteReports = async (filenames) => {
  try {
    await axios.post(`${config.privateRuntimeConfig.lighthouseBaseURL}/delete_reports`, {
      data: {
        filenames,
      },
    })
    return {
      success: true,
    }
  } catch (error) {
    return {
      success: false,
      error,
    }
  }
}

// Get all of the reports
const getReports = async () => {
  try {
    const response = await axios.get(`${config.privateRuntimeConfig.lighthouseBaseURL}/reports`)
    return {
      success: true,
      reports: response.data.reports,
    }
  } catch (error) {
    return {
      success: false,
      error,
    }
  }
}

// Create a reports
const createReport = async () => {
  try {
    const response = await axios.post(
      `${config.privateRuntimeConfig.lighthouseBaseURL}/reports/new`
    )
    return {
      success: true,
      reports: response.data.reports,
    }
  } catch (error) {
    return {
      success: false,
      error,
    }
  }
}

// Get Robots
const getRobots = async () => {
  try {
    const response = await axios.get(
      `${config.privateRuntimeConfig.lighthouseBaseURL}/beckman/robots`
    )
    return {
      success: true,
      robots: response.data.robots,
    }
  } catch (resp) {
    const errors = resp.response
      ? resp.response.data.errors
      : [resp.message + ': Failed to get Robots from Lighthouse Service']
    return {
      success: false,
      errors,
    }
  }
}

// Get Failure Types
const getFailureTypes = async () => {
  try {
    const response = await axios.get(
      `${config.privateRuntimeConfig.lighthouseBaseURL}/beckman/failure-types`
    )
    return {
      success: true,
      failureTypes: response.data.failure_types,
    }
  } catch (resp) {
    const errors = resp.response
      ? resp.response.data.errors
      : [resp.message + ': Failed to get Failure Types from Lighthouse Service']
    return {
      success: false,
      errors,
    }
  }
}

/**
 * - Returned on success: `{ success: true, response: "A successful message" }`
 * - Returned on failure: `{ success: false, errors: ["A failure message"] }`
 *
 * @param {*} form
 * @returns
 */
const createDestinationPlate = async (form) => {
  try {
    const response = await axios.get(
      `${config.privateRuntimeConfig.lighthouseBaseURL}` +
        '/cherrypicked-plates' +
        '/create?' +
        `barcode=${form.barcode}&` +
        `robot=${form.robotSerialNumber}&` +
        `user_id=${form.username}`
    )
    const responseData = response.data.data
    // success
    return {
      success: true,
      response: `Successfully created destination plate, with barcode: ${responseData.plate_barcode}, and ${responseData.number_of_fit_to_pick} fit to pick sample(s)`,
    }
  } catch (resp) {
    const errors = resp.response.data
    // failure
    return {
      success: false,
      ...errors,
    }
  }
}

/**
 * - Returned on success: `{ success: true, errors: [] }`
 * - Returned on partial success: `{ success: true, errors: ["A successful error message"] }`
 * - Returned on failure: `{ success: false, errors: ["A failure message"] }`
 *
 * @param {*} form
 * @returns
 */
const failDestinationPlate = async (form) => {
  try {
    const response = await axios.get(
      `${config.privateRuntimeConfig.lighthouseBaseURL}` +
        '/cherrypicked-plates' +
        '/fail?' +
        `barcode=${form.barcode}&` +
        `robot=${form.robotSerialNumber}&` +
        `user_id=${form.username}&` +
        `failure_type=${form.failureType}`
    )
    // partial success
    if (response.data.errors.length > 0) {
      return {
        success: true,
        errors: response.data.errors,
      }
    }
    // success
    return {
      success: true,
      response: `Successfully failed destination plate with barcode: ${form.barcode}`,
    }
  } catch (resp) {
    const errors = resp.response.data
    // faliure
    return {
      success: false,
      ...errors,
    }
  }
}

const lighthouse = {
  createDestinationPlate,
  createPlatesFromBarcodes,
  createReport,
  deleteReports,
  failDestinationPlate,
  findPlatesFromBarcodes,
  getFailureTypes,
  getImports,
  getReports,
  getRobots,
}

export default lighthouse
