'use client';

import Image from 'next/image';
import { Smartphone } from 'lucide-react';
import { useChatPanelStore } from '@/store/chatPanelStore';

export function AppDownload() {
  const { isOpen: isChatPanelOpen } = useChatPanelStore();

  // Placeholder links - will be updated when app is published
  const appStoreLink = '#';
  const playStoreLink = '#';

  return (
    <section className="bg-gradient-to-r from-primary-600 to-primary-700 py-16">
      <div className={`container-custom transition-all duration-300 ${isChatPanelOpen ? 'lg:pr-[450px]' : 'lg:pr-0'}`}>
        <div className="flex flex-col lg:flex-row items-center justify-center gap-12 lg:gap-32">
          {/* Left Content */}
          <div className="text-center lg:text-left max-w-lg">
            <div className="flex items-center justify-center lg:justify-start gap-3 mb-4">
              <div className="bg-white/20 rounded-full p-3">
                <Smartphone className="h-6 w-6 text-white" />
              </div>
              <h2 className="text-2xl md:text-3xl font-bold text-white">
                Get the Homezy App
              </h2>
            </div>
            <p className="text-primary-100 text-lg mb-6">
              Find and hire trusted professionals on the go. Get instant quotes, track your projects, and chat with pros - all from your phone.
            </p>

            {/* App Store Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
              <a
                href={appStoreLink}
                target="_blank"
                rel="noopener noreferrer"
                className="transition-transform hover:scale-105"
              >
                <Image
                  src="/app-store-badge.svg"
                  alt="Download on the App Store"
                  width={150}
                  height={50}
                  className="h-[50px] w-auto"
                />
              </a>
              <a
                href={playStoreLink}
                target="_blank"
                rel="noopener noreferrer"
                className="transition-transform hover:scale-105"
              >
                <Image
                  src="/google-play-badge.svg"
                  alt="Get it on Google Play"
                  width={170}
                  height={50}
                  className="h-[50px] w-auto"
                />
              </a>
            </div>
          </div>

          {/* Right Content - Phone Mockup */}
          <div className="hidden lg:block">
            <div className="relative w-[220px] h-[320px]">
              {/* Phone frame placeholder - can be replaced with actual mockup */}
              <div className="absolute inset-0 bg-white/10 rounded-[2.5rem] border-4 border-white/20 backdrop-blur-sm flex items-center justify-center">
                <div className="text-center text-white/80">
                  <Smartphone className="h-12 w-12 mx-auto mb-3 opacity-50" />
                  <p className="text-sm font-medium">Coming Soon</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
