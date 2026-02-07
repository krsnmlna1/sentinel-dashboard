import { NextResponse } from 'next/server';
import axios from 'axios';
import pdfParse from 'pdf-parse';

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
    
    // Use proper PDF parser
    const pdfData = await pdfParse(buffer);
    const extractedText = pdfData.text
      .replace(/\s+/g, ' ')
      .trim()
      .substring(0, 15000); // Limit to 15k chars for AI

    console.log('📄 Extracted text length:', extractedText.length);

    if (extractedText.length < 100) {
      return NextResponse.json(
        { success: false, error: 'Could not extract meaningful text from PDF' },
        { status: 400 }
      );
    }

    // 3. Send to AI for analysis
    // 3. Send to Cloudflare Worker (Plan B Backend)
    const workerUrl = 'https://sentinel-api.krsnmlna1.workers.dev/api/audit';
    
    // We pass the extracted text as "contractAddress" because our worker expects that field for input
    // This is a temporary workaround to avoid redeploying the worker code immediately
    const workerResponse = await axios.post(workerUrl, {
      contractAddress: extractedText, 
      auditType: 'whitepaper'
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
      extractedLength: cleanedText.length,
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
