/**
 * Legacy Turnstile Endpoint Forwarder -> Google reCAPTCHA v2 Handler
 */
const recaptchaHandler = require('./verify-recaptcha');

exports.handler = async function(event, context) {
  return recaptchaHandler.handler(event, context);
};
