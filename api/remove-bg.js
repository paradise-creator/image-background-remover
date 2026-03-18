/**
 * Image Background Remover API
 * Cloudflare Workers / Pages Function
 */

export async function onRequestPost(context) {
  const { request, env } = context;
  
  // Get API key from environment
  const API_KEY = env.REMOVEBG_API_KEY;
  
  if (!API_KEY) {
    return new Response(JSON.stringify({ 
      error: 'API key not configured' 
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  try {
    const { image } = await request.json();
    
    if (!image) {
      return new Response(JSON.stringify({ 
        error: 'No image provided' 
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Call Remove.bg API
    const formData = new FormData();
    // Convert base64 to blob
    const binaryString = atob(image);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    const blob = new Blob([bytes], { type: 'image/png' });
    formData.append('image_file', blob, 'image.png');
    formData.append('size', 'auto');
    formData.append('format', 'png');

    const response = await fetch('https://api.remove.bg/v1.0/removebg', {
      method: 'POST',
      headers: {
        'X-Api-Key': API_KEY
      },
      body: formData
    });

    if (!response.ok) {
      const errorText = await response.text();
      return new Response(JSON.stringify({ 
        error: 'Remove.bg API error: ' + errorText 
      }), {
        status: response.status,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Convert result to base64
    const resultBuffer = await response.arrayBuffer();
    const resultBase64 = btoa(
      new Uint8Array(resultBuffer)
        .reduce((data, byte) => data + String.fromCharCode(byte), '')
    );

    return new Response(JSON.stringify({ 
      image: `data:image/png;base64,${resultBase64}`
    }), {
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    return new Response(JSON.stringify({ 
      error: error.message 
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

// Handle CORS preflight
export async function onRequestOptions() {
  return new Response(null, {
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type'
    }
  });
}
