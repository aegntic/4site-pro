
import React from 'react';
import { SiteData } from '../../types';
import { Card } from '../ui/Card';

interface CreativeProjectTemplateProps {
  siteData: SiteData;
}

export const CreativeProjectTemplate: React.FC<CreativeProjectTemplateProps> = ({ siteData }) => {
  return (
    <Card className="p-6 bg-slate-800 border-slate-700">
      <h1 className="text-3xl font-bold text-center text-purple-400 mb-4">(Creative Template) {siteData.title}</h1>
      <p className="text-center text-slate-300 mb-6">This is a placeholder for a more visually distinct "Creative" template.</p>
      
      {siteData.sections.map((section, index) => (
        (section.id !== 'title' && section.title.toLowerCase() !== siteData.title.toLowerCase()) && section.content.trim() !== '' ? (
          <div key={section.id || `section-${index}`} className="mb-6 p-4 bg-slate-700/50 rounded-lg">
            <h2 className="text-xl font-semibold text-purple-300 mb-2" dangerouslySetInnerHTML={{ __html: section.title }}></h2>
            <div 
              className="prose prose-sm prose-invert max-w-none text-slate-300 prose-headings:text-purple-200 prose-strong:text-slate-100 prose-a:text-pink-400 hover:prose-a:text-pink-300"
              dangerouslySetInnerHTML={{ __html: section.content.replace(/<h1[^>]*>.*?<\/h1>/i, '') }}
            />
          </div>
        ) : null
      ))}
       <p className="text-center text-xs text-slate-500 mt-8">Creative Template - More unique styling to come!</p>
    </Card>
  );
};
