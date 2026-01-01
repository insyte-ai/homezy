/**
 * Central export for all Mongoose models
 */

export { User, IUser } from './User.model';
export { Lead, LeadClaim, ILead, ILeadClaim } from './Lead.model';
export { Quote, IQuote } from './Quote.model';
export { Job, IJob, IJobMilestone, IJobDocument, IJobPhoto } from './Job.model';
export { Review, IReview, ICategoryRatings, IProfessionalResponse } from './Review.model';
export { CreditTransaction, CreditBalance, ICreditTransaction, ICreditBalance } from './Credit.model';
export { default as ServiceGroup, IServiceGroup, IServiceCategory, ISubService, IServiceType } from './Service.model';

// Home Management Models
export { Property, IProperty } from './Property.model';
export { HomeProject, IHomeProject } from './HomeProject.model';
export { ProjectResource, IProjectResource } from './ProjectResource.model';
export { ServiceHistory, IServiceHistory } from './ServiceHistory.model';
export { ServiceReminder, IServiceReminder } from './ServiceReminder.model';
export { Expense, IExpense } from './Expense.model';

// Portfolio & Ideas Models
export { PhotoSave, IPhotoSave } from './PhotoSave.model';
export { Project, IProject, IProjectPhoto } from './Project.model';
