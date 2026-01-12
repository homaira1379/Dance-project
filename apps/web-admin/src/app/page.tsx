import React from "react";

import { Navigation } from "../components/Navigation";
import { Hero } from "../components/Hero";
import { JoinCTA } from "../components/JoinCTA";
import { About } from "../components/About";
import { Classes } from "../components/Classes";
import { Schedule } from "../components/Schedule";
import { Instructors } from "../components/Instructors";
import { BookingRequest } from "../components/BookingRequest";
import { Contact } from "../components/Contact";

export default function Page() {
  return (
    <div className="min-h-screen bg-page text-slate-900">
      <div id="top" />

      <Navigation />
      <Hero />
      <JoinCTA />

      <section id="about" className="py-20">
        <About />
      </section>

      <section id="classes" className="py-20 bg-[#FAFAFA]">
        <Classes />
      </section>

      <section id="schedule" className="py-20">
        <Schedule />
      </section>

      <section id="instructors" className="py-20 bg-[#FAFAFA]">
        <Instructors />
      </section>

      <BookingRequest />

      <section id="contact">
        <Contact />
      </section>
    </div>
  );
}
