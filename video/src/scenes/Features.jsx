import { BrowserFrame } from '../components/BrowserFrame';
import { SplitScene, StackedScene } from '../components/Layouts';
import { hotspots } from '../hotspots';

const centre = (box) => ({ x: box.x + box.w / 2, y: box.y + box.h / 2 });
// Zoom point midway between a form field and its submit button, so both stay in view
const between = (field, button) => ({ x: field.x + field.w / 2, y: (field.y + button.y + button.h) / 2 });

export const Home = () => (
  <StackedScene
    caption={{
      eyebrow: 'Welcome to PulseCare AI',
      title: 'Your health,',
      highlight: 'all in one portal',
      body: 'Consult doctors, check symptoms, order medicines and book lab tests from one place.',
    }}
  >
    <BrowserFrame width={1480} height={690} enterDelay={10} pages={[{ screen: 'home', path: '/home', scroll: [45, 200, 0, 0.62] }]} />
  </StackedScene>
);

export const Doctors = () => (
  <SplitScene
    side="left"
    caption={{
      eyebrow: 'Consult specialists',
      title: 'Book a doctor',
      highlight: 'in seconds',
      body: 'Browse specialists by department, pick a live dated slot and confirm your visit.',
      points: ['10 specialists across 8 departments', 'Booked slots are locked instantly', 'Track visits in My Appointments'],
    }}
    pages={[
      { screen: 'doctors', path: '/doctors', scroll: [25, 120, 0, 0.32] },
      {
        screen: 'book_doctor',
        path: '/book-doctor',
        at: 135,
        zoom: [145, 200, 1, 1.28],
        origin: between(hotspots.bookingInput, hotspots.bookingButton),
        typing: { field: hotspots.bookingInput, text: 'Mild fever and a runny nose for two days.', start: 160, until: 238 },
        click: { target: hotspots.bookingButton, start: 214, at: 238 },
      },
    ]}
  />
);

export const SymptomChecker = () => (
  <SplitScene
    side="right"
    caption={{
      eyebrow: 'Powered by Gemini AI',
      title: 'AI Symptom',
      highlight: 'Checker',
      body: 'Describe how you feel in plain words and get guidance in seconds.',
      points: ['Urgency level and the right department', 'Self-care tips and warning signs', 'Recommended specialists to book'],
    }}
    pages={[
      {
        screen: 'symptom_checker',
        path: '/symptom-checker',
        zoom: [8, 60, 1, 1.22],
        origin: between(hotspots.symptomInput, hotspots.symptomButton),
        typing: { field: hotspots.symptomInput, text: 'My hands and feet often feel cold and I get cold sweats', start: 26, until: 124 },
        click: { target: hotspots.symptomButton, start: 100, at: 124 },
      },
      { screen: 'symptom_result', path: '/symptom-checker', at: 134, scroll: [150, 240, 0, 1] },
    ]}
  />
);

export const Pharmacy = () => (
  <SplitScene
    side="left"
    caption={{
      eyebrow: 'Online pharmacy',
      title: 'Medicines,',
      highlight: 'delivered',
      body: 'Shop prescription and wellness products with live stock checks.',
      points: ['Rx alerts for prescription medicines', 'Cash or Card on Delivery', 'Instant receipt and order tracking'],
    }}
    pages={[
      { screen: 'pharmacy', path: '/medicines', scroll: [20, 105, 0, 0.22] },
      {
        screen: 'cart',
        path: '/cart',
        at: 115,
        scroll: [135, 175, 0, 1],
        click: { target: hotspots.checkoutButton, start: 180, at: 204, from: { x: centre(hotspots.checkoutButton).x - 300, y: 760 } },
      },
      { screen: 'order_confirmation', path: '/cart', at: 214, cover: true, zoom: [224, 305, 1, 1.35], origin: '50% 52%' },
    ]}
  />
);

export const LabsEmergency = () => (
  <StackedScene
    caption={{
      eyebrow: 'Diagnostics & emergency',
      title: 'Home lab tests and',
      highlight: '24/7 emergency help',
      body: 'Schedule sample collection at home, or reach ambulances and trauma centres in one tap.',
    }}
  >
    <BrowserFrame width={850} height={640} enterDelay={10} pages={[{ screen: 'labs', path: '/labs', scroll: [40, 190, 0, 0.3] }]} />
    <BrowserFrame width={850} height={640} enterDelay={20} pages={[{ screen: 'emergency', path: '/emergency', scroll: [50, 190, 0, 0.45] }]} />
  </StackedScene>
);

export const Admin = () => (
  <SplitScene
    side="right"
    caption={{
      eyebrow: 'Admin dashboard',
      title: 'Run the clinic',
      highlight: 'from one place',
      body: 'Live totals for patients, doctors, appointments, tickets and orders.',
      points: ['Complete visits to free their slots', 'Update pharmacy order status', 'Search and filter every record'],
    }}
    pages={[
      { screen: 'admin', path: '/admin', zoom: [25, 120, 1, 1.22], origin: '50% 22%' },
      { screen: 'admin_orders', path: '/admin', at: 125, scroll: [140, 230, 0, 1], zoom: [140, 235, 1, 1.18], origin: '50% 62%' },
    ]}
  />
);
