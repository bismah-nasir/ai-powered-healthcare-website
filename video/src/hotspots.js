// Positions of form fields and buttons in the screenshots, in CSS pixels of the 1440px wide layout
// (measured with Playwright when the screens were captured). Used for the typing and click animations.
export const hotspots = {
  symptomInput: { x: 353, y: 330.5, w: 734, h: 144, padLeft: 16, padTop: 14, padRight: 16, fontSize: 15.2, lineHeight: 22.8, color: "rgb(23, 33, 54)" },
  symptomButton: { x: 353, y: 656.3, w: 734, h: 47.7, padLeft: 24, padTop: 12, padRight: 24, fontSize: 15.2, lineHeight: 21.7, color: "rgb(255, 255, 255)" },
  bookingInput: { x: 618.3, y: 444, w: 568.7, h: 121.2, padLeft: 44, padTop: 14, padRight: 16, fontSize: 15.2, lineHeight: 22.8, color: "rgb(23, 33, 54)" },
  bookingButton: { x: 618.3, y: 723.2, w: 568.7, h: 48.8, padLeft: 24, padTop: 12, padRight: 24, fontSize: 15.2, lineHeight: 22.8, color: "rgb(255, 255, 255)" },
  checkoutButton: { x: 855.3, y: 540.5, w: 389.7, h: 46.3, padLeft: 24, padTop: 12, padRight: 24, fontSize: 15.2, lineHeight: 20.3, color: "rgb(255, 255, 255)" },
};
