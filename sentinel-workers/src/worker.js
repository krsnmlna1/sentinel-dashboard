
// worker.js - Main API endpoint (Plan B: No Queues)
import { processAuditJob } from './queue-consumer.js';

export default {
  // HTTP Handler
  async fetch(request, env, ctx) {
    // CORS headers
    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, HEAD, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    };

    // Handle OPTIONS request for CORS
    if (request.method === 'OPTIONS') {
      return new Response(null, {
        headers: corsHeaders,
      });
    }

    // Parse URL
    const url = new URL(request.url);

    // 0. Health Check (GET /)
    if (url.pathname === '/' && request.method === 'GET') {
      return new Response('Sentinel Worker is Online', {
        status: 200,
        headers: corsHeaders
      });
    }

    // 1. Submit Audit Request (POST /api/audit)
    if (url.pathname === '/api/audit' && request.method === 'POST') {
      try {
        const body = await request.json();
        
        // Validate input
        if (!body.contractAddress || !body.auditType) {
          return new Response(JSON.stringify({ error: 'Missing required fields' }), {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          });
        }

        const jobId = crypto.randomUUID();
        
        // Initial state in KV
        await env.AUDIT_KV.put(jobId, JSON.stringify({
          status: 'queued',
          input: body,
          createdAt: Date.now()
        }));
        
        // PLAN B: Use ctx.waitUntil for background processing instead of Queues
        // This is "fire and forget" - we respond to user immediately, code keeps running
        ctx.waitUntil(
            processAuditJob(jobId, body, env)
        );
        
        return new Response(JSON.stringify({ 
          success: true,
          jobId,
          message: 'Audit job started successfully' 
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });

      } catch (err) {
        return new Response(JSON.stringify({ error: err.message }), {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }
    }
    
    // 2. Check Job Status (GET /api/audit/:jobId)
    // Url pattern: /api/audit/JOB_ID
    const match = url.pathname.match(/^\/api\/audit\/([a-zA-Z0-9-]+)$/);
    if (match && request.method === 'GET') {
      const jobId = match[1];
      const result = await env.AUDIT_KV.get(jobId);
      
      if (!result) {
        return new Response(JSON.stringify({ error: 'Job not found' }), { 
          status: 404,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }
      
      return new Response(result, {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }
    
    return new Response('Not found', { status: 404, headers: corsHeaders });
  }
};
