'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { getLeadById, Lead } from '@/lib/services/leads';
import { submitQuote, getMyQuoteForLead, Quote, QuoteItem, uploadQuoteDocument } from '@/lib/services/quotes';
import {
  ArrowLeft,
  MapPin,
  Calendar,
  DollarSign,
  Clock,
  User,
  Phone,
  Mail,
  FileText,
  Plus,
  Trash2,
  AlertCircle,
  CheckCircle,
  Upload,
  X,
  Paperclip,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { StartConversationButton } from '@/components/common/StartConversationButton';

export default function LeadDetailPage() {
  const router = useRouter();
  const params = useParams();
  const leadId = params?.leadId as string;

  const [lead, setLead] = useState<Lead | null>(null);
  const [myQuote, setMyQuote] = useState<Quote | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showQuoteForm, setShowQuoteForm] = useState(false);
  const [quoteMode, setQuoteMode] = useState<'select' | 'upload' | 'form'>('select');

  // Quote form state
  const [items, setItems] = useState<QuoteItem[]>([
    { description: '', quantity: 1, unitPrice: 0, total: 0 },
  ]);
  const [estimatedDays, setEstimatedDays] = useState<number | ''>('');
  const [approach, setApproach] = useState('');
  const [warranty, setWarranty] = useState('');
  const [attachments, setAttachments] = useState<{ url: string; filename: string; size: number }[]>([]);
  const [uploading, setUploading] = useState(false);
  const [uploadModeTotal, setUploadModeTotal] = useState<number>(0);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (leadId) {
      loadLead();
      loadMyQuote();
    }
  }, [leadId]);

  const loadLead = async () => {
    try {
      setLoading(true);
      const data = await getLeadById(leadId);
      setLead(data);
    } catch (error: any) {
      console.error('Failed to load lead:', error);
      toast.error(error.response?.data?.message || 'Failed to load lead');
      router.push('/pro/dashboard/leads');
    } finally {
      setLoading(false);
    }
  };

  const loadMyQuote = async () => {
    try {
      const quote = await getMyQuoteForLead(leadId);
      setMyQuote(quote);
    } catch (error) {
      console.error('Failed to load my quote:', error);
    }
  };

  const handleAddItem = () => {
    setItems([...items, { description: '', quantity: 1, unitPrice: 0, total: 0 }]);
  };

  const handleRemoveItem = (index: number) => {
    if (items.length > 1) {
      setItems(items.filter((_, i) => i !== index));
    }
  };

  const handleItemChange = (index: number, field: keyof QuoteItem, value: string | number) => {
    const newItems = [...items];
    newItems[index] = {
      ...newItems[index],
      [field]: value,
    };

    // Recalculate total for this item
    if (field === 'quantity' || field === 'unitPrice') {
      newItems[index].total = newItems[index].quantity * newItems[index].unitPrice;
    }

    setItems(newItems);
  };

  const calculateTotals = () => {
    const subtotal = items.reduce((sum, item) => sum + item.total, 0);
    const vat = subtotal * 0.05; // 5% VAT
    const total = subtotal + vat;

    return { subtotal, vat, total };
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const file = files[0];

    // Validate file type
    const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      toast.error('Please upload a PDF or image file (JPEG, PNG, WebP)');
      return;
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      toast.error('File size must be less than 10MB');
      return;
    }

    try {
      setUploading(true);
      const result = await uploadQuoteDocument(file);
      setAttachments(prev => [...prev, result]);
      toast.success('Document uploaded successfully');
    } catch (error: any) {
      console.error('Upload failed:', error);
      toast.error(error.response?.data?.message || 'Failed to upload document');
    } finally {
      setUploading(false);
      // Reset input
      e.target.value = '';
    }
  };

  const handleRemoveAttachment = (index: number) => {
    setAttachments(prev => prev.filter((_, i) => i !== index));
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  const handleSubmitQuote = async (e: React.FormEvent) => {
    e.preventDefault();

    // Clear previous errors
    setFormErrors({});
    const errors: Record<string, string> = {};

    // Common validation
    if (!estimatedDays || estimatedDays < 1) {
      errors.estimatedDays = 'Please enter estimated duration (at least 1 day)';
    } else if (estimatedDays > 365) {
      errors.estimatedDays = 'Duration cannot exceed 365 days';
    }

    if (!approach.trim()) {
      errors.approach = 'Please describe your approach';
    } else if (approach.trim().length < 50) {
      errors.approach = `Approach must be at least 50 characters (${approach.trim().length}/50)`;
    }

    // Mode-specific validation
    if (quoteMode === 'upload') {
      if (attachments.length === 0) {
        errors.attachments = 'Please upload your quote document';
      }
      if (!uploadModeTotal || uploadModeTotal <= 0) {
        errors.uploadModeTotal = 'Please enter a valid total amount';
      }
    } else {
      const invalidItems = items.filter((item) => !item.description.trim() || item.unitPrice <= 0);
      if (invalidItems.length > 0) {
        errors.items = 'Please fill in all quote items with descriptions and valid prices';
      }
    }

    // If there are errors, set them and return
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      toast.error('Please fix the errors before submitting');
      return;
    }

    try {
      setSubmitting(true);

      let pricing;
      if (quoteMode === 'upload') {
        // For upload mode, create a single line item
        const subtotal = uploadModeTotal / 1.05; // Reverse calculate from total
        const vat = uploadModeTotal - subtotal;
        pricing = {
          items: [{ description: 'As per attached quote', quantity: 1, unitPrice: subtotal, total: subtotal }],
          subtotal,
          vat,
          total: uploadModeTotal,
        };
      } else {
        const { subtotal, vat, total } = calculateTotals();
        pricing = { items, subtotal, vat, total };
      }

      await submitQuote(leadId, {
        pricing,
        timeline: {
          estimatedDuration: Number(estimatedDays),
        },
        approach,
        warranty: warranty.trim() || undefined,
        attachments: attachments.length > 0 ? attachments.map((a, index) => ({
          id: `att_${Date.now()}_${index}`,
          type: a.filename.toLowerCase().match(/\.(jpg|jpeg|png|gif|webp)$/) ? 'image' as const : 'document' as const,
          url: a.url,
          filename: a.filename,
          size: a.size,
        })) : undefined,
      });

      toast.success('Quote submitted successfully!');
      router.push('/pro/dashboard/quotes');
    } catch (error: any) {
      console.error('Failed to submit quote:', error);
      // Handle server validation errors
      if (error.response?.data?.details) {
        const serverErrors: Record<string, string> = {};
        error.response.data.details.forEach((detail: { field: string; message: string }) => {
          serverErrors[detail.field] = detail.message;
        });
        setFormErrors(serverErrors);
        toast.error('Please fix the validation errors');
      } else {
        toast.error(error.response?.data?.message || 'Failed to submit quote');
      }
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!lead) {
    return (
      <div className="container-custom py-12">
        <div className="bg-red-50 border border-red-200 rounded-lg p-8 text-center">
          <AlertCircle className="h-12 w-12 text-red-600 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-red-900 mb-2">Lead Not Found</h2>
          <p className="text-red-700 mb-4">This lead may have been deleted or you don't have access to it.</p>
          <button onClick={() => router.push('/pro/dashboard/leads')} className="btn btn-primary">
            Back to My Leads
          </button>
        </div>
      </div>
    );
  }

  const { subtotal, vat, total } = calculateTotals();

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container-custom py-8">
        {/* Header */}
        <div className="mb-6">
          <button
            onClick={() => router.push('/pro/dashboard/leads')}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to My Leads
          </button>
          <h1 className="text-3xl font-bold text-gray-900">{lead.title}</h1>
          <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
            <span className="flex items-center gap-1">
              <MapPin className="h-4 w-4" />
              {lead.location?.neighborhood ? `${lead.location.neighborhood}, ` : ''}{lead.location?.emirate}
            </span>
            <span className="flex items-center gap-1">
              <Calendar className="h-4 w-4" />
              Posted {new Date(lead.createdAt).toLocaleDateString()}
            </span>
            <span className="flex items-center gap-1">
              <Clock className="h-4 w-4" />
              {lead.urgency}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Lead Details */}
            <div className="bg-white rounded-lg p-6 border border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Project Details</h2>
              <div className="prose max-w-none">
                <p className="text-gray-700 whitespace-pre-wrap">{lead.description}</p>
              </div>
            </div>

            {/* Quote Form or Existing Quote */}
            {myQuote ? (
              <div className="bg-green-50 border border-green-200 rounded-lg p-6">
                <div className="flex items-start gap-3">
                  <CheckCircle className="h-6 w-6 text-green-600 flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-green-900 mb-2">
                      Quote Submitted
                    </h3>
                    <p className="text-green-700 mb-4">
                      You've already submitted a quote for this lead on{' '}
                      {new Date(myQuote.createdAt).toLocaleDateString()}.
                    </p>
                    <button
                      onClick={() => router.push(`/pro/dashboard/quotes`)}
                      className="text-green-700 hover:text-green-900 font-medium underline"
                    >
                      View Your Quote
                    </button>
                  </div>
                </div>
              </div>
            ) : showQuoteForm && quoteMode === 'select' ? (
              /* Mode Selection */
              <div className="bg-white rounded-lg p-6 border border-gray-200">
                <h2 className="text-xl font-semibold text-gray-900 mb-2">Submit Your Quote</h2>
                <p className="text-gray-600 mb-6">Choose how you'd like to submit your quote</p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Option 1: Upload Quote */}
                  <button
                    type="button"
                    onClick={() => setQuoteMode('upload')}
                    className="p-6 border-2 border-gray-200 rounded-lg hover:border-primary-500 hover:bg-primary-50 transition text-left group"
                  >
                    <div className="flex items-center gap-3 mb-3">
                      <div className="p-2 bg-primary-100 rounded-lg group-hover:bg-primary-200 transition">
                        <Upload className="h-6 w-6 text-primary-600" />
                      </div>
                      <h3 className="font-semibold text-gray-900">Upload Your Quote</h3>
                    </div>
                    <p className="text-sm text-gray-600">
                      Already have a quote document from your system? Upload it directly along with the total amount.
                    </p>
                  </button>

                  {/* Option 2: Use Form */}
                  <button
                    type="button"
                    onClick={() => setQuoteMode('form')}
                    className="p-6 border-2 border-gray-200 rounded-lg hover:border-primary-500 hover:bg-primary-50 transition text-left group"
                  >
                    <div className="flex items-center gap-3 mb-3">
                      <div className="p-2 bg-primary-100 rounded-lg group-hover:bg-primary-200 transition">
                        <FileText className="h-6 w-6 text-primary-600" />
                      </div>
                      <h3 className="font-semibold text-gray-900">Create Quote Here</h3>
                    </div>
                    <p className="text-sm text-gray-600">
                      Use our form to create a detailed quote with itemized pricing and automatic calculations.
                    </p>
                  </button>
                </div>

                <div className="mt-6 pt-4 border-t border-gray-200">
                  <button
                    type="button"
                    onClick={() => setShowQuoteForm(false)}
                    className="text-sm text-gray-500 hover:text-gray-700"
                  >
                    ← Back to lead details
                  </button>
                </div>
              </div>
            ) : showQuoteForm && quoteMode === 'upload' ? (
              /* Upload Mode Form */
              <form onSubmit={handleSubmitQuote} className="bg-white rounded-lg p-6 border border-gray-200">
                <div className="flex items-center gap-2 mb-6">
                  <button
                    type="button"
                    onClick={() => setQuoteMode('select')}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <ArrowLeft className="h-5 w-5" />
                  </button>
                  <h2 className="text-xl font-semibold text-gray-900">Upload Your Quote</h2>
                </div>

                {/* Error Summary */}
                {Object.keys(formErrors).length > 0 && (
                  <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                    <div className="flex items-start gap-2">
                      <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="font-medium text-red-800">Please fix the following errors:</p>
                        <ul className="mt-1 text-sm text-red-700 list-disc list-inside">
                          {Object.entries(formErrors).map(([key, value]) =>
                            value ? <li key={key}>{value}</li> : null
                          )}
                        </ul>
                      </div>
                    </div>
                  </div>
                )}

                {/* Document Upload */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Quote Document <span className="text-red-500">*</span>
                  </label>
                  <p className="text-sm text-gray-500 mb-3">
                    Upload your quote document (PDF, JPEG, PNG - max 10MB)
                  </p>

                  {attachments.length > 0 && (
                    <div className="space-y-2 mb-3">
                      {attachments.map((attachment, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between p-3 bg-green-50 rounded-lg border border-green-200"
                        >
                          <div className="flex items-center gap-3">
                            <CheckCircle className="h-5 w-5 text-green-600" />
                            <div>
                              <p className="text-sm font-medium text-gray-700 truncate max-w-xs">
                                {attachment.filename}
                              </p>
                              <p className="text-xs text-gray-500">
                                {formatFileSize(attachment.size)}
                              </p>
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleRemoveAttachment(index)}
                            className="p-1 text-gray-400 hover:text-red-600 transition"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  {attachments.length === 0 && (
                    <label className="flex flex-col items-center justify-center gap-2 px-4 py-8 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-primary-500 hover:bg-primary-50 transition">
                      <input
                        type="file"
                        onChange={handleFileUpload}
                        accept=".pdf,.jpg,.jpeg,.png,.webp"
                        className="hidden"
                        disabled={uploading}
                      />
                      {uploading ? (
                        <>
                          <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary-600 border-t-transparent" />
                          <span className="text-sm text-gray-600">Uploading...</span>
                        </>
                      ) : (
                        <>
                          <Upload className="h-8 w-8 text-gray-400" />
                          <span className="text-sm font-medium text-gray-700">Click to upload your quote</span>
                          <span className="text-xs text-gray-500">PDF, JPEG, PNG up to 10MB</span>
                        </>
                      )}
                    </label>
                  )}
                </div>

                {/* Total Amount */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Total Quote Amount (AED) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    value={uploadModeTotal || ''}
                    onChange={(e) => {
                      setUploadModeTotal(Number(e.target.value));
                      if (formErrors.uploadModeTotal) {
                        setFormErrors(prev => ({ ...prev, uploadModeTotal: '' }));
                      }
                    }}
                    placeholder="Enter total amount including VAT"
                    min="0"
                    step="0.01"
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
                      formErrors.uploadModeTotal ? 'border-red-500' : 'border-gray-300'
                    }`}
                    required
                  />
                  {formErrors.uploadModeTotal ? (
                    <p className="text-sm text-red-600 mt-1">{formErrors.uploadModeTotal}</p>
                  ) : (
                    <p className="text-xs text-gray-500 mt-1">This should be the final amount including VAT</p>
                  )}
                </div>

                {/* Estimated Duration */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Estimated Duration <span className="text-red-500">*</span>
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      value={estimatedDays}
                      onChange={(e) => {
                        setEstimatedDays(e.target.value ? Number(e.target.value) : '');
                        if (formErrors.estimatedDays) {
                          setFormErrors(prev => ({ ...prev, estimatedDays: '' }));
                        }
                      }}
                      placeholder="e.g., 5"
                      min="1"
                      max="365"
                      className={`w-32 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
                        formErrors.estimatedDays ? 'border-red-500' : 'border-gray-300'
                      }`}
                      required
                    />
                    <span className="text-gray-600">day(s)</span>
                  </div>
                  {formErrors.estimatedDays ? (
                    <p className="text-sm text-red-600 mt-1">{formErrors.estimatedDays}</p>
                  ) : (
                    <p className="text-xs text-gray-500 mt-1">How many days do you estimate this project will take?</p>
                  )}
                </div>

                {/* Approach */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Approach & Methodology <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    value={approach}
                    onChange={(e) => {
                      setApproach(e.target.value);
                      if (formErrors.approach) {
                        setFormErrors(prev => ({ ...prev, approach: '' }));
                      }
                    }}
                    placeholder="Describe how you'll approach this project, materials you'll use, and your methodology... (minimum 50 characters)"
                    rows={3}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
                      formErrors.approach ? 'border-red-500' : 'border-gray-300'
                    }`}
                    required
                  />
                  <div className="flex justify-between mt-1">
                    {formErrors.approach ? (
                      <p className="text-sm text-red-600">{formErrors.approach}</p>
                    ) : (
                      <p className="text-xs text-gray-500">Minimum 50 characters</p>
                    )}
                    <p className={`text-xs ${approach.length >= 50 ? 'text-green-600' : 'text-gray-500'}`}>
                      {approach.length}/50
                    </p>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => setQuoteMode('select')}
                    className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition"
                  >
                    Back
                  </button>
                  <button
                    type="submit"
                    disabled={submitting || attachments.length === 0}
                    className="flex-1 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition disabled:opacity-50"
                  >
                    {submitting ? 'Submitting...' : 'Submit Quote'}
                  </button>
                </div>
              </form>
            ) : showQuoteForm && quoteMode === 'form' ? (
              /* Detailed Form Mode */
              <form onSubmit={handleSubmitQuote} className="bg-white rounded-lg p-6 border border-gray-200">
                <div className="flex items-center gap-2 mb-6">
                  <button
                    type="button"
                    onClick={() => setQuoteMode('select')}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <ArrowLeft className="h-5 w-5" />
                  </button>
                  <h2 className="text-xl font-semibold text-gray-900">Create Your Quote</h2>
                </div>

                {/* Error Summary */}
                {Object.keys(formErrors).length > 0 && (
                  <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                    <div className="flex items-start gap-2">
                      <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="font-medium text-red-800">Please fix the following errors:</p>
                        <ul className="mt-1 text-sm text-red-700 list-disc list-inside">
                          {Object.entries(formErrors).map(([key, value]) =>
                            value ? <li key={key}>{value}</li> : null
                          )}
                        </ul>
                      </div>
                    </div>
                  </div>
                )}

                {/* Quote Items */}
                <div className="mb-6">
                  <div className="flex items-center justify-between mb-4">
                    <label className="block text-sm font-medium text-gray-700">
                      Quote Items
                    </label>
                    <button
                      type="button"
                      onClick={handleAddItem}
                      className="flex items-center gap-1 text-sm text-primary-600 hover:text-primary-700"
                    >
                      <Plus className="h-4 w-4" />
                      Add Item
                    </button>
                  </div>

                  <div className="space-y-3">
                    {items.map((item, index) => (
                      <div key={index} className="flex gap-3 items-start">
                        <div className="flex-1">
                          <input
                            type="text"
                            value={item.description}
                            onChange={(e) => handleItemChange(index, 'description', e.target.value)}
                            placeholder="Description (e.g., Labor, Materials)"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                            required
                          />
                        </div>
                        <div className="w-24">
                          <input
                            type="number"
                            value={item.quantity}
                            onChange={(e) => handleItemChange(index, 'quantity', Number(e.target.value))}
                            placeholder="Qty"
                            min="1"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                            required
                          />
                        </div>
                        <div className="w-32">
                          <input
                            type="number"
                            value={item.unitPrice}
                            onChange={(e) => handleItemChange(index, 'unitPrice', Number(e.target.value))}
                            placeholder="Unit Price (AED)"
                            min="0"
                            step="0.01"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                            required
                          />
                        </div>
                        <div className="w-32 flex items-center">
                          <span className="text-gray-700 font-medium">
                            AED {item.total.toFixed(2)}
                          </span>
                        </div>
                        {items.length > 1 && (
                          <button
                            type="button"
                            onClick={() => handleRemoveItem(index)}
                            className="p-2 text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>

                  {/* Totals */}
                  <div className="mt-4 pt-4 border-t border-gray-200 space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Subtotal:</span>
                      <span className="font-medium">AED {subtotal.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">VAT (5%):</span>
                      <span className="font-medium">AED {vat.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-lg font-bold">
                      <span>Total:</span>
                      <span className="text-primary-600">AED {total.toFixed(2)}</span>
                    </div>
                  </div>
                </div>

                {/* Estimated Duration */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Estimated Duration <span className="text-red-500">*</span>
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      value={estimatedDays}
                      onChange={(e) => {
                        setEstimatedDays(e.target.value ? Number(e.target.value) : '');
                        if (formErrors.estimatedDays) {
                          setFormErrors(prev => ({ ...prev, estimatedDays: '' }));
                        }
                      }}
                      placeholder="e.g., 5"
                      min="1"
                      max="365"
                      className={`w-32 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
                        formErrors.estimatedDays ? 'border-red-500' : 'border-gray-300'
                      }`}
                      required
                    />
                    <span className="text-gray-600">day(s)</span>
                  </div>
                  {formErrors.estimatedDays ? (
                    <p className="text-sm text-red-600 mt-1">{formErrors.estimatedDays}</p>
                  ) : (
                    <p className="text-xs text-gray-500 mt-1">How many days do you estimate this project will take?</p>
                  )}
                </div>

                {/* Approach */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Approach & Methodology <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    value={approach}
                    onChange={(e) => {
                      setApproach(e.target.value);
                      if (formErrors.approach) {
                        setFormErrors(prev => ({ ...prev, approach: '' }));
                      }
                    }}
                    placeholder="Describe how you'll approach this project, what methods you'll use, and any important considerations... (minimum 50 characters)"
                    rows={4}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
                      formErrors.approach ? 'border-red-500' : 'border-gray-300'
                    }`}
                    required
                  />
                  <div className="flex justify-between mt-1">
                    {formErrors.approach ? (
                      <p className="text-sm text-red-600">{formErrors.approach}</p>
                    ) : (
                      <p className="text-xs text-gray-500">Minimum 50 characters</p>
                    )}
                    <p className={`text-xs ${approach.length >= 50 ? 'text-green-600' : 'text-gray-500'}`}>
                      {approach.length}/50
                    </p>
                  </div>
                </div>

                {/* Warranty */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Warranty & Guarantees (Optional)
                  </label>
                  <textarea
                    value={warranty}
                    onChange={(e) => setWarranty(e.target.value)}
                    placeholder="Describe any warranties or guarantees you offer..."
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                </div>

                {/* Attachments */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Supporting Documents (Optional)
                  </label>
                  <p className="text-sm text-gray-500 mb-3">
                    Attach trade license, product catalogs, permits, photos, or other supporting materials (PDF, JPEG, PNG - max 10MB each)
                  </p>

                  {/* Uploaded files list */}
                  {attachments.length > 0 && (
                    <div className="space-y-2 mb-3">
                      {attachments.map((attachment, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200"
                        >
                          <div className="flex items-center gap-3">
                            <Paperclip className="h-4 w-4 text-gray-400" />
                            <div>
                              <p className="text-sm font-medium text-gray-700 truncate max-w-xs">
                                {attachment.filename}
                              </p>
                              <p className="text-xs text-gray-500">
                                {formatFileSize(attachment.size)}
                              </p>
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleRemoveAttachment(index)}
                            className="p-1 text-gray-400 hover:text-red-600 transition"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Upload button */}
                  <label className="flex items-center justify-center gap-2 px-4 py-3 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-primary-500 hover:bg-primary-50 transition">
                    <input
                      type="file"
                      onChange={handleFileUpload}
                      accept=".pdf,.jpg,.jpeg,.png,.webp"
                      className="hidden"
                      disabled={uploading}
                    />
                    {uploading ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-2 border-primary-600 border-t-transparent" />
                        <span className="text-sm text-gray-600">Uploading...</span>
                      </>
                    ) : (
                      <>
                        <Upload className="h-4 w-4 text-gray-400" />
                        <span className="text-sm text-gray-600">
                          {attachments.length > 0 ? 'Add another document' : 'Upload document'}
                        </span>
                      </>
                    )}
                  </label>
                </div>

                {/* Actions */}
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => setQuoteMode('select')}
                    className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition"
                  >
                    Back
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="flex-1 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition disabled:opacity-50"
                  >
                    {submitting ? 'Submitting...' : 'Submit Quote'}
                  </button>
                </div>
              </form>
            ) : (
              <div className="bg-white rounded-lg p-6 border border-gray-200 text-center">
                <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Ready to Submit Your Quote?
                </h3>
                <p className="text-gray-600 mb-6">
                  Create a professional quote with itemized pricing, timeline, and your approach.
                </p>
                <button
                  onClick={() => setShowQuoteForm(true)}
                  className="btn btn-primary"
                >
                  Create Quote
                </button>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Homeowner Info */}
            <div className="bg-white rounded-lg p-6 border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Homeowner Information</h3>
              <div className="space-y-3">
                {typeof lead.homeownerId === 'object' ? (
                  <>
                    <div className="flex items-start gap-3">
                      <User className="h-5 w-5 text-gray-400 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-sm text-gray-500">Name</p>
                        <p className="font-medium text-gray-900">{lead.homeownerId.name}</p>
                      </div>
                    </div>
                    {lead.homeownerId.phone && (
                      <div className="flex items-start gap-3">
                        <Phone className="h-5 w-5 text-gray-400 flex-shrink-0 mt-0.5" />
                        <div>
                          <p className="text-sm text-gray-500">Phone</p>
                          <a
                            href={`tel:${lead.homeownerId.phone}`}
                            className="font-medium text-primary-600 hover:text-primary-700"
                          >
                            {lead.homeownerId.phone}
                          </a>
                        </div>
                      </div>
                    )}
                    <div className="flex items-start gap-3">
                      <Mail className="h-5 w-5 text-gray-400 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-sm text-gray-500">Email</p>
                        <a
                          href={`mailto:${lead.homeownerId.email}`}
                          className="font-medium text-primary-600 hover:text-primary-700"
                        >
                          {lead.homeownerId.email}
                        </a>
                      </div>
                    </div>

                    {/* Message Button */}
                    <div className="pt-3 mt-3 border-t border-gray-200">
                      <StartConversationButton
                        recipientId={lead.homeownerId.id}
                        recipientName={lead.homeownerId.name}
                        relatedLeadId={lead.id}
                        variant="primary"
                        size="md"
                        className="w-full justify-center"
                      />
                    </div>
                  </>
                ) : (
                  <p className="text-sm text-gray-500">Contact information will be available after claiming the lead.</p>
                )}
              </div>
            </div>

            {/* Budget & Category */}
            <div className="bg-white rounded-lg p-6 border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Project Info</h3>
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-gray-500">Category</p>
                  <p className="font-medium text-gray-900">{lead.category}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Budget Range</p>
                  <p className="font-medium text-gray-900">AED {lead.budgetBracket}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Urgency</p>
                  <p className="font-medium text-gray-900 capitalize">{lead.urgency}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
