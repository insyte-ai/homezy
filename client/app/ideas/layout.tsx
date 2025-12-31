import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Home Design Ideas & Inspiration | Homezy',
  description:
    'Browse thousands of home design photos for inspiration. Find ideas for kitchens, bathrooms, bedrooms, living rooms, and more from verified home improvement professionals in the UAE.',
  openGraph: {
    title: 'Home Design Ideas | Homezy',
    description: 'Get inspired by beautiful home design photos from top UAE professionals',
    type: 'website',
  },
};

export default function IdeasLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
