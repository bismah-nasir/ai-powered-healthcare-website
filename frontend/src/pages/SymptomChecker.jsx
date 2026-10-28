import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Sparkles, Stethoscope, TriangleAlert, ArrowRight, Star, Award, LoaderCircle,
  Phone, CircleCheck, Info, RotateCcw
} from 'lucide-react';

// Visual treatment for each urgency level returned by the triage API
const URGENCY_STYLES = {
  emergency: {
    label: 'Emergency',
    description: 'Seek emergency care immediately',
    badge: 'bg-danger text-white',
    panel: 'border-danger/40 bg-danger/5',
  },
  urgent: {
    label: 'Urgent',
    description: 'See a doctor within 24 hours',
    badge: 'bg-warning text-white',
    panel: 'border-warning/40 bg-warning/5',
  },
  routine: {
    label: 'Routine',
    description: 'Book a regular appointment',
    badge: 'bg-info text-white',
    panel: 'border-info/40 bg-info/5',
  },
  self_care: {
    label: 'Self-Care',
    description: 'Likely manageable at home',
    badge: 'bg-success text-white',
    panel: 'border-success/40 bg-success/5',
  },
};

const DURATION_OPTIONS = ['Less than a day', '1-3 days', '4-7 days', '1-4 weeks', 'More than a month'];

const EXAMPLES = [
  'Itchy red rash on both forearms for 3 days, no fever',
  'Headache behind my eyes and blurry vision when reading',
  'My child has had a fever of 101°F and a cough since yesterday',
];

