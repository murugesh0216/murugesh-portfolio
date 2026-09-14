// ─────────────────────────────────────────────────────────────────────────────
//  EmailJS Configuration
//  Fill in the three values below after completing the one-time setup.
//  See EMAILJS_SETUP.md in this folder for step-by-step instructions.
// ─────────────────────────────────────────────────────────────────────────────

const EMAILJS_SERVICE_ID  = "YOUR_SERVICE_ID";   // e.g. "service_abc123"
const EMAILJS_TEMPLATE_ID = "YOUR_TEMPLATE_ID";  // e.g. "template_xyz789"
const EMAILJS_PUBLIC_KEY  = "YOUR_PUBLIC_KEY";   // e.g. "AbCdEfGhIjKlMnOp"
const GMAIL_RECEIVER_EMAIL = "rmurugesh126@gmail.com";

// Initialize EmailJS with your public key
(function () {
  if (typeof emailjs !== "undefined" && EMAILJS_PUBLIC_KEY && EMAILJS_PUBLIC_KEY !== "YOUR_PUBLIC_KEY") {
    emailjs.init({ publicKey: EMAILJS_PUBLIC_KEY });
  }
})();
