'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { getLeadById, Lead } from '@/lib/services/leads';
import { submitQuote, getMyQuoteForLead, Quote, QuoteItem } from '@/lib/services/quotes';
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

  // Quote form state
  const [items, setItems] = useState<QuoteItem[]>([
    { description: '', quantity: 1, unitPrice: 0, total: 0 },
  ]);
  const [startDate, setStartDate] = useState('');
  const [completionDate, setCompletionDate] = useState('');
  const [approach, setApproach] = useState('');
  const [warranty, setWarranty] = useState('');

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

  const handleSubmitQuote = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!startDate || !completionDate) {
      toast.error('Please provide project timeline');
      return;
    }

    if (new Date(completionDate) <= new Date(startDate)) {
      toast.error('Completion date must be after start date');
      return;
    }

    if (!approach.trim()) {
      toast.error('Please describe your approach');
      return;
    }

    if (items.some((item) => !item.description.trim() || item.unitPrice <= 0)) {
      toast.error('Please fill in all quote items with valid prices');
      return;
    }

    try {
      setSubmitting(true);
      const { subtotal, vat, total } = calculateTotals();

      await submitQuote(leadId, {
        pricing: {
          items,
          subtotal,
          vat,
          total,
        },
        timeline: {
          startDate,
          completionDate,
        },
        approach,
        warranty: warranty.trim() || undefined,
      });

      toast.success('Quote submitted successfully!');
      router.push('/pro/dashboard/quotes');
    } catch (error: any) {
      console.error('Failed to submit quote:', error);
      toast.error(error.response?.data?.message || 'Failed to submit quote');
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
            ) : showQuoteForm ? (
              <form onSubmit={handleSubmitQuote} className="bg-white rounded-lg p-6 border border-gray-200">
                <h2 className="text-xl font-semibold text-gray-900 mb-6">Submit Your Quote</h2>

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

                {/* Timeline */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Start Date
                    </label>
                    <input
                      type="date"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      min={new Date().toISOString().split('T')[0]}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Estimated Completion Date
                    </label>
                    <input
                      type="date"
                      value={completionDate}
                      onChange={(e) => setCompletionDate(e.target.value)}
                      min={startDate || new Date().toISOString().split('T')[0]}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      required
                    />
                  </div>
                </div>

                {/* Approach */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Approach & Methodology <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    value={approach}
                    onChange={(e) => setApproach(e.target.value)}
                    placeholder="Describe how you'll approach this project, what methods you'll use, and any important considerations..."
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    required
                  />
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

                {/* Actions */}
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => setShowQuoteForm(false)}
                    className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition"
                  >
                    Cancel
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
                        relatedLeadTitle={lead.title}
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
