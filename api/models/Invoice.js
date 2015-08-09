/**
 * Invoice.js
 *
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs        :: http://sailsjs.org/#!documentation/models
 */

module.exports = {

  attributes: {
    // required fields
    price: {
      type: "number",
      required: true,
    },
    currency: {
      type: "string",
      required: true,
      defaultsTo: "PKR",
      enum: ["PKR", "USD", "BTC"]
    },

    // item description
    itemDesc: {
      type: "string",
      size: "100"
    },

    // notification settings
    notificationUrl: {
      type: "string"
    },
    redirectUrl: {
      type: "string"
    },

    // confirmations
    confirmationSpeed: {
      type: "number"
    },

    // others
    physical: {
      type: "boolean",
      defaultsTo: "false"
    },

    // buyer details
    buyerName: {
      type: "string",
    },
    buyerAddress: {
      type: "string",
    },
    buyerLocality: {
      type: "string",
    },
    buyerRegion: {
      type: "string",
    },
    buyerPostelCode: {
      type: "number",
    },
    buyerCountry: {
      type: "string"
    },
    buyerEmail: {
      type: 'string',
      email: true
    },
    buyerPhone: {
      type: "number"
    },

    // status of invoice i.e confirmed
    status: {
      type: "string"
    },

    // exception for paidOver or paidPartial , or false
    exception: {
      type: "boolean"
    }
  }
};
