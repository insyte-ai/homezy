import { z } from 'zod';

export const submitReviewSchema = z.object({
  body: z.object({
    leadId: z.string().min(1, 'Lead ID is required'),
    professionalId: z.string().min(1, 'Professional ID is required'),
    overallRating: z.number().min(1).max(5),
    categoryRatings: z.object({
      professionalism: z.number().min(1).max(5),
      quality: z.number().min(1).max(5),
      timeliness: z.number().min(1).max(5),
      value: z.number().min(1).max(5),
      communication: z.number().min(1).max(5),
    }),
    reviewText: z.string().min(50, 'Review must be at least 50 characters').max(500, 'Review must be at most 500 characters'),
    wouldRecommend: z.boolean(),
    projectCompleted: z.boolean(),
    photos: z.array(z.string().url()).optional(),
  }),
});

export const getProfessionalReviewsSchema = z.object({
  query: z.object({
    page: z.string().optional().transform(val => parseInt(val || '1', 10)),
    limit: z.string().optional().transform(val => parseInt(val || '10', 10)),
  }),
});

export type SubmitReviewInput = z.infer<typeof submitReviewSchema>['body'];
