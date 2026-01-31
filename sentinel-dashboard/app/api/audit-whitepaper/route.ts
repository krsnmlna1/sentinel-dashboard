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
    
    // For now, we'll use a simple text extraction
    // In production, you'd want to use a proper PDF parser like pdf-parse
    const textContent = buffer.toString('utf-8', 0, Math.min(buffer.length, 50000));
    
    // Clean the text
    const cleanedText = textContent
      .replace(/[^\x20-\x7E\n]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim()
      .substring(0, 15000); // Limit to 15k chars for AI

    if (cleanedText.length < 100) {
      return NextResponse.json(
        { success: false, error: 'Could not extract meaningful text from PDF' },
        { status: 400 }
      );
    }

    const extractedText = cleanedText;
    console.log('📄 Extracted text length:', extractedText.length);

    // 3. Send to AI for analysis
    const groqApiKey = process.env.GROQ_API_KEY;
    if (!groqApiKey) {
      throw new Error('GROQ_API_KEY not configured');
    }
    const prompt = `You are a blockchain security expert analyzing a cryptocurrency project whitepaper. Provide a comprehensive security and viability analysis.

WHITEPAPER CONTENT:
${cleanedText}

Analyze the following aspects:

1. **PROJECT OVERVIEW**
   - Core value proposition
   - Problem being solved
   - Target market

2. **TECHNICAL ANALYSIS**
   - Technology stack
   - Architecture soundness
   - Scalability considerations
   - Innovation level

3. **TOKENOMICS**
   - Token distribution
   - Vesting schedules
   - Utility and use cases
   - Red flags in allocation

4. **TEAM & ADVISORS**
   - Team credentials (if mentioned)
   - Advisor quality
   - Transparency level

5. **SECURITY CONCERNS**
   - Audit mentions
   - Security measures
   - Potential vulnerabilities
   - Centralization risks

6. **RED FLAGS** 🚩
   - Unrealistic promises
   - Vague technical details
   - Poor tokenomics
   - Lack of transparency
   - Plagiarism indicators

7. **OVERALL RISK ASSESSMENT**
   - Risk Score (0-100, where 100 is highest risk)
   - Investment viability
   - Key recommendations

Provide a detailed, critical analysis. Be honest about red flags.`;

    // Call Groq AI
    const aiResponse = await axios.post(
      'https://api.groq.com/openai/v1/chat/completions',
      {
        model: 'llama-3.3-70b-versatile',
        messages: [
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.3,
        max_tokens: 2000
      },
      {
        headers: {
          'Authorization': `Bearer ${groqApiKey}`,
          'Content-Type': 'application/json',
        },
        timeout: 60000 // 60 second timeout
      }
    );

    const analysis = aiResponse.data.choices[0].message.content;

    return NextResponse.json({
      success: true,
      fileName: file.name,
      fileSize: file.size,
      analysis: analysis,
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
