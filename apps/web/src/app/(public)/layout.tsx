'use client';

import React, { useState } from 'react';
import { Navbar } from '@/components/public/navbar';
import { Footer } from '@/components/public/footer';
import { SearchCommand } from '@/components/public/search-command';

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [searchOpen, setSearchOpen] = useState(false);

  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      <Navbar onOpenSearch={() => setSearchOpen(true)} />
      <SearchCommand open={searchOpen} onOpenChange={setSearchOpen} />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}
