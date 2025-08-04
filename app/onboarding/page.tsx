'use client';

import { useState } from 'react';
import { useUser } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { AI_PROVIDERS } from '@/lib/ai-providers';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import { Upload, ExternalLink, Check, ArrowRight, ArrowLeft } from 'lucide-react';
import { useDropzone } from 'react-dropzone';

export default function OnboardingPage() {
  const { user } = useUser();
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    fullName: user?.fullName || '',
    phone: '',
    preferences: {
      jobTypes: [] as string[],
      locations: [] as string[],
      salaryMin: '',
      salaryMax: '',
      remote: false
    },
    aiProvider: '',
    aiApiKey: '',
    resumeFile: null as File | null
  });

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: {
      'application/pdf': ['.pdf']
    },
    maxFiles: 1,
    onDrop: (acceptedFiles) => {
      if (acceptedFiles.length > 0) {
        setFormData(prev => ({ ...prev, resumeFile: acceptedFiles[0] }));
        toast.success('Resume uploaded successfully!');
      }
    }
  });

  const jobTypes = ['Full-time', 'Part-time', 'Contract', 'Freelance', 'Internship'];

  const handleNext = () => {
    if (step < 4) setStep(step + 1);
  };

  const handleBack = () => {
    if (step > 1) setStep(step - 1);
  };

  const handleJobTypeToggle = (jobType: string) => {
    setFormData(prev => ({
      ...prev,
      preferences: {
        ...prev.preferences,
        jobTypes: prev.preferences.jobTypes.includes(jobType)
          ? prev.preferences.jobTypes.filter(t => t !== jobType)
          : [...prev.preferences.jobTypes, jobType]
      }
    }));
  };

  const handleSubmit = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      // Create user profile
      const { error } = await supabase
        .from('profiles')
        .upsert({
          user_id: user.id,
          full_name: formData.fullName,
          email: user.emailAddresses[0]?.emailAddress || '',
          phone: formData.phone,
          preferences: formData.preferences,
          ai_provider: formData.aiProvider,
          ai_api_key: formData.aiApiKey, // In production, encrypt this
        });

      if (error) throw error;

      toast.success('Profile created successfully!');
      router.push('/dashboard');
    } catch (error) {
      console.error('Onboarding error:', error);
      toast.error('Failed to create profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const selectedProvider = AI_PROVIDERS.find(p => p.id === formData.aiProvider);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-4">
      <div className="max-w-2xl mx-auto py-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Welcome to JobAI</h1>
          <p className="text-slate-600">Let's set up your profile to get started</p>
          
          {/* Progress indicator */}
          <div className="flex justify-center mt-6 space-x-2">
            {[1, 2, 3, 4].map((num) => (
              <div
                key={num}
                className={`w-3 h-3 rounded-full ${
                  step >= num ? 'bg-blue-600' : 'bg-slate-200'
                }`}
              />
            ))}
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>
              {step === 1 && 'Basic Information'}
              {step === 2 && 'Job Preferences'}
              {step === 3 && 'AI Provider Setup'}
              {step === 4 && 'Resume Upload'}
            </CardTitle>
            <CardDescription>
              {step === 1 && 'Tell us about yourself'}
              {step === 2 && 'What kind of opportunities are you looking for?'}
              {step === 3 && 'Choose your AI provider for intelligent features'}
              {step === 4 && 'Upload your resume for AI-powered parsing'}
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-6">
            {step === 1 && (
              <div className="space-y-4">
                <div>
                  <Label htmlFor="fullName">Full Name</Label>
                  <Input
                    id="fullName"
                    value={formData.fullName}
                    onChange={(e) => setFormData(prev => ({ ...prev, fullName: e.target.value }))}
                    placeholder="Enter your full name"
                  />
                </div>
                
                <div>
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    value={formData.phone}
                    onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                    placeholder="+1 (555) 123-4567"
                  />
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-6">
                <div>
                  <Label>Job Types (select all that apply)</Label>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {jobTypes.map((type) => (
                      <Badge
                        key={type}
                        variant={formData.preferences.jobTypes.includes(type) ? "default" : "outline"}
                        className="cursor-pointer"
                        onClick={() => handleJobTypeToggle(type)}
                      >
                        {formData.preferences.jobTypes.includes(type) && (
                          <Check className="w-3 h-3 mr-1" />
                        )}
                        {type}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="salaryMin">Minimum Salary</Label>
                    <Input
                      id="salaryMin"
                      value={formData.preferences.salaryMin}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        preferences: { ...prev.preferences, salaryMin: e.target.value }
                      }))}
                      placeholder="$50,000"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="salaryMax">Maximum Salary</Label>
                    <Input
                      id="salaryMax"
                      value={formData.preferences.salaryMax}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        preferences: { ...prev.preferences, salaryMax: e.target.value }
                      }))}
                      placeholder="$100,000"
                    />
                  </div>
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="space-y-6">
                <div>
                  <Label>Choose AI Provider</Label>
                  <div className="grid grid-cols-2 gap-4 mt-4">
                    {AI_PROVIDERS.map((provider) => (
                      <Card
                        key={provider.id}
                        className={`cursor-pointer transition-colors ${
                          formData.aiProvider === provider.id
                            ? 'border-blue-500 bg-blue-50'
                            : 'hover:border-slate-300'
                        }`}
                        onClick={() => setFormData(prev => ({ ...prev, aiProvider: provider.id }))}
                      >
                        <CardContent className="p-4">
                          <div className="text-center">
                            <div className="text-2xl mb-2">{provider.icon}</div>
                            <h3 className="font-semibold">{provider.name}</h3>
                            <p className="text-xs text-slate-600 mt-1">{provider.description}</p>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>

                {selectedProvider && (
                  <div className="space-y-4">
                    <div className="p-4 bg-blue-50 rounded-lg">
                      <p className="text-sm text-blue-800 mb-2">
                        You'll need an API key from {selectedProvider.name} to use AI features.
                      </p>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => window.open(selectedProvider.apiKeyUrl, '_blank')}
                      >
                        Get API Key
                        <ExternalLink className="w-4 h-4 ml-2" />
                      </Button>
                    </div>

                    <div>
                      <Label htmlFor="apiKey">API Key</Label>
                      <Input
                        id="apiKey"
                        type="password"
                        value={formData.aiApiKey}
                        onChange={(e) => setFormData(prev => ({ ...prev, aiApiKey: e.target.value }))}
                        placeholder="Enter your API key"
                      />
                    </div>
                  </div>
                )}
              </div>
            )}

            {step === 4 && (
              <div className="space-y-6">
                <div>
                  <Label>Upload Resume (PDF)</Label>
                  <div
                    {...getRootProps()}
                    className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
                      isDragActive ? 'border-blue-500 bg-blue-50' : 'border-slate-300 hover:border-slate-400'
                    }`}
                  >
                    <input {...getInputProps()} />
                    <Upload className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                    {formData.resumeFile ? (
                      <div>
                        <p className="text-green-600 font-medium">{formData.resumeFile.name}</p>
                        <p className="text-sm text-slate-500">Click or drag to replace</p>
                      </div>
                    ) : (
                      <div>
                        <p className="text-slate-600 mb-2">Drag & drop your resume here</p>
                        <p className="text-sm text-slate-500">or click to browse</p>
                      </div>
                    )}
                  </div>
                </div>

                <div className="p-4 bg-amber-50 rounded-lg">
                  <p className="text-sm text-amber-800">
                    Your resume will be parsed using AI to extract skills, experience, and other relevant information.
                    This data helps match you with the best job opportunities.
                  </p>
                </div>
              </div>
            )}

            <div className="flex justify-between pt-6">
              <Button
                variant="outline"
                onClick={handleBack}
                disabled={step === 1}
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>

              {step < 4 ? (
                <Button
                  onClick={handleNext}
                  disabled={
                    (step === 1 && !formData.fullName) ||
                    (step === 3 && (!formData.aiProvider || !formData.aiApiKey))
                  }
                >
                  Next
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              ) : (
                <Button
                  onClick={handleSubmit}
                  disabled={loading}
                >
                  {loading ? 'Creating Profile...' : 'Complete Setup'}
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}