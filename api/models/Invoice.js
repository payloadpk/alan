/**
 * Invoice.js
 *
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs        :: http://sailsjs.org/#!documentation/models
 */

module.exports = {

  attributes: {
    /*
     * Invoice financials
     */

    // total invoice price
    price: {
      type: "float",
      required: true,
    },
    // currency of price
    currency: {
      type: "string",
      required: true,
      defaultsTo: "PKR",
      enum: ["PKR", "USD", "BTC"]
    },
    // units of currency per bitcoin
    rate: {
      type: "float",
      required: "true"
    },
    // invoice amount in bitcoin
    amount: {
      type: "float",
      required: true
    },

    /*
     * Notification settings
     */

    // notification settings
    notificationUrl: {
      type: "string"
    },
    // confirmations required for invoice to be marked as complete, default is 3
    confirmationSpeed: {
      type: "integer",
      defaultsTo: 3
    },
    // TODO
    redirectUrl: {
      type: "string"
    },

    /*
     * Item metadata
     */

    // item description
    itemDesc: {
      type: "string",
      size: "100"
    },

    // others
    physical: {
      type: "boolean",
      defaultsTo: false
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
      type: "integer",
    },
    buyerCountry: {
      type: "string"
    },
    buyerEmail: {
      type: 'string',
      email: true
    },
    buyerPhone: {
      type: "integer"
    },

    // status of invoice i.e confirmed
    status: {
      type: "string"
    },

    // exception for paidOver or paidPartial, or false
    exception: {
      type: "boolean"
    }
  }
};
