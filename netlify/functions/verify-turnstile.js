/**
 * Cloudflare Turnstile Verification — Netlify Serverless Function
 * Endpoint: /.netlify/functions/verify-turnstile (or /api/verify-turnstile)
 * 
 * Verifies Turnstile tokens against https://challenges.cloudflare.com/turnstile/v0/siteverify
 * Uses process.env.TURNSTILE_SECRET_KEY strictly on the server side.
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

  // Only allow POST
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
        // Fallback for urlencoded
        const params = new URLSearchParams(event.body);
        body = Object.fromEntries(params.entries());
      }
    }

    // Extract Turnstile token
    const token = body.token || body['cf-turnstile-response'] || body.turnstileToken;
    const secretKey = process.env.TURNSTILE_SECRET_KEY;

    if (!secretKey) {
      console.error('[Turnstile] TURNSTILE_SECRET_KEY is not configured in server environment.');
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({
          success: false,
          error: 'Server configuration error: Turnstile Secret Key missing.'
        })
      };
    }

    if (!token) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({
          success: false,
          error: 'Turnstile verification token is missing. Please complete the security challenge.'
        })
      };
    }

    // Extract user IP if available
    const remoteIp = event.headers['x-forwarded-for'] || 
                     event.headers['x-nf-client-connection-ip'] || 
                     event.headers['client-ip'] || '';

    // Prepare FormData for Cloudflare siteverify
    const formData = new URLSearchParams();
    formData.append('secret', secretKey);
    formData.append('response', token);
    if (remoteIp) {
      formData.append('remoteip', remoteIp.split(',')[0].trim());
    }

    // Call Cloudflare Turnstile Verification API
    const cfResponse = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
      method: 'POST',
      body: formData,
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    });

    const cfData = await cfResponse.json();

    if (cfData.success) {
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          success: true,
          message: 'Human verification successful.',
          hostname: cfData.hostname,
          action: cfData.action
        })
      };
    } else {
      console.warn('[Turnstile] Bot verification failed:', cfData['error-codes']);
      return {
        statusCode: 403,
        headers,
        body: JSON.stringify({
          success: false,
          error: 'Security challenge failed or expired. Please refresh and try again.',
          errorCodes: cfData['error-codes']
        })
      };
    }
  } catch (error) {
    console.error('[Turnstile] Verification exception:', error);
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
