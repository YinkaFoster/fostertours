import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Separator } from '../components/ui/separator';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import {
  FileText, Calendar, Clock, CheckCircle, ArrowRight, ArrowLeft,
  Shield, CreditCard, Upload, AlertCircle, Globe, Plane, User
} from 'lucide-react';
import { toast } from 'sonner';

const VisaDetailPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [applicantInfo, setApplicantInfo] = useState({
    firstName: '', lastName: '', email: '', phone: '',
    nationality: '', passportNumber: '', passportExpiry: '',
    travelDate: '', purpose: 'tourism'
  });

  const visaData = {
    visaId: searchParams.get('visaId') || 'VS' + Date.now(),
    country: searchParams.get('country') || 'United Arab Emirates',
    countryCode: searchParams.get('countryCode') || 'AE',
    flag: searchParams.get('flag') || '🇦🇪',
    visaType: searchParams.get('visaType') || 'Tourist Visa',
    duration: searchParams.get('duration') || '30 Days',
    validity: searchParams.get('validity') || '60 Days',
    entries: searchParams.get('entries') || 'Single Entry',
    processingTime: searchParams.get('processingTime') || '3-5 Business Days',
    price: parseFloat(searchParams.get('price') || '150'),
    expressPrice: parseFloat(searchParams.get('expressPrice') || '250'),
    image: searchParams.get('image') || 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=800',
  };

  const [selectedSpeed, setSelectedSpeed] = useState('standard');

  const requirements = [
    'Valid passport with 6+ months validity',
    'Passport-size photograph (white background)',
    'Confirmed flight reservation',
    'Hotel booking confirmation',
    'Bank statement (last 3 months)',
    'Employment letter / Business proof',
  ];

  const processSteps = [
    { step: 1, title: 'Submit Application', desc: 'Fill form & upload documents' },
    { step: 2, title: 'Document Review', desc: 'We verify your documents' },
    { step: 3, title: 'Processing', desc: 'Submitted to embassy' },
    { step: 4, title: 'Visa Issued', desc: 'Receive e-visa by email' },
  ];

  const currentPrice = selectedSpeed === 'express' ? visaData.expressPrice : visaData.price;
  const serviceFee = 25;
  const grandTotal = currentPrice + serviceFee;

  const handleApplyNow = () => {
    if (!isAuthenticated) {
      toast.error('Please login to continue');
      navigate('/login');
      return;
    }

    if (!applicantInfo.firstName || !applicantInfo.lastName || !applicantInfo.passportNumber) {
      toast.error('Please fill in all required fields');
      return;
    }

    const checkoutParams = new URLSearchParams({
      type: 'visa',
      itemId: visaData.visaId,
      price: grandTotal.toString(),
      title: `${visaData.country} ${visaData.visaType}`,
      description: `${visaData.duration} - ${visaData.entries}`,
      image: visaData.image,
      date: applicantInfo.travelDate || 'Flexible',
      location: visaData.country,
      guests: '1',
      visaType: visaData.visaType,
      duration: visaData.duration,
      processingSpeed: selectedSpeed,
      applicantName: `${applicantInfo.firstName} ${applicantInfo.lastName}`,
      passportNumber: applicantInfo.passportNumber,
    });

    navigate(`/booking/checkout?${checkoutParams.toString()}`);
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      {/* Hero */}
      <section className="relative pt-16">
        <div className="h-[300px] overflow-hidden">
          <img src={visaData.image} alt={visaData.country} className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-black/30" />
          <div className="absolute bottom-0 left-0 right-0 p-8">
            <div className="max-w-7xl mx-auto px-6">
              <Button variant="ghost" className="text-white hover:bg-white/10 mb-4" onClick={() => navigate(-1)}>
                <ArrowLeft className="w-4 h-4 mr-2" /> Back
              </Button>
              <div className="flex items-center gap-4">
                <span className="text-6xl">{visaData.flag}</span>
                <div>
                  <Badge className="bg-amber-500 mb-2">{visaData.visaType}</Badge>
                  <h1 className="text-4xl font-serif font-bold text-white">{visaData.country} Visa</h1>
                  <p className="text-white/80">{visaData.duration} • {visaData.entries}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Content */}
      <section className="py-8">
        <div className="max-w-7xl mx-auto px-6 md:px-12 lg:px-20">
          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              {/* Visa Details */}
              <Card className="border-0 shadow-lg">
                <CardContent className="p-6">
                  <h2 className="text-xl font-semibold mb-4">Visa Information</h2>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-lg text-center">
                      <Clock className="w-6 h-6 mx-auto mb-2 text-amber-600" />
                      <p className="text-sm text-slate-500">Stay Duration</p>
                      <p className="font-semibold">{visaData.duration}</p>
                    </div>
                    <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-lg text-center">
                      <Calendar className="w-6 h-6 mx-auto mb-2 text-amber-600" />
                      <p className="text-sm text-slate-500">Validity</p>
                      <p className="font-semibold">{visaData.validity}</p>
                    </div>
                    <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-lg text-center">
                      <Plane className="w-6 h-6 mx-auto mb-2 text-amber-600" />
                      <p className="text-sm text-slate-500">Entries</p>
                      <p className="font-semibold">{visaData.entries}</p>
                    </div>
                    <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-lg text-center">
                      <FileText className="w-6 h-6 mx-auto mb-2 text-amber-600" />
                      <p className="text-sm text-slate-500">Processing</p>
                      <p className="font-semibold">{visaData.processingTime}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Processing Speed */}
              <Card className="border-0 shadow-lg">
                <CardHeader>
                  <CardTitle>Processing Speed</CardTitle>
                </CardHeader>
                <CardContent className="p-6 space-y-4">
                  <div
                    className={`p-4 border-2 rounded-xl cursor-pointer transition-all ${
                      selectedSpeed === 'standard' ? 'border-amber-500 bg-amber-50 dark:bg-amber-900/20' : 'border-slate-200'
                    }`}
                    onClick={() => setSelectedSpeed('standard')}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-semibold">Standard Processing</p>
                        <p className="text-sm text-slate-500">{visaData.processingTime}</p>
                      </div>
                      <span className="text-xl font-bold text-amber-600">${visaData.price}</span>
                    </div>
                  </div>
                  <div
                    className={`p-4 border-2 rounded-xl cursor-pointer transition-all ${
                      selectedSpeed === 'express' ? 'border-amber-500 bg-amber-50 dark:bg-amber-900/20' : 'border-slate-200'
                    }`}
                    onClick={() => setSelectedSpeed('express')}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div>
                          <p className="font-semibold">Express Processing</p>
                          <p className="text-sm text-slate-500">24-48 Hours</p>
                        </div>
                        <Badge className="bg-orange-500">Fast</Badge>
                      </div>
                      <span className="text-xl font-bold text-amber-600">${visaData.expressPrice}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Required Documents */}
              <Card className="border-0 shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="w-5 h-5 text-amber-600" />
                    Required Documents
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="space-y-3">
                    {requirements.map((req, idx) => (
                      <div key={idx} className="flex items-center gap-3">
                        <CheckCircle className="w-5 h-5 text-green-500" />
                        <span className="text-slate-600 dark:text-slate-400">{req}</span>
                      </div>
                    ))}
                  </div>
                  <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                    <div className="flex items-start gap-2 text-blue-700 dark:text-blue-300">
                      <AlertCircle className="w-5 h-5 mt-0.5" />
                      <p className="text-sm">Our team will guide you through document submission after payment.</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Applicant Information */}
              <Card className="border-0 shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="w-5 h-5 text-amber-600" />
                    Applicant Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <Label>First Name *</Label>
                      <Input value={applicantInfo.firstName} onChange={(e) => setApplicantInfo({...applicantInfo, firstName: e.target.value})} placeholder="As on passport" className="mt-1" />
                    </div>
                    <div>
                      <Label>Last Name *</Label>
                      <Input value={applicantInfo.lastName} onChange={(e) => setApplicantInfo({...applicantInfo, lastName: e.target.value})} placeholder="As on passport" className="mt-1" />
                    </div>
                    <div>
                      <Label>Passport Number *</Label>
                      <Input value={applicantInfo.passportNumber} onChange={(e) => setApplicantInfo({...applicantInfo, passportNumber: e.target.value})} placeholder="A12345678" className="mt-1" />
                    </div>
                    <div>
                      <Label>Passport Expiry Date</Label>
                      <Input type="date" value={applicantInfo.passportExpiry} onChange={(e) => setApplicantInfo({...applicantInfo, passportExpiry: e.target.value})} className="mt-1" />
                    </div>
                    <div>
                      <Label>Email</Label>
                      <Input type="email" value={applicantInfo.email} onChange={(e) => setApplicantInfo({...applicantInfo, email: e.target.value})} className="mt-1" />
                    </div>
                    <div>
                      <Label>Phone</Label>
                      <Input value={applicantInfo.phone} onChange={(e) => setApplicantInfo({...applicantInfo, phone: e.target.value})} className="mt-1" />
                    </div>
                    <div>
                      <Label>Intended Travel Date</Label>
                      <Input type="date" value={applicantInfo.travelDate} onChange={(e) => setApplicantInfo({...applicantInfo, travelDate: e.target.value})} className="mt-1" />
                    </div>
                    <div>
                      <Label>Purpose of Visit</Label>
                      <Select value={applicantInfo.purpose} onValueChange={(v) => setApplicantInfo({...applicantInfo, purpose: v})}>
                        <SelectTrigger className="mt-1">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="tourism">Tourism</SelectItem>
                          <SelectItem value="business">Business</SelectItem>
                          <SelectItem value="transit">Transit</SelectItem>
                          <SelectItem value="family">Family Visit</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Price Summary */}
            <div>
              <Card className="border-0 shadow-lg sticky top-24">
                <CardHeader className="bg-amber-600 text-white">
                  <CardTitle className="flex items-center gap-2">
                    <CreditCard className="w-5 h-5" />
                    Application Summary
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="space-y-4">
                    <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
                      <p className="font-medium">{visaData.country} {visaData.visaType}</p>
                      <p className="text-sm text-slate-500">{visaData.duration} • {visaData.entries}</p>
                    </div>

                    {/* Process Steps */}
                    <div className="space-y-3">
                      {processSteps.map((step, idx) => (
                        <div key={idx} className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center font-bold text-sm">
                            {step.step}
                          </div>
                          <div>
                            <p className="font-medium text-sm">{step.title}</p>
                            <p className="text-xs text-slate-500">{step.desc}</p>
                          </div>
                        </div>
                      ))}
                    </div>

                    <Separator />
                    <div className="flex justify-between">
                      <span className="text-slate-600">{selectedSpeed === 'express' ? 'Express' : 'Standard'} Processing</span>
                      <span className="font-medium">${currentPrice.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-600">Service Fee</span>
                      <span className="font-medium">${serviceFee.toFixed(2)}</span>
                    </div>
                    <Separator />
                    <div className="flex justify-between items-center">
                      <span className="text-lg font-semibold">Total</span>
                      <span className="text-2xl font-bold text-amber-600">${grandTotal.toFixed(2)}</span>
                    </div>
                  </div>
                  <Button className="w-full mt-6 bg-amber-600 hover:bg-amber-700" size="lg" onClick={handleApplyNow}>
                    Apply Now <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                  <div className="mt-4 flex items-center justify-center gap-2 text-sm text-green-600">
                    <Shield className="w-4 h-4" />
                    <span>98% approval rate</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default VisaDetailPage;
