'use client';

import React, { useState } from 'react';
import { Mail, MessageCircle, Phone } from 'lucide-react';

export default function HelpContact() {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  const faqs = [
    {
      question: "How do I redeem Encircle Points?",
      answer: "Encircle Points can be redeemed on any purchase at Tanishq stores or online. You accumulate points with every purchase and can use them for discounts or special offers."
    },
    {
      question: "Do I need to pay shipping / delivery charges?",
      answer: "Enjoy free shipping on orders above a certain amount. Standard delivery charges apply for orders below the threshold. Express delivery options are also available."
    },
    {
      question: "Can I send gifts to my loved ones?",
      answer: "Yes! We offer gift wrapping and can deliver directly to your loved ones. Just select the gift option during checkout and add a personalized message."
    },
    {
      question: "What happens if my order is lost in transit?",
      answer: "All orders are fully insured during transit. In case of any issue, please contact our support team immediately with your order details."
    },
    {
      question: "Questions on Cash On Delivery (COD)",
      answer: "We accept Cash On Delivery for eligible orders. Payment is made directly to the delivery partner at your doorstep."
    },
    {
      question: "Questions on Tokenization",
      answer: "Tokenization is a secure payment feature that saves your card details for faster checkout. Your data is encrypted and PCI DSS compliant."
    }
  ];

  const contactMethods = [
    {
      icon: MessageCircle,
      title: "Chat with Us",
      description: "Get instant support from our team"
    },
    {
      icon: Phone,
      title: "Call Us At",
      description: "1800-266-0123"
    },
    {
      icon: Mail,
      title: "Write to Us",
      description: "Send us your queries anytime"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-amber-50">
      {/* Navigation */}
      <nav className="border-b border-amber-100 bg-white sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <a href="#" className="hover:text-amber-700 transition">Home</a>
            <span className="text-gray-400">|</span>
            <span className="text-amber-800 font-medium">Help & Contact</span>
          </div>
        </div>
      </nav>

      {/* Header */}
      <div className="max-w-7xl mx-auto px-6 py-16">
        <h1 className="text-5xl font-serif text-center text-amber-950 mb-2">
          Help & Contact
        </h1>
        <div className="h-1 w-16 bg-amber-700 mx-auto mb-8"></div>
      </div>

      {/* FAQ Section */}
      <div className="max-w-4xl mx-auto px-6 py-12">
        <h2 className="text-3xl font-serif text-amber-950 mb-8">
          Top Customer Questions
        </h2>

        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <div
              key={index}
              className="border border-amber-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow"
            >
              <button
                onClick={() => setActiveIndex(activeIndex === index ? null : index)}
                className="w-full px-6 py-4 bg-white hover:bg-amber-50 transition-colors flex justify-between items-center"
              >
                <h3 className="text-left text-amber-900 font-medium text-base">
                  {faq.question}
                </h3>
                <div
                  className={`ml-4 text-amber-700 transition-transform flex-shrink-0 ${
                    activeIndex === index ? 'rotate-180' : ''
                  }`}
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                  </svg>
                </div>
              </button>

              {activeIndex === index && (
                <div className="px-6 py-4 bg-amber-50 border-t border-amber-200">
                  <p className="text-gray-700 leading-relaxed text-sm">
                    {faq.answer}
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="mt-8 text-right">
          <a href="#" className="text-amber-800 hover:text-amber-950 font-medium underline">
            ALL FAQ'S →
          </a>
        </div>
      </div>

      {/* Contact Methods Section */}
      <div className="max-w-7xl mx-auto px-6 py-20">
        <h2 className="text-3xl font-serif text-center text-amber-950 mb-3">
          Have A Question
        </h2>
        <div className="h-1 w-16 bg-amber-700 mx-auto mb-16"></div>

        <div className="grid md:grid-cols-3 gap-12">
          {contactMethods.map((method, index) => {
            const Icon = method.icon;
            return (
              <div
                key={index}
                className="flex flex-col items-center text-center group"
              >
                <div className="mb-6 p-6 rounded-full bg-gradient-to-br from-amber-50 to-white border-2 border-amber-200 group-hover:border-amber-700 transition-colors">
                  <Icon className="w-10 h-10 text-amber-800 group-hover:text-amber-950 transition-colors" strokeWidth={1.5} />
                </div>
                <h3 className="text-xl font-serif text-amber-950 mb-2">
                  {method.title}
                </h3>
                <p className="text-sm text-gray-600">
                  {method.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Footer Note */}
      <div className="max-w-4xl mx-auto px-6 py-12 text-center">
        <p className="text-sm text-gray-600 leading-relaxed">
          The toll free number is only applicable for domestic orders within India. For international customers or
          <span className="block mt-2">
            other queries, please use our chat or email support options.
          </span>
        </p>
      </div>

      {/* Promotional Banner */}
      <div className="max-w-7xl mx-auto px-6 pb-12">
        <div className="bg-gradient-to-r from-amber-900 to-amber-800 rounded-2xl p-8 text-white flex items-center justify-between overflow-hidden relative">
          <div className="absolute inset-0 opacity-10">
            <svg className="w-full h-full" viewBox="0 0 400 200">
              <circle cx="50" cy="50" r="40" fill="white" />
              <circle cx="350" cy="150" r="30" fill="white" />
            </svg>
          </div>

          <div className="relative z-10">
            <span className="inline-block bg-amber-400 text-amber-950 px-3 py-1 rounded-full text-xs font-bold mb-3">
              New
            </span>
            <p className="text-lg">
              Welcome back! Continue your wedding journey with us.
              <span className="ml-2">→</span>
            </p>
          </div>

          <div className="relative z-10 w-12 h-12 rounded-full bg-gradient-to-br from-white to-gray-200 flex items-center justify-center flex-shrink-0">
            <span className="text-xl">💎</span>
          </div>
        </div>
      </div>
    </div>
  );
}