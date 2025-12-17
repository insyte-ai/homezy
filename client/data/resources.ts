import {
  CategoryInfo,
  ResourceCategory,
  TargetAudience,
  Author,
} from '@/types/resource';

// Default Authors
export const DEFAULT_AUTHORS: Author[] = [
  {
    id: 'homezy-team',
    name: 'Homezy Team',
    title: 'Home Services Experts',
    avatar: '/authors/homezy-team.jpg',
    bio: 'The Homezy team brings together expertise in home improvement, professional services, and homeowner guidance.',
  },
  {
    id: 'sarah-ahmed',
    name: 'Sarah Ahmed',
    title: 'Home Improvement Specialist',
    avatar: '/authors/sarah-ahmed.jpg',
    bio: 'Sarah has over 10 years of experience helping homeowners plan and execute home improvement projects in the UAE.',
  },
  {
    id: 'mohammad-khan',
    name: 'Mohammad Khan',
    title: 'Pro Success Manager',
    avatar: '/authors/mohammad-khan.jpg',
    bio: 'Mohammad works closely with professionals to help them grow their businesses on Homezy.',
  },
];

// Category Information
export const CATEGORY_INFO: CategoryInfo[] = [
  {
    id: 'getting-started',
    name: 'Getting Started',
    slug: ResourceCategory.GETTING_STARTED,
    description: 'New to Homezy? Learn the basics of finding pros, requesting quotes, and managing your home projects.',
    icon: 'Rocket',
    color: 'text-blue-600',
    bgColor: 'bg-blue-50',
    targetAudience: TargetAudience.BOTH,
  },
  {
    id: 'home-improvement-tips',
    name: 'Home Improvement Tips',
    slug: ResourceCategory.HOME_IMPROVEMENT_TIPS,
    description: 'Expert advice on home renovations, repairs, and improvements to increase your property value.',
    icon: 'Home',
    color: 'text-green-600',
    bgColor: 'bg-green-50',
    targetAudience: TargetAudience.HOMEOWNER,
  },
  {
    id: 'hiring-guides',
    name: 'Hiring Guides',
    slug: ResourceCategory.HIRING_GUIDES,
    description: 'How to find, evaluate, and hire the right professionals for your home projects.',
    icon: 'UserCheck',
    color: 'text-purple-600',
    bgColor: 'bg-purple-50',
    targetAudience: TargetAudience.HOMEOWNER,
  },
  {
    id: 'pro-business-tips',
    name: 'Pro Business Tips',
    slug: ResourceCategory.PRO_BUSINESS_TIPS,
    description: 'Grow your business with tips on lead management, customer service, and professional branding.',
    icon: 'Briefcase',
    color: 'text-orange-600',
    bgColor: 'bg-orange-50',
    targetAudience: TargetAudience.PRO,
  },
  {
    id: 'case-studies',
    name: 'Case Studies',
    slug: ResourceCategory.CASE_STUDIES,
    description: 'Real stories of successful projects and professional achievements on Homezy.',
    icon: 'FileText',
    color: 'text-indigo-600',
    bgColor: 'bg-indigo-50',
    targetAudience: TargetAudience.BOTH,
  },
  {
    id: 'industry-insights',
    name: 'Industry Insights',
    slug: ResourceCategory.INDUSTRY_INSIGHTS,
    description: 'Trends, statistics, and analysis of the UAE home services market.',
    icon: 'TrendingUp',
    color: 'text-cyan-600',
    bgColor: 'bg-cyan-50',
    targetAudience: TargetAudience.BOTH,
  },
  {
    id: 'seasonal-maintenance',
    name: 'Seasonal Maintenance',
    slug: ResourceCategory.SEASONAL_MAINTENANCE,
    description: 'Keep your home in top shape year-round with seasonal maintenance guides.',
    icon: 'Calendar',
    color: 'text-amber-600',
    bgColor: 'bg-amber-50',
    targetAudience: TargetAudience.HOMEOWNER,
  },
  {
    id: 'diy-vs-hire',
    name: 'DIY vs Hire',
    slug: ResourceCategory.DIY_VS_HIRE,
    description: 'Know when to tackle a project yourself and when to call in the professionals.',
    icon: 'HelpCircle',
    color: 'text-rose-600',
    bgColor: 'bg-rose-50',
    targetAudience: TargetAudience.HOMEOWNER,
  },
];

// Helper functions
export function getCategoryInfo(slug: string): CategoryInfo | undefined {
  return CATEGORY_INFO.find((cat) => cat.slug === slug);
}

export function getCategoriesByAudience(audience: TargetAudience): CategoryInfo[] {
  return CATEGORY_INFO.filter(
    (cat) => cat.targetAudience === audience || cat.targetAudience === TargetAudience.BOTH
  );
}

