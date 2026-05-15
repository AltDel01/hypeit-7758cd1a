
import React from 'react';
import Seo from '@/components/seo/Seo';
import ViralityDashboard from './virality/ViralityDashboard';

export default function Virality() {
  return (
    <>
      <Seo
        title="Virality Strategy, AI-Generated Plans by Viralin"
        description="Build a tailored virality strategy with AI. Hooks, formats, and posting plans for your niche."
        path="/virality"
      />
      <ViralityDashboard />
    </>
  );
}
