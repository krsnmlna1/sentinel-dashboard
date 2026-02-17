import { NextResponse } from 'next/server';
import axios from 'axios';

export async function POST(request: Request) {
  try {

    const { text, fileName } = await request.json();
    
    if (!text || text.length < 100) {
      return NextResponse.json(
        { success: false, error: 'Could not extract meaningful text from PDF' },
        { status: 400 }
      );
    }

    console.log('📄 Received text length:', text.length);

    // Send to Cloudflare Worker for AI analysis
    const workerUrl = 'https://sentinel-api.krsnmlna1.workers.dev/api/audit';
    
    const workerResponse = await axios.post(workerUrl, {
      auditType: 'whitepaper',
      whitepaperText: text, // Worker now accepts this field
      fileName: fileName
    });

    if (!workerResponse.data.success) {
      throw new Error(workerResponse.data.error || 'Worker failed to queue job');
    }

    const { jobId } = workerResponse.data;

    return NextResponse.json({
      success: true,
      jobId,
      fileName: fileName,
      message: 'Analysis queued successfully',
      textLength: text.length,
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
