// app/components/AuthChecker.tsx
'use client';
import { useUser, UserButton } from '@clerk/nextjs';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect } from 'react';

export default function AuthChecker({ children }: { children: React.ReactNode }) {
  const { isLoaded, isSignedIn } = useUser();
  const router = useRouter();
  const pathname = usePathname();

  // Redirect logic
  useEffect(() => {
    if (!isLoaded) return;
    
    // Redirect to sign-in if trying to access protected routes
    const protectedRoutes = ['/onboarding', '/dashboard'];
    if (!isSignedIn && protectedRoutes.some(route => pathname.startsWith(route))) {
      router.push('/signin');
    }
    
    // Redirect away from auth pages if signed in
    const authRoutes = ['/signin', '/signup'];
    if (isSignedIn && authRoutes.includes(pathname)) {
      router.push('/dashboard');
    }
    
    // Redirect to onboarding if signed in but hasn't completed onboarding
    if (isSignedIn && pathname === '/') {
      router.push('/onboarding');
    }
  }, [isLoaded, isSignedIn, pathname, router]);

  if (!isLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <>
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <h1 className="text-xl font-bold text-slate-900">JobAI</h1>
            {isSignedIn ? (
              <UserButton afterSignOutUrl="/signin" />
            ) : (
              <div className="flex space-x-4">
                <button
                  onClick={() => router.push('/signin')}
                  className="px-4 py-2 text-sm font-medium text-blue-600 hover:text-blue-800"
                >
                  Sign In
                </button>
                <button
                  onClick={() => router.push('/signup')}
                  className="px-4 py-2 text-sm font-medium bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  Sign Up
                </button>
              </div>
            )}
          </div>
        </div>
      </header>
      <main>{children}</main>
    </>
  );
}