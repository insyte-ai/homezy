'use client';

import { useState } from 'react';
import Image from 'next/image';
import type { ProProject } from '@homezy/shared';
import {
  Edit2,
  Trash2,
  Eye,
  Image as ImageIcon,
  ChevronDown,
  ChevronUp,
  Calendar,
} from 'lucide-react';

interface ProjectCardProps {
  project: ProProject;
  onEdit: (project: ProProject) => void;
  onDelete: (projectId: string) => void;
  onViewPhotos: (project: ProProject) => void;
}

// Check if URL is localhost (for development)
const isLocalhostUrl = (url: string) => {
  try {
    const parsed = new URL(url);
    return parsed.hostname === 'localhost' || parsed.hostname === '127.0.0.1';
  } catch {
    return false;
  }
};

export function ProjectCard({
  project,
  onEdit,
  onDelete,
  onViewPhotos,
}: ProjectCardProps) {
  const [expanded, setExpanded] = useState(false);

  const photoCount = project.photos?.length || 0;
  const publishedCount =
    project.photos?.filter((p) => p.isPublishedToIdeas && p.adminStatus === 'active')
      .length || 0;

  const coverPhoto =
    project.photos?.find((p) => p.displayOrder === 0) || project.photos?.[0];

  const formatDate = (date: Date | string) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      year: 'numeric',
    });
  };

  return (
    <div className="border border-neutral-200 rounded-lg overflow-hidden hover:shadow-lg transition-shadow bg-white">
      {/* Cover Image */}
      <div
        className="relative aspect-video bg-neutral-100 cursor-pointer"
        onClick={() => onViewPhotos(project)}
      >
        {coverPhoto ? (
          <Image
            src={coverPhoto.thumbnailUrl || coverPhoto.imageUrl}
            alt={project.name}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            className="object-cover"
            unoptimized={isLocalhostUrl(coverPhoto.thumbnailUrl || coverPhoto.imageUrl)}
          />
        ) : (
          <div className="flex items-center justify-center h-full">
            <ImageIcon className="h-12 w-12 text-neutral-400" />
          </div>
        )}

        {/* Photo count badge */}
        {photoCount > 0 && (
          <div className="absolute bottom-2 right-2 bg-black/70 text-white px-2 py-1 rounded text-xs font-medium flex items-center gap-1">
            <ImageIcon className="h-3 w-3" />
            {photoCount}
          </div>
        )}

        {/* Published indicator */}
        {publishedCount > 0 && (
          <div className="absolute top-2 right-2 bg-green-500 text-white px-2 py-1 rounded text-xs font-medium">
            {publishedCount} on Ideas
          </div>
        )}
      </div>

      {/* Project Info */}
      <div className="p-4">
        <div className="flex items-start justify-between mb-2">
          <h3 className="font-semibold text-neutral-900 text-lg line-clamp-1 flex-1">
            {project.name}
          </h3>
          <button
            onClick={() => setExpanded(!expanded)}
            className="ml-2 text-neutral-400 hover:text-neutral-600"
          >
            {expanded ? (
              <ChevronUp className="h-5 w-5" />
            ) : (
              <ChevronDown className="h-5 w-5" />
            )}
          </button>
        </div>

        <p className={`text-sm text-neutral-600 mb-3 ${expanded ? '' : 'line-clamp-2'}`}>
          {project.description}
        </p>

        <div className="flex items-center gap-2 mb-3 flex-wrap">
          <span className="inline-flex items-center px-2 py-1 rounded-md bg-primary-50 text-neutral-900 text-xs font-medium">
            {project.serviceCategory}
          </span>
          <span className="inline-flex items-center text-xs text-neutral-500 gap-1">
            <Calendar className="h-3 w-3" />
            {formatDate(project.completionDate)}
          </span>
        </div>

        {/* Photo stats */}
        <div className="flex items-center gap-4 text-xs text-neutral-600 mb-3">
          <span>{photoCount} photo{photoCount !== 1 ? 's' : ''}</span>
          {publishedCount > 0 && (
            <span className="text-green-600">{publishedCount} published</span>
          )}
        </div>

        {/* Expanded photo preview */}
        {expanded && project.photos && project.photos.length > 0 && (
          <div className="mb-3 pt-3 border-t border-neutral-200">
            <div className="grid grid-cols-4 gap-2">
              {project.photos.slice(0, 8).map((photo) => (
                <div
                  key={photo.id}
                  className="relative aspect-square bg-neutral-100 rounded overflow-hidden"
                >
                  <Image
                    src={photo.thumbnailUrl || photo.imageUrl}
                    alt=""
                    fill
                    sizes="80px"
                    className="object-cover"
                    unoptimized={isLocalhostUrl(photo.thumbnailUrl || photo.imageUrl)}
                  />
                  {photo.isPublishedToIdeas && photo.adminStatus === 'active' && (
                    <div className="absolute top-0.5 right-0.5 w-2 h-2 bg-green-500 rounded-full" />
                  )}
                </div>
              ))}
              {project.photos.length > 8 && (
                <div className="aspect-square bg-neutral-100 rounded flex items-center justify-center">
                  <span className="text-xs text-neutral-600">
                    +{project.photos.length - 8}
                  </span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-2 pt-3 border-t border-neutral-200">
          <button
            onClick={() => onViewPhotos(project)}
            className="flex-1 flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium text-primary-700 bg-primary-50 rounded-md hover:bg-primary-100"
          >
            <Eye className="h-4 w-4" />
            Photos
          </button>
          <button
            onClick={() => onEdit(project)}
            className="flex-1 flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium text-neutral-700 bg-neutral-100 rounded-md hover:bg-neutral-200"
          >
            <Edit2 className="h-4 w-4" />
            Edit
          </button>
          <button
            onClick={() => onDelete(project.id)}
            className="flex items-center justify-center px-3 py-2 text-sm font-medium text-red-700 bg-red-50 rounded-md hover:bg-red-100"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
