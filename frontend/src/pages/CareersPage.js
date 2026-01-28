import React from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import {
  Briefcase, MapPin, Clock, DollarSign, Users, Heart, Zap,
  Globe, Plane, GraduationCap, Coffee, Gift, ArrowRight
} from 'lucide-react';

const CareersPage = () => {
  const benefits = [
    { icon: Plane, title: 'Travel Perks', description: 'Discounted travel packages and free trips for top performers' },
    { icon: Heart, title: 'Health Insurance', description: 'Comprehensive health coverage for you and your family' },
    { icon: GraduationCap, title: 'Learning & Growth', description: 'Training programs and career development opportunities' },
    { icon: Coffee, title: 'Flexible Work', description: 'Hybrid work options and flexible hours' },
    { icon: Gift, title: 'Bonuses', description: 'Performance bonuses and annual increments' },
    { icon: Users, title: 'Great Team', description: 'Work with passionate travel enthusiasts' },
  ];

  const openings = [
    {
      id: 1,
      title: 'Senior Travel Consultant',
      department: 'Sales',
      location: 'Lagos, Nigeria',
      type: 'Full-time',
      experience: '3-5 years',
      salary: '₦400,000 - ₦600,000',
      description: 'Help clients plan and book their dream vacations while achieving sales targets.',
      requirements: [
        'Experience in travel/tourism industry',
        'Strong communication skills',
        'Knowledge of Amadeus/Sabre systems',
        'Passion for travel and customer service'
      ]
    },
    {
      id: 2,
      title: 'Digital Marketing Manager',
      department: 'Marketing',
      location: 'Lagos, Nigeria (Hybrid)',
      type: 'Full-time',
      experience: '4-6 years',
      salary: '₦500,000 - ₦800,000',
      description: 'Lead our digital marketing efforts to grow brand awareness and drive bookings.',
      requirements: [
        'Experience in digital marketing',
        'Proficiency in SEO/SEM, social media marketing',
        'Data-driven decision making',
        'Travel industry experience preferred'
      ]
    },
    {
      id: 3,
      title: 'Customer Success Associate',
      department: 'Support',
      location: 'Remote (Nigeria)',
      type: 'Full-time',
      experience: '1-3 years',
      salary: '₦200,000 - ₦350,000',
      description: 'Ensure customer satisfaction and handle inquiries across multiple channels.',
      requirements: [
        'Excellent communication skills',
        'Problem-solving abilities',
        'Experience with CRM tools',
        'Ability to work flexible hours'
      ]
    },
    {
      id: 4,
      title: 'Full-Stack Developer',
      department: 'Technology',
      location: 'Lagos, Nigeria (Hybrid)',
      type: 'Full-time',
      experience: '3-5 years',
      salary: '₦600,000 - ₦1,000,000',
      description: 'Build and maintain our travel booking platform and internal tools.',
      requirements: [
        'Proficiency in React, Node.js, Python',
        'Experience with MongoDB, PostgreSQL',
        'API integration experience',
        'Travel tech experience a plus'
      ]
    },
    {
      id: 5,
      title: 'Visa Processing Officer',
      department: 'Operations',
      location: 'Lagos, Nigeria',
      type: 'Full-time',
      experience: '2-4 years',
      salary: '₦250,000 - ₦400,000',
      description: 'Handle visa applications and documentation for various countries.',
      requirements: [
        'Knowledge of visa requirements for multiple countries',
        'Attention to detail',
        'Experience with embassy processes',
        'Strong organizational skills'
      ]
    },
    {
      id: 6,
      title: 'Content Creator (Intern)',
      department: 'Marketing',
      location: 'Lagos, Nigeria',
      type: 'Internship',
      experience: '0-1 year',
      salary: '₦80,000 - ₦120,000',
      description: 'Create engaging content for our social media platforms and blog.',
      requirements: [
        'Strong writing skills',
        'Knowledge of social media trends',
        'Basic photo/video editing skills',
        'Passion for travel'
      ]
    },
  ];

  const values = [
    { icon: Globe, title: 'Global Mindset', description: 'We think globally and embrace diverse perspectives.' },
    { icon: Zap, title: 'Innovation', description: 'We constantly seek better ways to serve our customers.' },
    { icon: Heart, title: 'Customer First', description: 'Every decision starts with our customers in mind.' },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      {/* Hero Section */}
      <section className="relative pt-24 pb-16 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-teal-600 to-teal-800" />
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=1920')] bg-cover bg-center opacity-20" />
        <div className="relative max-w-7xl mx-auto px-6 md:px-12 lg:px-20 py-20">
          <div className="text-center text-white">
            <Badge className="bg-orange-500 text-white mb-4">We're Hiring!</Badge>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-serif font-bold mb-6">
              Join Our Team
            </h1>
            <p className="text-xl text-teal-100 max-w-3xl mx-auto mb-8">
              Help us create unforgettable travel experiences for thousands of customers. 
              Join a passionate team that loves to explore the world.
            </p>
            <Button size="lg" className="bg-white text-teal-700 hover:bg-teal-50" asChild>
              <a href="#openings">View Open Positions</a>
            </Button>
          </div>
        </div>
      </section>

      {/* Culture & Values */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-6 md:px-12 lg:px-20">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <span className="text-teal-600 dark:text-teal-400 font-semibold mb-2 block">Our Culture</span>
              <h2 className="text-3xl md:text-4xl font-serif font-bold text-slate-900 dark:text-white mb-6">
                Work with Purpose, Travel with Passion
              </h2>
              <p className="text-slate-600 dark:text-slate-400 mb-6">
                At Foster Tours, we believe that travel has the power to transform lives. 
                Our team is made up of passionate individuals who share this belief and work 
                together to make dream vacations a reality for our customers.
              </p>
              <div className="space-y-4">
                {values.map((value, idx) => (
                  <div key={idx} className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-full bg-teal-100 dark:bg-teal-900/30 flex items-center justify-center flex-shrink-0">
                      <value.icon className="w-5 h-5 text-teal-600 dark:text-teal-400" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-slate-900 dark:text-white">{value.title}</h3>
                      <p className="text-sm text-slate-600 dark:text-slate-400">{value.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="relative">
              <img 
                src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=800" 
                alt="Team at Foster Tours" 
                className="rounded-2xl shadow-2xl"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="py-16 bg-slate-50 dark:bg-slate-900">
        <div className="max-w-7xl mx-auto px-6 md:px-12 lg:px-20">
          <div className="text-center mb-12">
            <span className="text-teal-600 dark:text-teal-400 font-semibold mb-2 block">Perks & Benefits</span>
            <h2 className="text-3xl md:text-4xl font-serif font-bold text-slate-900 dark:text-white mb-4">
              Why Work With Us?
            </h2>
            <p className="text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
              We take care of our team so they can take care of our customers.
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {benefits.map((benefit, idx) => (
              <Card key={idx} className="border-0 shadow-lg hover:shadow-xl transition-shadow">
                <CardContent className="p-6">
                  <div className="w-12 h-12 rounded-full bg-teal-100 dark:bg-teal-900/30 flex items-center justify-center mb-4">
                    <benefit.icon className="w-6 h-6 text-teal-600 dark:text-teal-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">{benefit.title}</h3>
                  <p className="text-slate-600 dark:text-slate-400 text-sm">{benefit.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Open Positions */}
      <section id="openings" className="py-16 scroll-mt-20">
        <div className="max-w-7xl mx-auto px-6 md:px-12 lg:px-20">
          <div className="text-center mb-12">
            <span className="text-teal-600 dark:text-teal-400 font-semibold mb-2 block">Open Positions</span>
            <h2 className="text-3xl md:text-4xl font-serif font-bold text-slate-900 dark:text-white mb-4">
              Current Openings
            </h2>
            <p className="text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
              Find your perfect role and start your journey with us.
            </p>
          </div>
          
          <div className="space-y-6">
            {openings.map((job) => (
              <Card key={job.id} className="border-0 shadow-lg hover:shadow-xl transition-shadow overflow-hidden">
                <CardContent className="p-0">
                  <div className="flex flex-col lg:flex-row">
                    <div className="flex-1 p-6">
                      <div className="flex flex-wrap items-center gap-3 mb-3">
                        <Badge className="bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-400">
                          {job.department}
                        </Badge>
                        <Badge variant="outline">{job.type}</Badge>
                      </div>
                      <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">
                        {job.title}
                      </h3>
                      <p className="text-slate-600 dark:text-slate-400 text-sm mb-4">
                        {job.description}
                      </p>
                      <div className="flex flex-wrap gap-4 text-sm text-slate-500">
                        <span className="flex items-center gap-1">
                          <MapPin className="w-4 h-4" />
                          {job.location}
                        </span>
                        <span className="flex items-center gap-1">
                          <Briefcase className="w-4 h-4" />
                          {job.experience}
                        </span>
                        <span className="flex items-center gap-1">
                          <DollarSign className="w-4 h-4" />
                          {job.salary}
                        </span>
                      </div>
                    </div>
                    <div className="lg:w-64 p-6 bg-slate-50 dark:bg-slate-800 flex flex-col justify-center">
                      <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
                        <strong>Requirements:</strong>
                      </p>
                      <ul className="text-sm text-slate-600 dark:text-slate-400 space-y-1 mb-4">
                        {job.requirements.slice(0, 2).map((req, idx) => (
                          <li key={idx} className="flex items-start gap-2">
                            <span className="text-teal-500 mt-1">•</span>
                            {req}
                          </li>
                        ))}
                      </ul>
                      <a 
                        href={`mailto:careers@fostertours.com?subject=Application for ${job.title}`}
                        className="w-full"
                      >
                        <Button className="w-full bg-teal-600 hover:bg-teal-700">
                          Apply Now <ArrowRight className="w-4 h-4 ml-2" />
                        </Button>
                      </a>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-gradient-to-br from-orange-500 to-orange-600">
        <div className="max-w-4xl mx-auto px-6 md:px-12 lg:px-20 text-center">
          <h2 className="text-3xl md:text-4xl font-serif font-bold text-white mb-6">
            Don't See Your Perfect Role?
          </h2>
          <p className="text-orange-100 text-lg mb-8">
            We're always looking for talented individuals. Send us your CV and we'll 
            keep you in mind for future opportunities.
          </p>
          <a href="mailto:careers@fostertours.com">
            <Button size="lg" className="bg-white text-orange-600 hover:bg-orange-50">
              Send Your CV
            </Button>
          </a>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default CareersPage;
