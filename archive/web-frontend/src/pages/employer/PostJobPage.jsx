import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import axios from '../../lib/axios';

const jobSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters'),
  description: z.string().min(20, 'Description must be at least 20 characters'),
  requirements: z.string().optional(),
  salary: z.string().optional(),
  location: z.string().min(2, 'Location is required'),
  jobType: z.string().min(1, 'Job type is required'),
  industry: z.string().optional(),
});

export default function PostJobPage() {
  const [hiringMode, setHiringMode] = useState('permanent'); // 'permanent' or 'shortterm'
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(jobSchema),
    defaultValues: {
      jobType: 'full-time',
    },
  });

  const onSubmit = async (data) => {
    try {
      setError('');
      setIsSubmitting(true);
      setSuccess(false);

      const jobData = {
        ...data,
        hiringMode,
        salary: data.salary || 'Negotiable',
      };

      await axios.post('/jobs', jobData);
      setSuccess(true);
      reset();
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to post job. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-neutral-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-neutral-900 mb-2">Post a Job</h1>
        <p className="text-neutral-600 mb-8">Fill in the details to create a new job posting</p>

        {/* Hiring Mode Toggle */}
        <div className="bg-white/70 backdrop-blur-lg border border-white/50 rounded-2xl p-6 shadow-lg mb-6">
          <h2 className="text-xl font-semibold text-neutral-900 mb-4">Hiring Mode</h2>
          <div className="grid grid-cols-2 gap-4">
            <button
              type="button"
              onClick={() => setHiringMode('permanent')}
              className={`p-6 rounded-xl border-2 transition-all ${
                hiringMode === 'permanent'
                  ? 'border-primary-500 bg-primary-50 shadow-md'
                  : 'border-neutral-200 bg-white hover:border-neutral-300'
              }`}
            >
              <div className="text-3xl mb-2">👔</div>
              <h3 className="font-bold text-lg text-neutral-900 mb-1">Permanent Role</h3>
              <p className="text-sm text-neutral-600">White Collar - Full-time positions</p>
            </button>

            <button
              type="button"
              onClick={() => setHiringMode('shortterm')}
              className={`p-6 rounded-xl border-2 transition-all ${
                hiringMode === 'shortterm'
                  ? 'border-accent-500 bg-accent-50 shadow-md'
                  : 'border-neutral-200 bg-white hover:border-neutral-300'
              }`}
            >
              <div className="text-3xl mb-2">🔧</div>
              <h3 className="font-bold text-lg text-neutral-900 mb-1">Short-Term Task</h3>
              <p className="text-sm text-neutral-600">Blue Collar - Gigs & projects</p>
            </button>
          </div>
        </div>

        {/* Job Form */}
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="bg-white/70 backdrop-blur-lg border border-white/50 rounded-2xl p-6 shadow-lg space-y-6">
            {success && (
              <div className="bg-success-50 border border-success-200 text-success-700 px-4 py-3 rounded-lg">
                Job posted successfully!
              </div>
            )}

            {error && (
              <div className="bg-error-50 border border-error-200 text-error-700 px-4 py-3 rounded-lg">
                {error}
              </div>
            )}

            <div>
              <label htmlFor="title" className="block text-sm font-medium text-neutral-700 mb-2">
                Job Title *
              </label>
              <input
                {...register('title')}
                type="text"
                id="title"
                placeholder={hiringMode === 'permanent' ? 'e.g., Senior Software Engineer' : 'e.g., Plumber for Emergency Repair'}
                className="w-full px-4 py-3 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
              {errors.title && <p className="mt-1 text-sm text-error-600">{errors.title.message}</p>}
            </div>

            <div>
              <label htmlFor="description" className="block text-sm font-medium text-neutral-700 mb-2">
                Description *
              </label>
              <textarea
                {...register('description')}
                id="description"
                rows="5"
                placeholder="Describe the role, responsibilities, and what you're looking for..."
                className="w-full px-4 py-3 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
              {errors.description && <p className="mt-1 text-sm text-error-600">{errors.description.message}</p>}
            </div>

            {hiringMode === 'permanent' && (
              <div>
                <label htmlFor="requirements" className="block text-sm font-medium text-neutral-700 mb-2">
                  Requirements
                </label>
                <textarea
                  {...register('requirements')}
                  id="requirements"
                  rows="3"
                  placeholder="Education, experience, skills required..."
                  className="w-full px-4 py-3 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>
            )}

            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="location" className="block text-sm font-medium text-neutral-700 mb-2">
                  Location *
                </label>
                <input
                  {...register('location')}
                  type="text"
                  id="location"
                  placeholder="e.g., Lahore, Pakistan"
                  className="w-full px-4 py-3 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
                {errors.location && <p className="mt-1 text-sm text-error-600">{errors.location.message}</p>}
              </div>

              <div>
                <label htmlFor="salary" className="block text-sm font-medium text-neutral-700 mb-2">
                  {hiringMode === 'permanent' ? 'Salary Range' : 'Payment/Rate'}
                </label>
                <input
                  {...register('salary')}
                  type="text"
                  id="salary"
                  placeholder={hiringMode === 'permanent' ? 'e.g., $60,000 - $80,000' : 'e.g., Rs 2000/hour'}
                  className="w-full px-4 py-3 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="jobType" className="block text-sm font-medium text-neutral-700 mb-2">
                  Job Type *
                </label>
                <select
                  {...register('jobType')}
                  id="jobType"
                  className="w-full px-4 py-3 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                >
                  {hiringMode === 'permanent' ? (
                    <>
                      <option value="full-time">Full-time</option>
                      <option value="part-time">Part-time</option>
                      <option value="contract">Contract</option>
                      <option value="remote">Remote</option>
                    </>
                  ) : (
                    <>
                      <option value="one-time">One-time Task</option>
                      <option value="hourly">Hourly Work</option>
                      <option value="project">Project-based</option>
                      <option value="urgent">Urgent</option>
                    </>
                  )}
                </select>
              </div>

              <div>
                <label htmlFor="industry" className="block text-sm font-medium text-neutral-700 mb-2">
                  Industry/Category
                </label>
                <input
                  {...register('industry')}
                  type="text"
                  id="industry"
                  placeholder={hiringMode === 'permanent' ? 'e.g., Technology' : 'e.g., Plumbing'}
                  className="w-full px-4 py-3 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>
            </div>

            <div className="flex justify-end gap-4 pt-4">
              <button
                type="button"
                onClick={() => reset()}
                className="px-6 py-3 border border-neutral-300 text-neutral-700 rounded-lg hover:bg-neutral-50 transition-colors"
              >
                Clear
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-6 py-3 bg-primary-600 hover:bg-primary-700 text-white font-semibold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? 'Posting...' : 'Post Job'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
