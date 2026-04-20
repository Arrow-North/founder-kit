import React, { useState } from 'react';

interface EmailCaptureScreenProps {
  onSubmit: (email: string, firstName: string, lastName: string) => void;
}

export function EmailCaptureScreen({ onSubmit }: EmailCaptureScreenProps) {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (firstName.trim() && lastName.trim() && email.trim()) {
      onSubmit(email, firstName, lastName);
    }
  };

  const inputClass = "w-full bg-white text-brand-dark rounded-xl p-4 md:p-5 text-lg md:text-xl focus:outline-none focus:ring-2 focus:ring-brand-accent shadow-inner";

  return (
    <div className="flex flex-col w-full h-full min-h-screen bg-brand-dark text-white px-4 sm:px-6 md:px-8 pt-24 md:pt-32 pb-8">
      <div className="flex-1 flex flex-col max-w-2xl mx-auto w-full">
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-white mb-4 md:mb-6 leading-tight">
          Almost there.
        </h1>
        <p className="text-brand-surface/90 text-lg md:text-xl mb-10 md:mb-12">
          Enter your email to access the downloads.
        </p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4 md:gap-5">
          <div className="flex flex-col sm:flex-row gap-3 md:gap-4">
            <input
              type="text"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              placeholder="First name"
              required
              className={inputClass} />

            <input
              type="text"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              placeholder="Last name"
              required
              className={inputClass} />

          </div>

          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="name@example.com"
            required
            className={inputClass} />


          <button
            type="submit"
            className="w-full bg-brand-cta text-brand-dark py-4 md:py-5 rounded-xl font-bold text-lg md:text-xl hover:bg-brand-cta/90 transition-colors shadow-lg mt-2">

            Build My Kit
          </button>

          <p className="text-center text-brand-surface/60 text-sm md:text-base mt-4">
            No account needed. Enter your email to access the downloads.
          </p>
        </form>
      </div>
    </div>);

}