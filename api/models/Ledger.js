/**
* Ledger.js
*
* @description :: TODO: You might write a short summary of how this model works and what it represents here.
* @docs        :: http://sailsjs.org/#!documentation/models
*/

module.exports = {

  attributes: {
      
      // entry code, e.g. fees, sales, exchange, etc.
      type : {
          type : 'number',
          required : true
      },
      
      // amount in bitcoin
      amount : {
          type : 'number',
          required : true
      },
      
      // entry description
      description : {
          type : 'string',
      },
      
      // related invoice's Id
      invoiceId {
          type : 'string'
      },
      
      // related invoice's amount in fiat/currency
      invoiceAmount : {
          type: 'number'
      },
      
      // related invoice's currency code
      invoiceCurrency : {
          type: 'string'
      },
      
      // the exchange rate for the invoice
      exRate : {
          type : 'number'
      }

  }
};

