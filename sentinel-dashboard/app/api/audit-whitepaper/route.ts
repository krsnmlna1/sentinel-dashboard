import { NextResponse } from 'next/server';
import axios from 'axios';

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    
    if (!file) {
      return NextResponse.json(
        { success: false, error: 'No file provided' },
        { status: 400 }
      );
    }

    // Check file type
    if (file.type !== 'application/pdf') {
      return NextResponse.json(
        { success: false, error: 'Only PDF files are supported' },
        { status: 400 }
      );
    }

    // Check file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json(
        { success: false, error: 'File size must be less than 10MB' },
        { status: 400 }
      );
    }

    // Read file content
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    
    // Convert PDF to base64 for Cloudflare Worker
    // Worker will handle PDF parsing to avoid native dependency issues in Vercel
    const base64Pdf = buffer.toString('base64');
    
    console.log('📄 PDF size:', buffer.length, 'bytes');

    // Send to Cloudflare Worker for PDF parsing and AI analysis
    const workerUrl = 'https://sentinel-api.krsnmlna1.workers.dev/api/audit';
    
    // Worker will parse the PDF and perform AI analysis
    const workerResponse = await axios.post(workerUrl, {
      auditType: 'whitepaper',
      pdfData: base64Pdf,
      fileName: file.name
    });

    if (!workerResponse.data.success) {
      throw new Error(workerResponse.data.error || 'Worker failed to queue job');
    }

    const { jobId } = workerResponse.data;

    return NextResponse.json({
      success: true,
      jobId,
      fileName: file.name,
      fileSize: file.size,
      message: 'Analysis queued successfully',
      timestamp: new Date().toISOString()
    });

  } catch (error: any) {
    console.error('Whitepaper audit error:', error.message);
    
    if (error.response) {
      return NextResponse.json(
        { 
          success: false, 
          error: `AI API Error: ${error.response.data?.error?.message || error.message}` 
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
