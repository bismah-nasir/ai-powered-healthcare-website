import { ApiError } from '@google/genai';
import Doctor from '../models/Doctor.js';
import {
  detectRedFlags,
  isTriageConfigured,
  runSymptomTriage,
} from '../services/triageService.js';

const SEX_OPTIONS = ['male', 'female', 'other'];

// Static response used when red-flag symptoms are found but the AI call is unavailable
const EMERGENCY_FALLBACK = {
  urgency: 'emergency',
  department: 'General Medicine',
  summary: 'Your description includes symptoms that can signal a medical emergency. Please seek emergency care immediately.',
  possibleCauses: [],
  careAdvice: [
    'Call your local emergency number or go to the nearest emergency room now.',
    'Do not drive yourself if you feel faint, confused, or short of breath.',
    'Stay with someone until help arrives.',
  ],
  warningSigns: [],
};

/**
 * @desc    AI symptom triage: urgency level, suggested department and matching doctors
 * @route   POST /api/triage
 * @access  Public
 */
export const triageSymptoms = async (req, res) => {
  const { symptoms, age, sex, duration } = req.body || {};

  // 1. Validate input
  const cleanSymptoms = typeof symptoms === 'string' ? symptoms.trim() : '';
  if (cleanSymptoms.length < 10 || cleanSymptoms.length > 1500) {
    return res.status(400).json({
      success: false,
      message: 'Please describe your symptoms in 10 to 1500 characters.',
    });
  }

  const cleanAge = age === undefined || age === '' || age === null ? null : Number(age);
  if (cleanAge !== null && (!Number.isInteger(cleanAge) || cleanAge < 0 || cleanAge > 120)) {
    return res.status(400).json({
      success: false,
      message: 'Age must be a whole number between 0 and 120.',
    });
  }

  const cleanSex = SEX_OPTIONS.includes(sex) ? sex : null;
  const cleanDuration = typeof duration === 'string' ? duration.trim().slice(0, 50) : null;

  const hasRedFlags = detectRedFlags(cleanSymptoms);

  // 2. Run AI assessment
  let assessment;
  let aiAvailable = true;

  try {
    if (!isTriageConfigured()) {
      throw new Error('GEMINI_API_KEY is not configured');
    }
    assessment = await runSymptomTriage({
      symptoms: cleanSymptoms,
      age: cleanAge,
      sex: cleanSex,
      duration: cleanDuration,
    });
  } catch (error) {
    if (error instanceof ApiError) {
      console.error(`[Triage Controller] Gemini API error ${error.status}: ${error.message}`);
    } else {
      console.error(`[Triage Controller] Triage error: ${error.message}`);
    }

    // Never leave a patient with red-flag symptoms without guidance
    if (!hasRedFlags) {
      const notConfigured = !isTriageConfigured();
      return res.status(notConfigured ? 503 : 502).json({
        success: false,
        message: notConfigured
          ? 'AI symptom checker is not configured on the server.'
          : 'AI symptom checker is temporarily unavailable. Please try again shortly.',
      });
    }

    aiAvailable = false;
    assessment = { ...EMERGENCY_FALLBACK };
  }

  // 3. Safety override: keyword red flags always escalate to emergency
  if (hasRedFlags) {
    assessment.urgency = 'emergency';
  }

  // 4. Recommend top-rated doctors from the suggested department
  try {
    const doctors = await Doctor.find({ department: assessment.department })
      .sort({ rating: -1, name: 1 })
      .limit(3)
      .select('name specialization department experience rating reviewsCount consultationFee imageUrl');

    res.status(200).json({
      success: true,
      data: {
        ...assessment,
        redFlagDetected: hasRedFlags,
        aiAvailable,
        doctors,
      },
    });
  } catch (error) {
    console.error(`[Triage Controller] Doctor lookup error: ${error.message}`);
    res.status(500).json({
      success: false,
      message: 'Server error, could not complete symptom assessment',
    });
  }
};
