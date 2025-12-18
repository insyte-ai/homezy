import Job, { IJob } from '../models/Job.model';
import { Lead } from '../models/Lead.model';
import { Quote } from '../models/Quote.model';
import mongoose from 'mongoose';

export type JobStatus = 'planning' | 'in-progress' | 'completed' | 'cancelled';

export interface CreateJobInput {
  homeownerId: string;
  professionalId: string;
  leadId: string;
  quoteId: string;
  title: string;
  description: string;
  category: string;
  budgetEstimated: number;
  startDate?: Date;
  endDate?: Date;
}

export interface UpdateJobStatusInput {
  status: JobStatus;
  completedAt?: Date;
}

/**
 * Create a new job from an accepted quote
 */
export async function createJob(input: CreateJobInput): Promise<IJob> {
  const job = new Job({
    homeownerId: input.homeownerId,
    professionalId: input.professionalId,
    leadId: input.leadId,
    quoteId: input.quoteId,
    title: input.title,
    description: input.description,
    category: input.category,
    budgetEstimated: input.budgetEstimated,
    budgetActual: 0,
    status: 'planning',
    startDate: input.startDate,
    endDate: input.endDate,
    milestones: [],
    documents: [],
    photos: [],
  });

  await job.save();
  return job;
}

/**
 * Get a job by ID
 */
export async function getJobById(jobId: string): Promise<IJob | null> {
  if (!mongoose.Types.ObjectId.isValid(jobId)) {
    return null;
  }
  return Job.findById(jobId);
}

/**
 * Get a job by lead ID
 */
export async function getJobByLeadId(leadId: string): Promise<IJob | null> {
  return Job.findOne({ leadId });
}

/**
 * Get jobs for a homeowner
 */
export async function getHomeownerJobs(
  homeownerId: string,
  options: { status?: JobStatus; limit?: number; skip?: number } = {}
): Promise<{ jobs: IJob[]; total: number }> {
  const query: any = { homeownerId };

  if (options.status) {
    query.status = options.status;
  }

  const [jobs, total] = await Promise.all([
    Job.find(query)
      .sort({ createdAt: -1 })
      .skip(options.skip || 0)
      .limit(options.limit || 20),
    Job.countDocuments(query),
  ]);

  return { jobs, total };
}

/**
 * Update job status
 */
export async function updateJobStatus(
  jobId: string,
  userId: string,
  input: UpdateJobStatusInput
): Promise<IJob | null> {
  const job = await Job.findById(jobId);

  if (!job) {
    return null;
  }

  // Only homeowner or professional can update status
  if (job.homeownerId !== userId && job.professionalId !== userId) {
    throw new Error('Not authorized to update this job');
  }

  // Validate status transitions
  const validTransitions: Record<JobStatus, JobStatus[]> = {
    planning: ['in-progress', 'cancelled'],
    'in-progress': ['completed', 'cancelled'],
    completed: [], // Cannot transition from completed
    cancelled: [], // Cannot transition from cancelled
  };

  const currentStatus = job.status as JobStatus;
  if (!validTransitions[currentStatus].includes(input.status)) {
    throw new Error(`Cannot transition from ${currentStatus} to ${input.status}`);
  }

  job.status = input.status;

  if (input.status === 'completed') {
    job.completedAt = input.completedAt || new Date();
  }

  await job.save();
  return job;
}

/**
 * Create a job when a quote is accepted
 */
export async function createJobFromQuote(
  leadId: string,
  quoteId: string,
  homeownerId: string
): Promise<IJob> {
  // Get lead and quote details
  const [lead, quote] = await Promise.all([
    Lead.findById(leadId),
    Quote.findById(quoteId),
  ]);

  if (!lead) {
    throw new Error('Lead not found');
  }

  if (!quote) {
    throw new Error('Quote not found');
  }

  // Check if job already exists for this lead
  const existingJob = await Job.findOne({ leadId });
  if (existingJob) {
    return existingJob;
  }

  return createJob({
    homeownerId,
    professionalId: quote.professionalId.toString(),
    leadId,
    quoteId,
    title: lead.title,
    description: lead.description,
    category: lead.category,
    budgetEstimated: quote.pricing.total,
  });
}
