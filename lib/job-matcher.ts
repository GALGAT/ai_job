import { callAI } from './ai-providers';
import { ParsedResumeData } from './resume-parser';

export interface JobMatch {
  jobId: string;
  matchScore: number;
  reasons: string[];
  missingSkills: string[];
  recommendations: string[];
}

export async function matchJobsWithAI(
  resumeData: ParsedResumeData,
  jobs: any[],
  preferences: any,
  aiProvider: string,
  apiKey: string
): Promise<JobMatch[]> {
  const prompt = `
    Analyze the candidate's resume and match them with the provided job listings. Return a JSON array of job matches.
    
    Candidate Resume Data:
    ${JSON.stringify(resumeData, null, 2)}
    
    Candidate Preferences:
    ${JSON.stringify(preferences, null, 2)}
    
    Job Listings:
    ${JSON.stringify(jobs, null, 2)}
    
    For each job, provide a match analysis with this structure:
    {
      "jobId": "string",
      "matchScore": number (0-100),
      "reasons": ["array of why this is a good match"],
      "missingSkills": ["skills the candidate lacks"],
      "recommendations": ["how to improve match score"]
    }
    
    Consider:
    1. Skills alignment
    2. Experience level match
    3. Education requirements
    4. Location preferences
    5. Salary expectations
    6. Company culture fit
    
    Return only the JSON array.
  `;

  try {
    const response = await callAI(
      aiProvider,
      apiKey,
      prompt,
      'You are an expert job matching specialist. Provide accurate, helpful job match analysis.'
    );

    const cleanedResponse = response.replace(/```json\n?|\n?```/g, '').trim();
    const matches = JSON.parse(cleanedResponse);
    
    return matches as JobMatch[];
  } catch (error) {
    console.error('Job matching failed:', error);
    throw new Error('Failed to match jobs. Please try again.');
  }
}

export async function generateCoverLetter(
  resumeData: ParsedResumeData,
  jobDescription: string,
  companyName: string,
  aiProvider: string,
  apiKey: string
): Promise<string> {
  const prompt = `
    Generate a professional, personalized cover letter for this job application.
    
    Candidate Information:
    Name: ${resumeData.fullName}
    Email: ${resumeData.email}
    Summary: ${resumeData.summary || 'Not provided'}
    Experience: ${JSON.stringify(resumeData.experience, null, 2)}
    Skills: ${resumeData.skills.join(', ')}
    
    Job Information:
    Company: ${companyName}
    Job Description: ${jobDescription}
    
    Requirements:
    1. Professional business letter format
    2. Personalized to the specific job and company
    3. Highlight relevant experience and skills
    4. Show enthusiasm and cultural fit
    5. Include specific examples from their background
    6. Professional but engaging tone
    7. Appropriate length (250-400 words)
    
    Return only the cover letter text, ready to use.
  `;

  try {
    const response = await callAI(
      aiProvider,
      apiKey,
      prompt,
      'You are an expert career counselor and cover letter writer. Create compelling, professional cover letters.'
    );

    return response.trim();
  } catch (error) {
    console.error('Cover letter generation failed:', error);
    throw new Error('Failed to generate cover letter. Please try again.');
  }
}

export async function generateInterviewQuestions(
  jobDescription: string,
  resumeData: ParsedResumeData,
  aiProvider: string,
  apiKey: string
): Promise<string[]> {
  const prompt = `
    Generate interview preparation questions for this specific job and candidate background.
    
    Job Description:
    ${jobDescription}
    
    Candidate Background:
    ${JSON.stringify({
      experience: resumeData.experience,
      skills: resumeData.skills,
      education: resumeData.education
    }, null, 2)}
    
    Generate 15-20 interview questions that:
    1. Are likely to be asked for this specific role
    2. Address the candidate's experience and background
    3. Include behavioral questions (STAR method)
    4. Cover technical skills relevant to the job
    5. Include company culture and fit questions
    6. Range from easy to challenging
    
    Return as a JSON array of question strings.
  `;

  try {
    const response = await callAI(
      aiProvider,
      apiKey,
      prompt,
      'You are an expert interview coach. Generate realistic, helpful interview questions.'
    );

    const cleanedResponse = response.replace(/```json\n?|\n?```/g, '').trim();
    const questions = JSON.parse(cleanedResponse);
    
    return questions as string[];
  } catch (error) {
    console.error('Interview question generation failed:', error);
    throw new Error('Failed to generate interview questions. Please try again.');
  }
}