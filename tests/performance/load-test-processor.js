/**
 * Artillery Processor for Load Testing
 *
 * This file contains custom functions for Artillery load tests
 */

// Custom functions can be added here
// Example: Generate random data, custom validations, etc.

module.exports = {
  // Before all scenarios
  beforeRequest: function(requestParams, context, ee, next) {
    // Add custom headers or modify request before sending
    return next();
  },

  // After each scenario
  afterResponse: function(requestParams, response, context, ee, next) {
    // Custom validation or data extraction after response
    return next();
  },
};
