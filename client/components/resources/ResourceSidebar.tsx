'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ChevronRight, Home, Briefcase, BookOpen } from 'lucide-react';
import { TargetAudience } from '@/types/resource';
import { HOMEOWNER_SECTIONS, PRO_SECTIONS } from '@/data/resources';

interface ResourceSidebarProps {
  audience: TargetAudience;
}

export function ResourceSidebar({ audience }: ResourceSidebarProps) {
  const pathname = usePathname();

  const sections = audience === TargetAudience.HOMEOWNER ? HOMEOWNER_SECTIONS : PRO_SECTIONS;
  const academyPath = audience === TargetAudience.HOMEOWNER ? '/resources/homeowner' : '/resources/pro';
  const academyLabel = audience === TargetAudience.HOMEOWNER ? 'Homeowner Academy' : 'Pro Academy';
  const AcademyIcon = audience === TargetAudience.HOMEOWNER ? Home : Briefcase;

  return (
    <aside className="w-full lg:w-64 flex-shrink-0">
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden sticky top-24">
        {/* Academy Header */}
        <Link
          href={academyPath}
          className={`flex items-center gap-3 p-4 border-b border-gray-100 hover:bg-gray-50 transition-colors ${
            pathname === academyPath ? 'bg-primary-50' : ''
          }`}
        >
          <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
            audience === TargetAudience.HOMEOWNER ? 'bg-green-100 text-green-600' : 'bg-orange-100 text-orange-600'
          }`}>
            <AcademyIcon className="h-5 w-5" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">{academyLabel}</h3>
            <p className="text-xs text-gray-500">
              {audience === TargetAudience.HOMEOWNER ? 'Resources for homeowners' : 'Resources for professionals'}
            </p>
          </div>
        </Link>

        {/* Navigation Sections */}
        <nav className="p-4 space-y-6">
          {sections.map((section, sectionIdx) => (
            <div key={sectionIdx}>
              <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                {section.title}
              </h4>
              <ul className="space-y-1">
                {section.links.map((link, linkIdx) => {
                  const isActive = pathname === link.href;
                  return (
                    <li key={linkIdx}>
                      <Link
                        href={link.href}
                        className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors ${
                          isActive
                            ? 'bg-primary-50 text-primary-700 font-medium'
                            : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                        }`}
                      >
                        <ChevronRight className={`h-4 w-4 flex-shrink-0 ${isActive ? 'text-primary-600' : 'text-gray-400'}`} />
                        <span className="truncate">{link.label}</span>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </nav>

        {/* Browse All Link */}
        <div className="p-4 border-t border-gray-100">
          <Link
            href="/resources/categories"
            className="flex items-center gap-2 text-sm text-primary-600 hover:text-primary-700 font-medium"
          >
            <BookOpen className="h-4 w-4" />
            Browse All Categories
          </Link>
        </div>
      </div>
    </aside>
  );
}

export default ResourceSidebar;
