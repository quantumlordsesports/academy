/**
 * Google reCAPTCHA v2 Checkbox Verification — Netlify Serverless Function
 * Endpoint: /.netlify/functions/verify-recaptcha (or /api/verify-recaptcha)
 */

exports.handler = async function(event, context) {
  // CORS Headers
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Content-Type': 'application/json'
  };

  // Handle CORS Preflight
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ message: 'Preflight OK' })
    };
  }

  // Enforce POST method
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ success: false, error: 'Method Not Allowed. Use POST.' })
    };
  }

  try {
    let body = {};
    if (event.body) {
      try {
        body = JSON.parse(event.body);
      } catch (e) {
        const params = new URLSearchParams(event.body);
        body = Object.fromEntries(params.entries());
      }
    }

    // Extract reCAPTCHA response token
    const token = body['g-recaptcha-response'] || body.response || body.token || body.recaptchaToken;
    const secretKey = process.env.RECAPTCHA_SECRET_KEY || '6Lf1pI0tAAAAAPmaEjiHjinHrXxyKrtMum_A8lmZ';

    // Validate token presence
    if (typeof token !== 'string' || token.trim().length === 0) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({
          success: false,
          error: 'Please complete the "I\'m not a robot" check.'
        })
      };
    }

    // Extract client IP address for verification
    const clientIp = event.headers['x-forwarded-for'] || 
                     event.headers['x-nf-client-connection-ip'] || 
                     event.headers['client-ip'] || '';

    // Prepare URL-encoded form data for Google reCAPTCHA siteverify
    const siteverifyParams = new URLSearchParams();
    siteverifyParams.append('secret', secretKey);
    siteverifyParams.append('response', token);
    if (clientIp) {
      siteverifyParams.append('remoteip', clientIp.split(',')[0].trim());
    }

    // Perform Google Siteverify fetch with 10-second timeout
    const googleResponse = await fetch('https://www.google.com/recaptcha/api/siteverify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: siteverifyParams,
      signal: AbortSignal.timeout(10_000)
    });

    if (!googleResponse.ok) {
      throw new Error(`Google Siteverify HTTP Error ${googleResponse.status}`);
    }

    const result = await googleResponse.json();

    // Check success status
    if (!result.success) {
      console.warn('[reCAPTCHA v2] Verification rejected by Google:', result['error-codes']);
      return {
        statusCode: 403,
        headers,
        body: JSON.stringify({
          success: false,
          error: 'reCAPTCHA verification failed or expired. Please tick the box again.',
          errorCodes: result['error-codes']
        })
      };
    }

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        message: 'Google reCAPTCHA v2 verification successful.',
        hostname: result.hostname,
        challenge_ts: result.challenge_ts
      })
    };

  } catch (error) {
    console.error('[reCAPTCHA Exception]', error.message);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        success: false,
        error: 'reCAPTCHA server verification error: ' + error.message
      })
    };
  }
};
