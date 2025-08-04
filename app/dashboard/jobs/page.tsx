'use client';

import { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/dashboard-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { 
  MapPin, 
  DollarSign, 
  Calendar,
  Search,
  Filter,
  Star,
  ExternalLink,
  FileText,
  Briefcase
} from 'lucide-react';
import { toast } from 'sonner';

interface JobMatch {
  jobId: string;
  matchScore: number;
  reasons: string[];
  missingSkills: string[];
  recommendations: string[];
}

interface Job {
  id: string;
  title: string;
  company: string;
  description: string;
  requirements: string[];
  location: string;
  salary_range?: string;
  job_type: string;
  created_at: string;
}

export default function JobsPage() {
  const [jobs, setJobs] = useState<(Job & { match?: JobMatch })[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [coverLetter, setCoverLetter] = useState('');
  const [generatingCoverLetter, setGeneratingCoverLetter] = useState(false);

  const fetchJobMatches = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/match-jobs', {
        method: 'POST',
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to fetch job matches');
      }

      const data = await response.json();
      
      // Mock job data for demonstration (in production, this would come from the API)
      const mockJobs: Job[] = [
        {
          id: '1',
          title: 'Senior Frontend Developer',
          company: 'TechCorp Inc.',
          description: 'We are looking for a senior frontend developer with expertise in React, TypeScript, and modern web technologies. You will be responsible for building scalable user interfaces and collaborating with our design team.',
          requirements: ['React', 'TypeScript', 'JavaScript', 'CSS', 'HTML', 'Git'],
          location: 'San Francisco, CA',
          salary_range: '$120,000 - $160,000',
          job_type: 'Full-time',
          created_at: new Date().toISOString()
        },
        {
          id: '2',
          title: 'Full Stack Engineer',
          company: 'Startup Labs',
          description: 'Join our fast-growing startup as a full stack engineer. Work with React, Node.js, and AWS to build innovative products that impact millions of users.',
          requirements: ['React', 'Node.js', 'AWS', 'MongoDB', 'TypeScript'],
          location: 'New York, NY',
          salary_range: '$100,000 - $140,000',
          job_type: 'Full-time',
          created_at: new Date().toISOString()
        },
        {
          id: '3',
          title: 'React Developer',
          company: 'MegaTech Solutions',
          description: 'Looking for a React developer to join our team and work on large-scale enterprise applications. Experience with Redux and testing frameworks preferred.',
          requirements: ['React', 'Redux', 'Jest', 'JavaScript', 'SASS'],
          location: 'Austin, TX',
          salary_range: '$90,000 - $120,000',
          job_type: 'Full-time',
          created_at: new Date().toISOString()
        }
      ];

      // Combine mock data with match scores (if available)
      const jobsWithMatches = mockJobs.map(job => {
        const match = data.matches?.find((m: JobMatch) => m.jobId === job.id);
        return { ...job, match };
      });

      setJobs(jobsWithMatches);
    } catch (error) {
      console.error('Error fetching jobs:', error);
      toast.error('Failed to load job matches. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const generateCoverLetter = async (job: Job) => {
    setGeneratingCoverLetter(true);
    try {
      const response = await fetch('/api/generate-cover-letter', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          jobId: job.id,
          jobDescription: job.description,
          companyName: job.company,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to generate cover letter');
      }

      const data = await response.json();
      setCoverLetter(data.coverLetter);
      toast.success('Cover letter generated successfully!');
    } catch (error) {
      console.error('Error generating cover letter:', error);
      toast.error('Failed to generate cover letter. Please try again.');
    } finally {
      setGeneratingCoverLetter(false);
    }
  };

  useEffect(() => {
    fetchJobMatches();
  }, []);

  const filteredJobs = jobs.filter(job =>
    job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    job.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
    job.location.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getMatchScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600 bg-green-50';
    if (score >= 60) return 'text-blue-600 bg-blue-50';
    if (score >= 40) return 'text-orange-600 bg-orange-50';
    return 'text-red-600 bg-red-50';
  };

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900">Job Matches</h1>
          <p className="text-slate-600 mt-2">
            AI-powered job recommendations based on your profile and preferences.
          </p>
        </div>

        {/* Search and Filters */}
        <div className="mb-6 flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-5 w-5" />
              <Input
                placeholder="Search jobs, companies, or locations..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          
          <Button variant="outline" onClick={fetchJobMatches} disabled={loading}>
            <Filter className="h-4 w-4 mr-2" />
            {loading ? 'Loading...' : 'Refresh Matches'}
          </Button>
        </div>

        {/* Job List */}
        <div className="space-y-6">
          {filteredJobs.map((job) => (
            <Card key={job.id} className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-xl font-semibold text-slate-900">{job.title}</h3>
                      {job.match && (
                        <Badge className={`${getMatchScoreColor(job.match.matchScore)} border-0`}>
                          <Star className="h-3 w-3 mr-1" />
                          {job.match.matchScore}% Match
                        </Badge>
                      )}
                    </div>
                    
                    <p className="text-lg text-slate-700 mb-2">{job.company}</p>
                    
                    <div className="flex flex-wrap items-center gap-4 text-sm text-slate-600 mb-4">
                      <div className="flex items-center">
                        <MapPin className="h-4 w-4 mr-1" />
                        {job.location}
                      </div>
                      {job.salary_range && (
                        <div className="flex items-center">
                          <DollarSign className="h-4 w-4 mr-1" />
                          {job.salary_range}
                        </div>
                      )}
                      <div className="flex items-center">
                        <Briefcase className="h-4 w-4 mr-1" />
                        {job.job_type}
                      </div>
                      <div className="flex items-center">
                        <Calendar className="h-4 w-4 mr-1" />
                        {new Date(job.created_at).toLocaleDateString()}
                      </div>
                    </div>

                    <p className="text-slate-600 line-clamp-2 mb-4">{job.description}</p>

                    {/* Skills */}
                    <div className="flex flex-wrap gap-2 mb-4">
                      {job.requirements.slice(0, 5).map((skill) => (
                        <Badge key={skill} variant="secondary">
                          {skill}
                        </Badge>
                      ))}
                      {job.requirements.length > 5 && (
                        <Badge variant="outline">
                          +{job.requirements.length - 5} more
                        </Badge>
                      )}
                    </div>

                    {/* Match Details */}
                    {job.match && (
                      <div className="bg-slate-50 rounded-lg p-4 mb-4">
                        <h4 className="font-medium text-slate-900 mb-2">Why this is a good match:</h4>
                        <ul className="text-sm text-slate-600 space-y-1">
                          {job.match.reasons.slice(0, 3).map((reason, index) => (
                            <li key={index} className="flex items-start">
                              <span className="text-green-500 mr-2">•</span>
                              {reason}
                            </li>
                          ))}
                        </ul>
                        
                        {job.match.missingSkills.length > 0 && (
                          <div className="mt-3">
                            <p className="text-sm text-slate-700 font-medium">Skills to develop:</p>
                            <div className="flex flex-wrap gap-1 mt-1">
                              {job.match.missingSkills.slice(0, 3).map((skill) => (
                                <Badge key={skill} variant="outline" className="text-xs">
                                  {skill}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex flex-col sm:flex-row gap-3">
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button 
                        onClick={() => setSelectedJob(job)}
                        className="flex-1"
                      >
                        View Details
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                      <DialogHeader>
                        <DialogTitle>{job.title} at {job.company}</DialogTitle>
                        <DialogDescription>
                          {job.location} • {job.job_type}
                        </DialogDescription>
                      </DialogHeader>
                      
                      <div className="space-y-6">
                        <div>
                          <h4 className="font-semibold mb-2">Job Description</h4>
                          <p className="text-slate-600">{job.description}</p>
                        </div>

                        <div>
                          <h4 className="font-semibold mb-2">Requirements</h4>
                          <div className="flex flex-wrap gap-2">
                            {job.requirements.map((req) => (
                              <Badge key={req} variant="secondary">{req}</Badge>
                            ))}
                          </div>
                        </div>

                        {job.match && (
                          <div>
                            <h4 className="font-semibold mb-2">Match Analysis</h4>
                            <div className="bg-slate-50 rounded-lg p-4">
                              <div className="mb-3">
                                <Badge className={`${getMatchScoreColor(job.match.matchScore)} border-0`}>
                                  {job.match.matchScore}% Match
                                </Badge>
                              </div>
                              
                              <div className="space-y-3">
                                <div>
                                  <p className="text-sm font-medium text-slate-700">Strengths:</p>
                                  <ul className="text-sm text-slate-600 mt-1 space-y-1">
                                    {job.match.reasons.map((reason, index) => (
                                      <li key={index}>• {reason}</li>
                                    ))}
                                  </ul>
                                </div>
                                
                                {job.match.recommendations.length > 0 && (
                                  <div>
                                    <p className="text-sm font-medium text-slate-700">Recommendations:</p>
                                    <ul className="text-sm text-slate-600 mt-1 space-y-1">
                                      {job.match.recommendations.map((rec, index) => (
                                        <li key={index}>• {rec}</li>
                                      ))}
                                    </ul>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        )}

                        <div className="flex gap-3">
                          <Button 
                            onClick={() => generateCoverLetter(job)}
                            disabled={generatingCoverLetter}
                            className="flex-1"
                          >
                            <FileText className="h-4 w-4 mr-2" />
                            {generatingCoverLetter ? 'Generating...' : 'Generate Cover Letter'}
                          </Button>
                          <Button variant="outline" className="flex-1">
                            <ExternalLink className="h-4 w-4 mr-2" />
                            Apply Now
                          </Button>
                        </div>

                        {coverLetter && (
                          <div>
                            <h4 className="font-semibold mb-2">Generated Cover Letter</h4>
                            <Textarea 
                              value={coverLetter}
                              onChange={(e) => setCoverLetter(e.target.value)}
                              rows={10}
                              className="font-mono text-sm"
                            />
                            <Button size="sm" className="mt-2" onClick={() => {
                              navigator.clipboard.writeText(coverLetter);
                              toast.success('Cover letter copied to clipboard!');
                            }}>
                              Copy to Clipboard
                            </Button>
                          </div>
                        )}
                      </div>
                    </DialogContent>
                  </Dialog>

                  <Button variant="outline">
                    <ExternalLink className="h-4 w-4 mr-2" />
                    Apply
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredJobs.length === 0 && !loading && (
          <div className="text-center py-12">
            <Briefcase className="h-12 w-12 text-slate-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-slate-900 mb-2">No jobs found</h3>
            <p className="text-slate-600 mb-4">
              {searchTerm ? 'Try adjusting your search terms.' : 'Configure your AI provider to get job matches.'}
            </p>
            <Button onClick={fetchJobMatches}>
              Refresh Jobs
            </Button>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}