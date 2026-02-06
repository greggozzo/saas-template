// components/Header.tsx
'use client';
import Link from 'next/link';
import { UserButton, SignedIn, SignedOut, SignInButton } from '@clerk/nextjs';

export default function Header() {
  return (
    <header className="border-b border-zinc-800 bg-zinc-950 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-6 py-5 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-3">
          <div className="w-9 h-9 bg-emerald-500 rounded-2xl flex items-center justify-center text-2xl font-bold text-black">
            S
          </div>
          <span className="text-3xl font-bold tracking-tighter">Streamrolling</span>
        </Link>

        <nav className="flex items-center gap-10 text-lg">
          <Link href="/" className="hover:text-emerald-400 transition-colors">Home</Link>
          <SignedIn>
            <Link href="/dashboard" className="hover:text-emerald-400 transition-colors">My Shows</Link>
          </SignedIn>
          <SignedOut>
            <SignInButton mode="modal">
              <button className="hover:text-emerald-400 transition-colors">Sign in</button>
            </SignInButton>
          </SignedOut>
          <SignedIn>
            <UserButton afterSignOutUrl="/" />
          </SignedIn>
        </nav>
      </div>
    </header>
  );
}