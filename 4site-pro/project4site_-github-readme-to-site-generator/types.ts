import React from 'react';

export interface Section {
  id: string; // e.g., 'overview', 'features', 'tech-stack'
  title: string; // Human-readable title
  content: string; // HTML content
  order: number; // For sorting sections
}

export interface PartnerToolRecommendation {
  name: string;
  description: string;
  ctaUrl: string;
  iconUrl?: string;
}

export interface SiteData {
  id: string;
  title: string;
  repoUrl: string;
  generatedMarkdown: string; // The raw Markdown returned by Gemini
  sections: Section[];
  template: 'TechProjectTemplate' | 'CreativeProjectTemplate'; // Add more as needed
  partnerToolRecommendations?: PartnerToolRecommendation[];
}

export enum AppState {
  Idle,
  Loading,
  Success,
  Error,
}

export interface IconProps extends React.SVGProps<SVGSVGElement> {
  name: string; // Icon name from lucide-react
  size?: number;
  color?: string;
}