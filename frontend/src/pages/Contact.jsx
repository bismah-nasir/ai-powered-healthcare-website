import React, { useState } from 'react';
import { Mail, Phone, MapPin, Clock, User, Tag, FileText, Send, CheckCircle, AlertTriangle } from 'lucide-react';

function Contact() {
  // Form input states
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: '',
  });

  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setSuccessMsg('');
    setErrorMsg('');

    try {
      const response = await fetch('http://localhost:5000/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setSuccessMsg(data.message || 'Support ticket submitted successfully!');
        // Clear form values
        setFormData({
          name: '',
          email: '',
          phone: '',
          subject: '',
          message: '',
        });
      } else {
        setErrorMsg(data.message || 'Submission failed. Please check details.');
      }
    } catch (error) {
      console.error('[Contact Form] Submission error:', error.message);
      setErrorMsg('Failed to reach the server. Please check your backend connection.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-bg-base/30 py-12 px-6 relative overflow-hidden transition-colors duration-300">
      {/* Decorative Blur Background Circles */}
      <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-primary/5 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-secondary/5 rounded-full blur-3xl pointer-events-none"></div>

      <div className="max-w-275 mx-auto flex flex-col gap-10 relative z-10">
        
        {/* Page Title */}
        <div className="text-center">
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-text-main font-headings">
            Get in <span className="text-primary">Touch</span>
          </h1>
          <p className="text-sm text-text-sub font-body mt-2 max-w-xl mx-auto leading-relaxed">
            Have any questions about consultations, laboratory screenings, or portal setups? Reach out and our team will assist you.
          </p>
        </div>

        {/* Two Column Layout Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
          
          {/* Column 1: Contact Clinical coordinates (4 cols) */}
          <div className="lg:col-span-5 flex flex-col gap-6">
            
            {/* Address Card */}
            <div className="glass-panel rounded-3xl p-6 flex gap-4 hover:border-primary/30 transition-all duration-300 animate-slide-up delay-75">
              <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center shrink-0 text-primary">
                <MapPin className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-text-main font-headings">Clinic HQ Address</h3>
                <p className="text-xs text-text-sub font-body mt-1.5 leading-relaxed">
                  Building 4-C, Shahrah-e-Faisal Road,<br />
                  PECHS Block 6, Karachi, Pakistan
                </p>
              </div>
            </div>

            {/* Hotlines Card */}
            <div className="glass-panel rounded-3xl p-6 flex gap-4 hover:border-primary/30 transition-all duration-300 animate-slide-up delay-100">
              <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center shrink-0 text-primary">
                <Phone className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-text-main font-headings">Call Support</h3>
                <p className="text-xs text-text-sub font-body mt-1.5 leading-relaxed">
                  Landline: <a href="tel:+9221111911911" className="text-primary font-semibold hover:underline">+92 (21) 111-911-911</a><br />
                  Direct Helpline: <a href="tel:1122" className="text-danger font-semibold hover:underline">1122</a>
                </p>
              </div>
            </div>

            {/* Emails Card */}
            <div className="glass-panel rounded-3xl p-6 flex gap-4 hover:border-primary/30 transition-all duration-300 animate-slide-up delay-150">
              <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center shrink-0 text-primary">
                <Mail className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-text-main font-headings">Email Desk</h3>
                <p className="text-xs text-text-sub font-body mt-1.5 leading-relaxed">
                  General Queries: <a href="mailto:support@pulsecare.ai" className="text-primary font-semibold hover:underline">support@pulsecare.ai</a><br />
                  Booking Desk: <a href="mailto:clinic@pulsecare.ai" className="text-primary font-semibold hover:underline">clinic@pulsecare.ai</a>
                </p>
              </div>
            </div>

            {/* Hours Card */}
            <div className="glass-panel rounded-3xl p-6 flex gap-4 hover:border-primary/30 transition-all duration-300 animate-slide-up delay-200">
              <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center shrink-0 text-primary">
                <Clock className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-text-main font-headings">Operating Hours</h3>
                <p className="text-xs text-text-sub font-body mt-1.5 leading-relaxed">
                  Monday – Saturday: <strong className="text-text-main">08:00 AM – 10:00 PM</strong><br />
                  Sunday: Emergency Services Open 24 Hours
                </p>
              </div>
            </div>

          </div>

          {/* Column 2: support Submission Form (7 cols) */}
          <div className="lg:col-span-7">
            <form 
              onSubmit={handleSubmit}
              className="glass-panel rounded-3xl p-8 flex flex-col gap-5 h-full justify-between animate-scale-in delay-150"
            >
              <div>
                <h2 className="text-lg font-bold text-text-main font-headings">Send Us a Message</h2>
                <p className="text-xs text-text-sub font-body mt-1">Please fill in the form and we will review your message.</p>
              </div>

              {/* Status Notifications */}
              {successMsg && (
                <div className="bg-success/10 border border-success/20 rounded-2xl p-4 flex gap-3 text-xs text-success font-body items-start animate-scale-in">
                  <CheckCircle className="w-5 h-5 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-bold">Submission Successful!</p>
                    <p className="text-[11px] leading-relaxed mt-1">{successMsg}</p>
                  </div>
                </div>
              )}

              {errorMsg && (
                <div className="bg-danger/10 border border-danger/20 rounded-2xl p-4 flex gap-3 text-xs text-danger font-body items-start animate-scale-in">
                  <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-bold">Submission Failed</p>
                    <p className="text-[11px] leading-relaxed mt-1">{errorMsg}</p>
                  </div>
                </div>
              )}

              {/* Field 1: Patient Name */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-text-sub uppercase tracking-wider font-body">Full Name *</label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-mute">
                    <User className="w-5 h-5" />
                  </span>
                  <input
                    type="text"
                    name="name"
                    required
                    disabled={loading}
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Enter your full name..."
                    className="pl-icon-left focus:border-primary w-full"
                  />
                </div>
              </div>

              {/* Field 2 & 3 row: Email & Phone */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Email */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-text-sub uppercase tracking-wider font-body">Email Address *</label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-mute">
                      <Mail className="w-5 h-5" />
                    </span>
                    <input
                      type="email"
                      name="email"
                      required
                      disabled={loading}
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="name@example.com"
                      className="pl-icon-left focus:border-primary w-full"
                    />
                  </div>
                </div>

                {/* Phone */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-text-sub uppercase tracking-wider font-body">Phone Number</label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-mute">
                      <Phone className="w-5 h-5" />
                    </span>
                    <input
                      type="tel"
                      name="phone"
                      disabled={loading}
                      value={formData.phone}
                      onChange={handleChange}
                      placeholder="e.g. 03001234567"
                      className="pl-icon-left focus:border-primary w-full"
                    />
                  </div>
                </div>
              </div>

              {/* Field 4: Subject */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-text-sub uppercase tracking-wider font-body">Subject *</label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-mute">
                    <Tag className="w-5 h-5" />
                  </span>
                  <input
                    type="text"
                    name="subject"
                    required
                    disabled={loading}
                    value={formData.subject}
                    onChange={handleChange}
                    placeholder="Brief summary of your inquiry..."
                    className="pl-icon-left focus:border-primary w-full"
                  />
                </div>
              </div>

              {/* Field 5: Message */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-text-sub uppercase tracking-wider font-body">Message *</label>
                <div className="relative">
                  <span className="absolute left-3.5 top-5 text-text-mute">
                    <FileText className="w-5 h-5" />
                  </span>
                  <textarea
                    name="message"
                    required
                    disabled={loading}
                    rows="4"
                    value={formData.message}
                    onChange={handleChange}
                    placeholder="Write details of your message or question..."
                    className="pl-icon-left focus:border-primary w-full min-h-25 resize-y py-3.5"
                  />
                </div>
              </div>

              {/* Submit Trigger */}
              <button
                type="submit"
                disabled={loading}
                className="btn btn-primary w-full py-4 rounded-2xl text-sm font-bold flex items-center justify-center gap-2 border-0 shadow-lg mt-2 disabled:opacity-75 disabled:cursor-not-allowed disabled:pointer-events-none"
              >
                <Send className="w-4 h-4" />
                {loading ? 'Sending Request...' : 'Send Message'}
              </button>

            </form>
          </div>

        </div>

      </div>
    </div>
  );
}

export default Contact;