function SymptomChecker() {
  // Form states
  const [symptoms, setSymptoms] = useState('');
  const [age, setAge] = useState('');
  const [sex, setSex] = useState('');
  const [duration, setDuration] = useState('');

  // UI states
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (symptoms.trim().length < 10) {
      setError('Please describe your symptoms in a bit more detail (at least 10 characters).');
      return;
    }

    setLoading(true);
    setError('');
    setResult(null);
    try {
      const response = await fetch('http://localhost:5000/api/triage', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          symptoms,
          age: age || undefined,
          sex: sex || undefined,
          duration: duration || undefined,
        }),
      });
      const resData = await response.json();

      if (resData.success) {
        setResult(resData.data);
      } else {
        setError(resData.message || 'Could not assess symptoms. Please try again.');
      }
    } catch (err) {
      console.error('[SymptomChecker Page] Triage error:', err.message);
      setError('Failed to connect to the server. Please ensure backend is running.');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setResult(null);
    setError('');
    setSymptoms('');
  };

  const urgency = result ? URGENCY_STYLES[result.urgency] || URGENCY_STYLES.routine : null;

  return (
    <div className="min-h-screen bg-bg-base/30 py-10 px-6 relative overflow-hidden transition-colors duration-300">
      {/* Background Decorative Blur Orbs */}
      <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-primary/5 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-secondary/5 rounded-full blur-3xl pointer-events-none"></div>

      <div className="max-w-200 mx-auto flex flex-col gap-8 relative z-10">

        {/* Page Title & Intro */}
        <div className="text-center md:text-left">
          <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-secondary bg-secondary/10 px-3 py-1 rounded-full font-body">
            <Sparkles className="w-3.5 h-3.5" /> Powered by Gemini AI
          </span>
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-text-main font-headings mt-3">
            AI Symptom <span className="text-primary">Checker</span>
          </h1>
          <p className="text-sm text-text-sub font-body mt-2 max-w-xl leading-relaxed">
            Describe how you're feeling and get an instant urgency assessment, the right department to visit, and recommended specialists.
          </p>
        </div>

        {/* Symptom Input Form */}
        {!result && (
          <form onSubmit={handleSubmit} className="glass-panel rounded-3xl p-6 md:p-8 flex flex-col gap-5 animate-fade-in">
            <div className="flex flex-col gap-2">
              <label htmlFor="symptoms" className="text-xs font-bold text-text-main tracking-wider uppercase font-headings">
                Describe your symptoms
              </label>
              <textarea
                id="symptoms"
                rows={5}
                maxLength={1500}
                placeholder="e.g. Sharp pain in my lower right abdomen since this morning, mild nausea..."
                value={symptoms}
                onChange={(e) => setSymptoms(e.target.value)}
                className="focus:border-primary resize-none"
              />
              <div className="flex flex-wrap gap-2 items-center">
                <span className="text-[10px] text-text-mute font-body uppercase tracking-wider font-semibold">Try:</span>
                {EXAMPLES.map((example) => (
                  <button
                    key={example}
                    type="button"
                    onClick={() => setSymptoms(example)}
                    className="text-[11px] text-text-sub hover:text-primary bg-primary/5 hover:bg-primary/10 px-3 py-1 rounded-full border-0 transition-colors font-body"
                  >
                    {example}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="flex flex-col gap-2">
                <label htmlFor="age" className="text-xs font-bold text-text-main tracking-wider uppercase font-headings">Age</label>
                <input
                  id="age"
                  type="number"
                  min="0"
                  max="120"
                  placeholder="Optional"
                  value={age}
                  onChange={(e) => setAge(e.target.value)}
                  className="focus:border-primary"
                />
              </div>
              <div className="flex flex-col gap-2">
                <label htmlFor="sex" className="text-xs font-bold text-text-main tracking-wider uppercase font-headings">Sex</label>
                <select id="sex" value={sex} onChange={(e) => setSex(e.target.value)} className="focus:border-primary">
                  <option value="">Prefer not to say</option>
                  <option value="female">Female</option>
                  <option value="male">Male</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div className="flex flex-col gap-2">
                <label htmlFor="duration" className="text-xs font-bold text-text-main tracking-wider uppercase font-headings">Duration</label>
                <select id="duration" value={duration} onChange={(e) => setDuration(e.target.value)} className="focus:border-primary">
                  <option value="">Not sure</option>
                  {DURATION_OPTIONS.map((option) => (
                    <option key={option} value={option}>{option}</option>
                  ))}
                </select>
              </div>
            </div>

            {error && (
              <p className="text-xs text-danger font-body font-semibold bg-danger/10 px-4 py-3 rounded-xl">{error}</p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary py-3.5 rounded-xl text-sm font-semibold flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <LoaderCircle className="w-4 h-4 animate-spin" /> Analyzing symptoms...
                </>
              ) : (
                <>
                  <Stethoscope className="w-4 h-4" /> Check My Symptoms
                </>
              )}
            </button>

            <p className="text-[11px] text-text-mute font-body leading-relaxed flex gap-2">
              <Info className="w-4 h-4 shrink-0" />
              This tool offers general guidance only and is not a medical diagnosis. If you think you are having a medical emergency, call your local emergency number immediately.
            </p>
          </form>
        )}

        {/* Triage Results */}
        {result && (
          <div className="flex flex-col gap-6 animate-slide-up">

            {/* Emergency call-to-action banner */}
            {result.urgency === 'emergency' && (
              <div className="rounded-3xl p-6 bg-danger text-white flex flex-col md:flex-row md:items-center gap-4 shadow-lg shadow-danger/20">
                <TriangleAlert className="w-10 h-10 shrink-0" />
                <div className="grow">
                  <h2 className="text-lg font-extrabold font-headings">This may be a medical emergency</h2>
                  <p className="text-sm font-body opacity-90 mt-1">Do not wait for an online appointment. Contact emergency services or go to the nearest ER now.</p>
                </div>
                <Link to="/emergency" className="btn bg-white! text-danger! font-bold rounded-xl text-sm flex items-center gap-2 shrink-0">
                  <Phone className="w-4 h-4" /> Emergency Contacts
                </Link>
              </div>
            )}

            {/* Assessment summary */}
            <div className={`glass-panel rounded-3xl p-6 md:p-8 flex flex-col gap-5 border ${urgency.panel}`}>
              <div className="flex flex-wrap items-center gap-3">
                <span className={`text-xs font-bold uppercase tracking-wider px-3 py-1.5 rounded-full ${urgency.badge}`}>
                  {urgency.label}
                </span>
                <span className="text-sm text-text-sub font-body font-semibold">{urgency.description}</span>
              </div>

              {result.summary && (
                <p className="text-sm text-text-main font-body leading-relaxed">{result.summary}</p>
              )}

              <div className="flex items-center gap-2 text-sm text-text-sub font-body">
                <Stethoscope className="w-4 h-4 text-primary" />
                Suggested department: <strong className="text-text-main">{result.department}</strong>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-5 pt-4 border-t border-border-color">
                {result.possibleCauses.length > 0 && (
                  <div>
                    <h3 className="text-xs font-bold text-text-main tracking-wider uppercase font-headings mb-2">Possible Causes</h3>
                    <ul className="flex flex-col gap-1.5">
                      {result.possibleCauses.map((item) => (
                        <li key={item} className="text-xs text-text-sub font-body leading-relaxed">• {item}</li>
                      ))}
                    </ul>
                  </div>
                )}
                {result.careAdvice.length > 0 && (
                  <div>
                    <h3 className="text-xs font-bold text-text-main tracking-wider uppercase font-headings mb-2">What You Can Do</h3>
                    <ul className="flex flex-col gap-1.5">
                      {result.careAdvice.map((item) => (
                        <li key={item} className="text-xs text-text-sub font-body leading-relaxed flex gap-1.5">
                          <CircleCheck className="w-3.5 h-3.5 text-success shrink-0 mt-0.5" /> {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                {result.warningSigns.length > 0 && (
                  <div>
                    <h3 className="text-xs font-bold text-text-main tracking-wider uppercase font-headings mb-2">Seek Help If</h3>
                    <ul className="flex flex-col gap-1.5">
                      {result.warningSigns.map((item) => (
                        <li key={item} className="text-xs text-text-sub font-body leading-relaxed flex gap-1.5">
                          <TriangleAlert className="w-3.5 h-3.5 text-danger shrink-0 mt-0.5" /> {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              {!result.aiAvailable && (
                <p className="text-[11px] text-text-mute font-body">AI analysis was unavailable, so this guidance is based on emergency keywords in your description.</p>
              )}
            </div>

            {/* Recommended doctors from the suggested department */}
            {result.urgency !== 'self_care' && result.doctors.length > 0 && (
              <div className="flex flex-col gap-4">
                <h2 className="text-lg font-bold text-text-main font-headings">
                  Recommended <span className="text-primary">{result.department}</span> Specialists
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {result.doctors.map((doctor) => (
                    <div key={doctor._id} className="glass-panel rounded-3xl p-5 flex flex-col gap-3 hover:border-primary hover:-translate-y-1 transition-all duration-300 group">
                      <div>
                        <div className="flex items-center gap-1.5 text-yellow-500 mb-1">
                          <Star className="w-3.5 h-3.5 fill-current" />
                          <span className="text-xs font-bold text-text-main">{doctor.rating.toFixed(1)}</span>
                          <span className="text-[10px] text-text-mute">({doctor.reviewsCount} reviews)</span>
                        </div>
                        <h3 className="font-bold text-sm text-text-main truncate group-hover:text-primary transition-colors font-headings">{doctor.name}</h3>
                        <p className="text-xs text-text-sub font-body truncate">{doctor.specialization}</p>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-text-sub font-body">
                        <Award className="w-4 h-4 text-primary" /> {doctor.experience} Years Experience
                      </div>
                      <div className="flex items-center justify-between pt-2 border-t border-border-color">
                        <p className="text-sm font-extrabold text-text-main font-headings">
                          <span className="text-xs text-primary font-bold mr-0.5">Rs</span>{doctor.consultationFee}
                        </p>
                        <Link to={`/book-doctor/${doctor._id}`} className="btn btn-primary rounded-xl text-xs! font-semibold flex items-center gap-1.5">
                          Book Now <ArrowRight className="w-3.5 h-3.5" />
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-3">
              <button type="button" onClick={handleReset} className="btn btn-secondary py-3 px-6 rounded-xl text-sm flex items-center justify-center gap-2">
                <RotateCcw className="w-4 h-4" /> Check Other Symptoms
              </button>
              <Link to="/doctors"className="btn btn-primary py-3 px-6 rounded-xl text-sm flex items-center justify-center gap-2">
                Browse All Doctors <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            <p className="text-[11px] text-text-mute font-body leading-relaxed flex gap-2">
              <Info className="w-4 h-4 shrink-0" />
              AI-generated guidance for informational purposes only. It is not a diagnosis and does not replace advice from a qualified medical professional.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default SymptomChecker;
