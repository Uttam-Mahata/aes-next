import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
}

export function Card({ children, className = '' }: CardProps) {
  return (
    <div className={`border rounded-lg shadow-md ${className}`}>
      {children}
    </div>
  );
}