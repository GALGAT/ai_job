import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { supabase } from '@/lib/supabase';
import { parseResumeWithAI } from '@/lib/resume-parser';

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get('resume') as File;
    const resumeText = formData.get('resumeText') as string;

    if (!file && !resumeText) {
      return NextResponse.json({ error: 'No resume data provided' }, { status: 400 });
    }

    // Get user's AI provider settings
    const { data: profile } = await supabase
      .from('profiles')
      .select('ai_provider, ai_api_key')
      .eq('user_id', userId)
      .single();

    if (!profile?.ai_provider || !profile?.ai_api_key) {
      return NextResponse.json({ 
        error: 'AI provider not configured. Please set up your AI provider in settings.' 
      }, { status: 400 });
    }

    let textContent = resumeText;

    // If file is provided, extract text (simplified - in production, use proper PDF parsing)
    if (file) {
      // Note: In a real implementation, you'd use a PDF parsing library here
      // For now, we'll assume the text was extracted client-side
      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      
      // Placeholder for PDF text extraction
      // You would use libraries like pdf-parse, pdf2pic, or similar
      textContent = 'PDF text extraction would happen here in production';
    }

    // Parse resume with AI
    const parsedData = await parseResumeWithAI(
      textContent,
      profile.ai_provider,
      profile.ai_api_key
    );

    // Update user profile with parsed resume data
    const { error: updateError } = await supabase
      .from('profiles')
      .update({ resume_data: parsedData })
      .eq('user_id', userId);

    if (updateError) {
      throw updateError;
    }

    return NextResponse.json({ 
      success: true, 
      data: parsedData 
    });
  } catch (error) {
    console.error('Resume parsing error:', error);
    return NextResponse.json({ 
      error: 'Failed to parse resume. Please try again.' 
    }, { status: 500 });
  }
}
