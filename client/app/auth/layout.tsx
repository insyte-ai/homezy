'use client';

import Image from "next/image";
import { PublicHeader } from "@/components/layout/PublicHeader";
import { PublicFooter } from "@/components/layout/PublicFooter";
import { useChatPanelStore } from "@/store/chatPanelStore";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isOpen: isChatPanelOpen } = useChatPanelStore();

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <PublicHeader />
      <div className={`flex-1 flex flex-col justify-center py-12 sm:px-6 lg:px-8 transition-all duration-300 ${isChatPanelOpen ? 'lg:pr-[450px]' : 'lg:pr-0'}`}>
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <div className="flex items-center justify-center gap-0.5 mb-2">
            <Image
              src="/house-logo.svg"
              alt="Homezy Logo"
              width={40}
              height={40}
              className="w-10 h-10"
            />
            <h1 className="font-quicksand text-[32px] font-bold text-gray-900 leading-none">
              Home<span className="text-primary-500">zy</span>
            </h1>
          </div>
        </div>
        <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
          <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
            {children}
          </div>
        </div>
      </div>
      <PublicFooter />
    </div>
  );
}
