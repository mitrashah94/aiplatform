import React from 'react';
import { ArrowRight, Brain, Zap, Workflow, Shield, Code, LogIn } from 'lucide-react';
import { Link } from 'react-router-dom';

export function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1558494949-ef010cbdcc31?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2034&q=80')] bg-cover bg-center opacity-10" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 relative">
          {/* Navigation */}
          <div className="absolute top-4 right-4 sm:right-6 lg:right-8 flex items-center gap-4">
            <Link
              to="/pricing"
              className="inline-flex items-center gap-2 px-4 py-2 bg-gray-800/80 hover:bg-gray-700/80 text-white rounded-lg backdrop-blur-sm transition-colors"
            >
              Pricing
            </Link>
            <Link
              to="/signin"
              className="inline-flex items-center gap-2 px-4 py-2 bg-gray-800/80 hover:bg-gray-700/80 text-white rounded-lg backdrop-blur-sm transition-colors"
            >
              <LogIn className="w-4 h-4" />
              Sign In
            </Link>
          </div>
          <div className="text-center">
            <h1 className="text-4xl sm:text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 mb-6">
              Elekite AI
            </h1>
            <p className="text-xl sm:text-2xl text-gray-300 mb-8 max-w-2xl mx-auto">
              Build powerful AI automation workflows with drag-and-drop simplicity. No code required.
            </p>
            <div className="flex justify-center gap-4">
              <Link
                to="/signup?plan=Pro"
                className="px-8 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium flex items-center gap-2 transition-colors"
              >
                Start Building <ArrowRight className="w-5 h-5" />
              </Link>
              <a
                href="#features"
                className="px-8 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-lg font-medium transition-colors"
              >
                Learn More
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div id="features" className="py-24 bg-gray-800/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-white mb-4">Automate Your Organization</h2>
            <p className="text-gray-400 max-w-2xl mx-auto">
              Create intelligent workflows that streamline your operations and boost productivity
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: Brain,
                title: 'AI-Powered Automation',
                description: 'Leverage advanced AI models to automate complex tasks and decision-making processes'
              },
              {
                icon: Workflow,
                title: 'Visual Workflow Builder',
                description: 'Design workflows with our intuitive drag-and-drop interface - no coding required'
              },
              {
                icon: Zap,
                title: 'Ready-to-Use Templates',
                description: 'Get started quickly with pre-built workflow templates for common business processes'
              },
              {
                icon: Shield,
                title: 'Enterprise Security',
                description: 'Bank-grade security with role-based access control and audit logging'
              },
              {
                icon: Code,
                title: 'API Integration',
                description: 'Connect with your existing tools and systems through our robust API'
              },
              {
                icon: Brain,
                title: 'Smart Optimization',
                description: 'AI continuously optimizes your workflows for maximum efficiency'
              }
            ].map((feature, index) => (
              <div
                key={index}
                className="bg-gray-800 p-6 rounded-lg border border-gray-700 hover:border-indigo-500 transition-colors"
              >
                <feature.icon className="w-12 h-12 text-indigo-500 mb-4" />
                <h3 className="text-xl font-semibold text-white mb-2">{feature.title}</h3>
                <p className="text-gray-400">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Templates Section */}
      <div className="py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-white mb-4">Ready-to-Use Workflow Templates</h2>
            <p className="text-gray-400 max-w-2xl mx-auto">
              Get started instantly with our pre-built automation templates
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
              <h3 className="text-xl font-semibold text-white mb-2">Customer Support</h3>
              <p className="text-gray-400 mb-4">Automate ticket routing, response generation, and follow-ups</p>
              <div className="text-sm text-indigo-400">12 workflows included</div>
            </div>
            <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
              <h3 className="text-xl font-semibold text-white mb-2">Data Processing</h3>
              <p className="text-gray-400 mb-4">Transform, analyze, and validate data automatically</p>
              <div className="text-sm text-indigo-400">8 workflows included</div>
            </div>
            <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
              <h3 className="text-xl font-semibold text-white mb-2">Document Analysis</h3>
              <p className="text-gray-400 mb-4">Extract insights from documents using AI</p>
              <div className="text-sm text-indigo-400">10 workflows included</div>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl p-8 md:p-12 shadow-xl">
            <div className="text-center">
              <h2 className="text-3xl font-bold text-white mb-4">
                Ready to Automate Your Workflows?
              </h2>
              <p className="text-indigo-100 mb-8 max-w-2xl mx-auto">
                Join forward-thinking companies using Elekite AI to transform their operations.
              </p>
              <div className="flex justify-center gap-4">
                <Link
                  to="/signup?plan=Pro"
                  className="inline-flex items-center gap-2 px-8 py-3 bg-white text-indigo-600 hover:bg-indigo-50 rounded-lg font-medium transition-colors"
                >
                  Get Started Now <ArrowRight className="w-5 h-5" />
                </Link>
                <Link
                  to="/signin"
                  className="inline-flex items-center gap-2 px-8 py-3 bg-indigo-500/20 hover:bg-indigo-500/30 text-white rounded-lg font-medium transition-colors backdrop-blur-sm"
                >
                  Sign In <LogIn className="w-5 h-5" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-900 border-t border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 to-purple-500">
              Elekite AI
            </h2>
            <p className="text-gray-500 mt-2">Building the future of AI automation</p>
            <div className="mt-8 text-gray-400">
              © {new Date().getFullYear()} Elekite AI. All rights reserved.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}