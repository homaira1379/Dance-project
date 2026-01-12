"use client";

import React, { useState } from "react";
import { MapPin, Phone, Mail, Clock } from "lucide-react";

export function Contact() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    message: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    alert("Thank you for your interest! We will contact you soon.");
    setFormData({ name: "", email: "", phone: "", message: "" });
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const contactInfo = [
    {
      icon: MapPin,
      title: "Location",
      content: "123 Dance Avenue, Studio City, CA 90210",
    },
    {
      icon: Phone,
      title: "Phone",
      content: "(555) 123-4567",
    },
    {
      icon: Mail,
      title: "Email",
      content: "info@dancelink.com",
    },
    {
      icon: Clock,
      title: "Hours",
      content: "Mon-Fri: 9AM-9PM, Sat-Sun: 10AM-6PM",
    },
  ];

  return (
    <section className="py-20 bg-[#FAFAFA]">
      <div className="max-w-7xl mx-auto px-6">
        {/* Header */}
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-slate-900">
            Get in <span className="text-brand">touch</span>
          </h2>
          <p className="text-muted max-w-2xl mx-auto">
            Ready to start your dance journey? Contact us to book a trial class or
            learn more about our programs.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          {/* Contact Form */}
          <div className="bg-white border border-border shadow-soft rounded-2xl p-8">
            <h3 className="text-xl font-bold text-slate-900 mb-6">
              Send us a message
            </h3>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="name" className="block mb-2 text-sm font-semibold text-slate-900">
                  Name *
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="w-full rounded-xl border border-border bg-white px-4 py-3 text-slate-900 outline-none focus:ring-2 focus:ring-brand/30"
                  placeholder="Your name"
                />
              </div>

              <div>
                <label htmlFor="email" className="block mb-2 text-sm font-semibold text-slate-900">
                  Email *
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="w-full rounded-xl border border-border bg-white px-4 py-3 text-slate-900 outline-none focus:ring-2 focus:ring-brand/30"
                  placeholder="your@email.com"
                />
              </div>

              <div>
                <label htmlFor="phone" className="block mb-2 text-sm font-semibold text-slate-900">
                  Phone
                </label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className="w-full rounded-xl border border-border bg-white px-4 py-3 text-slate-900 outline-none focus:ring-2 focus:ring-brand/30"
                  placeholder="(555) 123-4567"
                />
              </div>

              <div>
                <label htmlFor="message" className="block mb-2 text-sm font-semibold text-slate-900">
                  Message *
                </label>
                <textarea
                  id="message"
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  required
                  rows={4}
                  className="w-full rounded-xl border border-border bg-white px-4 py-3 text-slate-900 outline-none focus:ring-2 focus:ring-brand/30 resize-none"
                  placeholder="Tell us about your dance goals..."
                />
              </div>

              <button
                type="submit"
                className="w-full bg-brand hover:bg-brand-dark text-white px-6 py-3 rounded-xl font-semibold transition"
              >
                Send Message
              </button>
            </form>
          </div>

          {/* Contact Information */}
          <div className="space-y-6">
            <div className="bg-white border border-border shadow-soft rounded-2xl p-8">
              <h3 className="text-xl font-bold text-slate-900 mb-6">
                Contact information
              </h3>

              <div className="space-y-5">
                {contactInfo.map((info, index) => (
                  <div key={index} className="flex items-start gap-4">
                    <div className="w-11 h-11 bg-brand-soft rounded-xl flex items-center justify-center flex-shrink-0 text-brand border border-border">
                      <info.icon size={20} />
                    </div>

                    <div>
                      <h4 className="text-sm font-semibold text-slate-900 mb-1">
                        {info.title}
                      </h4>
                      <p className="text-sm text-muted">{info.content}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-2xl bg-brand-soft p-8 border border-border shadow-soft">
              <h4 className="text-lg font-bold text-slate-900 mb-3">
                First class free!
              </h4>
              <p className="text-muted mb-5">
                New students receive their first class absolutely free. Come experience
                our studio and find your passion for dance.
              </p>
              <a
                href="#classes"
                className="inline-flex items-center justify-center bg-brand hover:bg-brand-dark text-white px-6 py-3 rounded-xl font-semibold transition"
              >
                Book your free class
              </a>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-16 pt-8 border-t border-border text-center">
          <p className="text-sm text-muted">
            © {new Date().getFullYear()} <span className="font-medium text-slate-900">DanceLink</span>. All rights reserved.
          </p>
        </div>
      </div>
    </section>
  );
}
