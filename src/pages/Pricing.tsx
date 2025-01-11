import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { LogIn, Check, ArrowRight, Building2, Users, Zap, Loader2 } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { createCheckoutSession } from '../lib/stripe';

export function Pricing() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [isLoading, setIsLoading] = useState(false);
  const [selectedTier, setSelectedTier] = useState<string | null>(
    searchParams.get('plan')
  );
  const [subscription, setSubscription] = useState<any>(null);

  useEffect(() => {
    fetchSubscription();
  }, []);

  const fetchSubscription = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const { data, error } = await supabase
        .from('subscriptions')
        .select('*, prices(*, products(*))')
        .eq('user_id', session.user.id)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      setSubscription(data);
    } catch (error) {
      console.error('Error fetching subscription:', error);
    }
  };

  const tiers = [
    {
      name: 'Free Trial',
      price: 0,
      duration: '30 days',
      features: [
        'One project',
        'Basic AI models',
        'Community support',
        'Standard API rate limits'
      ],
      priceId: null,
      cta: 'Start Free Trial',
      icon: Zap
    },
    {
      name: 'Pro',
      price: 50,
      duration: 'per month',
      features: [
        'Up to 20 projects',
        'Advanced AI models',
        'Priority support',
        'Higher API rate limits',
        'Custom branding',
        'Analytics dashboard'
      ],
      priceId: 'price_pro_monthly',
      cta: subscription?.prices?.products?.name === 'Pro' ? 'Current Plan' : 'Upgrade to Pro',
      icon: Users,
      popular: true
    },
    {
      name: 'Team',
      price: 20,
      duration: 'per seat/month',
      features: [
        'Unlimited projects',
        'Organization management',
        'Team collaboration',
        'Admin controls',
        'Advanced security',
        'Custom integrations',
        'Dedicated support'
      ],
      priceId: 'price_team_monthly',
      cta: subscription?.prices?.products?.name === 'Team' ? 'Current Plan' : 'Start Team Plan',
      icon: Building2
    },
    {
      name: 'Enterprise',
      price: null,
      duration: 'custom',
      features: [
        'Custom project limits',
        'Enterprise AI models',
        'Dedicated account manager',
        'Custom SLA',
        'On-premise deployment',
        'SSO integration',
        'Custom contracts'
      ],
      priceId: null,
      cta: 'Contact Sales',
      icon: Building2
    }
  ];

  const handleSelectTier = async (tier: any) => {
    try {
      setIsLoading(true);
      setSelectedTier(tier.name);

      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        navigate(`/signup?plan=${encodeURIComponent(tier.name)}`);
        return;
      }

      if (tier.name === 'Enterprise') {
        window.location.href = 'mailto:sales@elekite.ai?subject=Enterprise%20Plan%20Inquiry';
        return;
      }

      if (tier.name === 'Free Trial') {
        // Handle free trial signup
        const { error } = await supabase.from('subscriptions').insert({
          user_id: session.user.id,
          status: 'trialing',
          trial_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
        });

        if (error) throw error;
        navigate('/projects');
        return;
      }

      if (!tier.priceId) {
        throw new Error('Invalid price ID');
      }

      await createCheckoutSession(tier.priceId);
    } catch (error) {
      console.error('Error:', error);
      alert('Failed to process request. Please try again.');
    } finally {
      setIsLoading(false);
      setSelectedTier(null);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900">
      {/* Navigation */}
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex justify-between items-center">
          <Link to="/" className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 to-purple-500">
            Elekite AI
          </Link>
          <div className="flex items-center gap-4">
            <Link
              to="/signin"
              className="inline-flex items-center gap-2 px-4 py-2 bg-gray-800/80 hover:bg-gray-700/80 text-white rounded-lg backdrop-blur-sm transition-colors"
            >
              <LogIn className="w-4 h-4" />
              Sign In
            </Link>
          </div>
        </div>
      </nav>

      {/* Header */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 text-center">
        <h1 className="text-4xl font-bold text-white mb-4">
          Choose Your Plan
        </h1>
        <p className="text-xl text-gray-400 max-w-2xl mx-auto">
          Start with a free trial or choose a plan that fits your needs
        </p>
      </div>

      {/* Pricing Cards */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-24">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {tiers.map((tier) => (
            <div
              key={tier.name}
              className={`bg-gray-800 rounded-xl p-8 border-2 ${
                tier.popular
                  ? 'border-indigo-500 ring-2 ring-indigo-500 ring-opacity-50'
                  : 'border-gray-700'
              }`}
            >
              {tier.popular && (
                <div className="absolute -top-5 left-1/2 -translate-x-1/2">
                  <div className="bg-indigo-500 text-white px-3 py-1 rounded-full text-sm font-medium">
                    Most Popular
                  </div>
                </div>
              )}

              <div className="relative">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-xl font-semibold text-white">{tier.name}</h3>
                    <div className="mt-2 flex items-baseline">
                      {tier.price === null ? (
                        <span className="text-gray-400">Custom pricing</span>
                      ) : (
                        <>
                          <span className="text-4xl font-bold text-white">${tier.price}</span>
                          <span className="ml-2 text-gray-400">/{tier.duration}</span>
                        </>
                      )}
                    </div>
                  </div>
                  <tier.icon className="w-8 h-8 text-indigo-400" />
                </div>

                <ul className="mt-6 space-y-4">
                  {tier.features.map((feature) => (
                    <li key={feature} className="flex items-start">
                      <Check className="w-5 h-5 text-indigo-500 mt-0.5" />
                      <span className="ml-3 text-gray-300">{feature}</span>
                    </li>
                  ))}
                </ul>

                <button
                  onClick={() => handleSelectTier(tier)}
                  disabled={isLoading || subscription?.prices?.products?.name === tier.name}
                  className={`mt-8 w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-medium transition-colors ${
                    subscription?.prices?.products?.name === tier.name
                      ? 'bg-green-600 text-white cursor-default'
                      : tier.popular
                      ? 'bg-indigo-500 hover:bg-indigo-600 text-white'
                      : 'bg-gray-700 hover:bg-gray-600 text-white'
                  } disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                  {isLoading && selectedTier === tier.name ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <>
                      {tier.cta}
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}