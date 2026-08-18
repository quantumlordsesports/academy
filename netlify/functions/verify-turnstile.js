/**
 * Cloudflare Turnstile Canonical Siteverify — Netlify Serverless Function
 * Endpoint: /.netlify/functions/verify-turnstile (or /api/verify-turnstile)
 * 
 * Spec: https://developers.cloudflare.com/turnstile/spin/prompt.md
 * Validates cf-turnstile-response tokens server-side before allowing form/auth actions.
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

    // Extract Turnstile token and parameters
    const token = body.token || body['cf-turnstile-response'] || body.turnstileToken;
    const requestedAction = body.action || body['data-action'];
    const secretKey = process.env.TURNSTILE_SECRET || process.env.TURNSTILE_SECRET_KEY;

    // Validate token presence and constraints (1-2048 chars)
    if (typeof token !== 'string' || token.length === 0 || token.length > 2048) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({
          success: false,
          error: 'Turnstile verification token is invalid or missing.'
        })
      };
    }

    if (!secretKey) {
      console.error('[Turnstile] Server Secret Key is not configured in environment variables.');
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({
          success: false,
          error: 'Server configuration error: Turnstile Secret Key missing.'
        })
      };
    }

    // Extract client IP address for enhanced security check
    const clientIp = event.headers['x-forwarded-for'] || 
                     event.headers['x-nf-client-connection-ip'] || 
                     event.headers['client-ip'] || '';

    // Prepare URL-encoded form data for Cloudflare siteverify
    const siteverifyParams = new URLSearchParams();
    siteverifyParams.append('secret', secretKey);
    siteverifyParams.append('response', token);
    if (clientIp) {
      siteverifyParams.append('remoteip', clientIp.split(',')[0].trim());
    }

    // Perform canonical Siteverify fetch with 10-second timeout
    const cfResponse = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: siteverifyParams,
      signal: AbortSignal.timeout(10_000)
    });

    if (!cfResponse.ok) {
      throw new Error(`Cloudflare Siteverify HTTP Error ${cfResponse.status}`);
    }

    const result = await cfResponse.json();

    // Check success status
    if (!result.success) {
      console.warn('[Turnstile] Verification rejected by Cloudflare:', result['error-codes']);
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

    // Validate Action if specified
    if (requestedAction && result.action && result.action !== requestedAction) {
      console.warn(`[Turnstile] Action mismatch: expected "${requestedAction}", received "${result.action}"`);
      return {
        statusCode: 403,
        headers,
        body: JSON.stringify({
          success: false,
          error: 'Security action verification mismatch.'
        })
      };
    }

    // Validate Hostname against allowed list if configured
    const configuredHostnames = (process.env.TURNSTILE_HOSTNAMES || 'quantumlordsesports.netlify.app,localhost,127.0.0.1')
      .split(',')
      .map(h => h.trim())
      .filter(Boolean);

    if (configuredHostnames.length > 0 && result.hostname) {
      const isAllowedHostname = configuredHostnames.includes(result.hostname);
      if (!isAllowedHostname) {
        console.warn(`[Turnstile] Hostname mismatch: received "${result.hostname}"`);
        return {
          statusCode: 403,
          headers,
          body: JSON.stringify({
            success: false,
            error: 'Security hostname verification mismatch.'
          })
        };
      }
    }

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        message: 'Turnstile verification successful.',
        action: result.action,
        hostname: result.hostname,
        challenge_ts: result.challenge_ts
      })
    };

  } catch (error) {
    console.error('[Turnstile Exception]', error.message);
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
