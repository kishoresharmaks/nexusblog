'use client';

import React from 'react';
import { AdSlot } from './ad-slot';

export function InArticleAd({ slotIndex = 1 }: { slotIndex?: number }) {
  return (
    <div className="my-8">
      <AdSlot
        placementSlug={`article-in-content-${slotIndex}`}
        label="Sponsored Break"
        minHeight={120}
        className="max-w-2xl mx-auto shadow-sm"
      />
    </div>
  );
}

export function SidebarAd() {
  return (
    <div className="sticky top-24 space-y-4">
      <AdSlot
        placementSlug="article-sidebar"
        label="Developer Spotlight"
        minHeight={250}
        className="shadow-sm"
      />
    </div>
  );
}

export function HeaderAd() {
  return (
    <div className="w-full max-w-5xl mx-auto my-4 px-4 sm:px-6">
      <AdSlot
        placementSlug="article-header"
        label="Featured Partner"
        minHeight={90}
        className="shadow-xs"
      />
    </div>
  );
}

export function FooterAd() {
  return (
    <div className="w-full max-w-5xl mx-auto my-8 px-4 sm:px-6">
      <AdSlot
        placementSlug="footer-banner"
        label="Ecosystem Sponsor"
        minHeight={90}
        className="shadow-xs"
      />
    </div>
  );
}

export function HomeTopAd() {
  return (
    <div className="container mx-auto max-w-7xl px-4 sm:px-6 my-6">
      <AdSlot
        placementSlug="home-top-banner"
        label="Featured Partner"
        minHeight={90}
        className="shadow-2xs"
      />
    </div>
  );
}

export function HomeFeedAd() {
  return (
    <div className="container mx-auto max-w-7xl px-4 sm:px-6 my-8">
      <AdSlot
        placementSlug="home-mid-feed"
        label="Sponsored Break"
        minHeight={90}
        className="shadow-2xs"
      />
    </div>
  );
}
