'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useChatPanelStore } from '@/store/chatPanelStore';

export function PublicFooter() {
  const { isOpen: isChatPanelOpen } = useChatPanelStore();

  return (
    <footer className="bg-gray-50 border-t border-gray-200 py-12 mt-auto">
      <div className={`container-custom transition-all duration-300 ${isChatPanelOpen ? 'lg:pr-[40vw]' : 'lg:pr-14'}`}>
        <div className="grid md:grid-cols-4 gap-8 mb-8">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-0.5 mb-4">
              <Image
                src="/house-logo.svg"
                alt="Homezy"
                width={28}
                height={28}
                className="w-7 h-7"
              />
              <span className="font-quicksand text-[28px] font-bold text-gray-900">
                homezy
              </span>
            </div>
            <p className="text-sm text-gray-600">
              AI-powered home improvement marketplace for UAE
            </p>
          </div>

          {/* For Homeowners */}
          <div>
            <h3 className="font-semibold text-gray-900 mb-3">
              For Homeowners
            </h3>
            <ul className="space-y-2 text-sm text-gray-600">
              <li>
                <Link href="/services" className="hover:text-gray-900">
                  Browse Services
                </Link>
              </li>
              <li>
                <Link
                  href="/lead-marketplace"
                  className="hover:text-gray-900"
                >
                  View Jobs
                </Link>
              </li>
              <li>
                <Link href="/how-it-works" className="hover:text-gray-900">
                  How It Works
                </Link>
              </li>
            </ul>
          </div>

          {/* For Professionals */}
          <div>
            <h3 className="font-semibold text-gray-900 mb-3">
              For Professionals
            </h3>
            <ul className="space-y-2 text-sm text-gray-600">
              <li>
                <Link href="/become-a-pro" className="hover:text-gray-900">
                  Become a Pro
                </Link>
              </li>
              <li>
                <Link
                  href="/lead-marketplace"
                  className="hover:text-gray-900"
                >
                  Browse Leads
                </Link>
              </li>
              <li>
                <Link href="/pricing" className="hover:text-gray-900">
                  Pricing
                </Link>
              </li>
            </ul>
          </div>

          {/* Company */}
          <div>
            <h3 className="font-semibold text-gray-900 mb-3">Company</h3>
            <ul className="space-y-2 text-sm text-gray-600">
              <li>
                <Link href="/about" className="hover:text-gray-900">
                  About Us
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-gray-900">
                  Contact
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="hover:text-gray-900">
                  Privacy Policy
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-200 pt-8 text-center text-sm text-gray-500">
          <p>
            © {new Date().getFullYear()} Avik Smart Home Services FZ-LLC. All
            rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
