import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { supabase } from '@/lib/supabase';
import { matchJobsWithAI } from '@/lib/job-matcher';

export async function POST(request: NextRequest) {
  try {
    const { userId } = auth();

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user profile with resume data and preferences
    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (!profile?.resume_data) {
      return NextResponse.json({ 
        error: 'Resume data not found. Please upload and parse your resume first.' 
      }, { status: 400 });
    }

    if (!profile.ai_provider || !profile.ai_api_key) {
      return NextResponse.json({ 
        error: 'AI provider not configured.' 
      }, { status: 400 });
    }

    // Get available jobs (in production, this might come from external APIs)
    const { data: jobs } = await supabase
      .from('jobs')
      .select('*')
      .limit(20);

    if (!jobs || jobs.length === 0) {
      return NextResponse.json({ 
        error: 'No jobs available for matching.' 
      }, { status: 404 });
    }

    // Match jobs using AI
    const jobMatches = await matchJobsWithAI(
      profile.resume_data,
      jobs,
      profile.preferences,
      profile.ai_provider,
      profile.ai_api_key
    );

    // Sort by match score
    const sortedMatches = jobMatches.sort((a, b) => b.matchScore - a.matchScore);

    return NextResponse.json({ 
      success: true, 
      matches: sortedMatches,
      totalJobs: jobs.length 
    });

  } catch (error) {
    console.error('Job matching error:', error);
    return NextResponse.json({ 
      error: 'Failed to match jobs. Please try again.' 
    }, { status: 500 });
  }
}
