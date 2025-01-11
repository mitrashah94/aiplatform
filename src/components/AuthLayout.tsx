import React from 'react';
import { Link } from 'react-router-dom';

interface AuthLayoutProps {
  children: React.ReactNode;
  title: string;
  subtitle: string;
  alternateLink: {
    text: string;
    label: string;
    to: string;
  };
}

export function AuthLayout({ children, title, subtitle, alternateLink }: AuthLayoutProps) {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center p-4">
      <div className="max-w-md w-full space-y-8 bg-gray-800 p-8 rounded-xl border border-gray-700">
        <div>
          <Link to="/" className="block text-center">
            <h2 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 to-purple-500">
              Elekite AI
            </h2>
          </Link>
          <h2 className="mt-6 text-2xl font-bold text-white text-center">{title}</h2>
          <p className="mt-2 text-sm text-gray-400 text-center">{subtitle}</p>
        </div>
        {children}
        <div className="text-center">
          <p className="text-sm text-gray-400">
            {alternateLink.text}{' '}
            <Link to={alternateLink.to} className="text-indigo-400 hover:text-indigo-300">
              {alternateLink.label}
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}