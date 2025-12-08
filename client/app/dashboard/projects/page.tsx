'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  FolderKanban,
  Calendar,
  DollarSign,
  User,
  ExternalLink,
  CheckCircle,
  Clock
} from 'lucide-react';
import { getMyLeads, Lead, LeadStatus } from '@/lib/services/leads';
import { getQuotesForLead, Quote, QuoteStatus } from '@/lib/services/quotes';

interface Project {
  lead: Lead;
  acceptedQuote: Quote;
}

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProjects();
  }, []);

  const loadProjects = async () => {
    try {
      setLoading(true);
      // Get all accepted leads
      const { leads } = await getMyLeads({ status: LeadStatus.ACCEPTED, limit: 100 });

      // Fetch the accepted quote for each lead
      const projectsData = await Promise.all(
        leads.map(async (lead) => {
          try {
            const { quotes } = await getQuotesForLead(lead.id);
            const acceptedQuote = quotes.find(q => q.status === QuoteStatus.ACCEPTED);
            if (acceptedQuote) {
              return { lead, acceptedQuote };
            }
            return null;
          } catch {
            return null;
          }
        })
      );

      setProjects(projectsData.filter((p): p is Project => p !== null));
    } catch (error) {
      console.error('Failed to load projects:', error);
    } finally {
      setLoading(false);
    }
  };

  const activeProjects = projects.filter(p => {
    const completionDate = new Date(p.acceptedQuote.timeline.completionDate);
    return completionDate >= new Date();
  });

  const completedProjects = projects.filter(p => {
    const completionDate = new Date(p.acceptedQuote.timeline.completionDate);
    return completionDate < new Date();
  });

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">My Projects</h1>
        <p className="text-gray-600">
          Track your ongoing and completed home improvement projects
        </p>
      </div>

      {/* Stats */}
      <div className="grid sm:grid-cols-2 gap-6 mb-8">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg p-6 text-white">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-white/20 rounded-lg">
              <Clock className="h-6 w-6" />
            </div>
          </div>
          <div className="text-3xl font-bold mb-1">{activeProjects.length}</div>
          <div className="text-blue-100">Active Projects</div>
        </div>

        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-lg p-6 text-white">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-white/20 rounded-lg">
              <CheckCircle className="h-6 w-6" />
            </div>
          </div>
          <div className="text-3xl font-bold mb-1">{completedProjects.length}</div>
          <div className="text-green-100">Completed Projects</div>
        </div>
      </div>

      {/* Projects List */}
      {loading ? (
        <div className="space-y-4">
          {[1, 2].map((i) => (
            <div key={i} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 animate-pulse">
              <div className="h-5 bg-gray-200 rounded w-3/4 mb-3"></div>
              <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-2/3"></div>
            </div>
          ))}
        </div>
      ) : projects.length === 0 ? (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
          <FolderKanban className="h-12 w-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No projects yet</h3>
          <p className="text-gray-600 mb-6">
            Projects will appear here once you accept a quote from a professional
          </p>
          <Link href="/dashboard/requests" className="btn btn-primary inline-flex items-center gap-2">
            View My Requests
            <ExternalLink className="h-4 w-4" />
          </Link>
        </div>
      ) : (
        <div className="space-y-8">
          {/* Active Projects */}
          {activeProjects.length > 0 && (
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Active Projects ({activeProjects.length})
              </h2>
              <div className="space-y-4">
                {activeProjects.map(({ lead, acceptedQuote }) => {
                  const professional = typeof acceptedQuote.professional === 'object'
                    ? acceptedQuote.professional
                    : null;
                  const daysRemaining = Math.ceil(
                    (new Date(acceptedQuote.timeline.completionDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
                  );

                  return (
                    <div
                      key={lead.id}
                      className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <h3 className="text-lg font-semibold text-gray-900 mb-1">{lead.title}</h3>
                          <p className="text-sm text-gray-600 line-clamp-2">{lead.description}</p>
                        </div>
                        {daysRemaining > 0 && (
                          <span className="ml-4 px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium whitespace-nowrap">
                            {daysRemaining} days left
                          </span>
                        )}
                      </div>

                      <div className="grid md:grid-cols-3 gap-4 mb-4">
                        <div>
                          <p className="text-sm text-gray-600 mb-1 flex items-center gap-2">
                            <User className="h-4 w-4" />
                            Professional
                          </p>
                          <p className="font-medium text-gray-900">{acceptedQuote.professionalName}</p>
                          {professional && professional.rating && (
                            <p className="text-sm text-gray-600">⭐ {professional.rating.toFixed(1)}</p>
                          )}
                        </div>

                        <div>
                          <p className="text-sm text-gray-600 mb-1 flex items-center gap-2">
                            <DollarSign className="h-4 w-4" />
                            Total Cost
                          </p>
                          <p className="font-medium text-gray-900">
                            AED {acceptedQuote.pricing.total.toLocaleString()}
                          </p>
                          <p className="text-xs text-gray-500">Inc. VAT</p>
                        </div>

                        <div>
                          <p className="text-sm text-gray-600 mb-1 flex items-center gap-2">
                            <Calendar className="h-4 w-4" />
                            Completion Date
                          </p>
                          <p className="font-medium text-gray-900">
                            {new Date(acceptedQuote.timeline.completionDate).toLocaleDateString()}
                          </p>
                        </div>
                      </div>

                      <div className="pt-4 border-t border-gray-200">
                        <Link
                          href={`/dashboard/requests/${lead.id}`}
                          className="btn btn-outline text-sm inline-flex items-center gap-2"
                        >
                          View Project Details
                          <ExternalLink className="h-4 w-4" />
                        </Link>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Completed Projects */}
          {completedProjects.length > 0 && (
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <CheckCircle className="h-5 w-5" />
                Completed Projects ({completedProjects.length})
              </h2>
              <div className="space-y-4">
                {completedProjects.map(({ lead, acceptedQuote }) => {
                  const professional = typeof acceptedQuote.professional === 'object'
                    ? acceptedQuote.professional
                    : null;

                  return (
                    <div
                      key={lead.id}
                      className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 opacity-75 hover:opacity-100 transition-opacity"
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <h3 className="text-lg font-semibold text-gray-900 mb-1">{lead.title}</h3>
                          <p className="text-sm text-gray-600 line-clamp-2">{lead.description}</p>
                        </div>
                        <span className="ml-4 px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium whitespace-nowrap flex items-center gap-1">
                          <CheckCircle className="h-3 w-3" />
                          Completed
                        </span>
                      </div>

                      <div className="grid md:grid-cols-3 gap-4 mb-4">
                        <div>
                          <p className="text-sm text-gray-600 mb-1">Professional</p>
                          <p className="font-medium text-gray-900">{acceptedQuote.professionalName}</p>
                        </div>

                        <div>
                          <p className="text-sm text-gray-600 mb-1">Total Cost</p>
                          <p className="font-medium text-gray-900">
                            AED {acceptedQuote.pricing.total.toLocaleString()}
                          </p>
                        </div>

                        <div>
                          <p className="text-sm text-gray-600 mb-1">Completed On</p>
                          <p className="font-medium text-gray-900">
                            {new Date(acceptedQuote.timeline.completionDate).toLocaleDateString()}
                          </p>
                        </div>
                      </div>

                      <div className="pt-4 border-t border-gray-200 flex gap-3">
                        <Link
                          href={`/dashboard/requests/${lead.id}`}
                          className="btn btn-outline text-sm inline-flex items-center gap-2"
                        >
                          View Details
                          <ExternalLink className="h-4 w-4" />
                        </Link>
                        {/* Future: Add "Leave Review" button */}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
