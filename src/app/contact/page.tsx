"use client";

import Link from "next/link";
import { useState } from "react";
import { Mail, MessageCircle, Phone } from "lucide-react";

export default function HelpContact() {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  const faqs = [
    {
      question: "What kind of jewellery do you stock?",
      answer:
        "We focus on artificial jewellery, including gold-tone styles, American Diamond pieces, gifting picks, and occasion-ready sets for festive dressing.",
    },
    {
      question: "Do you offer delivery across India?",
      answer:
        "Yes. We deliver across India, and shipping timelines vary by city and product availability. You will see the delivery estimate during checkout.",
    },
    {
      question: "Can I place a gifting order?",
      answer:
        "Yes. You can send gifting orders directly to your loved ones, and we can help with festive picks, bridesmaid gifts, and return-gift bundles.",
    },
    {
      question: "How do I care for artificial jewellery?",
      answer:
        "Store pieces in a dry pouch, keep them away from perfume and water, and wipe them with a soft cloth after use to help preserve the finish.",
    },
    {
      question: "Do you have bridal or bulk styling support?",
      answer:
        "Yes. If you need a bridal-fashion set, bridesmaid styling, or bulk gifting help, our team can suggest coordinated options based on budget and event.",
    },
    {
      question: "Can I pay with Cash on Delivery?",
      answer:
        "Cash on Delivery may be available for eligible orders. If COD is not available for your pin code, you can still complete the order with secure online payment.",
    },
  ];

  const contactMethods = [
    {
      icon: MessageCircle,
      title: "Chat with Us",
      description: "Get quick help with styling, gifting, or order questions",
    },
    {
      icon: Phone,
      title: "Call Us At",
      description: "1800-266-0123",
    },
    {
      icon: Mail,
      title: "Write to Us",
      description: "Send your query anytime and we will get back to you",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-amber-50">
      <nav className="sticky top-0 z-40 border-b border-amber-100 bg-white">
        <div className="mx-auto max-w-7xl px-6 py-4">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Link href="/" className="transition hover:text-amber-700">
              Home
            </Link>
            <span className="text-gray-400">|</span>
            <span className="font-medium text-amber-800">Help & Contact</span>
          </div>
        </div>
      </nav>

      <div className="mx-auto max-w-7xl px-6 py-16">
        <h1 className="mb-2 text-center text-5xl font-serif text-amber-950">
          Help & Contact
        </h1>
        <div className="mx-auto mb-8 h-1 w-16 bg-amber-700"></div>
      </div>

      <div className="mx-auto max-w-4xl px-6 py-12">
        <h2 className="mb-8 text-3xl font-serif text-amber-950">
          Top Customer Questions
        </h2>

        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <div
              key={index}
              className="overflow-hidden rounded-lg border border-amber-200 transition-shadow hover:shadow-md"
            >
              <button
                onClick={() => setActiveIndex(activeIndex === index ? null : index)}
                className="flex w-full items-center justify-between bg-white px-6 py-4 transition-colors hover:bg-amber-50"
              >
                <h3 className="text-left text-base font-medium text-amber-900">
                  {faq.question}
                </h3>
                <div
                  className={`ml-4 flex-shrink-0 text-amber-700 transition-transform ${
                    activeIndex === index ? "rotate-180" : ""
                  }`}
                >
                  <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 14l-7 7m0 0l-7-7m7 7V3"
                    />
                  </svg>
                </div>
              </button>

              {activeIndex === index && (
                <div className="border-t border-amber-200 bg-amber-50 px-6 py-4">
                  <p className="text-sm leading-relaxed text-gray-700">{faq.answer}</p>
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="mt-8 text-right">
          <Link
            href="/about"
            className="font-medium text-amber-800 underline hover:text-amber-950"
          >
            More about Auraa
          </Link>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-6 py-20">
        <h2 className="mb-3 text-center text-3xl font-serif text-amber-950">
          Have A Question
        </h2>
        <div className="mx-auto mb-16 h-1 w-16 bg-amber-700"></div>

        <div className="grid gap-12 md:grid-cols-3">
          {contactMethods.map((method, index) => {
            const Icon = method.icon;
            return (
              <div key={index} className="group flex flex-col items-center text-center">
                <div className="mb-6 rounded-full border-2 border-amber-200 bg-gradient-to-br from-amber-50 to-white p-6 transition-colors group-hover:border-amber-700">
                  <Icon
                    className="h-10 w-10 text-amber-800 transition-colors group-hover:text-amber-950"
                    strokeWidth={1.5}
                  />
                </div>
                <h3 className="mb-2 text-xl font-serif text-amber-950">
                  {method.title}
                </h3>
                <p className="text-sm text-gray-600">{method.description}</p>
              </div>
            );
          })}
        </div>
      </div>

      <div className="mx-auto max-w-4xl px-6 py-12 text-center">
        <p className="text-sm leading-relaxed text-gray-600">
          The toll free number is currently applicable for domestic orders within India.
          For styling help, gifting requests, or
          <span className="mt-2 block">
            any other query, please use our chat or email support options.
          </span>
        </p>
      </div>

      <div className="mx-auto max-w-7xl px-6 pb-12">
        <div className="relative flex items-center justify-between overflow-hidden rounded-2xl bg-gradient-to-r from-amber-900 to-amber-800 p-8 text-white">
          <div className="absolute inset-0 opacity-10">
            <svg className="h-full w-full" viewBox="0 0 400 200">
              <circle cx="50" cy="50" r="40" fill="white" />
              <circle cx="350" cy="150" r="30" fill="white" />
            </svg>
          </div>

          <div className="relative z-10">
            <span className="mb-3 inline-block rounded-full bg-amber-400 px-3 py-1 text-xs font-bold text-amber-950">
              New
            </span>
            <p className="text-lg">
              Explore bridal-fashion sets, gifting picks, and fresh party-wear styles.
              <span className="ml-2">-&gt;</span>
            </p>
          </div>

          <div className="relative z-10 flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-white to-gray-200">
            <span className="text-xl">*</span>
          </div>
        </div>
      </div>
    </div>
  );
}
