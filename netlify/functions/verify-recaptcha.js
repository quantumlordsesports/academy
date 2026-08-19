/**
 * Google reCAPTCHA v3 Canonical Siteverify — Netlify Serverless Function
 * Endpoint: /.netlify/functions/verify-recaptcha (or /api/verify-recaptcha)
 * 
 * Validates reCAPTCHA v3 tokens server-side before allowing form/auth actions.
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

    // Extract reCAPTCHA token and parameters
    const token = body['g-recaptcha-response'] || body.response || body.token || body.recaptchaToken;
    const requestedAction = body.action || body['data-action'];
    const secretKey = process.env.RECAPTCHA_SECRET_KEY || '6LeuUY0tAAAAAACI4XECRUwqVCnsdauRQYA0f9V9';

    // Validate token presence
    if (typeof token !== 'string' || token.trim().length === 0) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({
          success: false,
          error: 'reCAPTCHA verification token is invalid or missing.'
        })
      };
    }

    if (!secretKey) {
      console.error('[reCAPTCHA] Server Secret Key is not configured in environment variables.');
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({
          success: false,
          error: 'Server configuration error: reCAPTCHA Secret Key missing.'
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
      console.warn('[reCAPTCHA] Verification rejected by Google:', result['error-codes']);
      return {
        statusCode: 403,
        headers,
        body: JSON.stringify({
          success: false,
          error: 'Bot verification challenge failed or expired. Please retry.',
          errorCodes: result['error-codes']
        })
      };
    }

    // Check reCAPTCHA v3 score if present (human score threshold is typically 0.5; allow >= 0.3)
    if (typeof result.score === 'number' && result.score < 0.3) {
      console.warn('[reCAPTCHA v3] Low bot score detected:', result.score);
      return {
        statusCode: 403,
        headers,
        body: JSON.stringify({
          success: false,
          error: 'Bot verification failed due to low interaction score. Please retry.',
          score: result.score
        })
      };
    }

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        message: 'Google reCAPTCHA verification successful.',
        action: result.action || requestedAction || undefined,
        score: result.score,
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
        error: 'An internal error occurred during security challenge verification.'
      })
    };
  }
};
