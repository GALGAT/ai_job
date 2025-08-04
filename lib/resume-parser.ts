import { callAI } from './ai-providers';

export interface ParsedResumeData {
  fullName: string;
  email: string;
  phone?: string;
  address?: string;
  summary?: string;
  education: EducationEntry[];
  experience: ExperienceEntry[];
  skills: string[];
  certifications?: string[];
  languages?: string[];
}

export interface EducationEntry {
  institution: string;
  degree: string;
  fieldOfStudy?: string;
  graduationYear?: number;
  gpa?: string;
}

export interface ExperienceEntry {
  company: string;
  position: string;
  startDate: string;
  endDate?: string;
  description: string;
  achievements?: string[];
}

export async function parseResumeWithAI(
  resumeText: string,
  aiProvider: string,
  apiKey: string
): Promise<ParsedResumeData> {
  const prompt = `
    Parse the following resume text and extract structured data. Return ONLY a valid JSON object with the following structure:
    
    {
      "fullName": "string",
      "email": "string",
      "phone": "string (optional)",
      "address": "string (optional)",
      "summary": "string (optional)",
      "education": [
        {
          "institution": "string",
          "degree": "string",
          "fieldOfStudy": "string (optional)",
          "graduationYear": number (optional),
          "gpa": "string (optional)"
        }
      ],
      "experience": [
        {
          "company": "string",
          "position": "string",
          "startDate": "string (MM/YYYY format)",
          "endDate": "string (MM/YYYY format, optional)",
          "description": "string",
          "achievements": ["string array (optional)"]
        }
      ],
      "skills": ["string array"],
      "certifications": ["string array (optional)"],
      "languages": ["string array (optional)"]
    }
    
    Resume text:
    ${resumeText}
  `;

  try {
    const response = await callAI(
      aiProvider,
      apiKey,
      prompt,
      'You are an expert resume parser. Extract information accurately and return only valid JSON.'
    );

    // Clean the response to ensure it's valid JSON
    const cleanedResponse = response.replace(/```json\n?|\n?```/g, '').trim();
    const parsedData = JSON.parse(cleanedResponse);
    
    return parsedData as ParsedResumeData;
  } catch (error) {
    console.error('Resume parsing failed:', error);
    throw new Error('Failed to parse resume. Please check your AI provider settings and try again.');
  }
}

export async function optimizeResumeWithAI(
  resumeData: ParsedResumeData,
  jobDescription: string,
  aiProvider: string,
  apiKey: string
): Promise<string> {
  const prompt = `
    Optimize the following resume data for this specific job posting. Generate an improved LaTeX resume template that highlights relevant skills and experience.
    
    Job Description:
    ${jobDescription}
    
    Resume Data:
    ${JSON.stringify(resumeData, null, 2)}
    
    Return a complete LaTeX document that:
    1. Uses a professional, ATS-friendly format
    2. Highlights skills and experience most relevant to the job
    3. Optimizes keywords from the job description
    4. Maintains truthfulness to the original data
    5. Uses modern, clean formatting
  `;

  try {
    const response = await callAI(
      aiProvider,
      apiKey,
      prompt,
      'You are an expert resume writer and LaTeX specialist. Create professional, ATS-optimized resumes.'
    );

    return response;
  } catch (error) {
    console.error('Resume optimization failed:', error);
    throw new Error('Failed to optimize resume. Please try again.');
  }
}