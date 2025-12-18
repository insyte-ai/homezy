'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { Upload, CheckCircle, Clock, XCircle, FileText } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';

interface VerificationDocument {
  type: string;
  url: string;
  status: 'pending' | 'approved' | 'rejected';
  uploadedAt: string;
  rejectionReason?: string;
}

interface DocumentType {
  id: string;
  label: string;
  description: string;
  required: boolean;
}

const DOCUMENT_TYPES: DocumentType[] = [
  {
    id: 'license',
    label: 'Trade/Business License',
    description: 'PDF, PNG, JPG up to 10MB',
    required: true,
  },
  {
    id: 'vat',
    label: 'VAT Certificate',
    description: 'Tax Registration Number (TRN) certificate',
    required: true,
  },
];

export default function ProVerificationPage() {
  const { user, fetchCurrentUser } = useAuthStore();
  const [documents, setDocuments] = useState<VerificationDocument[]>([]);
  const [uploading, setUploading] = useState<Record<string, boolean>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const fileInputRefs = useRef<Record<string, HTMLInputElement | null>>({});
  const [proProfile, setProProfile] = useState<any>(null);

  // Helper to get auth headers
  const getAuthHeaders = (): HeadersInit => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;
    return token ? { Authorization: `Bearer ${token}` } : {};
  };

  // Fetch pro profile data
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/pros/me`,
          {
            credentials: 'include',
            headers: getAuthHeaders(),
          }
        );
        if (response.ok) {
          const data = await response.json();
          setProProfile(data.data);
          if (data.data?.verificationDocuments) {
            setDocuments(data.data.verificationDocuments);
          }
        }
      } catch (error) {
        console.error('Failed to fetch profile:', error);
      }
    };

    if (user) {
      fetchProfile();
    }
  }, [user]);

  const getDocumentByType = (type: string): VerificationDocument | undefined => {
    return documents.find((doc) => doc.type === type);
  };

  const handleFileSelect = async (type: string, file: File) => {
    // Validate file size (10MB max)
    if (file.size > 10 * 1024 * 1024) {
      setErrors((prev) => ({ ...prev, [type]: 'File size must be less than 10MB' }));
      return;
    }

    // Validate file type
    const validTypes = ['application/pdf', 'image/png', 'image/jpeg', 'image/jpg'];
    if (!validTypes.includes(file.type)) {
      setErrors((prev) => ({ ...prev, [type]: 'File must be PDF, PNG, or JPG' }));
      return;
    }

    setErrors((prev) => ({ ...prev, [type]: '' }));
    setUploading((prev) => ({ ...prev, [type]: true }));

    try {
      const formData = new FormData();
      formData.append('document', file);
      formData.append('type', type);

      const token = localStorage.getItem('accessToken');
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/pros/me/verification/upload`,
        {
          method: 'POST',
          credentials: 'include',
          headers: {
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
          body: formData,
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Upload failed');
      }

      const result = await response.json();

      // Update local state with the new document
      setDocuments((prev) => {
        const existing = prev.findIndex((doc) => doc.type === type);
        if (existing !== -1) {
          const updated = [...prev];
          updated[existing] = result.data.document;
          return updated;
        }
        return [...prev, result.data.document];
      });

      // Refresh user data to get updated verification status
      await fetchCurrentUser();
    } catch (error) {
      console.error('Upload error:', error);
      setErrors((prev) => ({
        ...prev,
        [type]: error instanceof Error ? error.message : 'Upload failed. Please try again.',
      }));
    } finally {
      setUploading((prev) => ({ ...prev, [type]: false }));
    }
  };

  const handleClick = (type: string) => {
    fileInputRefs.current[type]?.click();
  };

  const handleInputChange = (type: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileSelect(type, file);
    }
    // Reset input so the same file can be selected again
    e.target.value = '';
  };

  const handleDrop = (type: string, e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file) {
      handleFileSelect(type, file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'rejected':
        return <XCircle className="h-5 w-5 text-red-500" />;
      default:
        return <Clock className="h-5 w-5 text-yellow-500" />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'approved':
        return 'Approved';
      case 'rejected':
        return 'Rejected';
      default:
        return 'Pending Review';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return 'text-green-700 bg-green-50';
      case 'rejected':
        return 'text-red-700 bg-red-50';
      default:
        return 'text-yellow-700 bg-yellow-50';
    }
  };

  const verificationStatus = proProfile?.verificationStatus;
  const isFullyVerified = verificationStatus === 'approved';

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-6">
        <Link href="/pro/dashboard" className="text-primary-600 hover:text-primary-700 text-sm font-medium">
          &larr; Back to Dashboard
        </Link>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-neutral-200 p-8">
        <h1 className="text-3xl font-bold text-neutral-900 mb-2">
          Verification Documents
        </h1>
        <p className="text-neutral-600 mb-8">
          Upload your documents to get verified and start claiming leads
        </p>

        {isFullyVerified ? (
          <div className="bg-green-50 border border-green-200 rounded-lg p-6 mb-8">
            <div className="flex items-center gap-3">
              <CheckCircle className="h-6 w-6 text-green-500" />
              <div>
                <h3 className="font-semibold text-green-900">Fully Verified</h3>
                <p className="text-sm text-green-700">
                  Your account is verified. You can claim leads and receive the verified badge.
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-primary-50 border border-primary-200 rounded-lg p-6 mb-8">
            <h3 className="font-semibold text-primary-900 mb-2">Why verify?</h3>
            <ul className="space-y-2 text-sm text-neutral-900">
              <li className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-primary-600" />
                Start claiming and responding to leads
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-primary-600" />
                Build trust with homeowners
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-primary-600" />
                Get 15% credit discount with comprehensive verification
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-primary-600" />
                Priority placement in search results
              </li>
            </ul>
          </div>
        )}

        <div className="space-y-6">
          {DOCUMENT_TYPES.map((docType) => {
            const existingDoc = getDocumentByType(docType.id);
            const isUploading = uploading[docType.id];
            const error = errors[docType.id];

            return (
              <div key={docType.id}>
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  {docType.label} {docType.required && <span className="text-red-500">*</span>}
                </label>

                {existingDoc ? (
                  <div className={`border rounded-lg p-4 ${getStatusColor(existingDoc.status)}`}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <FileText className="h-8 w-8 text-neutral-400" />
                        <div>
                          <p className="font-medium text-neutral-900">{docType.label}</p>
                          <div className="flex items-center gap-2 mt-1">
                            {getStatusIcon(existingDoc.status)}
                            <span className="text-sm">{getStatusText(existingDoc.status)}</span>
                          </div>
                          {existingDoc.status === 'rejected' && existingDoc.rejectionReason && (
                            <p className="text-sm text-red-600 mt-1">
                              Reason: {existingDoc.rejectionReason}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <a
                          href={existingDoc.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-primary-600 hover:text-primary-700 font-medium"
                        >
                          View
                        </a>
                        {existingDoc.status !== 'approved' && (
                          <button
                            onClick={() => handleClick(docType.id)}
                            className="text-sm text-neutral-600 hover:text-neutral-700 font-medium"
                            disabled={isUploading}
                          >
                            Replace
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div
                    onClick={() => !isUploading && handleClick(docType.id)}
                    onDrop={(e) => handleDrop(docType.id, e)}
                    onDragOver={handleDragOver}
                    className={`mt-2 border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                      isUploading
                        ? 'border-primary-300 bg-primary-50 cursor-wait'
                        : 'border-neutral-300 hover:border-primary-400 cursor-pointer'
                    }`}
                  >
                    {isUploading ? (
                      <>
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
                        <p className="mt-4 text-sm text-neutral-600">Uploading...</p>
                      </>
                    ) : (
                      <>
                        <Upload className="mx-auto h-12 w-12 text-neutral-400" />
                        <p className="mt-2 text-sm text-neutral-600">
                          <span className="font-medium text-primary-600">Click to upload</span> or drag and drop
                        </p>
                        <p className="text-xs text-neutral-500">{docType.description}</p>
                      </>
                    )}
                  </div>
                )}

                {error && (
                  <p className="mt-2 text-sm text-red-600">{error}</p>
                )}

                <input
                  ref={(el) => { fileInputRefs.current[docType.id] = el; }}
                  type="file"
                  accept=".pdf,.png,.jpg,.jpeg"
                  onChange={(e) => handleInputChange(docType.id, e)}
                  className="hidden"
                />
              </div>
            );
          })}
        </div>

        {documents.length > 0 && documents.some((d) => d.status === 'pending') && (
          <div className="mt-8 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-yellow-600" />
              <p className="text-sm text-yellow-800">
                Your documents are being reviewed. This typically takes 1-2 business days.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