export function getHomeownerCategories(): CategoryInfo[] {
  return getCategoriesByAudience(TargetAudience.HOMEOWNER);
}

export function getProCategories(): CategoryInfo[] {
  return getCategoriesByAudience(TargetAudience.PRO);
}

export function getDefaultAuthor(): Author {
  return DEFAULT_AUTHORS[0];
}

export function getAuthorById(id: string): Author | undefined {
  return DEFAULT_AUTHORS.find((author) => author.id === id);
}

// Homeowner Academy Sections
export const HOMEOWNER_SECTIONS = [
  {
    title: 'Getting Started',
    links: [
      { label: 'How Homezy Works', href: '/resources/getting-started/how-homezy-works' },
      { label: 'Creating Your First Request', href: '/resources/getting-started/creating-first-request' },
      { label: 'Understanding Quotes', href: '/resources/hiring-guides/understanding-quotes' },
    ],
  },
  {
    title: 'Finding the Right Pro',
    links: [
      { label: 'How to Evaluate Pros', href: '/resources/hiring-guides/evaluating-professionals' },
      { label: 'Reading Reviews', href: '/resources/hiring-guides/reading-reviews' },
      { label: 'Asking the Right Questions', href: '/resources/hiring-guides/questions-to-ask' },
    ],
  },
  {
    title: 'Project Planning',
    links: [
      { label: 'Setting a Budget', href: '/resources/home-improvement-tips/setting-budget' },
      { label: 'Timeline Expectations', href: '/resources/home-improvement-tips/timeline-expectations' },
      { label: 'Preparing Your Home', href: '/resources/home-improvement-tips/preparing-home' },
    ],
  },
];

// Pro Academy Sections
export const PRO_SECTIONS = [
  {
    title: 'Getting Started',
    links: [
      { label: 'Setting Up Your Profile', href: '/resources/getting-started/pro-profile-setup' },
      { label: 'How Credits Work', href: '/resources/getting-started/understanding-credits' },
      { label: 'Your First Lead', href: '/resources/getting-started/winning-first-lead' },
    ],
  },
  {
    title: 'Lead Management',
    links: [
      { label: 'Responding to Leads', href: '/resources/pro-business-tips/responding-to-leads' },
      { label: 'Writing Winning Quotes', href: '/resources/pro-business-tips/writing-quotes' },
      { label: 'Follow-up Best Practices', href: '/resources/pro-business-tips/follow-up-tips' },
    ],
  },
  {
    title: 'Growing Your Business',
    links: [
      { label: 'Building Your Reputation', href: '/resources/pro-business-tips/building-reputation' },
      { label: 'Getting More Reviews', href: '/resources/pro-business-tips/getting-reviews' },
      { label: 'Showcase Your Work', href: '/resources/pro-business-tips/portfolio-tips' },
    ],
  },
];

// FAQ Content
export const HOMEOWNER_FAQS = [
  {
    question: 'How does Homezy work?',
    answer: 'Homezy connects you with verified local professionals. Simply describe your project, receive quotes from interested pros, compare their profiles and reviews, then choose the best fit for your needs.',
  },
  {
    question: 'Is Homezy free for homeowners?',
    answer: 'Yes! Homezy is completely free for homeowners. You can post unlimited projects and receive quotes at no cost.',
  },
  {
    question: 'How do I know if a pro is reliable?',
    answer: 'All pros on Homezy are verified and have public profiles showing their work history, reviews from past customers, and business credentials. We also display verification badges for additional trust.',
  },
  {
    question: 'What if I\'m not satisfied with the work?',
    answer: 'We recommend discussing any concerns directly with your pro first. If issues persist, contact our support team and we\'ll help mediate and find a resolution.',
  },
];

export const PRO_FAQS = [
  {
    question: 'How do credits work?',
    answer: 'Credits are used to unlock leads and contact homeowners. Each lead costs a certain number of credits based on the project size. You can purchase credit packages through your dashboard.',
  },
  {
    question: 'How do I get more leads?',
    answer: 'Complete your profile, add portfolio photos, respond quickly to leads, and maintain good reviews. Pros with complete profiles and fast response times get prioritized in our matching algorithm.',
  },
  {
    question: 'What happens after I purchase a lead?',
    answer: 'Once you purchase a lead, you can contact the homeowner directly through our messaging system. Send a personalized quote and introduce yourself to stand out.',
  },
  {
    question: 'How can I get more reviews?',
    answer: 'After completing a job, politely ask satisfied customers to leave a review. You can also send review requests through our platform. Quality work leads to quality reviews!',
  },
];
