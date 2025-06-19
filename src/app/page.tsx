'use client';

import Link from 'next/link';
import Navigation from '@/components/Navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  MessageSquare, 
  Phone, 
  Users, 
  BarChart3, 
  Shield, 
  Zap,
  Heart,
  Globe,
  Clock,
  CheckCircle
} from 'lucide-react';

export default function HomePage() {
  const features = [
    {
      icon: MessageSquare,
      title: 'SMS Messaging',
      description: 'Send automated SMS reminders and notifications to patients instantly.',
    },
    {
      icon: Phone,
      title: 'Voice Calls',
      description: 'Automated voice calling system for important healthcare communications.',
    },
    {
      icon: Users,
      title: 'Patient Groups',
      description: 'Organize patients by condition, department, or care type for targeted messaging.',
    },
    {
      icon: BarChart3,
      title: 'Analytics Dashboard',
      description: 'Track communication success rates and patient engagement metrics.',
    },
    {
      icon: Clock,
      title: 'Scheduled Messages',
      description: 'Plan and schedule communications for optimal delivery times.',
    },
    {
      icon: Globe,
      title: 'Bulk Operations',
      description: 'Send messages to multiple patients or entire groups simultaneously.',
    },
  ];

  const benefits = [
    'Reduce missed appointments by up to 80%',
    'Improve patient engagement and satisfaction',
    'Streamline healthcare communication workflows',
    'HIPAA-compliant messaging and data storage',
    'Real-time delivery tracking and analytics',
    'Easy CSV import for patient data management',
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
      {/* Navigation */}
      <Navigation variant="home" />

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center">
            <h1 className="text-5xl md:text-7xl font-bold text-gray-900 mb-6">
              Modern Healthcare
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-green-600">
                {' '}Communication
              </span>
            </h1>
            <p className="text-xl md:text-2xl text-gray-600 mb-8 max-w-3xl mx-auto">
              Streamline patient communication with automated SMS and voice messaging. 
              Reduce missed appointments, improve engagement, and enhance care coordination.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/login">
                <Button variant="primary" className="bg-blue-600 hover:bg-blue-700 text-lg px-8 py-3">
                  Get Started
                </Button>
              </Link>
              <Button 
                variant="outline" 
                className="text-lg px-8 py-3"
                onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })}
              >
                Learn More
              </Button>
            </div>
          </div>

          {/* Hero Image/Illustration */}
          <div className="mt-16 relative">
            <div className="bg-gradient-to-r from-blue-500 to-green-500 rounded-2xl p-8 text-white shadow-2xl">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-center">
                <div className="text-center">
                  <div className="relative mb-4">
                    <div className="w-20 h-20 mx-auto bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                      <MessageSquare className="h-12 w-12 text-white" />
                    </div>
                    <div className="absolute -top-2 -right-2 w-6 h-6 bg-green-400 rounded-full flex items-center justify-center">
                      <CheckCircle className="h-4 w-4 text-white" />
                    </div>
                  </div>
                  <h3 className="text-xl font-semibold mb-2">SMS Messaging</h3>
                  <p className="opacity-90 text-sm">Instant patient notifications with 98% delivery rate</p>
                </div>
                <div className="text-center">
                  <div className="relative mb-4">
                    <div className="w-20 h-20 mx-auto bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                      <Phone className="h-12 w-12 text-white" />
                    </div>
                    <div className="absolute -top-2 -right-2 w-6 h-6 bg-blue-400 rounded-full flex items-center justify-center">
                      <Clock className="h-4 w-4 text-white" />
                    </div>
                  </div>
                  <h3 className="text-xl font-semibold mb-2">Voice Calls</h3>
                  <p className="opacity-90 text-sm">Automated voice reminders and confirmations</p>
                </div>
                <div className="text-center">
                  <div className="relative mb-4">
                    <div className="w-20 h-20 mx-auto bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                      <BarChart3 className="h-12 w-12 text-white" />
                    </div>
                    <div className="absolute -top-2 -right-2 w-6 h-6 bg-yellow-400 rounded-full flex items-center justify-center">
                      <Zap className="h-4 w-4 text-white" />
                    </div>
                  </div>
                  <h3 className="text-xl font-semibold mb-2">Real-time Analytics</h3>
                  <p className="opacity-90 text-sm">Track communication success and patient engagement</p>
                </div>
              </div>
              
              {/* Demo metrics */}
              <div className="mt-8 pt-6 border-t border-white/20">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                  <div>
                    <div className="text-2xl font-bold text-white">10,000+</div>
                    <div className="text-white/80 text-xs">Messages Sent</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-white">98.5%</div>
                    <div className="text-white/80 text-xs">Delivery Rate</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-white">500+</div>
                    <div className="text-white/80 text-xs">Healthcare Providers</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-white">24/7</div>
                    <div className="text-white/80 text-xs">Automated Service</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Powerful Features for Healthcare Communication
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Everything you need to modernize patient communication and improve care coordination.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => {
              const IconComponent = feature.icon;
              return (
                <Card key={index} className="border-0 shadow-lg hover:shadow-xl transition-shadow duration-300">
                  <CardHeader className="text-center">
                    <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                      <IconComponent className="h-8 w-8 text-blue-600" />
                    </div>
                    <CardTitle className="text-xl font-semibold text-gray-900">
                      {feature.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="text-center">
                    <p className="text-gray-600">{feature.description}</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section id="benefits" className="py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-4xl font-bold text-gray-900 mb-6">
                Transform Your Healthcare Practice
              </h2>
              <p className="text-xl text-gray-600 mb-8">
                HealthComm helps healthcare providers improve patient outcomes through 
                better communication, reduced no-shows, and enhanced patient engagement.
              </p>
              
              <div className="space-y-4">
                {benefits.map((benefit, index) => (
                  <div key={index} className="flex items-start space-x-3">
                    <CheckCircle className="h-6 w-6 text-green-500 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-700">{benefit}</span>
                  </div>
                ))}
              </div>

              <div className="mt-8">
                <Link href="/login">
                  <Button variant="primary" className="bg-blue-600 hover:bg-blue-700 text-lg px-8 py-3">
                    Start Free Trial
                  </Button>
                </Link>
              </div>
            </div>

            <div className="lg:pl-8">
              <div className="bg-white rounded-2xl shadow-xl p-8">
                <div className="text-center mb-6">
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">Quick Stats</h3>
                  <p className="text-gray-600">Real results from healthcare providers</p>
                </div>
                
                <div className="grid grid-cols-2 gap-6">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-blue-600 mb-2">80%</div>
                    <div className="text-sm text-gray-600">Reduction in No-Shows</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-green-600 mb-2">95%</div>
                    <div className="text-sm text-gray-600">Message Delivery Rate</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-purple-600 mb-2">50%</div>
                    <div className="text-sm text-gray-600">Time Saved on Calls</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-orange-600 mb-2">24/7</div>
                    <div className="text-sm text-gray-600">Automated Operations</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold text-gray-900 mb-6">
            Built for Modern Healthcare
          </h2>
          <p className="text-xl text-gray-600 max-w-4xl mx-auto mb-12">
            HealthComm is designed specifically for healthcare providers who want to leverage 
            technology to improve patient communication, reduce administrative burden, 
            and enhance overall care quality.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                <Shield className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">HIPAA Compliant</h3>
              <p className="text-gray-600">
                Built with healthcare security and privacy standards in mind.
              </p>
            </div>
            <div className="text-center">
              <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                <Zap className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Easy Integration</h3>
              <p className="text-gray-600">
                Seamlessly integrate with existing healthcare management systems.
              </p>
            </div>
            <div className="text-center">
              <div className="mx-auto w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mb-4">
                <Heart className="h-8 w-8 text-purple-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Patient-Centered</h3>
              <p className="text-gray-600">
                Designed to improve patient experience and health outcomes.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Screenshots/Demo Section */}
      <section className="py-24 bg-gradient-to-r from-gray-900 to-blue-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">
              See HealthComm in Action
            </h2>
            <p className="text-xl text-blue-100 max-w-3xl mx-auto">
              Experience the power of automated healthcare communication with our intuitive dashboard.
            </p>
          </div>

          {/* Dashboard Preview */}
          <div className="relative">
            <div className="bg-white rounded-2xl shadow-2xl p-6 mx-auto max-w-4xl">
              <div className="bg-gray-100 rounded-lg p-8">
                <div className="text-center">
                  <div className="inline-flex items-center space-x-2 mb-6">
                    <Heart className="h-6 w-6 text-blue-600" />
                    <span className="text-xl font-bold text-gray-900">HealthComm Dashboard</span>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-white rounded-lg p-4 shadow-sm">
                      <MessageSquare className="h-8 w-8 text-blue-600 mx-auto mb-3" />
                      <h3 className="font-semibold text-gray-900 mb-2">Quick Messaging</h3>
                      <p className="text-sm text-gray-600">Send SMS to patients instantly</p>
                      <div className="mt-3 bg-blue-100 rounded px-3 py-2 text-xs text-blue-800">
                        &ldquo;Your appointment is confirmed for tomorrow at 2 PM&rdquo;
                      </div>
                    </div>
                    
                    <div className="bg-white rounded-lg p-4 shadow-sm">
                      <Users className="h-8 w-8 text-green-600 mx-auto mb-3" />
                      <h3 className="font-semibold text-gray-900 mb-2">Patient Groups</h3>
                      <p className="text-sm text-gray-600">Organize by condition or care type</p>
                      <div className="mt-3 flex flex-wrap gap-1">
                        <span className="bg-red-100 text-red-800 text-xs px-2 py-1 rounded">Diabetes</span>
                        <span className="bg-purple-100 text-purple-800 text-xs px-2 py-1 rounded">Elderly Care</span>
                      </div>
                    </div>
                    
                    <div className="bg-white rounded-lg p-4 shadow-sm">
                      <BarChart3 className="h-8 w-8 text-purple-600 mx-auto mb-3" />
                      <h3 className="font-semibold text-gray-900 mb-2">Analytics</h3>
                      <p className="text-sm text-gray-600">Track success rates</p>
                      <div className="mt-3 space-y-1">
                        <div className="flex justify-between text-xs">
                          <span className="text-gray-600">Delivery Rate</span>
                          <span className="text-green-600 font-medium">98.5%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div className="bg-green-500 h-2 rounded-full" style={{ width: '98.5%' }}></div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Floating elements for visual appeal */}
            <div className="absolute -top-4 -left-4 w-8 h-8 bg-blue-400 rounded-full opacity-60"></div>
            <div className="absolute -bottom-4 -right-4 w-12 h-12 bg-green-400 rounded-full opacity-40"></div>
            <div className="absolute top-1/2 -right-8 w-6 h-6 bg-purple-400 rounded-full opacity-50"></div>
          </div>
        </div>
      </section>

      {/* Call to Action Section */}
      <section className="py-24 bg-gradient-to-r from-blue-600 to-green-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Ready to Transform Your Practice?
            </h2>
            <p className="text-xl text-blue-100 mb-8">
              Join hundreds of healthcare providers already using HealthComm to improve 
              patient communication and reduce no-shows.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
              <Link href="/login">
                <Button 
                  variant="outline" 
                  className="bg-white text-blue-600 border-white hover:bg-blue-50 text-lg px-8 py-3"
                >
                  Start Free Demo
                </Button>
              </Link>
              <Button 
                variant="outline" 
                className="border-white text-white hover:bg-white/10 text-lg px-8 py-3"
                onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })}
              >
                Learn More
              </Button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-white/90">
              <div className="flex items-center justify-center space-x-2">
                <CheckCircle className="h-5 w-5" />
                <span>No setup fees</span>
              </div>
              <div className="flex items-center justify-center space-x-2">
                <CheckCircle className="h-5 w-5" />
                <span>30-day free trial</span>
              </div>
              <div className="flex items-center justify-center space-x-2">
                <CheckCircle className="h-5 w-5" />
                <span>24/7 support</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="flex items-center justify-center space-x-2 mb-6">
              <Heart className="h-8 w-8 text-blue-400" />
              <span className="text-2xl font-bold">HealthComm</span>
            </div>
            <p className="text-gray-400 mb-6">
              Modern healthcare communication platform for the digital age.
            </p>
            <div className="flex justify-center space-x-8">
              <Link href="/login" className="text-gray-400 hover:text-white transition-colors">
                Login
              </Link>
              <a href="#features" className="text-gray-400 hover:text-white transition-colors">
                Features
              </a>
              <a href="#about" className="text-gray-400 hover:text-white transition-colors">
                About
              </a>
            </div>
            <div className="mt-8 pt-8 border-t border-gray-800 text-gray-500 text-sm">
              © 2025 HealthComm. All rights reserved. Built for modern healthcare providers.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
