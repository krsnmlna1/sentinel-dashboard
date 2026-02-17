import { NextResponse } from 'next/server';
import axios from 'axios';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { text, fileName } = body;
    
    if (!text) {
      return NextResponse.json(
        { success: false, error: 'No text provided' },
        { status: 400 }
      );
    }

    if (text.length < 100) {
      return NextResponse.json(
        { success: false, error: 'Extracted text is too short' },
        { status: 400 }
      );
    }

    console.log('📄 Received text length:', text.length, 'chars');

    // Send to Cloudflare Worker for AI analysis
    const workerUrl = 'https://sentinel-api.krsnmlna1.workers.dev/api/audit';
    
    const workerResponse = await axios.post(workerUrl, {
      auditType: 'whitepaper',
      whitepaperText: text.substring(0, 50000), // Limit to 50k chars for LLM
      fileName: fileName || 'whitepaper.pdf'
    });

    if (!workerResponse.data.success) {
      throw new Error(workerResponse.data.error || 'Worker failed to queue job');
    }

    const { jobId } = workerResponse.data;

    return NextResponse.json({
      success: true,
      jobId,
      fileName: fileName || 'whitepaper.pdf',
      textLength: text.length,
      message: 'Analysis queued successfully',
      timestamp: new Date().toISOString()
    });

  } catch (error: any) {
    console.error('Whitepaper audit error:', error.message);
    
    if (error.response) {
      return NextResponse.json(
        { 
          success: false, 
          error: `API Error: ${error.response.data?.error || error.message}` 
        },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
