import Image from 'next/image';

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex items-center justify-center gap-3 mb-2">
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
  );
}
