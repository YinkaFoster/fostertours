import React, { useState } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';
import {
  ChevronDown, ChevronUp, Search, HelpCircle, Plane, Hotel,
  CreditCard, FileText, Calendar, Shield
} from 'lucide-react';
import { Input } from '../components/ui/input';

const FAQsPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');
  const [openItems, setOpenItems] = useState([]);

  const categories = [
    { id: 'all', label: 'All FAQs', icon: HelpCircle },
    { id: 'booking', label: 'Booking', icon: Calendar },
    { id: 'flights', label: 'Flights', icon: Plane },
    { id: 'hotels', label: 'Hotels', icon: Hotel },
    { id: 'payments', label: 'Payments', icon: CreditCard },
    { id: 'visa', label: 'Visa', icon: FileText },
    { id: 'policies', label: 'Policies', icon: Shield },
  ];

  const faqs = [
    {
      id: 1,
      category: 'booking',
      question: 'How do I make a booking on Foster Tours?',
      answer: 'Making a booking is easy! Simply search for your desired destination, select your dates, choose from available options, and proceed to checkout. You can pay securely using various payment methods including cards, bank transfer, or wallet balance.'
    },
    {
      id: 2,
      category: 'booking',
      question: 'Can I modify my booking after confirmation?',
      answer: 'Yes, you can modify your booking depending on the type of service and the policies of the provider. Log in to your account, go to My Bookings, and select the booking you wish to modify. Some changes may incur additional fees.'
    },
    {
      id: 3,
      category: 'flights',
      question: 'How early should I book my flight?',
      answer: 'We recommend booking your flight at least 2-3 weeks in advance for domestic flights and 4-6 weeks for international flights to get the best prices. However, last-minute deals are sometimes available.'
    },
    {
      id: 4,
      category: 'flights',
      question: 'What happens if my flight is cancelled?',
      answer: 'If your flight is cancelled by the airline, you are entitled to a full refund or rebooking at no additional cost. Our team will contact you immediately to arrange alternatives. For cancellations due to personal reasons, our cancellation policy applies.'
    },
    {
      id: 5,
      category: 'flights',
      question: 'Can I choose my seat on the flight?',
      answer: 'Seat selection depends on the airline and fare class. Many airlines offer seat selection during booking or check-in. Premium seats may require an additional fee. We recommend checking with the specific airline for their seat selection policy.'
    },
    {
      id: 6,
      category: 'hotels',
      question: 'What is your hotel cancellation policy?',
      answer: 'Hotel cancellation policies vary by property. Most hotels offer free cancellation up to 24-48 hours before check-in. Some promotional rates may be non-refundable. Always check the cancellation policy before booking.'
    },
    {
      id: 7,
      category: 'hotels',
      question: 'Can I request early check-in or late check-out?',
      answer: 'Early check-in and late check-out are subject to availability and hotel policy. You can request these at the time of booking or directly with the hotel. Additional charges may apply.'
    },
    {
      id: 8,
      category: 'payments',
      question: 'What payment methods do you accept?',
      answer: 'We accept various payment methods including credit/debit cards (Visa, Mastercard), bank transfers, PayPal, and wallet balance. For Nigerian customers, we also support local bank transfers and USSD payments.'
    },
    {
      id: 9,
      category: 'payments',
      question: 'Is my payment information secure?',
      answer: 'Absolutely! We use industry-standard SSL encryption and secure payment gateways to protect your financial information. We are PCI-DSS compliant and never store your full card details on our servers.'
    },
    {
      id: 10,
      category: 'payments',
      question: 'How do I get a refund?',
      answer: 'Refunds are processed according to our cancellation policy. Once approved, refunds typically take 5-10 business days to reflect in your account, depending on your payment method and bank.'
    },
    {
      id: 11,
      category: 'visa',
      question: 'What documents do I need for a visa application?',
      answer: 'Required documents vary by country but typically include: valid passport, passport photos, completed application form, proof of accommodation, flight itinerary, bank statements, and travel insurance. Check our visa page for country-specific requirements.'
    },
    {
      id: 12,
      category: 'visa',
      question: 'How long does visa processing take?',
      answer: 'Processing times vary by country and visa type. Tourist visas typically take 5-15 business days. We recommend applying at least 3-4 weeks before your travel date to allow for any delays.'
    },
    {
      id: 13,
      category: 'policies',
      question: 'What is your privacy policy?',
      answer: 'We take your privacy seriously. We collect only necessary information to provide our services and never share your personal data with third parties without your consent. Read our full privacy policy for details.'
    },
    {
      id: 14,
      category: 'policies',
      question: 'Do you offer travel insurance?',
      answer: 'Yes, we recommend and can arrange travel insurance for all our customers. Travel insurance covers trip cancellations, medical emergencies, lost luggage, and more. Ask our team for quotes.'
    },
  ];

  const toggleItem = (id) => {
    setOpenItems(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const filteredFaqs = faqs.filter(faq => {
    const matchesSearch = faq.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          faq.answer.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = activeCategory === 'all' || faq.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      {/* Hero Section */}
      <section className="relative pt-24 pb-16 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-teal-600 to-teal-800" />
        <div className="relative max-w-7xl mx-auto px-6 md:px-12 lg:px-20 py-16">
          <div className="text-center text-white">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-white/10 mb-6">
              <HelpCircle className="w-8 h-8" />
            </div>
            <h1 className="text-4xl md:text-5xl font-serif font-bold mb-6">
              Frequently Asked Questions
            </h1>
            <p className="text-xl text-teal-100 max-w-2xl mx-auto mb-8">
              Find quick answers to common questions about our services.
            </p>
            
            {/* Search Bar */}
            <div className="max-w-xl mx-auto">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <Input
                  type="text"
                  placeholder="Search FAQs..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-12 pr-4 py-6 text-lg bg-white text-slate-900 border-0 rounded-full shadow-lg"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="py-6 bg-white dark:bg-slate-900 border-b dark:border-slate-800 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 md:px-12 lg:px-20">
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
            {categories.map((category) => (
              <Button
                key={category.id}
                variant={activeCategory === category.id ? 'default' : 'outline'}
                className={`flex items-center gap-2 whitespace-nowrap ${
                  activeCategory === category.id 
                    ? 'bg-teal-600 hover:bg-teal-700 text-white' 
                    : 'hover:bg-teal-50 dark:hover:bg-teal-900/20'
                }`}
                onClick={() => setActiveCategory(category.id)}
              >
                <category.icon className="w-4 h-4" />
                {category.label}
              </Button>
            ))}
          </div>
        </div>
      </section>

      {/* FAQs */}
      <section className="py-16">
        <div className="max-w-4xl mx-auto px-6 md:px-12 lg:px-20">
          <p className="text-slate-600 dark:text-slate-400 mb-8">
            Showing {filteredFaqs.length} questions
          </p>
          <div className="space-y-4">
            {filteredFaqs.map((faq) => (
              <Card key={faq.id} className="border-0 shadow-md overflow-hidden">
                <CardContent className="p-0">
                  <button
                    className="w-full p-6 text-left flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                    onClick={() => toggleItem(faq.id)}
                  >
                    <span className="font-medium text-slate-900 dark:text-white pr-4">
                      {faq.question}
                    </span>
                    {openItems.includes(faq.id) ? (
                      <ChevronUp className="w-5 h-5 text-teal-600 flex-shrink-0" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-slate-400 flex-shrink-0" />
                    )}
                  </button>
                  {openItems.includes(faq.id) && (
                    <div className="px-6 pb-6 text-slate-600 dark:text-slate-400 border-t dark:border-slate-700 pt-4">
                      {faq.answer}
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>

          {filteredFaqs.length === 0 && (
            <div className="text-center py-12">
              <HelpCircle className="w-16 h-16 text-slate-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">
                No matching questions found
              </h3>
              <p className="text-slate-600 dark:text-slate-400">
                Try adjusting your search or browse all categories.
              </p>
            </div>
          )}
        </div>
      </section>

      {/* Contact CTA */}
      <section className="py-16 bg-slate-50 dark:bg-slate-900">
        <div className="max-w-4xl mx-auto px-6 md:px-12 lg:px-20 text-center">
          <h2 className="text-2xl font-serif font-bold text-slate-900 dark:text-white mb-4">
            Still have questions?
          </h2>
          <p className="text-slate-600 dark:text-slate-400 mb-6">
            Our support team is happy to help you with any questions.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <a href="https://wa.me/2349058681268" target="_blank" rel="noopener noreferrer">
              <Button className="bg-green-600 hover:bg-green-700">
                Chat on WhatsApp
              </Button>
            </a>
            <a href="mailto:support@fostertours.com">
              <Button variant="outline">
                Email Support
              </Button>
            </a>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default FAQsPage;
