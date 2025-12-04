import { ReactNode } from 'react';
import { Droplets } from 'lucide-react';

interface AuthLayoutProps {
  children: ReactNode;
  title?: string;
  subtitle?: string;
}

export function AuthLayout({ children, title, subtitle }: AuthLayoutProps) {
  return (
    <div className="min-h-screen flex">
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4xIj48cGF0aCBkPSJNMzYgMzRjMC0yIDItNCAyLTRzMiAyIDIgNC0yIDQtMiA0LTItMi0yLTR6Ii8+PC9nPjwvZz48L3N2Zz4=')] opacity-30"></div>
        
        <div className="relative z-10 flex flex-col justify-center px-12 text-white">
          <div className="flex items-center gap-3 mb-8">
            <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
              <Droplets className="h-10 w-10" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Rural Water Supply</h1>
              <p className="text-blue-200 text-sm">Management Information System</p>
            </div>
          </div>
          
          <div className="space-y-6">
            <h2 className="text-4xl font-bold leading-tight">
              Empowering Communities<br />
              with Clean Water Access
            </h2>
            <p className="text-blue-100 text-lg max-w-md leading-relaxed">
              Comprehensive water resource management, customer relationship tools, 
              and decision support for sustainable rural water services.
            </p>
          </div>
          
        </div>
        
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-blue-900/50 to-transparent"></div>
      </div>
      
      <div className="flex-1 flex items-center justify-center bg-gray-50 dark:bg-gray-900 px-4 sm:px-6 lg:px-8">
        <div className="w-full max-w-md space-y-8">
          <div className="lg:hidden text-center mb-8">
            <div className="flex items-center justify-center gap-2 mb-2">
              <div className="p-2 bg-blue-600 rounded-lg">
                <Droplets className="h-6 w-6 text-white" />
              </div>
              <span className="text-xl font-bold text-gray-900 dark:text-white">Rural Water MIS</span>
            </div>
          </div>
          
          {(title || subtitle) && (
            <div className="text-center">
              {title && <h2 className="text-3xl font-bold text-gray-900 dark:text-white">{title}</h2>}
              {subtitle && <p className="mt-2 text-gray-600 dark:text-gray-400">{subtitle}</p>}
            </div>
          )}
          
          {children}
        </div>
      </div>
    </div>
  );
}
