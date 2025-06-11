
import React from 'react';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

export const Card: React.FC<CardProps> = ({ children, className = '', ...props }) => {
  return (
    <div
      className={`bg-card text-card-foreground rounded-xl border border-muted shadow-lg ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};
