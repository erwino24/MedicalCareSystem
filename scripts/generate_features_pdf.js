import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import fs from 'fs';
import path from 'path';

async function generateFeaturesPdf() {
  const pdfDoc = await PDFDocument.create();
  
  // Embed standard fonts
  const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  const fontRegular = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const fontOblique = await pdfDoc.embedFont(StandardFonts.HelveticaOblique);

  // Palette definition
  const tealDark = rgb(15 / 255, 118 / 255, 110 / 255);    // #0f766e
  const tealPrimary = rgb(13 / 255, 148 / 255, 136 / 255); // #0d9488
  const tealLight = rgb(204 / 255, 251 / 255, 241 / 255);  // #ccfbf1
  const slateDark = rgb(15 / 255, 23 / 255, 42 / 255);     // #0f172a
  const slateMuted = rgb(71 / 255, 85 / 255, 105 / 255);   // #475569
  const slateLight = rgb(241 / 255, 245 / 255, 249 / 255); // #f1f5f9
  const white = rgb(1, 1, 1);
  const gold = rgb(217 / 255, 119 / 255, 6 / 255);

  let currentPage;
  let cursorY;
  const pageWidth = 595.28; // Standard A4
  const pageHeight = 841.89;
  const margin = 40;
  const contentWidth = pageWidth - (margin * 2);

  function addNewPage(headerTitle = '') {
    currentPage = pdfDoc.addPage([pageWidth, pageHeight]);
    
    // Top banner accent
    currentPage.drawRectangle({
      x: 0,
      y: pageHeight - 6,
      width: pageWidth,
      height: 6,
      color: tealPrimary,
    });

    // Running Top Header (pages > 1)
    if (pdfDoc.getPageCount() > 1 && headerTitle) {
      currentPage.drawText('MaternalCare OB-GYN System | End-to-End Features Specification', {
        x: margin,
        y: pageHeight - 26,
        size: 8,
        font: fontRegular,
        color: slateMuted,
      });
      currentPage.drawText(headerTitle, {
        x: pageWidth - margin - fontBold.widthOfTextAtSize(headerTitle, 8),
        y: pageHeight - 26,
        size: 8,
        font: fontBold,
        color: tealDark,
      });
      currentPage.drawLine({
        start: { x: margin, y: pageHeight - 32 },
        end: { x: pageWidth - margin, y: pageHeight - 32 },
        thickness: 0.5,
        color: rgb(226 / 255, 232 / 255, 240 / 255),
      });
    }

    // Running Footer
    const pageNumText = `Page ${pdfDoc.getPageCount()}`;
    currentPage.drawText(pageNumText, {
      x: pageWidth - margin - fontRegular.widthOfTextAtSize(pageNumText, 8),
      y: 20,
      size: 8,
      font: fontRegular,
      color: slateMuted,
    });
    currentPage.drawText('Confidential & Proprietary | Clinic Operational Documentation', {
      x: margin,
      y: 20,
      size: 8,
      font: fontRegular,
      color: slateMuted,
    });
    currentPage.drawLine({
      start: { x: margin, y: 30 },
      end: { x: pageWidth - margin, y: 30 },
      thickness: 0.5,
      color: rgb(226 / 255, 232 / 255, 240 / 255),
    });

    cursorY = pageHeight - 48;
    return currentPage;
  }

  function checkPageBreak(requiredHeight, headerTitle = '') {
    if (cursorY - requiredHeight < 42) {
      addNewPage(headerTitle);
    }
  }

  function drawSectionHeading(title, subtitle = '') {
    checkPageBreak(50, title);
    cursorY -= 8;
    
    // Background pill accent
    currentPage.drawRectangle({
      x: margin,
      y: cursorY - 18,
      width: contentWidth,
      height: 22,
      color: slateLight,
      borderColor: rgb(203 / 255, 213 / 255, 225 / 255),
      borderWidth: 0.5,
    });

    currentPage.drawRectangle({
      x: margin,
      y: cursorY - 18,
      width: 4,
      height: 22,
      color: tealPrimary,
    });

    currentPage.drawText(title.toUpperCase(), {
      x: margin + 12,
      y: cursorY - 12,
      size: 10,
      font: fontBold,
      color: slateDark,
    });

    cursorY -= 28;

    if (subtitle) {
      currentPage.drawText(subtitle, {
        x: margin,
        y: cursorY,
        size: 8.5,
        font: fontOblique,
        color: slateMuted,
      });
      cursorY -= 14;
    }
  }

  function drawFeatureBlock(title, bulletPoints) {
    const blockHeight = 20 + (bulletPoints.length * 13) + 4;
    checkPageBreak(blockHeight);

    // Section bullet indicator
    currentPage.drawRectangle({
      x: margin,
      y: cursorY - 1,
      width: 5,
      height: 5,
      color: tealPrimary,
    });

    currentPage.drawText(title, {
      x: margin + 10,
      y: cursorY - 2,
      size: 9.5,
      font: fontBold,
      color: tealDark,
    });
    cursorY -= 14;

    for (const point of bulletPoints) {
      // Bullet dot
      currentPage.drawCircle({
        x: margin + 14,
        y: cursorY + 2,
        size: 1.5,
        color: slateMuted,
      });

      // Wrap text
      const cleanPoint = point.replace(/[^\x00-\x7F]/g, ''); // Ensure pure ASCII
      const words = cleanPoint.split(' ');
      let line = '';
      let lineOffset = 0;

      for (let i = 0; i < words.length; i++) {
        const testLine = line + (line ? ' ' : '') + words[i];
        const testWidth = fontRegular.widthOfTextAtSize(testLine, 8.5);
        if (testWidth > contentWidth - 28 && i > 0) {
          currentPage.drawText(line, {
            x: margin + 22,
            y: cursorY - lineOffset,
            size: 8.5,
            font: fontRegular,
            color: slateDark,
          });
          line = words[i];
          lineOffset += 11;
          checkPageBreak(14);
        } else {
          line = testLine;
        }
      }

      if (line) {
        currentPage.drawText(line, {
          x: margin + 22,
          y: cursorY - lineOffset,
          size: 8.5,
          font: fontRegular,
          color: slateDark,
        });
      }

      cursorY -= (11 + lineOffset);
    }

    cursorY -= 3;
  }

  // ==================== PAGE 1: TITLE & EXECUTIVE SUMMARY ====================
  addNewPage();

  // Hero Title Box
  currentPage.drawRectangle({
    x: margin,
    y: cursorY - 95,
    width: contentWidth,
    height: 95,
    color: slateDark,
    borderColor: tealPrimary,
    borderWidth: 1.5,
  });

  currentPage.drawText('MaternalCare OB-GYN Clinical System', {
    x: margin + 20,
    y: cursorY - 30,
    size: 18,
    font: fontBold,
    color: white,
  });

  currentPage.drawText('End-to-End Features, Architecture & Clinical Workflow Specification', {
    x: margin + 20,
    y: cursorY - 48,
    size: 10,
    font: fontRegular,
    color: tealLight,
  });

  currentPage.drawText('Integrated Obstetrics & Gynecology Patient Records, Scheduling & Smart Rx Prescription Platform', {
    x: margin + 20,
    y: cursorY - 65,
    size: 8.5,
    font: fontOblique,
    color: rgb(148 / 255, 163 / 255, 184 / 255),
  });

  currentPage.drawText('Version 2.0 | Production Release | Live URL: https://medical-care-system-one.vercel.app/', {
    x: margin + 20,
    y: cursorY - 82,
    size: 7.5,
    font: fontRegular,
    color: gold,
  });

  cursorY -= 112;

  // Overview
  drawSectionHeading('1. Executive Overview & Core Value Proposition');
  drawFeatureBlock('Zero-Lockin Dual Excel & Cloud Architecture', [
    'Combines instantaneous client-side responsiveness with live multi-tab Excel database synchronisation (OBGYN_Clinic_Database.xlsx).',
    'Supports Chrome File System Access API for transparent local disk auto-saving without requiring recurring file dialogs.',
    'Provides 1-click Excel Export, Import, and Factory Default Database Restoration across all clinic workstations.',
  ]);

  drawFeatureBlock('Role-Tailored Dual Clinical Portals', [
    'Lead Doctor (MD / FPOGS): Full clinical authorization (Gestational metrics, Prescriptions, High-Risk Watchlist, Record Deletion).',
    'Assistant Nurse (RN / Triage): Triage vitals registration, patient intake, appointment scheduling, and WhatsApp/SMS reminder dispatching.',
    'Fast Security PIN Authentication: Pre-configured demo PINs and 4-digit practitioner credentials stored securely in Excel database.',
  ]);

  // Section 2: Practitioner Authentication
  drawSectionHeading('2. Practitioner Authentication & Staff Management');
  drawFeatureBlock('Secure Portal Login & Fast Profile Switcher', [
    'Visual Doctor vs Assistant Nurse toggle tabs with personalized practitioner profile selectors.',
    '4-digit security PIN verification with intuitive default helper pills (Dr. Sarah Jenkins MD: 1234, Nurse Maria Santos RN: 0000).',
    'Instant staff registration directly from the login portal (+ Register a Nurse or New Doctor) without administrative lockout.',
  ]);

  drawFeatureBlock('Role Permission & Security Matrix', [
    'Doctor-Exclusive Privileges: Modifying Last Menstrual Period (LMP), Gravida/Para parity, Issuing & Signing Prescriptions (Rx Pad), Deleting Checkup or Patient Records.',
    'Nurse-Safe Boundaries: Protected fields with Doctor Authorization badges to prevent accidental clinical alterations while enabling fast intake and vital triage logging.',
  ]);

  // ==================== PAGE 2: CLINICAL OB-GYN ENGINE & SCHEDULING ====================
  addNewPage('Clinical Engine & Scheduling');

  drawSectionHeading('3. Intelligent Obstetrics Engine & Gestational Calculations');
  drawFeatureBlock('Automated Naegele\'s Rule & Biometric Calculations', [
    'Estimated Date of Delivery (EDD): Automatically derived using Naegele\'s Rule (LMP + 7 days - 3 months + 1 year).',
    'Age of Gestation (AOG): Calculated to the exact day (Weeks + Days) in real-time against current date.',
    'Estimated Conception Date: Accurately calculated as LMP + 14 days for comprehensive patient timeline counseling.',
    'Gestational Trimester Cohort: Categorized dynamically into 1st Trimester (<= 13w 6d), 2nd Trimester (14w - 27w 6d), 3rd Trimester (>= 28w), and Post-Term (>= 40w).',
  ]);

  drawFeatureBlock('High-Risk & Delivery Watchlist', [
    'Identifies and escalates patients approaching term (>= 32 weeks AOG or within 30 to 45 days of expected delivery).',
    'Interactive cohort distribution charts showing active clinic patient census broken down by pregnancy trimester.',
  ]);

  drawSectionHeading('4. Intelligent Scheduling & Interactive Calendar System');
  drawFeatureBlock('Nurse-Centric Interactive Monthly Calendar', [
    'Full-month calendar grid with previous/next month navigation, "Today" quick jump, and single-day filtering.',
    'Color-Coded Status Badges: Completed consultations are tagged in Green (Done), while upcoming bookings are tagged in Orange (Scheduled).',
    'Collapsible Upcoming Queue: [Hide List] / [Show List] toggle that seamlessly expands the calendar to 100% full-screen width.',
  ]);

  drawFeatureBlock('Smart Slot Booking & Conflict Prevention', [
    'Prevents double-booking: Automatically scans booked consultations for the selected date and disables taken time slots with (Taken / Booked).',
    'Pre-fills earliest available consultation window and provides instant modal feedback.',
  ]);

  drawFeatureBlock('1-Click WhatsApp & SMS Consultation Reminders', [
    'Generates pre-formatted bilingual clinical reminder templates containing patient name, scheduled date, time slot, and clinic location.',
    'Dispatches directly to patient\'s registered mobile phone via native WhatsApp or SMS with a single click.',
  ]);

  // ==================== PAGE 3: PATIENT CHART & CHECKUPS ====================
  addNewPage('Patient Chart & Clinical Records');

  drawSectionHeading('5. Patient Directory & Adaptive Two-Column Medical Chart');
  drawFeatureBlock('Desktop Collapsible Sidebar vs Mobile Adaptive Layout', [
    'Computer / Desktop View: [Hide List] / [Show Patients] toggle collapses the patient directory sidebar, giving the clinical chart 100% full-screen width for spacious recording.',
    'Mobile View: Optimized single-screen navigation with sticky back button and responsive touch cards.',
    'Multi-Filter Directory Search: Instant real-time filtering by Patient Name, Phone Number, Home Address, Clinical Status (Active/Inactive), and Gestational Trimester.',
  ]);

  drawFeatureBlock('Comprehensive Patient Demographic & History Profile', [
    'Full obstetric history (GxPy), Patient Age, Blood Type, Contact Details, and Home Address.',
    'Illness & Medical History Banner: Dedicated collapsible card for documenting Pre-existing Conditions, Surgical History, Family History, and Drug Allergies with high-visibility warning badges.',
    'Emergency Contact Management: Records Next of Kin name, relationship, emergency phone number, and physical address.',
    'Protected Clinical Status: Read-only Active Prenatal badge in chart header, strictly editable via authorized "Edit Info" modal.',
  ]);

  drawSectionHeading('6. Consultations, Vitals Triage & Clinical Check-up Table');
  drawFeatureBlock('Dual Doctor-Nurse Inline Row Entry', [
    'Top input row for instant recording of Consultation Date, Vitals (Weight in kg, Blood Pressure BP, Fetal Heart Rate FHR in bpm), Clinical Diagnosis, Procedure / Treatment, and Follow-Up Date.',
    'Interactive Date Picker: Allows logging visits for current date or backdating past consultations seamlessly.',
    'Automatic Consultation Completion: Saving a checkup automatically tags any pending scheduled appointment for that patient as "Done".',
  ]);

  drawFeatureBlock('Historical Consultation Timeline & Medication Badges', [
    'Chronological visit audit trail displaying vitals, findings, and follow-up schedules.',
    'Live Prescription Badges: Displays Prescribed Medications (X): Generic Name (Dosage) directly in the checkup row with 1-click Rx re-print access.',
  ]);

  // ==================== PAGE 4: PRESCRIPTIONS & TECHNICAL SUMMARY ====================
  addNewPage('Doctor Prescription Pad (Rx) & Technical Stack');

  drawSectionHeading('7. Doctor\'s Official Medical Prescription Pad (Rx)');
  drawFeatureBlock('Professional A4 / US Letter Rx Pad Generation', [
    'Clean, standardized medical layout complete with Clinic Header, Patient Info, AOG / EDD, Allergies Alert, Rx Symbol, Signatures, and PRC / PTR / S2 License Credentials.',
    'Digital Signature & Official Medical Stamp options ready for physical printing or PDF export.',
  ]);

  drawFeatureBlock('Automatic Prescription Archiving upon Print & Save', [
    'Zero Hardcoded Defaults: Starts with a clean, blank medication list (0 meds) or loads previously saved medicines.',
    'Auto-Save on Print: Clicking [Print Prescription] or [Save to Checkup Record] automatically writes all prescribed medications permanently into the patient\'s clinical checkup record and Excel database.',
    '1-Click "Clear All" action and fast 1-click OB-GYN preset formulations (Prenatal Multivitamins, Iron + Folic Acid, Calcium + D3, Progesterone / Duphaston, Isoxsuprine, Paracetamol, etc.).',
  ]);

  drawSectionHeading('8. Technical Architecture, Security & Offline Capabilities');
  drawFeatureBlock('Frontend Stack & Styling System', [
    'Core Framework: React 19 + TypeScript + Vite for instant sub-second bundling and zero-runtime latency.',
    'TailwindCSS Design System: Modern healthcare color tokens, dark glassmorphism, responsive grid layouts, and high-contrast typography.',
    'Lucide Healthcare Icons: Crisp vector icons for triage vitals, fetal metrics, prescriptions, and calendar operations.',
  ]);

  drawFeatureBlock('Multi-Tab Excel Database Schema (OBGYN_Clinic_Database.xlsx)', [
    'Sheet 1: Patients Directory - ID, Full Name, Age, Phone, Address, Blood Type, Gravida, Para, LMP, Illness History, Allergies, Status, Emergency Contact.',
    'Sheet 2: Clinical Checkups - ID, Patient ID, Visit Date, BP, Weight, FHR, Diagnosis, Procedure, Follow-Up Date, Prescriptions JSON, Notes.',
    'Sheet 3: Appointment Schedule - ID, Patient ID, Patient Name, Date, Time Slot, Reason, Status (Scheduled / Completed / Cancelled), Reminded.',
    'Sheet 4: Practitioner Accounts - ID, Full Name, Title, Role (DOCTOR / NURSE), PIN Code, Avatar.',
  ]);

  // Summary Sign-off Box
  cursorY -= 8;
  currentPage.drawRectangle({
    x: margin,
    y: cursorY - 45,
    width: contentWidth,
    height: 45,
    color: tealLight,
    borderColor: tealPrimary,
    borderWidth: 1,
  });

  currentPage.drawText('MaternalCare OB-GYN System - Built for Clinical Excellence & Patient Safety', {
    x: margin + 15,
    y: cursorY - 18,
    size: 9.5,
    font: fontBold,
    color: tealDark,
  });

  currentPage.drawText('All features are fully deployed, verified with strict TypeScript builds, and live in production.', {
    x: margin + 15,
    y: cursorY - 32,
    size: 8,
    font: fontRegular,
    color: slateDark,
  });

  // Save the PDF
  const pdfBytes = await pdfDoc.save();
  const publicPath = path.resolve(process.cwd(), 'public/MaternalCare_OBGYN_End_to_End_Features.pdf');
  const rootPath = path.resolve(process.cwd(), 'MaternalCare_OBGYN_End_to_End_Features.pdf');

  fs.writeFileSync(publicPath, pdfBytes);
  fs.writeFileSync(rootPath, pdfBytes);

  console.log(`Successfully generated PDF files:\n- ${publicPath}\n- ${rootPath}`);
}

generateFeaturesPdf().catch(console.error);
