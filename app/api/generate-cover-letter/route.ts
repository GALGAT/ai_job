import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { supabase } from '@/lib/supabase';
import { generateCoverLetter } from '@/lib/job-matcher';

export async function POST(request: NextRequest) {
  try {
    const { userId } = auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { jobId, jobDescription, companyName } = await request.json();
    if (!jobId || !jobDescription || !companyName) {
      return NextResponse.json({ 
        error: 'Missing required fields: jobId, jobDescription, companyName' 
      }, { status: 400 });
    }

    // Get user profile
    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (!profile?.resume_data) {
      return NextResponse.json({ 
        error: 'Resume data not found.' 
      }, { status: 400 });
    }

    if (!profile.ai_provider || !profile.ai_api_key) {
      return NextResponse.json({ 
        error: 'AI provider not configured.' 
      }, { status: 400 });
    }

    // Generate cover letter
    const coverLetter = await generateCoverLetter(
      profile.resume_data,
      jobDescription,
      companyName,
      profile.ai_provider,
      profile.ai_api_key
    );

    return NextResponse.json({ 
      success: true, 
      coverLetter 
    });
  } catch (error) {
    console.error('Cover letter generation error:', error);
    return NextResponse.json({ 
      error: 'Failed to generate cover letter. Please try again.' 
    }, { status: 500 });
  }
}
