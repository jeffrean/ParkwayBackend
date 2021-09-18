const Ajv = require("ajv");

// Local

const ajv = Ajv();


/**
 * SCHEMAS
 */
export const createListingValidator = ajv.compile({
  type: "object",
  properties: {
    title: {type: "string"},
    description: {type: "string"},
    special_instructions: {type: "string"},
    house_number: {type: "string"},
    street: {type: "string"},
    state: {type: "string"},
    zip_code: {type: "string"},
    rates: {
      type: "object",
      properties: {
        hourly: {
          type: "number",
        },
        daily: {
          type: "number",
        },
        monthly: {
          type: "number",
        },
      },
      minProperties: 1,
      additionalProperties: false,
    },
  },
  minProperties: 8,
  additionalProperties: false,
});

export const addListingImageValidator = ajv.compile({
  type: "object",
  properties: {
    image_bytes: { type: "string" }
  }
});


/**
 * CUSTOM VALIDATORS
 */


