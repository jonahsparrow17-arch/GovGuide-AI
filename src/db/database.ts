import initSqlJs, { Database } from 'sql.js';
import fs from 'fs';
import path from 'path';
import {
  GovernmentService,
  GovernmentScheme,
  DocumentRequirement,
  ApplicationStep,
  CommonMistake,
  ServiceFAQ,
  CitizenProfile,
  SchemeMatchResult,
  SchemeCategoryCount,
  EligibilityCheckRequest,
  EligibilityCheckResult,
  SourceRecord,
  ChecklistRecord,
  ChecklistItemRecord,
  SchemeCategory,
  TrustStatus
} from '../types.js';

let db: Database | null = null;
const dbDir = path.join(process.cwd(), 'data');

export async function getDatabase(): Promise<Database> {
  if (db) return db;

  const SQL = await initSqlJs();

  if (!fs.existsSync(dbDir)) {
    fs.mkdirSync(dbDir, { recursive: true });
  }

  // Initialize SQLite database
  db = new SQL.Database();
  initTables(db);
  seedInitialData(db);

  return db;
}

function initTables(database: Database) {
  database.run(`
    CREATE TABLE IF NOT EXISTS services (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      slug TEXT UNIQUE NOT NULL,
      short_description TEXT NOT NULL,
      full_description TEXT NOT NULL,
      category TEXT NOT NULL,
      eligibility TEXT NOT NULL,
      official_website TEXT NOT NULL,
      processing_fee TEXT NOT NULL,
      processing_time TEXT NOT NULL,
      issuing_authority TEXT NOT NULL,
      icon TEXT NOT NULL,
      last_verified TEXT NOT NULL,
      important_notes TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS documents (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      service_id INTEGER NOT NULL,
      category TEXT NOT NULL,
      name TEXT NOT NULL,
      description TEXT NOT NULL,
      is_mandatory INTEGER NOT NULL,
      accepted_options TEXT NOT NULL,
      FOREIGN KEY (service_id) REFERENCES services(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS application_steps (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      service_id INTEGER NOT NULL,
      step_number INTEGER NOT NULL,
      title TEXT NOT NULL,
      description TEXT NOT NULL,
      location_type TEXT NOT NULL,
      tip TEXT,
      FOREIGN KEY (service_id) REFERENCES services(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS common_mistakes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      service_id INTEGER NOT NULL,
      mistake TEXT NOT NULL,
      impact TEXT NOT NULL,
      prevention TEXT NOT NULL,
      FOREIGN KEY (service_id) REFERENCES services(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS service_faqs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      service_id INTEGER NOT NULL,
      question TEXT NOT NULL,
      answer TEXT NOT NULL,
      FOREIGN KEY (service_id) REFERENCES services(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS schemes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      slug TEXT UNIQUE NOT NULL,
      category TEXT NOT NULL,
      department TEXT NOT NULL,
      state_or_central TEXT NOT NULL,
      benefit TEXT NOT NULL,
      who_can_apply TEXT NOT NULL,
      what_you_get TEXT NOT NULL,
      eligibility TEXT NOT NULL,
      documents TEXT NOT NULL,
      application_steps TEXT NOT NULL,
      status TEXT NOT NULL,
      official_source TEXT NOT NULL,
      source_verified_authority TEXT NOT NULL,
      last_verified TEXT NOT NULL,
      effective_date TEXT,
      important_notes TEXT,
      target_demographics TEXT NOT NULL,
      education_level TEXT,
      min_age INTEGER,
      max_age INTEGER,
      income_limit_annual INTEGER,
      gender TEXT
    );

    CREATE TABLE IF NOT EXISTS checklists (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      target_slug TEXT,
      target_type TEXT,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS checklist_items (
      id TEXT PRIMARY KEY,
      checklist_id TEXT NOT NULL,
      title TEXT NOT NULL,
      description TEXT,
      required INTEGER NOT NULL DEFAULT 1,
      completed INTEGER NOT NULL DEFAULT 0,
      source TEXT,
      FOREIGN KEY (checklist_id) REFERENCES checklists(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS sources (
      id TEXT PRIMARY KEY,
      url TEXT NOT NULL,
      domain TEXT NOT NULL,
      title TEXT NOT NULL,
      government_department TEXT NOT NULL,
      source_type TEXT NOT NULL,
      verification_status TEXT NOT NULL,
      last_verified TEXT NOT NULL,
      associated_slug TEXT
    );
  `);
}

function seedInitialData(database: Database) {
  // -------------------------------------------------------------
  // 1. SEED 5 CORE SERVICES
  // -------------------------------------------------------------

  const servicesData = [
    {
      id: 1,
      name: 'Indian Passport',
      slug: 'passport',
      short_description: 'Official travel and identity document for Indian citizens traveling abroad. Issued by CPV Division, Ministry of External Affairs.',
      full_description: 'An Indian Passport is a legal travel document issued by the Government of India under the Passports Act 1967. It certifies the identity and nationality of the holder for international travel and serves as primary proof of Indian citizenship. Services include Fresh Passport, Renewal/Re-issue, and Tatkaal (expedited processing).',
      category: 'Identity & Travel',
      eligibility: [
        'Must be an Indian citizen by birth, descent, or naturalization',
        'Must have valid address proof for the current residence (minimum 1 year of continuous stay)',
        'Must not have unresolved criminal proceedings or pending non-bailable warrants',
        'Minors (under 18 years) require consent of both parents along with parents passport copies'
      ],
      official_website: 'https://passportindia.gov.in',
      processing_fee: '₹1,500 (Normal 36-page, 10-year) | ₹2,000 (Normal 60-page) | ₹3,500 (Tatkaal 36-page)',
      processing_time: '10 to 15 working days (Normal) | 1 to 3 working days (Tatkaal, post-police clearance)',
      issuing_authority: 'Consular, Passport & Visa (CPV) Division, Ministry of External Affairs (MEA)',
      icon: 'FileText',
      last_verified: '2026-08-01',
      important_notes: 'Police verification is mandatory for fresh passports. Ensure your local address matches all supporting utility or bank records exactly.',
      documents: [
        { category: 'Proof of Date of Birth', name: 'DOB Certificate / Matriculation', description: 'Document establishing the exact birth date of the applicant.', is_mandatory: 1, accepted_options: ['Birth Certificate issued by Municipal Authority/Registrar', '10th Class / Matriculation Passing Certificate mentioning DOB', 'PAN Card issued by Income Tax Department', 'Aadhaar Card / e-Aadhaar'] },
        { category: 'Proof of Present Address', name: 'Current Residential Address Proof', description: 'Document validating your current stay for the last 1 year.', is_mandatory: 1, accepted_options: ['Aadhaar Card with current address', 'Active Bank Passbook with photo & branch stamp (Scheduled Commercial Banks)', 'Electricity / Water Bill (not older than 3 months)', 'Voter ID (EPIC Card)', 'Registered Rent Agreement (minimum 1-year tenure)'] },
        { category: 'Proof of Identity', name: 'Photo Identity Proof', description: 'Valid government-issued photo identity.', is_mandatory: 1, accepted_options: ['Aadhaar Card', 'Voter Identity Card', 'PAN Card', 'Driving Licence'] },
        { category: 'Non-ECR Supporting Proof', name: 'Educational Qualification (Optional for ECNR)', description: 'Required for non-Emigration Check Required (ECR) category stamping.', is_mandatory: 0, accepted_options: ['Matriculation / 10th Class passing certificate or higher degree', 'Income Tax Returns proof of last 3 years', 'Proof of staying abroad for 3+ years'] }
      ],
      steps: [
        { step_number: 1, title: 'Register on Official Passport Seva Portal', description: 'Create an account on passportindia.gov.in. Choose your nearest Regional Passport Office (RPO) jurisdiction based on your current residential city.', location_type: 'Online', tip: 'Do not use third-party broker websites. Official portal is passportindia.gov.in only.' },
        { step_number: 2, title: 'Fill Online Application Form (Form 1)', description: 'Select "Apply for Fresh Passport / Re-issue" and carefully enter your personal details, parentage, spouse name, current address, and emergency contact.', location_type: 'Online', tip: 'Ensure spelling matches your Matriculation certificate and Aadhaar identically.' },
        { step_number: 3, title: 'Pay Application Fee & Schedule PSK Slot', description: 'Pay online via SBI ePay, Debit/Credit Card, or Internet Banking. Select your preferred Passport Seva Kendra (PSK) or Post Office PSK (POPSK) date and time slot.', location_type: 'Online', tip: 'Slots open daily at specific regional times (usually 11:00 AM or 3:00 PM depending on state).' },
        { step_number: 4, title: 'Visit Passport Seva Kendra (PSK) with Originals', description: 'Arrive 15 minutes before your scheduled appointment time. Carry ARN receipt, two sets of self-attested photocopies, and all original documents for physical biometric scanning and document counter verification (Counters A, B, and C).', location_type: 'Visit Center', tip: 'No personal paper photographs are needed for adults; photos are captured digitally in Counter A.' },
        { step_number: 5, title: 'Police Verification & Passport Dispatch', description: 'Your local police station will contact you to verify resident status. After clearance, the printed passport is securely dispatched via India Post Speed Post with SMS tracking.', location_type: 'Hybrid', tip: 'Keep original address documents and two references ready for the police officer visit.' }
      ],
      mistakes: [
        { mistake: 'Name or Initials Discrepancy with 10th Certificate', impact: 'Application placed on hold at Counter B; applicant referred to RPO main branch.', prevention: 'Ensure your First Name and Surname on the application match your 10th / School Leaving Certificate letter for letter.' },
        { mistake: 'Unregistered / Incomplete Address History (< 1 year)', impact: 'Police verification reports adverse remarks; penalty up to ₹5,000.', prevention: 'If you have lived at more than one address in the preceding 12 months, list all previous addresses in the history section.' },
        { mistake: 'Booking through fake/fraudulent intermediary domains', impact: 'Financial loss, stolen identity documents, and unissued appointment.', prevention: 'Only navigate to official https://passportindia.gov.in. Genuine government portals always end in .gov.in.' }
      ],
      faqs: [
        { question: 'Is physical photograph required to be carried to the PSK for adults?', answer: 'No. For all adult applicants, live digital photography and biometric fingerprints are captured at Counter A inside the Passport Seva Kendra.' },
        { question: 'What is the validity of an adult Indian passport?', answer: 'Standard adult passports are issued with 10 years of validity from the date of issue.' },
        { question: 'Can I apply for a passport under Tatkaal scheme without an Annexure verification certificate?', answer: 'Yes. Under revised guidelines, Tatkaal applications can be submitted with 3 accepted identity/address documents (e.g. Aadhaar, PAN, Voter ID) without needing a Class-1 officer Annexure verification certificate.' }
      ]
    },
    {
      id: 2,
      name: 'Aadhaar Card',
      slug: 'aadhaar',
      short_description: '12-digit unique biometric identity number issued by UIDAI for residents of India.',
      full_description: 'Aadhaar is a 12-digit individual identification number issued by the Unique Identification Authority of India (UIDAI) on behalf of the Government of India. It serves as proof of identity and proof of address anywhere in India. UIDAI offers services for new enrollment, mandatory biometric updates for children, demographic updates, and document verification.',
      category: 'Identity & Resident Records',
      eligibility: [
        'Must be a resident of India (resided in India for 182 days or more in the past 12 months)',
        'Available for all individuals regardless of age or gender (including newborns)',
        'Mandatory biometric update required for children upon reaching age 5 and age 15'
      ],
      official_website: 'https://uidai.gov.in',
      processing_fee: 'Free for Fresh Enrollment & Mandatory Child Biometric Update | ₹50 for Demographic Update | ₹100 for Biometric Update',
      processing_time: '15 to 30 days (Updates often reflect within 5-7 working days online)',
      issuing_authority: 'Unique Identification Authority of India (UIDAI), Ministry of Electronics & IT',
      icon: 'CreditCard',
      last_verified: '2026-08-01',
      important_notes: 'Always keep your mobile number linked with Aadhaar to access online OTP-based e-services and self-service address update portals.',
      documents: [
        { category: 'Proof of Identity (PoI)', name: 'Identity Verification Document', description: 'Document containing name and photograph of the resident.', is_mandatory: 1, accepted_options: ['Passport', 'PAN Card', 'Voter ID (EPIC)', 'Driving Licence', 'Ration Card / PDS Photo Card', 'Government Photo ID Card'] },
        { category: 'Proof of Address (PoA)', name: 'Residential Verification Document', description: 'Document validating residential address.', is_mandatory: 1, accepted_options: ['Electricity Bill (not older than 3 months)', 'Water Bill (not older than 3 months)', 'Bank Account Statement / Passbook with photo & stamp', 'Voter ID', 'Passport', 'Registered Rent Agreement'] },
        { category: 'Proof of Date of Birth (PoB)', name: 'Date of Birth Record', description: 'Document certifying legal date of birth.', is_mandatory: 1, accepted_options: ['Birth Certificate', 'SSLC / 10th Standard Passing Certificate', 'Passport', 'PAN Card'] },
        { category: 'Proof of Relationship (PoR)', name: 'Relationship Document (For Minor Enrollment)', description: 'Required when enrolling child with Head of Family (HoF).', is_mandatory: 0, accepted_options: ['Birth Certificate mentioning parents names', 'Ration Card', 'Passport of Parent'] }
      ],
      steps: [
        { step_number: 1, title: 'Locate Aadhaar Seva Kendra or Book Appointment Online', description: 'Visit myaadhaar.uidai.gov.in and click "Book an Appointment" to reserve a time slot at your nearest Aadhaar Seva Kendra (ASK) or authorized bank/post office branch.', location_type: 'Online', tip: 'Booking an appointment online eliminates waiting in walk-in queues.' },
        { step_number: 2, title: 'Prepare Original Documents & Enrolment Form', description: 'Fill out the Aadhaar Enrolment / Correction form. Keep original Proof of Identity, Address, and Date of Birth documents ready for physical scanning.', location_type: 'Offline', tip: 'Ensure spelling matches across your identity and address documents.' },
        { step_number: 3, title: 'Visit Enrollment Center for Biometric & Demographic Capture', description: 'Visit the Kendra on your appointment date. The operator captures 10 fingerprints, both iris scans, live photo, and scans original documents into the UIDAI system.', location_type: 'Visit Center', tip: 'Verify all typed details on the operator dual-screen before biometric sign-off.' },
        { step_number: 4, title: 'Collect Enrolment Slip (EID) with 28-digit Number', description: 'Obtain the physical printed acknowledgement receipt containing the 14-digit Enrolment ID and 14-digit timestamp.', location_type: 'Visit Center', tip: 'Store this slip securely; it is required to track status or download e-Aadhaar before card dispatch.' },
        { step_number: 5, title: 'Track Status & Download e-Aadhaar', description: 'Track processing status on myaadhaar.uidai.gov.in using your EID. Once generated, download password-protected e-Aadhaar PDF using OTP sent to registered mobile.', location_type: 'Online', tip: 'The password to open e-Aadhaar is FIRST 4 LETTERS OF NAME in CAPITAL + YEAR OF BIRTH.' }
      ],
      mistakes: [
        { mistake: 'Not linking an active mobile number during enrollment', impact: 'Cannot access online update portal, DigiLocker, or instant OTP verifications.', prevention: 'Always provide your own personal active mobile number to the enrollment operator.' },
        { mistake: 'Submitting unverified photocopy without showing original document', impact: 'Application rejected instantly by UIDAI backend validation.', prevention: 'Always carry original physical documents to the center. Operators only scan originals.' },
        { mistake: 'Ignoring mandatory biometric updates at age 5 and age 15', impact: 'Aadhaar becomes dormant and fails biometric authentication for scholarships/exams.', prevention: 'Children must undergo free biometric updates between ages 5-7 and ages 15-17.' }
      ],
      faqs: [
        { question: 'Is e-Aadhaar downloaded from UIDAI website equally valid as the physical PVC card?', answer: 'Yes. Under the Aadhaar Act, digital e-Aadhaar downloaded from uidai.gov.in is legally equivalent to the physical letter/card for all official purposes.' },
        { question: 'Can I update my residential address in Aadhaar online without visiting a center?', answer: 'Yes. If your mobile number is linked, you can submit an address update request on myaadhaar.uidai.gov.in by uploading a valid address proof or through Head of Family (HoF) consent.' },
        { question: 'Is new Aadhaar enrollment free of cost?', answer: 'Yes, fresh Aadhaar enrollment and mandatory child biometric updates at age 5 and 15 are 100% free at all authorized government centers.' }
      ]
    },
    {
      id: 3,
      name: 'PAN Card (Permanent Account Number)',
      slug: 'pan-card',
      short_description: '10-digit alphanumeric tax identifier issued by the Income Tax Department for financial transactions.',
      full_description: 'Permanent Account Number (PAN) is a unique 10-character alphanumeric identifier issued by the Income Tax Department of India. It serves as universal tax identification and is legally mandatory for opening bank accounts, filing tax returns, making investments, and conducting high-value financial transactions. Available via Instant e-PAN (paperless Aadhaar-based) or standard physical card application (Form 49A).',
      category: 'Taxation & Finance',
      eligibility: [
        'Any individual Indian citizen, minor, firm, or company',
        'Instant e-PAN requires a valid Aadhaar card with an active linked mobile number and age 18+',
        'Minors (under 18) can apply for PAN Card through parent/guardian representation (Form 49A)'
      ],
      official_website: 'https://www.incometax.gov.in',
      processing_fee: 'Free for Instant e-PAN (Digital PDF) | ₹107 (Physical Card in India) | ₹1,017 (Foreign dispatch)',
      processing_time: 'Instant (10 minutes for e-PAN) | 10 to 15 working days for physical card dispatch',
      issuing_authority: 'Income Tax Department, Ministry of Finance (Facilitated via Protean / UTIITSL)',
      icon: 'CreditCard',
      last_verified: '2026-08-01',
      important_notes: 'Instant e-PAN is 100% free of cost on incometax.gov.in. It carries the same legal validity as a laminated physical card.',
      documents: [
        { category: 'Proof of Identity (PoI)', name: 'Identity Document for PAN', description: 'Official proof validating applicant name and photo.', is_mandatory: 1, accepted_options: ['Aadhaar Card', 'Voter ID Card', 'Passport', 'Driving Licence', "Arm's Licence"] },
        { category: 'Proof of Address (PoA)', name: 'Residential Address Proof for PAN', description: 'Document confirming permanent residential address.', is_mandatory: 1, accepted_options: ['Aadhaar Card', 'Voter ID', 'Passport', 'Electricity / Landline / Broadband Bill (last 3 months)', 'Bank Account Statement (last 3 months)'] },
        { category: 'Proof of Date of Birth (PoB)', name: 'DOB Proof Document for PAN', description: 'Document establishing birth date.', is_mandatory: 1, accepted_options: ['Aadhaar Card', 'Birth Certificate', '10th Class Matriculation Certificate', 'Passport'] }
      ],
      steps: [
        { step_number: 1, title: 'Choose Application Route (Instant e-PAN vs Physical Card)', description: 'Option A: For 100% free instant paperless PAN in 10 minutes, visit incometax.gov.in e-Filing portal. Option B: For physical laminated plastic card, visit Protean (tin-nsdl.com) or UTIITSL portal (Form 49A).', location_type: 'Online', tip: 'If you only need PAN for bank KYC or internships, Instant e-PAN is generated immediately with zero fees.' },
        { step_number: 2, title: 'Submit Aadhaar OTP Authentication (Instant Route)', description: 'Enter your 12-digit Aadhaar number on the Income Tax e-Filing portal. Enter the 6-digit OTP received on your Aadhaar-linked mobile phone to validate identity.', location_type: 'Online', tip: 'Ensure your mobile phone is charged and active to receive the Aadhaar OTP within the 10-minute timer.' },
        { step_number: 3, title: 'Confirm Demographic Details & Generate PAN', description: 'The portal auto-fetches your Name, Date of Birth, Gender, Address, and Photograph directly from UIDAI database. Confirm details and submit request.', location_type: 'Online', tip: 'Verify that your surname and father name are correctly reflected.' },
        { step_number: 4, title: 'Download Digitally Signed e-PAN PDF', description: 'Check status within 10 minutes using your Aadhaar number. Download the digitally signed e-PAN PDF containing a verifiable QR code.', location_type: 'Online', tip: 'Password to open e-PAN PDF is your Date of Birth in DDMMYYYY format without slashes.' },
        { step_number: 5, title: 'Optional: Request Physical Reprint (₹50)', description: 'If you need a physical plastic laminated card later, visit the Protean/UTIITSL reprint portal, enter your newly generated PAN, pay ₹50, and it will be delivered by Speed Post.', location_type: 'Online', tip: 'Physical reprint requests take approximately 7-10 days for home delivery.' }
      ],
      mistakes: [
        { mistake: 'Applying for multiple PAN cards', impact: 'Possessing more than one PAN is illegal under Section 272B of Income Tax Act with penalty up to ₹10,000.', prevention: 'Never apply for a second PAN. If you lost your card, apply for Reprint/Duplicate of existing PAN.' },
        { mistake: 'Mismatch between Aadhaar and Matriculation details', impact: 'Instant e-PAN generation fails during UIDAI backend authentication.', prevention: 'Update your Aadhaar name/DOB first to match your educational certificates before generating PAN.' },
        { mistake: 'Paying ₹200–₹500 to unauthorized internet cafes for Instant e-PAN', impact: 'Unnecessary expense and exposure of private financial documents.', prevention: 'Instant e-PAN is completely free on official government portal incometax.gov.in.' }
      ],
      faqs: [
        { question: 'Is Instant e-PAN accepted for opening bank accounts and stock demat accounts?', answer: 'Yes. Digitally signed e-PAN issued by the Income Tax Department carries equal legal validity as the physical laminated card as per CBDT notifications.' },
        { question: 'Can a student under 18 years get a PAN Card?', answer: 'Yes, minors can apply for a PAN card under Form 49A with parent/guardian acting as representative assessee. Instant e-PAN requires age 18+.' },
        { question: 'Is Aadhaar-PAN linking mandatory?', answer: 'Yes, linking PAN with Aadhaar is legally mandatory for all individual taxpayers under the Income Tax Act.' }
      ]
    },
    {
      id: 4,
      name: 'Driving Licence (Learner & Permanent DL)',
      slug: 'driving-licence',
      short_description: 'Official permit to operate motor vehicles on public roads in India. Managed via MoRTH Sarathi portal.',
      full_description: 'A Driving Licence is an official document issued by state Regional Transport Offices (RTO) authorizing an individual to operate a motor vehicle on public roads. The process involves two phases: 1) Learner Licence (LL) test valid for 6 months, followed by 2) Practical driving skill test at RTO for Permanent Driving Licence (DL).',
      category: 'Transport & Licensing',
      eligibility: [
        'Age 16+ for Gearless 2-Wheeler (up to 50cc) with parent consent',
        'Age 18+ for Non-Transport light motor vehicles (Motorcycle with Gear & Car / LMV)',
        'Age 20+ for Commercial / Transport vehicles (minimum 1 year holding LMV licence)',
        'Must pass computerized traffic signals & road safety test for Learner Licence'
      ],
      official_website: 'https://parivahan.gov.in',
      processing_fee: '₹150 to ₹200 (Learner Licence) | ₹300 (DL Test) + ₹200 (Smart Card DL issuance)',
      processing_time: 'Same day for Learner Licence (Online) | 7 to 15 days for Permanent Smart Card DL post-test',
      issuing_authority: 'Regional Transport Offices (RTO), State Transport Departments / MoRTH',
      icon: 'Car',
      last_verified: '2026-08-01',
      important_notes: 'You can apply for Permanent DL after 30 days from Learner Licence issuance, and before expiry of 180 days (6 months).',
      documents: [
        { category: 'Proof of Age', name: 'Age Verification Document for DL', description: 'Document certifying minimum legal driving age.', is_mandatory: 1, accepted_options: ['10th Standard Matriculation Certificate', 'Birth Certificate', 'Passport', 'Aadhaar Card', 'PAN Card'] },
        { category: 'Proof of Address', name: 'Residential Address Proof for Local RTO', description: 'Valid proof establishing residence under chosen RTO jurisdiction.', is_mandatory: 1, accepted_options: ['Aadhaar Card', 'Voter ID (EPIC)', 'Passport', 'Current Electricity / Water Bill', 'Registered Rent Agreement'] },
        { category: 'Medical Fitness Declaration', name: 'Form 1 / Form 1A', description: 'Self-declaration of physical fitness or medical certificate.', is_mandatory: 1, accepted_options: ['Form 1 (Self-declaration for non-commercial applicants under 40)', 'Form 1A (Signed by registered MBBS Doctor for commercial or applicants above 40)'] },
        { category: 'Valid Learner Licence (LL)', name: 'Existing Learner Licence Number', description: 'Mandatory for booking Permanent DL driving skill test.', is_mandatory: 1, accepted_options: ['Active Learner Licence issued at least 30 days prior'] }
      ],
      steps: [
        { step_number: 1, title: 'Apply for Learner Licence on Sarathi Portal', description: 'Visit parivahan.gov.in -> Online Services -> Drivers/Learners Licence. Select your state and choose "Apply for Learner Licence".', location_type: 'Online', tip: 'Select Aadhaar Authentication mode for contact-less online LL test from home in eligible states.' },
        { step_number: 2, title: 'Complete Road Safety Tutorial & Online LL Test', description: 'Watch mandatory road safety educational video on Sarathi portal and take the computerized 15-question traffic signs test (Pass score: 60%+).', location_type: 'Online', tip: 'Revise traffic signs, road lane markings, and basic vehicle hand signals before starting.' },
        { step_number: 3, title: 'Download Form 3 Learner Licence (Valid for 6 Months)', description: 'Upon passing test, instantly download and print your Learner Licence (Form 3). You can now drive with a permanent DL holder beside you and "L" board displayed.', location_type: 'Online', tip: 'Learner Licence is valid across India for 180 days.' },
        { step_number: 4, title: 'Book Permanent DL Driving Test Slot (After 30 Days)', description: 'After minimum 30 days of holding LL, log in to Sarathi portal, select "Apply for Driving Licence", pay DL test fee (₹500 approx), and book an RTO test track slot.', location_type: 'Online', tip: 'Do not delay past 5 months; LL cannot be renewed once 180 days expire without re-testing.' },
        { step_number: 5, title: 'Appear for RTO Driving Test & Receive Smart Card', description: 'Bring your vehicle, active LL, insurance, PUC certificate, and original ID proofs to RTO test track. Demonstrate "H" track, "8" track, gradient start, and reverse parking.', location_type: 'Visit Center', tip: 'Always wear seatbelt/helmet, adjust mirrors, and use turn indicators during the RTO test.' }
      ],
      mistakes: [
        { mistake: 'Waiting past 180 days after LL issuance to book DL test', impact: 'Learner Licence lapses completely; applicant must pay fees and restart LL test from beginning.', prevention: 'Book your practical test slot on Sarathi as soon as the 30-day learning window completes.' },
        { mistake: 'Bringing vehicle with expired Insurance or PUC to RTO test', impact: 'Motor Vehicle Inspector disqualifies applicant from driving test on the spot.', prevention: 'Ensure vehicle used for test has valid Pollution Certificate (PUC), active Insurance, and matching class.' },
        { mistake: 'Failing to use turn indicators and mirror checks during RTO test', impact: 'Instant deduction of driving test points leading to test failure.', prevention: 'Exaggerate head movements for rear-view mirror checks and engage indicators 30 meters before turning.' }
      ],
      faqs: [
        { question: 'Can I take the Learner Licence test from home on mobile/computer?', answer: 'Yes. In states participating in the Aadhaar-based faceless scheme on sarathi.parivahan.gov.in, applicants with Aadhaar-linked mobile can take the online LL test from home.' },
        { question: 'What is the minimum gap required between Learner Licence and Permanent DL test?', answer: 'You must hold the Learner Licence for at least 30 continuous days before you become eligible to take the practical DL driving test.' },
        { question: 'Is a digital Driving Licence stored in DigiLocker or mParivahan legally accepted during traffic police checks?', answer: 'Yes. Digital Driving Licences and RC books in DigiLocker or mParivahan are legally recognized across India as per MoRTH notifications.' }
      ]
    },
    {
      id: 5,
      name: 'Voter ID Card (EPIC Registration)',
      slug: 'voter-id',
      short_description: 'Elector Photo Identity Card (EPIC) issued by Election Commission of India for voting rights.',
      full_description: 'The Elector Photo Identity Card (EPIC), commonly known as Voter ID, is an identity document issued by the Election Commission of India (ECI) to adult Indian citizens. It serves as primary proof of electoral franchise, citizenship, and residential address. Services include New Voter Registration (Form 6), Overseas Citizen Registration (Form 6A), and Correction/Shifting of Residence (Form 8).',
      category: 'Electoral & Citizenship',
      eligibility: [
        'Must be an Indian citizen',
        'Must be 18 years of age or older on the qualifying date (1st of Jan, April, July, or Oct)',
        'Must be ordinarily resident in the constituency/assembly area where applying',
        'Must not be disqualified as an elector under any law'
      ],
      official_website: 'https://voters.eci.gov.in',
      processing_fee: '100% Free of Cost (New Registration & Corrections)',
      processing_time: '15 to 30 days (Digital e-EPIC available immediately upon ERO approval)',
      issuing_authority: 'Election Commission of India (ECI) & State Chief Electoral Officers (CEO)',
      icon: 'FileCheck',
      last_verified: '2026-08-01',
      important_notes: 'Citizens turning 18 can now register in advance on four qualifying dates (Jan 1, Apr 1, Jul 1, Oct 1) on voters.eci.gov.in.',
      documents: [
        { category: 'Proof of Age', name: 'Age Proof Document for Voter ID', description: 'Document establishing age 18+ on qualifying date.', is_mandatory: 1, accepted_options: ['Birth Certificate', 'Aadhaar Card', 'PAN Card', 'Driving Licence', '10th / 12th CBSE/State Board Passing Certificate', 'Indian Passport'] },
        { category: 'Proof of Ordinary Residence', name: 'Current Residential Address Proof', description: 'Document validating your stay in the constituency.', is_mandatory: 1, accepted_options: ['Aadhaar Card', 'Water / Electricity / Gas Connection Bill (1 year)', 'Current Bank Passbook with address', 'Indian Passport', 'Registered Rent Agreement / Sale Deed'] },
        { category: 'Passport-size Photograph', name: 'Recent Color Photograph', description: 'White background passport photo for EPIC card.', is_mandatory: 1, accepted_options: ['Recent color photograph (4.5cm x 3.5cm) with frontal face view'] }
      ],
      steps: [
        { step_number: 1, title: 'Visit Official ECI Voters Service Portal', description: 'Go to voters.eci.gov.in (or download Voter Helpline Mobile App). Sign up using your mobile number and email.', location_type: 'Online', tip: 'Do not use unverified third-party voter portals. ECI official portal is voters.eci.gov.in.' },
        { step_number: 2, title: 'Fill Form 6 (New Voter Registration)', description: 'Select "Form 6 - Application for New Voters". Choose your State, District, and Parliamentary / Assembly Constituency.', location_type: 'Online', tip: 'Check which Assembly Constituency your street falls under before starting.' },
        { step_number: 3, title: 'Enter Personal Details & Upload Documents', description: 'Enter personal name, family member details, current residential address, and upload self-attested copies of Age Proof, Address Proof, and Photo.', location_type: 'Online', tip: 'Ensure the uploaded photo has a clear plain white background and is under 2MB.' },
        { step_number: 4, title: 'Submit Declaration & Note Reference Number', description: 'Review your entries, complete the legal declaration, and submit. You will receive an instant 12-character Reference ID via SMS to track your application.', location_type: 'Online', tip: 'Save the SMS Reference ID to check Booth Level Officer (BLO) verification status.' },
        { step_number: 5, title: 'BLO Field Verification & e-EPIC Download', description: 'Your assigned Booth Level Officer (BLO) may visit your residence to verify address. Once approved by Electoral Registration Officer (ERO), download your digital e-EPIC card instantly with photo and QR code.', location_type: 'Hybrid', tip: 'Digital e-EPIC can be downloaded instantly from the portal and carries 100% legal validity for voting.' }
      ],
      mistakes: [
        { mistake: 'Filling Form 6 when already registered in another constituency', impact: 'Dual enrollment in electoral roll is a punishable offense under Section 31 of Representation of the People Act 1950.', prevention: 'If shifting residence to a new house/city, use Form 8 (Shifting of Residence), never Form 6.' },
        { mistake: 'Entering wrong Assembly Constituency number', impact: 'Application forwarded to incorrect Electoral Registration Officer causing rejection.', prevention: 'Look up your polling booth or ask family members for the exact Assembly Constituency name.' },
        { mistake: 'Uploading blurred photograph or cropped selfie', impact: 'EPIC printed with unrecognized photo or rejected during administrative review.', prevention: 'Upload a clean, high-resolution passport-style photo with neutral expression.' }
      ],
      faqs: [
        { question: 'Is there any fee to apply for a Voter ID Card?', answer: 'No. Voter ID registration (Form 6) and correction (Form 8) are 100% free of cost on the ECI portal.' },
        { question: 'Can I vote if I have an e-EPIC digital copy on my mobile phone?', answer: 'Yes, as long as your name is listed on the active Electoral Roll, you can vote at your assigned polling booth showing your Voter ID or accepted alternative photo identity proofs (e.g. Aadhaar, Driving Licence, Passport).' },
        { question: 'What is the qualifying date for turning 18 to register as a voter?', answer: 'ECI has 4 qualifying dates every year: January 1, April 1, July 1, and October 1. You can submit advance applications in the quarter you turn 18.' }
      ]
    }
  ];

  for (const s of servicesData) {
    database.run(
      `INSERT INTO services (
        id, name, slug, short_description, full_description, category, eligibility,
        official_website, processing_fee, processing_time, issuing_authority, icon,
        last_verified, important_notes
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        s.id,
        s.name,
        s.slug,
        s.short_description,
        s.full_description,
        s.category,
        JSON.stringify(s.eligibility),
        s.official_website,
        s.processing_fee,
        s.processing_time,
        s.issuing_authority,
        s.icon,
        s.last_verified,
        s.important_notes
      ]
    );

    for (const doc of s.documents) {
      database.run(
        `INSERT INTO documents (service_id, category, name, description, is_mandatory, accepted_options)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [s.id, doc.category, doc.name, doc.description, doc.is_mandatory, JSON.stringify(doc.accepted_options)]
      );
    }

    for (const step of s.steps) {
      database.run(
        `INSERT INTO application_steps (service_id, step_number, title, description, location_type, tip)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [s.id, step.step_number, step.title, step.description, step.location_type, step.tip || null]
      );
    }

    for (const m of s.mistakes) {
      database.run(
        `INSERT INTO common_mistakes (service_id, mistake, impact, prevention)
         VALUES (?, ?, ?, ?)`,
        [s.id, m.mistake, m.impact, m.prevention]
      );
    }

    for (const f of s.faqs) {
      database.run(
        `INSERT INTO service_faqs (service_id, question, answer)
         VALUES (?, ?, ?)`,
        [s.id, f.question, f.answer]
      );
    }
  }

  // -------------------------------------------------------------
  // 2. SEED GOVERNMENT SCHEMES (WITH TRUST SYSTEM & 8 CATEGORIES)
  // -------------------------------------------------------------

  const schemesData = [
    // 1. Education & Students
    {
      name: 'Pudhumai Penn Scheme (Moovalur Ramamirtham Ammaiyar Higher Education Assurance)',
      slug: 'pudhumai-penn',
      category: 'Education & Students',
      department: 'Department of Social Welfare & Women Empowerment, Government of Tamil Nadu',
      state_or_central: 'Tamil Nadu State Government',
      benefit: '₹1,000 per month (Direct Benefit Transfer)',
      who_can_apply: 'Female students who studied Class 6 to 12 in Tamil Nadu Government schools and are pursuing higher education.',
      what_you_get: 'Monthly financial assistance of ₹1,000 deposited directly into the student\'s Aadhaar-linked bank account until completion of undergraduate degree, diploma, or ITI course.',
      eligibility: [
        'Permanent female resident / student of Tamil Nadu',
        'Studied continuously from Class 6 to 12 in Tamil Nadu Government Schools (including Model, Corporation, and Municipal schools)',
        'Actively enrolled in recognized Higher Education (Undergraduate Degree, Engineering, Medicine, Arts & Science, Diploma, or ITI)',
        'No household income ceiling limit applies'
      ],
      documents: [
        'Aadhaar Card of the female student',
        'Active Bank Account Passbook (Aadhaar-linked with NPCI DBT mapping)',
        'EMIS ID / Class 6 to 12 Government School Study Certificate',
        'College / Polytechnic / ITI Admission Proof & Bonafide Certificate'
      ],
      steps: [
        { step_number: 1, title: 'College Portal Enrollment (UMIS / Penkalvi)', description: 'During admission, student provides EMIS number to college nodal officer for verification on penkalvi.tn.gov.in portal.', location_type: 'Online' },
        { step_number: 2, title: 'Institutional & Aadhaar DBT Seeding Check', description: 'Department verifies government school study history and confirms Aadhaar-linked DBT bank account.', location_type: 'Online' },
        { step_number: 3, title: 'Monthly DBT Disbursement', description: 'Upon verification, ₹1,000 is credited monthly directly into the student\'s bank account.', location_type: 'Online' }
      ],
      status: 'VERIFIED',
      official_source: 'https://penkalvi.tn.gov.in',
      source_verified_authority: 'Department of Social Welfare & Women Empowerment, Government of Tamil Nadu',
      last_verified: '2026-08-14',
      effective_date: '2022-09-05',
      important_notes: 'Can be availed alongside other merit scholarships without restriction.',
      target_demographics: ['student', 'women', 'college', 'girl student', 'female student'],
      education_level: ['College', 'ITI / Polytechnic', 'Graduate'],
      min_age: 17,
      max_age: 26,
      gender: 'Female'
    },
    {
      name: 'Tamil Pudhalvan Scheme',
      slug: 'tamil-pudhalvan',
      category: 'Education & Students',
      department: 'Department of Higher Education, Government of Tamil Nadu',
      state_or_central: 'Tamil Nadu State Government',
      benefit: '₹1,000 per month (Direct Benefit Transfer)',
      who_can_apply: 'Male students who studied Class 6 to 12 in Tamil Nadu Government schools and are pursuing higher education.',
      what_you_get: 'Monthly financial assistance of ₹1,000 deposited directly into the student\'s Aadhaar-linked bank account to support college living, books, and study materials.',
      eligibility: [
        'Permanent male student of Tamil Nadu',
        'Studied continuously from Class 6 to 12 in Tamil Nadu Government Schools (including Tamil medium in aided schools)',
        'Actively enrolled in recognized Higher Education (Undergraduate Degree, Engineering, Medicine, Law, Arts & Science, Diploma, or ITI)',
        'Valid Aadhaar-seeded bank account in student\'s own name'
      ],
      documents: [
        'Aadhaar Card of the male student',
        'EMIS Number / School Study Certificate (Classes 6 to 12 Government School)',
        'College / Polytechnic / ITI Bonafide Certificate & Student ID Card',
        'Active Bank Account Passbook (Aadhaar linked for DBT)'
      ],
      steps: [
        { step_number: 1, title: 'College Portal Registration (UMIS)', description: 'Submit EMIS details and admission credentials to college scholarship desk.', location_type: 'Online' },
        { step_number: 2, title: 'Institutional & Aadhaar Verification', description: 'College verifies government school attendance records and confirms active bank DBT linkage.', location_type: 'Online' },
        { step_number: 3, title: 'Monthly DBT Disbursement', description: 'Monthly ₹1,000 is credited directly to the student\'s verified bank account.', location_type: 'Online' }
      ],
      status: 'VERIFIED',
      official_source: 'https://umis.tn.gov.in',
      source_verified_authority: 'Department of Higher Education, Government of Tamil Nadu',
      last_verified: '2026-08-14',
      effective_date: '2024-08-09',
      important_notes: 'Aadhaar seeding with bank account (NPCI mapping) is mandatory to receive DBT payments.',
      target_demographics: ['student', 'boy student', 'male student', 'youth', 'college'],
      education_level: ['College', 'ITI / Polytechnic', 'Graduate'],
      min_age: 17,
      max_age: 26,
      gender: 'Male'
    },
    {
      name: "Perunthalaivar Kamarajar Free Breakfast Scheme (Chief Minister's Breakfast Scheme)",
      slug: 'chief-ministers-breakfast-scheme',
      category: 'Education & Students',
      department: 'Social Welfare & Nutritious Meal Programme Department, Tamil Nadu',
      state_or_central: 'Tamil Nadu State Government',
      benefit: '100% Free Hot Nutritious Breakfast on all school working days',
      who_can_apply: 'All primary school children studying in Classes 1 to 5 in Government Schools across Tamil Nadu.',
      what_you_get: 'Free hot, nutritious freshly cooked breakfast (including Pongal, Rava Upma, Kichadi with Sambhar) served before morning classes to combat nutritional deficiency and improve school attendance.',
      eligibility: [
        'Enrolled in Class 1 to Class 5 in any Tamil Nadu Government Primary / Middle School',
        'No separate application or fee required; automatically covered upon school enrollment'
      ],
      documents: [
        'School Admission Record / Student EMIS Record (Handled by School Administration)'
      ],
      steps: [
        { step_number: 1, title: 'Automatic Enrollment', description: 'Every student enrolled in Classes 1-5 in government schools is registered automatically by the school headmaster.', location_type: 'Offline' },
        { step_number: 2, title: 'Daily Breakfast Serving', description: 'Hot breakfast prepared in centralized kitchens is served between 8:15 AM to 8:45 AM on all school working days.', location_type: 'Offline' }
      ],
      status: 'VERIFIED',
      official_source: 'https://cmbreakfast.tn.gov.in',
      source_verified_authority: 'Government of Tamil Nadu',
      last_verified: '2026-08-01',
      effective_date: '2022-09-15',
      important_notes: 'Expanded to all 31,000+ government primary schools across urban and rural Tamil Nadu.',
      target_demographics: ['student', 'child', 'parent', 'school student'],
      education_level: ['School'],
      min_age: 5,
      max_age: 11,
      gender: 'All'
    },
    {
      name: 'Free Student Bus Pass / Concessional Transport Scheme',
      slug: 'student-bus-pass-scheme',
      category: 'Education & Students',
      department: 'Transport Department, Government of Tamil Nadu',
      state_or_central: 'Tamil Nadu State Government',
      benefit: '100% Free Bus Travel between home and educational institution',
      who_can_apply: 'Students studying in recognized Schools, Government Arts/Science Colleges, Engineering Colleges, Polytechnics, and ITIs.',
      what_you_get: 'Smart card free bus pass enabling unlimited travel on Tamil Nadu State Transport Corporation (TNSTC) and MTC ordinary buses along the student\'s residential commute route.',
      eligibility: [
        'Regular full-time students in recognized educational institutions in Tamil Nadu',
        'Commuting distance between verified residence and school/college'
      ],
      documents: [
        'School/College Bonafide Certificate with institution stamp',
        'Proof of Residence (Ration card / Aadhaar card / Rental receipt)',
        'Passport-size photograph (2 copies)',
        'Duly filled Smart Card Bus Pass Application Form'
      ],
      steps: [
        { step_number: 1, title: 'Submit Form via School / College', description: 'Institution collects bus pass applications and verifies student residential route.', location_type: 'Offline' },
        { step_number: 2, title: 'TNSTC / MTC Processing', description: 'Transport corporation issues laminated smart bus passes with QR code directly through the institution.', location_type: 'Offline' },
        { step_number: 3, title: 'Concession During Issue', description: 'Students can travel free by showing school uniform/ID card until the plastic smart pass is distributed.', location_type: 'Offline' }
      ],
      status: 'VERIFIED',
      official_source: 'https://transport.tn.gov.in',
      source_verified_authority: 'Transport Department, Government of Tamil Nadu',
      last_verified: '2026-08-01',
      effective_date: '2021-06-01',
      important_notes: 'Valid for the entire academic year across all district transport divisions.',
      target_demographics: ['student', 'youth', 'school student', 'college student'],
      education_level: ['School', 'College', 'ITI / Polytechnic'],
      min_age: 6,
      max_age: 25,
      gender: 'All'
    },
    {
      name: 'Post-Matric Scholarship for SC / ST / SCC Students',
      slug: 'sc-st-post-matric-scholarship',
      category: 'Education & Students',
      department: 'Adi Dravidar and Tribal Welfare Department, Tamil Nadu & Ministry of Social Justice, GoI',
      state_or_central: 'Centrally Sponsored State Scheme',
      benefit: '100% Compulsory Tuition Fee waiver + Monthly Maintenance Allowance',
      who_can_apply: 'SC, ST, and Converted Christian (SCC) students pursuing post-matriculation courses (Class 11 to PhD).',
      what_you_get: 'Reimbursement of all non-refundable compulsory fees charged by recognized colleges/universities, plus monthly maintenance allowance up to ₹13,500/year for hostellers.',
      eligibility: [
        'Must belong to SC / ST / Converted Christian community of Tamil Nadu',
        'Annual family income must not exceed ₹2,50,000 per annum',
        'Pursuing recognized Post-Matric course (Higher Secondary, Degree, PG, Professional Courses)'
      ],
      documents: [
        'Community Certificate (Permanent / Digital Caste Certificate)',
        'Income Certificate issued by Revenue Authority / e-Sevai (validity within 1 year)',
        'Class 10 / 12 / previous semester marksheet',
        'Aadhaar Card linked to Bank Account',
        'College Fee Structure & Admission Receipt'
      ],
      steps: [
        { step_number: 1, title: 'Apply on TN Scholarship Portal', description: 'Register on tn.gov.in/scholarship portal or National Scholarship Portal (NSP).', location_type: 'Online' },
        { step_number: 2, title: 'Institutional Level Verification', description: 'College verification officer verifies caste and income credentials against revenue database.', location_type: 'Online' },
        { step_number: 3, title: 'Direct Benefit Credit', description: 'Tuition fees credited directly to institution/student account; maintenance allowance sent to student DBT account.', location_type: 'Online' }
      ],
      status: 'VERIFIED',
      official_source: 'https://scholarships.gov.in',
      source_verified_authority: 'Adi Dravidar and Tribal Welfare Department, TN',
      last_verified: '2026-08-01',
      effective_date: '2021-04-01',
      important_notes: 'Students studying in Government Quota seats in self-financing colleges are also eligible for fee concession.',
      target_demographics: ['student', 'college', 'sc/st', 'youth'],
      education_level: ['School', 'College', 'ITI / Polytechnic', 'Graduate'],
      income_limit_annual: 250000,
      gender: 'All'
    },

    // 2. Women & Family
    {
      name: 'Free Bus Travel for Women (Vidiyal Payanam Thittam)',
      slug: 'vidiyal-payanam-women-bus-travel',
      category: 'Women & Family',
      department: 'Transport Department, Government of Tamil Nadu',
      state_or_central: 'Tamil Nadu State Government',
      benefit: '100% Free Bus Travel on Ordinary Town Buses',
      who_can_apply: 'All women, transwomen, female students, and persons with disabilities.',
      what_you_get: 'Free travel across all government-operated state transport corporation (TNSTC/MTC) white-board ordinary town buses in Tamil Nadu with zero ticket fare.',
      eligibility: [
        'All women / female residents of Tamil Nadu (no age limit)',
        'Transgender women / persons',
        'Female students and working women',
        'Differently abled persons and accompanied escorts',
        'Applicable on all Ordinary Fare (White Board) Town / City Buses operated by State Transport Corporations'
      ],
      documents: [
        'No registration or ID pass required',
        'Zero-fare paper ticket issued directly by bus conductor on board for transit auditing'
      ],
      steps: [
        { step_number: 1, title: 'Board Ordinary Town Bus', description: 'Board any ordinary (white board / destination board) city or town government bus in Tamil Nadu.', location_type: 'Offline' },
        { step_number: 2, title: 'Receive Zero-Fare Passenger Ticket', description: 'Conductor issues a ₹0 ticket on board without requiring any document verification.', location_type: 'Offline' }
      ],
      status: 'ACTIVE',
      official_source: 'https://transport.tn.gov.in',
      source_verified_authority: 'Transport Department, Government of Tamil Nadu',
      last_verified: '2026-08-14',
      effective_date: '2021-05-08',
      important_notes: 'Valid exclusively on Ordinary (White Board) Town Buses. Not applicable on Deluxe, Express, or AC buses.',
      target_demographics: ['women', 'mother', 'female', 'senior citizen', 'student', 'transgender'],
      gender: 'Female'
    },
    {
      name: 'Kalaignar Magalir Urimai Thittam (Women Basic Income Entitlement)',
      slug: 'kalaignar-magalir-urimai-thittam',
      category: 'Women & Family',
      department: 'Special Programme Implementation Department & Revenue Administration, Tamil Nadu',
      state_or_central: 'Tamil Nadu State Government',
      benefit: '₹1,000 per month (Direct Benefit Transfer)',
      who_can_apply: 'Permanent female resident heads of families in Tamil Nadu meeting basic income and asset criteria.',
      what_you_get: 'Monthly basic income support of ₹1,000 deposited directly into the woman\'s bank account on the 15th of every month via DBT.',
      eligibility: [
        'Permanent female resident of Tamil Nadu aged 21 years or older',
        'Must be listed as the female head of family on the Smart Family Ration Card',
        'Household annual income must be under ₹2.5 Lakh (₹2,50,000 per annum)',
        'Landholding under 5 acres (wetland) or under 10 acres (dryland)',
        'Household annual electricity consumption under 3,600 units/year',
        'Family must not own a four-wheeler / car (except commercial livelihood vehicles like tractor/auto)'
      ],
      documents: [
        'Smart Family Ration Card (showing applicant as female head of family)',
        'Aadhaar Card of the female applicant',
        'Bank Account Passbook (Aadhaar linked with NPCI DBT enabled)',
        'Electricity Consumer Number (TANGEDCO billing receipt)'
      ],
      steps: [
        { step_number: 1, title: 'Application Submission via e-Sevai / Ration Camp', description: 'Apply at designated e-Sevai center or ration shop camp with biometric / OTP verification.', location_type: 'Offline' },
        { step_number: 2, title: 'Database & Field Verification', description: 'Automated verification against revenue, land registry, and TANGEDCO power consumption databases.', location_type: 'Online' },
        { step_number: 3, title: 'Monthly DBT Disbursement', description: '₹1,000 credited automatically to the Aadhaar-linked bank account on the 15th of every month with SMS notification.', location_type: 'Online' }
      ],
      status: 'VERIFIED',
      official_source: 'https://kmut.tn.gov.in',
      source_verified_authority: 'Revenue Administration & Special Programme Implementation Department, Tamil Nadu',
      last_verified: '2026-08-14',
      effective_date: '2023-09-15',
      important_notes: 'Only one eligible adult woman per Smart Ration Card can receive the monthly ₹1,000 entitlement.',
      target_demographics: ['women', 'mother', 'homemaker', 'head of family', 'female'],
      min_age: 21,
      max_age: 99,
      income_limit_annual: 250000,
      gender: 'Female'
    },
    {
      name: 'Moovalur Ramamirtham Ammaiyar Marriage Assistance (Annan Seer / Financial Assistance)',
      slug: 'marriage-assistance-scheme',
      category: 'Women & Family',
      department: 'Department of Social Welfare and Women Empowerment, Tamil Nadu',
      state_or_central: 'Tamil Nadu State Government',
      benefit: 'Financial Assistance up to ₹50,000 + 8 Grams (1 Sovereign) 22K Gold Coin for Thirumangalyam',
      who_can_apply: 'Poor brides from economically weaker sections pursuing marriage.',
      what_you_get: 'Scheme I: ₹25,000 cheque + 8g Gold coin for 10th pass brides. Scheme II: ₹50,000 cheque + 8g Gold coin for Degree / Diploma holders.',
      eligibility: [
        'Bride must be 18 years of age or older at marriage; Groom 21+ years',
        'Family annual income must not exceed ₹72,000 per annum',
        'Only one daughter per poor family can avail the financial grant'
      ],
      documents: [
        'Bride & Groom Age Proof (Birth Certificate / 10th Marksheet)',
        'Educational Qualification Marksheet / Degree Certificate',
        'Income Certificate from Tahsildar / e-Sevai (Income < ₹72,000)',
        'Wedding Invitation Card & Marriage Proof',
        'Community Certificate & Aadhaar Card'
      ],
      steps: [
        { step_number: 1, title: 'Submit Application via e-Sevai', description: 'Apply online through e-Sevai center at least 45 days prior to marriage or up to 2 days before wedding date.', location_type: 'Online' },
        { step_number: 2, title: 'Social Welfare Officer Field Audit', description: 'District Social Welfare Officer (DSWO) verifies family credentials and wedding date.', location_type: 'Offline' },
        { step_number: 3, title: 'Distribution of Gold Coin & Cheque', description: 'Beneficiary receives the official gold sovereign and electronic bank transfer.', location_type: 'Visit Center' }
      ],
      status: 'VERIFIED',
      official_source: 'https://www.tnsocialwelfare.tn.gov.in',
      source_verified_authority: 'Social Welfare Department, Government of Tamil Nadu',
      last_verified: '2026-08-01',
      effective_date: '2021-04-01',
      important_notes: 'Applications must be lodged prior to the wedding date with verified local marriage invitation.',
      target_demographics: ['women', 'bride', 'family'],
      min_age: 18,
      max_age: 35,
      income_limit_annual: 72000,
      gender: 'Female'
    },

    // 3. Employment & Skills
    {
      name: 'Naan Mudhalvan Skill Development Scheme',
      slug: 'naan-mudhalvan',
      category: 'Employment & Skills',
      department: 'Tamil Nadu Skill Development Corporation (TNSDC), Government of Tamil Nadu',
      state_or_central: 'Tamil Nadu State Government',
      benefit: 'Free Industry-Aligned Skill Certification & Career Mentorship',
      who_can_apply: 'College, University, Engineering, Polytechnic, and ITI students in Tamil Nadu.',
      what_you_get: '100% free access to high-demand technology, engineering, financial markets, and communication skill tracks integrated directly into college semester curricula with state placement support.',
      eligibility: [
        'Enrolled in recognized Higher Educational Institutions (Engineering, Arts & Science, ITI, Polytechnic, or State Universities) in Tamil Nadu',
        'Undergraduate and Postgraduate students across all academic years',
        'No restriction on family income or community'
      ],
      documents: [
        'College Student ID Card & Institutional EMIS / Roll Number',
        'Aadhaar Card'
      ],
      steps: [
        { step_number: 1, title: 'Portal Login via naanmudhalvan.tn.gov.in', description: 'Log in using your college institutional credentials / student registration number.', location_type: 'Online' },
        { step_number: 2, title: 'Select Industry Specialization Track', description: 'Choose from specialized emerging technology tracks (AI/ML, Cloud, Data Analytics, Electric Mobility, Cambridge English, Banking).', location_type: 'Online' },
        { step_number: 3, title: 'Coursework, Assessment & Placement Drives', description: 'Complete practical laboratory projects, earn verified certifications, and participate in state-level placement drives.', location_type: 'Hybrid' }
      ],
      status: 'ACTIVE',
      official_source: 'https://naanmudhalvan.tn.gov.in',
      source_verified_authority: 'Tamil Nadu Skill Development Corporation (TNSDC)',
      last_verified: '2026-08-14',
      effective_date: '2022-03-01',
      important_notes: 'Provides industry-aligned learning tracks in collaboration with global tech and industry partners.',
      target_demographics: ['student', 'job seeker', 'youth', 'college', 'engineering', 'polytechnic'],
      education_level: ['College', 'ITI / Polytechnic', 'Graduate'],
      min_age: 17,
      max_age: 28,
      gender: 'All'
    },
    {
      name: 'Pradhan Mantri Kaushal Vikas Yojana (PMKVY 4.0)',
      slug: 'pmkvy-skill-training',
      category: 'Employment & Skills',
      department: 'Ministry of Skill Development and Entrepreneurship (MSDE), Government of India',
      state_or_central: 'Central Government Scheme',
      benefit: 'Free Skill Training, National Skill Qualification Framework (NSQF) Certification & Assessment Allowance',
      who_can_apply: 'Unemployed youth, school/college dropouts, and job seekers seeking industry-recognized vocational certification.',
      what_you_get: 'Short-term training in 30+ sectors (Healthcare, Electronics, Logistics, IT, Construction) with government-funded assessment, certified credential, and placement assistance.',
      eligibility: [
        'Indian citizen aged 15 to 45 years',
        'School/college dropout or unemployed youth looking for formal skill certification',
        'Possess valid Aadhaar and bank account'
      ],
      documents: [
        'Aadhaar Card',
        'Educational Marksheet (8th / 10th / 12th as per job role)',
        'Bank Account Details',
        '2 Passport-size photographs'
      ],
      steps: [
        { step_number: 1, title: 'Find Training Center on Skill India Portal', description: 'Search accredited PMKVY training centers on skillindiadigital.gov.in.', location_type: 'Online' },
        { step_number: 2, title: 'Enroll in Selected Job Role', description: 'Undergo 200–400 hours of classroom and practical machine training.', location_type: 'Visit Center' },
        { step_number: 3, title: 'Assessment & Government Certificate', description: 'Third-party assessment agency conducts exam and issues Government of India Skill Certificate.', location_type: 'Visit Center' }
      ],
      status: 'VERIFIED',
      official_source: 'https://www.skillindiadigital.gov.in',
      source_verified_authority: 'National Skill Development Corporation (NSDC)',
      last_verified: '2026-08-01',
      effective_date: '2023-01-01',
      important_notes: 'Training and assessment are 100% free of charge; candidate receives a ₹500 reward on certification.',
      target_demographics: ['job seeker', 'youth', 'unemployed'],
      min_age: 15,
      max_age: 45,
      gender: 'All'
    },

    // 4. Differently Abled
    {
      name: 'Maintenance Allowance & UDID Welfare for Differently Abled Persons',
      slug: 'differently-abled-maintenance-allowance',
      category: 'Differently Abled',
      department: 'Welfare of Differently Abled Persons Department, Government of Tamil Nadu',
      state_or_central: 'Tamil Nadu State Government',
      benefit: '₹2,000 per month financial maintenance allowance + Free Assistive Devices',
      who_can_apply: 'Persons with 40%+ benchmark disability holding a valid National Disability Certificate (UDID).',
      what_you_get: 'Monthly maintenance pension of ₹2,000 disbursed via DBT, along with eligibility for free motorized tricycles, braille smart canes, hearing aids, and free travel passes.',
      eligibility: [
        'Disability benchmark of 40% or above (Locomotor, Visual, Hearing, Intellectual, Multiple Disabilities)',
        'Must possess Unique Disability ID (UDID) card / National Disability Certificate',
        'Resident of Tamil Nadu'
      ],
      documents: [
        'Unique Disability ID (UDID) Card / Medical Board Disability Certificate',
        'Aadhaar Card',
        'Ration Card / Proof of Address',
        'Bank Account Passbook (Aadhaar linked)'
      ],
      steps: [
        { step_number: 1, title: 'Apply on UDID Swavlamban Portal', description: 'Register on swavlambancard.gov.in and undergo hospital medical board assessment.', location_type: 'Online' },
        { step_number: 2, title: 'Submit Allowance Form at District DDAWO', description: 'Submit maintenance pension form at District Differently Abled Welfare Office.', location_type: 'Visit Center' },
        { step_number: 3, title: 'Monthly DBT Disbursal', description: '₹2,000 credited monthly directly to the bank account.', location_type: 'Online' }
      ],
      status: 'VERIFIED',
      official_source: 'https://www.swavlambancard.gov.in',
      source_verified_authority: 'Welfare of Differently Abled Persons Department, TN',
      last_verified: '2026-08-01',
      effective_date: '2023-01-01',
      important_notes: 'Severely disabled persons (75%+ disability) receive enhanced maintenance allowance of ₹2,000/month.',
      target_demographics: ['differently abled', 'divyangjan', 'pwd'],
      gender: 'All'
    },

    // 5. Senior Citizens
    {
      name: 'Indira Gandhi National Old Age Pension Scheme (IGNOAPS / OAP)',
      slug: 'old-age-pension-scheme',
      category: 'Senior Citizens',
      department: 'Revenue Administration, Disaster Management & Social Security, Government of Tamil Nadu',
      state_or_central: 'Centrally Sponsored State Implemented',
      benefit: '₹1,200 per month old age pension via direct bank transfer',
      who_can_apply: 'Destitute senior citizens aged 60 years or above belonging to Below Poverty Line (BPL) families.',
      what_you_get: 'Monthly financial assistance of ₹1,200 + free monthly supply of 20 kg rice through Public Distribution System (PDS) ration shops and 2 sets of free dhotis/sarees per year.',
      eligibility: [
        'Age 60 years or above',
        'Belonging to Below Poverty Line (BPL) household or destitute category',
        'No regular financial support from earning adult family members',
        'Resident of Tamil Nadu'
      ],
      documents: [
        'Aadhaar Card & Proof of Age (Birth Certificate / Voter ID / Medical Certificate)',
        'Smart Family Ration Card',
        'BPL Survey Record / Destitute Certificate from Village Administrative Officer (VAO)',
        'Bank / Post Office Savings Account Passbook'
      ],
      steps: [
        { step_number: 1, title: 'Apply at Local e-Sevai / Tahsildar Office', description: 'Submit Social Security Pension (SSP) application with age and BPL proofs.', location_type: 'Online' },
        { step_number: 2, title: 'Field Inquest by Revenue Inspector & VAO', description: 'Local revenue officers verify living condition and destitute status.', location_type: 'Offline' },
        { step_number: 3, title: 'Monthly Pension Sanction', description: 'Tahsildar issues Sanction Order; ₹1,200 deposited monthly directly to bank account.', location_type: 'Online' }
      ],
      status: 'VERIFIED',
      official_source: 'https://nsap.nic.in',
      source_verified_authority: 'Revenue Administration Department, TN',
      last_verified: '2026-08-01',
      effective_date: '2023-08-01',
      important_notes: 'Senior citizens aged 80+ receive enhanced state-supported allowance.',
      target_demographics: ['senior citizen', 'elderly', 'bpl', 'destitute'],
      min_age: 60,
      max_age: 120,
      gender: 'All'
    },

    // 6. Housing / Welfare
    {
      name: 'Kalaignar Kanavu Illam / Pradhan Mantri Awas Yojana (PMAY-Gramin)',
      slug: 'pm-awas-yojana-housing',
      category: 'Housing / Welfare',
      department: 'Rural Development & Panchayat Raj Department, Government of Tamil Nadu & MoHUA',
      state_or_central: 'Central & State Joint Housing Initiative',
      benefit: '₹3,50,000 financial grant for concrete pucca house construction',
      who_can_apply: 'Hut dwellers and homeless rural/urban poor families with no concrete pucca house.',
      what_you_get: 'Direct financial subsidy in 4 milestone-based installments for constructing a 360 sq.ft disaster-resilient concrete house with an individual household toilet and solar electrification.',
      eligibility: [
        'Family must not own any pucca (concrete) house anywhere in India',
        'Must possess own vacant land site or approved patta / rural house site allotment',
        'Listed in Socio-Economic Caste Census (SECC) / Awas+ rural beneficiary registry',
        'Annual household income below ₹3,00,000 for EWS category'
      ],
      documents: [
        'Aadhaar Card of Husband and Wife',
        'Smart Family Ration Card',
        'Land Ownership Document (Patta / Registered Sale Deed / Allotment Order)',
        'Bank Account Passbook (Aadhaar-linked for geo-tagged stage payments)',
        'MGNREGS Job Card Number'
      ],
      steps: [
        { step_number: 1, title: 'Beneficiary Selection by Grama Sabha', description: 'Panchayat verifies kutcha hut status through Awas+ mobile geo-tagging survey.', location_type: 'Offline' },
        { step_number: 2, title: 'Administrative Sanction Order', description: 'Block Development Officer (BDO) issues work order and house design blueprint.', location_type: 'Visit Center' },
        { step_number: 3, title: 'Stage-Wise DBT Fund Release', description: 'Payment disbursed in 4 stages (Basement, Lintel, Roof, Completion) based on geo-tagged photo audits.', location_type: 'Online' }
      ],
      status: 'VERIFIED',
      official_source: 'https://pmayg.nic.in',
      source_verified_authority: 'Rural Development & Panchayat Raj Dept, TN',
      last_verified: '2026-08-01',
      effective_date: '2024-02-15',
      important_notes: 'Beneficiary also receives 90 days of unskilled labor wages under MGNREGS (approx ₹25,000 extra) + ₹12,000 for toilet construction.',
      target_demographics: ['homeless', 'rural poor', 'family', 'bpl'],
      income_limit_annual: 300000,
      gender: 'All'
    },

    // 7. Livelihood
    {
      name: 'PM-KISAN Samman Nidhi (Farmer Income Support)',
      slug: 'pm-kisan-income-support',
      category: 'Livelihood',
      department: 'Department of Agriculture & Farmers Welfare, Ministry of Agriculture, GoI',
      state_or_central: 'Central Sector Scheme',
      benefit: '₹6,000 per year in 3 equal installments of ₹2,000 each',
      who_can_apply: 'Small and marginal landholder farmer families with cultivable land in their name.',
      what_you_get: 'Direct income support of ₹6,000 per year transferred into the farmer\'s bank account every 4 months (April-July, August-November, December-March) to procure agricultural inputs and seeds.',
      eligibility: [
        'Small and marginal farmer family with cultivable landholding in revenue records',
        'Land patta/chitta must be in the applicant farmer\'s name',
        'Institutional landholders, income-tax payers, and government employees are excluded'
      ],
      documents: [
        'Aadhaar Card',
        'Land Ownership Record (Patta / Chitta / Land Revenue Receipt)',
        'Active Bank Account Passbook (Aadhaar linked with NPCI e-KYC completed)'
      ],
      steps: [
        { step_number: 1, title: 'Online Registration on pmkisan.gov.in', description: 'Click "New Farmer Registration" and enter Aadhaar number and state land details.', location_type: 'Online' },
        { step_number: 2, title: 'Complete e-KYC via OTP / Biometric', description: 'Complete mandatory facial or Aadhaar OTP e-KYC on the portal.', location_type: 'Online' },
        { step_number: 3, title: 'Direct Benefit Credit', description: '₹2,000 installment credited directly to bank account every 4 months.', location_type: 'Online' }
      ],
      status: 'VERIFIED',
      official_source: 'https://pmkisan.gov.in',
      source_verified_authority: 'Ministry of Agriculture & Farmers Welfare, GoI',
      last_verified: '2026-08-01',
      effective_date: '2019-02-24',
      important_notes: 'Mandatory e-KYC and land seeding are required on the portal to receive ongoing quarterly installments.',
      target_demographics: ['farmer', 'agriculture', 'rural', 'livelihood'],
      gender: 'All'
    },
    {
      name: 'PM SVANidhi (Micro-Credit for Street Vendors)',
      slug: 'pm-svanidhi-street-vendors',
      category: 'Livelihood',
      department: 'Ministry of Housing and Urban Affairs (MoHUA), Government of India',
      state_or_central: 'Central Government Scheme',
      benefit: 'Collateral-free working capital loan: ₹10,000 (1st Tranche), ₹20,000 (2nd Tranche), ₹50,000 (3rd Tranche)',
      who_can_apply: 'Urban and peri-urban street vendors, hawkers, vegetable/fruit sellers, and tea stall owners.',
      what_you_get: 'Affordable working capital loans with 7% interest subsidy on timely repayment, plus cashback up to ₹1,200/year on digital UPI transactions.',
      eligibility: [
        'Street vendors engaged in vending on or before March 24, 2020',
        'Possessing Certificate of Vending / ID Card issued by Urban Local Body (Municipality/Corporation) or Letter of Recommendation (LoR)'
      ],
      documents: [
        'Aadhaar Card & Voter ID',
        'Vending Certificate / Urban Local Body Identity Card / Recommendation Letter',
        'Bank Account Passbook & Active UPI QR code'
      ],
      steps: [
        { step_number: 1, title: 'Apply on pmsvanidhi.mohua.gov.in', description: 'Enter mobile number and Vending ID / ULB survey number.', location_type: 'Online' },
        { step_number: 2, title: 'Bank Loan Sanction & Disbursal', description: 'Scheduled Commercial Bank / MFI sanctions collateral-free ₹10,000 loan.', location_type: 'Online' },
        { step_number: 3, title: 'Repayment & Upgrade to ₹20,000 / ₹50,000', description: 'On timely 12-month EMI repayment, upgrade automatically to ₹20,000 and ₹50,000 loans with 7% interest cashback.', location_type: 'Online' }
      ],
      status: 'VERIFIED',
      official_source: 'https://pmsvanidhi.mohua.gov.in',
      source_verified_authority: 'Ministry of Housing and Urban Affairs, GoI',
      last_verified: '2026-08-01',
      effective_date: '2020-06-01',
      important_notes: 'No collateral required. Timely digital repayment earns 7% annual interest subsidy deposited directly to savings account.',
      target_demographics: ['street vendor', 'hawker', 'small business', 'livelihood'],
      gender: 'All'
    },

    // 8. Other Government Schemes
    {
      name: 'Aran & Aran Illam Transgender Welfare Support',
      slug: 'transgender-welfare-aran-scheme',
      category: 'Other Government Schemes',
      department: 'Tamil Nadu Transgender Welfare Board, Social Welfare Department',
      state_or_central: 'Tamil Nadu State Government',
      benefit: 'Monthly Pension of ₹1,500 + Free Housing Site & ₹50,000 Self-Employment Grant',
      who_can_apply: 'Transgender persons holding identity cards issued by the Tamil Nadu Transgender Welfare Board.',
      what_you_get: 'Monthly financial assistance, free house site patta, subsidized self-employment livelihood grant of ₹50,000 for starting small businesses, and 100% free gender-affirming medical support.',
      eligibility: [
        'Transgender person registered with the Tamil Nadu Transgender Welfare Board',
        'Age 40+ years for destitute pension (or any age for self-employment grant)',
        'Resident of Tamil Nadu'
      ],
      documents: [
        'Transgender ID Card issued by Transgender Welfare Board / National Portal TG Certificate',
        'Aadhaar Card',
        'Bank Account Passbook (Aadhaar linked)',
        'Ration Card / Residential proof'
      ],
      steps: [
        { step_number: 1, title: 'Register with Transgender Welfare Board', description: 'Apply on transgender.gov.in or district social welfare office for official TG ID card.', location_type: 'Online' },
        { step_number: 2, title: 'Apply for Pension / Livelihood Subsidy', description: 'Submit application at District Social Welfare Office (DSWO) in Collectorate.', location_type: 'Visit Center' },
        { step_number: 3, title: 'DBT Credit & Housing Site Sanction', description: 'Monthly pension and self-employment subsidy disbursed through bank account.', location_type: 'Online' }
      ],
      status: 'VERIFIED',
      official_source: 'https://transgender.gov.in',
      source_verified_authority: 'Social Welfare & Women Empowerment Dept, TN',
      last_verified: '2026-08-01',
      effective_date: '2021-06-01',
      important_notes: 'Tamil Nadu was the pioneer state in India to establish a dedicated Transgender Welfare Board.',
      target_demographics: ['transgender', 'transwoman', 'transman', 'other'],
      gender: 'Transgender'
    }
  ];

  for (const s of schemesData) {
    database.run(
      `INSERT INTO schemes (
        name, slug, category, department, state_or_central, benefit, who_can_apply, what_you_get,
        eligibility, documents, application_steps, status, official_source,
        source_verified_authority, last_verified, effective_date, important_notes,
        target_demographics, education_level, min_age, max_age, income_limit_annual, gender
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        s.name,
        s.slug,
        s.category,
        s.department,
        s.state_or_central,
        s.benefit,
        s.who_can_apply,
        s.what_you_get,
        JSON.stringify(s.eligibility),
        JSON.stringify(s.documents),
        JSON.stringify(s.steps),
        s.status,
        s.official_source,
        s.source_verified_authority,
        s.last_verified,
        s.effective_date || null,
        s.important_notes || null,
        JSON.stringify(s.target_demographics),
        s.education_level ? JSON.stringify(s.education_level) : null,
        s.min_age !== undefined ? s.min_age : null,
        s.max_age !== undefined ? s.max_age : null,
        s.income_limit_annual !== undefined ? s.income_limit_annual : null,
        s.gender || 'All'
      ]
    );
  }

  // -------------------------------------------------------------
  // 3. SEED OFFICIAL SOURCES
  // -------------------------------------------------------------
  const sourcesData = [
    { id: 'src-passport', url: 'https://passportindia.gov.in', domain: 'passportindia.gov.in', title: 'Passport Seva Portal', government_department: 'Consular, Passport and Visa (CPV) Division, MEA', source_type: 'Central Government Portal', verification_status: 'VERIFIED', last_verified: '2026-08-14', associated_slug: 'passport' },
    { id: 'src-aadhaar', url: 'https://uidai.gov.in', domain: 'uidai.gov.in', title: 'Unique Identification Authority of India (UIDAI)', government_department: 'Ministry of Electronics & Information Technology (MeitY)', source_type: 'Statutory Authority', verification_status: 'VERIFIED', last_verified: '2026-08-14', associated_slug: 'aadhaar' },
    { id: 'src-pan', url: 'https://incometax.gov.in', domain: 'incometax.gov.in', title: 'Income Tax e-Filing Portal', government_department: 'Central Board of Direct Taxes (CBDT), Ministry of Finance', source_type: 'Central Government Department', verification_status: 'VERIFIED', last_verified: '2026-08-14', associated_slug: 'pan-card' },
    { id: 'src-dl', url: 'https://parivahan.gov.in', domain: 'parivahan.gov.in', title: 'Sarathi Parivahan Citizen Portal', government_department: 'Ministry of Road Transport and Highways (MoRTH)', source_type: 'Central Government Portal', verification_status: 'VERIFIED', last_verified: '2026-08-14', associated_slug: 'driving-licence' },
    { id: 'src-voter', url: 'https://voters.eci.gov.in', domain: 'voters.eci.gov.in', title: 'Voter Services Portal', government_department: 'Election Commission of India (ECI)', source_type: 'Constitutional Body', verification_status: 'VERIFIED', last_verified: '2026-08-14', associated_slug: 'voter-id' },
    { id: 'src-pudhumai', url: 'https://penkalvi.tn.gov.in', domain: 'penkalvi.tn.gov.in', title: 'Pudhumai Penn / Moovalur Portal', government_department: 'Department of Social Welfare & Women Empowerment, Government of Tamil Nadu', source_type: 'State Government Portal', verification_status: 'VERIFIED', last_verified: '2026-08-14', associated_slug: 'pudhumai-penn' },
    { id: 'src-pudhalvan', url: 'https://umis.tn.gov.in', domain: 'umis.tn.gov.in', title: 'Tamil Pudhalvan Higher Education Portal', government_department: 'Department of Higher Education, Government of Tamil Nadu', source_type: 'State Government Portal', verification_status: 'VERIFIED', last_verified: '2026-08-14', associated_slug: 'tamil-pudhalvan' },
    { id: 'src-kmut', url: 'https://kmut.tn.gov.in', domain: 'kmut.tn.gov.in', title: 'Kalaignar Magalir Urimai Thittam', government_department: 'Special Programme Implementation Department, Tamil Nadu', source_type: 'State Government Portal', verification_status: 'VERIFIED', last_verified: '2026-08-14', associated_slug: 'kalaignar-magalir-urimai-thittam' },
    { id: 'src-vidiyal', url: 'https://transport.tn.gov.in', domain: 'transport.tn.gov.in', title: 'Tamil Nadu Transport Department', government_department: 'Transport Department, Government of Tamil Nadu', source_type: 'State Government Department', verification_status: 'ACTIVE', last_verified: '2026-08-14', associated_slug: 'vidiyal-payanam-women-bus-travel' },
    { id: 'src-naanmudhalvan', url: 'https://naanmudhalvan.tn.gov.in', domain: 'naanmudhalvan.tn.gov.in', title: 'Naan Mudhalvan Skill Portal', government_department: 'Tamil Nadu Skill Development Corporation (TNSDC)', source_type: 'State Skill Portal', verification_status: 'ACTIVE', last_verified: '2026-08-14', associated_slug: 'naan-mudhalvan' },
    { id: 'src-pmkisan', url: 'https://pmkisan.gov.in', domain: 'pmkisan.gov.in', title: 'PM-KISAN Samman Nidhi Portal', government_department: 'Ministry of Agriculture and Farmers Welfare, GoI', source_type: 'National Welfare Portal', verification_status: 'VERIFIED', last_verified: '2026-08-14', associated_slug: 'pm-kisan-income-support' },
    { id: 'src-oap', url: 'https://nsap.nic.in', domain: 'nsap.nic.in', title: 'National Social Assistance Programme (NSAP)', government_department: 'Ministry of Rural Development & Social Welfare TN', source_type: 'National Portal', verification_status: 'VERIFIED', last_verified: '2026-08-14', associated_slug: 'old-age-pension-scheme' },
    { id: 'src-housing', url: 'https://pmayg.nic.in', domain: 'pmayg.nic.in', title: 'Pradhan Mantri Awas Yojana - Gramin', government_department: 'Ministry of Rural Development & RDPR TN', source_type: 'National Housing Portal', verification_status: 'VERIFIED', last_verified: '2026-08-14', associated_slug: 'pm-awas-yojana-housing' },
    { id: 'src-disability', url: 'https://swims.tn.gov.in', domain: 'swims.tn.gov.in', title: 'Differently Abled Welfare Board', government_department: 'Welfare of Differently Abled Persons Department, TN', source_type: 'State Welfare Portal', verification_status: 'VERIFIED', last_verified: '2026-08-14', associated_slug: 'differently-abled-maintenance-allowance' }
  ];

  for (const src of sourcesData) {
    database.run(
      `INSERT INTO sources (id, url, domain, title, government_department, source_type, verification_status, last_verified, associated_slug)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [src.id, src.url, src.domain, src.title, src.government_department, src.source_type, src.verification_status, src.last_verified, src.associated_slug]
    );
  }
}

// -------------------------------------------------------------
// HELPER QUERY FUNCTIONS FOR SERVICES
// -------------------------------------------------------------

export async function getAllServices(): Promise<GovernmentService[]> {
  const database = await getDatabase();
  const stmt = database.prepare(`
    SELECT id, name, slug, short_description, full_description, category, eligibility,
           official_website, processing_fee, processing_time, issuing_authority, icon,
           last_verified, important_notes
    FROM services
    ORDER BY id ASC
  `);

  const results: GovernmentService[] = [];
  while (stmt.step()) {
    const row = stmt.get();
    const cols = stmt.getColumnNames();
    const obj: any = {};
    cols.forEach((col, idx) => {
      obj[col] = row[idx];
    });
    results.push({
      ...obj,
      overview: obj.full_description,
      processing_information: `${obj.processing_fee}. ${obj.processing_time}`,
      eligibility: JSON.parse(obj.eligibility || '[]')
    });
  }
  stmt.free();
  return results;
}

export async function getServiceBySlug(slug: string): Promise<GovernmentService | null> {
  const database = await getDatabase();
  const stmt = database.prepare(`
    SELECT id, name, slug, short_description, full_description, category, eligibility,
           official_website, processing_fee, processing_time, issuing_authority, icon,
           last_verified, important_notes
    FROM services
    WHERE slug = ?
    LIMIT 1
  `);
  stmt.bind([slug]);

  if (!stmt.step()) {
    stmt.free();
    return null;
  }

  const row = stmt.get();
  const columns = stmt.getColumnNames();
  stmt.free();

  const serviceObj: any = {};
  columns.forEach((col, idx) => {
    serviceObj[col] = row[idx];
  });

  const serviceId = serviceObj.id;

  // Documents
  const docStmt = database.prepare(`
    SELECT id, service_id, category, name, description, is_mandatory, accepted_options
    FROM documents
    WHERE service_id = ?
    ORDER BY id ASC
  `);
  docStmt.bind([serviceId]);
  const documents: DocumentRequirement[] = [];
  while (docStmt.step()) {
    const dRow = docStmt.get();
    const dCols = docStmt.getColumnNames();
    const dObj: any = {};
    dCols.forEach((c, i) => {
      dObj[c] = dRow[i];
    });
    documents.push({
      id: dObj.id,
      service_id: dObj.service_id,
      category: dObj.category,
      name: dObj.name,
      description: dObj.description,
      is_mandatory: Boolean(dObj.is_mandatory),
      accepted_options: JSON.parse(dObj.accepted_options || '[]')
    });
  }
  docStmt.free();

  // Steps
  const stepStmt = database.prepare(`
    SELECT id, service_id, step_number, title, description, location_type, tip
    FROM application_steps
    WHERE service_id = ?
    ORDER BY step_number ASC
  `);
  stepStmt.bind([serviceId]);
  const steps: ApplicationStep[] = [];
  while (stepStmt.step()) {
    const sRow = stepStmt.get();
    const sCols = stepStmt.getColumnNames();
    const sObj: any = {};
    sCols.forEach((c, i) => {
      sObj[c] = sRow[i];
    });
    steps.push({
      id: sObj.id,
      service_id: sObj.service_id,
      step_number: sObj.step_number,
      title: sObj.title,
      description: sObj.description,
      location_type: sObj.location_type as any,
      tip: sObj.tip || undefined
    });
  }
  stepStmt.free();

  // Mistakes
  const mistakeStmt = database.prepare(`
    SELECT id, service_id, mistake, impact, prevention
    FROM common_mistakes
    WHERE service_id = ?
    ORDER BY id ASC
  `);
  mistakeStmt.bind([serviceId]);
  const mistakes: CommonMistake[] = [];
  while (mistakeStmt.step()) {
    const mRow = mistakeStmt.get();
    const mCols = mistakeStmt.getColumnNames();
    const mObj: any = {};
    mCols.forEach((c, i) => {
      mObj[c] = mRow[i];
    });
    mistakes.push({
      id: mObj.id,
      service_id: mObj.service_id,
      mistake: mObj.mistake,
      impact: mObj.impact,
      prevention: mObj.prevention
    });
  }
  mistakeStmt.free();

  // FAQs
  const faqStmt = database.prepare(`
    SELECT id, service_id, question, answer
    FROM service_faqs
    WHERE service_id = ?
    ORDER BY id ASC
  `);
  faqStmt.bind([serviceId]);
  const faqs: ServiceFAQ[] = [];
  while (faqStmt.step()) {
    const fRow = faqStmt.get();
    const fCols = faqStmt.getColumnNames();
    const fObj: any = {};
    fCols.forEach((c, i) => {
      fObj[c] = fRow[i];
    });
    faqs.push({
      id: fObj.id,
      service_id: fObj.service_id,
      question: fObj.question,
      answer: fObj.answer
    });
  }
  faqStmt.free();

  return {
    ...serviceObj,
    overview: serviceObj.full_description,
    processing_information: `${serviceObj.processing_fee}. ${serviceObj.processing_time}`,
    eligibility: JSON.parse(serviceObj.eligibility || '[]'),
    documents,
    steps,
    mistakes,
    faqs
  };
}

// -------------------------------------------------------------
// HELPER QUERY FUNCTIONS FOR GOVERNMENT SCHEMES
// -------------------------------------------------------------

function mapSchemeRow(columns: string[], row: any[]): GovernmentScheme {
  const obj: any = {};
  columns.forEach((col, idx) => {
    obj[col] = row[idx];
  });

  return {
    id: obj.id,
    name: obj.name,
    slug: obj.slug,
    category: obj.category,
    department: obj.department,
    state_or_central: obj.state_or_central,
    benefit: obj.benefit,
    who_can_apply: obj.who_can_apply,
    what_you_get: obj.what_you_get,
    eligibility: JSON.parse(obj.eligibility || '[]'),
    documents: JSON.parse(obj.documents || '[]'),
    application_steps: JSON.parse(obj.application_steps || '[]'),
    status: obj.status,
    official_source: obj.official_source,
    source_verified_authority: obj.source_verified_authority,
    last_verified: obj.last_verified,
    effective_date: obj.effective_date || undefined,
    important_notes: obj.important_notes || undefined,
    target_demographics: JSON.parse(obj.target_demographics || '[]'),
    education_level: obj.education_level ? JSON.parse(obj.education_level) : undefined,
    min_age: obj.min_age !== null && obj.min_age !== undefined ? obj.min_age : undefined,
    max_age: obj.max_age !== null && obj.max_age !== undefined ? obj.max_age : undefined,
    income_limit_annual: obj.income_limit_annual !== null && obj.income_limit_annual !== undefined ? obj.income_limit_annual : undefined,
    gender: obj.gender || 'All'
  };
}

export async function getAllSchemes(category?: string, status?: string): Promise<GovernmentScheme[]> {
  const database = await getDatabase();
  let query = `SELECT * FROM schemes WHERE 1=1`;
  const params: any[] = [];

  if (category && category.trim()) {
    query += ` AND category = ?`;
    params.push(category.trim());
  }
  if (status && status.trim()) {
    query += ` AND status = ?`;
    params.push(status.trim());
  }

  query += ` ORDER BY id ASC`;

  const stmt = database.prepare(query);
  stmt.bind(params);
  const results: GovernmentScheme[] = [];
  while (stmt.step()) {
    const row = stmt.get();
    const cols = stmt.getColumnNames();
    results.push(mapSchemeRow(cols, row));
  }
  stmt.free();
  return results;
}

export async function getSchemeBySlug(slug: string): Promise<GovernmentScheme | null> {
  const database = await getDatabase();
  const stmt = database.prepare(`SELECT * FROM schemes WHERE slug = ? LIMIT 1`);
  stmt.bind([slug]);

  let result: GovernmentScheme | null = null;
  if (stmt.step()) {
    result = mapSchemeRow(stmt.getColumnNames(), stmt.get());
  }
  stmt.free();
  return result;
}

export async function findSchemesForCitizen(profile: CitizenProfile): Promise<SchemeMatchResult[]> {
  const allSchemes = await getAllSchemes();
  const results: SchemeMatchResult[] = [];

  for (const scheme of allSchemes) {
    let matchScore = 0;
    const matchReasons: string[] = [];

    // 1. Age Filter
    if (profile.age !== undefined) {
      if (scheme.min_age !== undefined && profile.age < scheme.min_age) {
        continue;
      }
      if (scheme.max_age !== undefined && profile.age > scheme.max_age) {
        continue;
      }
      if (scheme.min_age !== undefined || scheme.max_age !== undefined) {
        matchScore += 10;
        matchReasons.push(`Matches your age group (${scheme.min_age || 0} to ${scheme.max_age || 'Any'} years)`);
      }
    }

    // 2. Gender Filter
    if (profile.gender && scheme.gender && scheme.gender !== 'All') {
      if (profile.gender.toLowerCase() === scheme.gender.toLowerCase()) {
        matchScore += 20;
        matchReasons.push(`Specifically intended for ${scheme.gender} citizens`);
      } else {
        // Mismatched specific gender
        continue;
      }
    }

    // 3. User Type / Target Demographics Matching
    if (profile.user_type) {
      const userTypeLower = profile.user_type.toLowerCase();
      const hasDemographicMatch = scheme.target_demographics.some((d) =>
        userTypeLower.includes(d.toLowerCase()) || d.toLowerCase().includes(userTypeLower)
      );

      if (hasDemographicMatch) {
        matchScore += 30;
        matchReasons.push(`Designed for ${profile.user_type}`);
      }
    }

    // 4. Differently Abled Special Match
    if (profile.is_differently_abled) {
      if (scheme.category === 'Differently Abled' || scheme.target_demographics.includes('differently abled') || scheme.target_demographics.includes('divyangjan')) {
        matchScore += 40;
        matchReasons.push('Exclusive welfare benefit for Differently Abled (Divyangjan) citizens');
      }
    }

    // 5. Education Level Matching
    if (profile.education_level && scheme.education_level) {
      if (scheme.education_level.includes(profile.education_level) || scheme.education_level.includes('All')) {
        matchScore += 15;
        matchReasons.push(`Applicable for ${profile.education_level} education level`);
      }
    }

    // 6. Annual Income Threshold Check
    if (profile.annual_income !== undefined && scheme.income_limit_annual !== undefined) {
      if (profile.annual_income <= scheme.income_limit_annual) {
        matchScore += 15;
        matchReasons.push(`Meets income criteria (Under ₹${scheme.income_limit_annual.toLocaleString('en-IN')}/year)`);
      } else {
        // Exceeds strict ceiling
        continue;
      }
    }

    // 7. Category Interest Matching
    if (profile.category_interest && scheme.category === profile.category_interest) {
      matchScore += 20;
      matchReasons.push(`Matches your interest in ${scheme.category}`);
    }

    if (matchScore > 0) {
      results.push({
        scheme,
        matchScore,
        matchReasons: matchReasons.length > 0 ? matchReasons : ['General public welfare entitlement'],
        disclaimer: 'You may be eligible based on the information provided. Please verify the current official requirements on the designated official government portal.'
      });
    }
  }

  // Sort descending by match score
  results.sort((a, b) => b.matchScore - a.matchScore);
  return results;
}

// -------------------------------------------------------------
// UNIFIED SEARCH (SERVICES + SCHEMES)
// -------------------------------------------------------------

export async function searchServices(query: string): Promise<GovernmentService[]> {
  const database = await getDatabase();
  const q = `%${query.toLowerCase()}%`;
  const stmt = database.prepare(`
    SELECT id, name, slug, short_description, full_description, category, eligibility,
           official_website, processing_fee, processing_time, issuing_authority, icon,
           last_verified, important_notes
    FROM services
    WHERE LOWER(name) LIKE ?
       OR LOWER(short_description) LIKE ?
       OR LOWER(full_description) LIKE ?
       OR LOWER(category) LIKE ?
    ORDER BY id ASC
  `);
  stmt.bind([q, q, q, q]);

  const results: GovernmentService[] = [];
  while (stmt.step()) {
    const row = stmt.get();
    const cols = stmt.getColumnNames();
    const obj: any = {};
    cols.forEach((col, idx) => {
      obj[col] = row[idx];
    });
    results.push({
      ...obj,
      overview: obj.full_description,
      processing_information: `${obj.processing_fee}. ${obj.processing_time}`,
      eligibility: JSON.parse(obj.eligibility || '[]')
    });
  }
  stmt.free();
  return results;
}

export async function searchUnified(query: string): Promise<{
  services: GovernmentService[];
  schemes: GovernmentScheme[];
}> {
  const database = await getDatabase();
  const q = `%${query.toLowerCase()}%`;

  const services = await searchServices(query);

  const stmt = database.prepare(`
    SELECT * FROM schemes
    WHERE LOWER(name) LIKE ?
       OR LOWER(category) LIKE ?
       OR LOWER(benefit) LIKE ?
       OR LOWER(who_can_apply) LIKE ?
       OR LOWER(what_you_get) LIKE ?
       OR LOWER(department) LIKE ?
    ORDER BY id ASC
  `);
  stmt.bind([q, q, q, q, q, q]);

  const schemes: GovernmentScheme[] = [];
  while (stmt.step()) {
    const row = stmt.get();
    const cols = stmt.getColumnNames();
    schemes.push(mapSchemeRow(cols, row));
  }
  stmt.free();

  return { services, schemes };
}

// -------------------------------------------------------------
// SCHEME CATEGORIES WITH ACCURATE COUNTS
// -------------------------------------------------------------

export async function getSchemeCategoriesWithCounts(): Promise<SchemeCategoryCount[]> {
  const database = await getDatabase();
  const allCategories: { category: SchemeCategory; description: string; icon: string }[] = [
    { category: 'Education & Students', description: 'Scholarships, higher education assistance, free travel passes & meal support', icon: 'GraduationCap' },
    { category: 'Women & Family', description: 'Basic income rights, marriage welfare aid, free bus transport & nutrition', icon: 'HeartHandshake' },
    { category: 'Employment & Skills', description: 'Skill certification, campus career tracks & apprenticeship programs', icon: 'Briefcase' },
    { category: 'Differently Abled', description: 'Monthly disability maintenance allowance, assistive devices & travel concessions', icon: 'Accessibility' },
    { category: 'Senior Citizens', description: 'Monthly old age security pensions, subsidized ration & health care support', icon: 'Users' },
    { category: 'Housing / Welfare', description: 'Rural & urban housing construction subsidies, sanitation & pucca house grants', icon: 'Home' },
    { category: 'Livelihood', description: 'Direct income support for farmers, street vendors & micro-entrepreneur credit', icon: 'Coins' },
    { category: 'Other Government Schemes', description: 'Transgender social welfare, artisan grants & community initiatives', icon: 'ShieldCheck' }
  ];

  const results: SchemeCategoryCount[] = [];

  for (const cat of allCategories) {
    const stmt = database.prepare(`SELECT COUNT(*) as count FROM schemes WHERE category = ?`);
    stmt.bind([cat.category]);
    let count = 0;
    if (stmt.step()) {
      count = stmt.get()[0] as number;
    }
    stmt.free();

    results.push({
      category: cat.category,
      count,
      description: cat.description,
      icon: cat.icon
    });
  }

  return results;
}

// -------------------------------------------------------------
// STRUCTURED ELIGIBILITY ENGINE (RULE EVALUATOR)
// -------------------------------------------------------------

export async function checkEligibilityRules(request: EligibilityCheckRequest): Promise<EligibilityCheckResult[]> {
  const allSchemes = await getAllSchemes(request.category_interest);
  const results: EligibilityCheckResult[] = [];

  for (const scheme of allSchemes) {
    // If a specific scheme was requested
    if (request.scheme_slug && scheme.slug !== request.scheme_slug) {
      continue;
    }

    const matchedRules: string[] = [];
    const unverifiedRequirements: string[] = [];
    let isDisqualified = false;
    let score = 0;

    // 1. Gender Rule
    if (scheme.gender && scheme.gender !== 'All') {
      if (request.gender) {
        if (request.gender.toLowerCase() === scheme.gender.toLowerCase() || (scheme.gender === 'Female' && request.gender.toLowerCase() === 'women')) {
          matchedRules.push(`Target gender matched: ${scheme.gender}`);
          score += 25;
        } else {
          isDisqualified = true;
        }
      } else {
        unverifiedRequirements.push(`Scheme is exclusively for ${scheme.gender} applicants`);
      }
    } else {
      matchedRules.push('Open to all genders');
      score += 10;
    }

    if (isDisqualified) continue;

    // 2. Age Rule
    if (request.age !== undefined) {
      const minAge = scheme.min_age ?? 0;
      const maxAge = scheme.max_age ?? 120;

      if (request.age >= minAge && request.age <= maxAge) {
        matchedRules.push(`Age ${request.age} is within eligible bracket (${minAge}–${maxAge} years)`);
        score += 25;
      } else {
        isDisqualified = true;
      }
    } else if (scheme.min_age !== undefined || scheme.max_age !== undefined) {
      unverifiedRequirements.push(`Requires age between ${scheme.min_age ?? 0} and ${scheme.max_age ?? 120} years`);
    }

    if (isDisqualified) continue;

    // 3. Occupation / Demographics Rule
    if (request.occupation) {
      const occLower = request.occupation.toLowerCase();
      const hasDemoMatch = scheme.target_demographics.some(d => d.toLowerCase().includes(occLower) || occLower.includes(d.toLowerCase()));
      if (hasDemoMatch) {
        matchedRules.push(`Applicant profile matches target demographic: ${request.occupation}`);
        score += 25;
      }
    }

    // 4. Education Level Rule
    if (scheme.education_level && scheme.education_level.length > 0) {
      if (request.education_level) {
        const eduMatch = scheme.education_level.some(e => e.toLowerCase() === request.education_level?.toLowerCase());
        if (eduMatch) {
          matchedRules.push(`Education level matches: ${request.education_level}`);
          score += 20;
        } else {
          unverifiedRequirements.push(`Specifically intended for ${scheme.education_level.join(' / ')}`);
        }
      } else {
        unverifiedRequirements.push(`Applicable for students in ${scheme.education_level.join(' / ')}`);
      }
    }

    // 5. Annual Income Rule
    if (scheme.income_limit_annual !== undefined) {
      if (request.annual_income !== undefined) {
        if (request.annual_income <= scheme.income_limit_annual) {
          matchedRules.push(`Annual income (₹${request.annual_income.toLocaleString('en-IN')}) is within ceiling (₹${scheme.income_limit_annual.toLocaleString('en-IN')}/year)`);
          score += 20;
        } else {
          isDisqualified = true;
        }
      } else {
        unverifiedRequirements.push(`Household annual income must be under ₹${scheme.income_limit_annual.toLocaleString('en-IN')}`);
      }
    }

    if (isDisqualified) continue;

    // 6. Disability Status Rule
    if (scheme.category === 'Differently Abled') {
      if (request.is_differently_abled) {
        matchedRules.push('Valid UDID / Differently Abled Welfare criteria match');
        score += 30;
      } else if (request.is_differently_abled === false) {
        continue;
      } else {
        unverifiedRequirements.push('Requires UDID / disability assessment certificate (40%+ benchmark disability)');
      }
    }

    // Determine Match Level
    let matchLevel: 'high' | 'possible' | 'more_info_needed' = 'more_info_needed';
    if (score >= 50 && unverifiedRequirements.length === 0) {
      matchLevel = 'high';
    } else if (score >= 25 || matchedRules.length > 0) {
      matchLevel = 'possible';
    }

    const explanation = `Matches ${matchedRules.length} core criteria (${matchedRules.slice(0, 2).join('; ')}). ${
      unverifiedRequirements.length > 0 ? `Needs verification: ${unverifiedRequirements.join(', ')}.` : 'Strong alignment with official guidelines.'
    }`;

    results.push({
      scheme_id: scheme.slug,
      scheme_name: scheme.name,
      category: scheme.category,
      benefit: scheme.benefit,
      match_level: matchLevel,
      matched_rules: matchedRules,
      unverified_requirements: unverifiedRequirements,
      explanation,
      official_url: scheme.official_source
    });
  }

  // Sort by High match first, then Possible, then More info
  const rank = { high: 3, possible: 2, more_info_needed: 1 };
  results.sort((a, b) => rank[b.match_level] - rank[a.match_level]);

  return results;
}

// -------------------------------------------------------------
// OFFICIAL SOURCES & TRUST VERIFICATION
// -------------------------------------------------------------

export async function getOfficialSources(): Promise<SourceRecord[]> {
  const database = await getDatabase();
  const stmt = database.prepare(`SELECT * FROM sources ORDER BY verification_status DESC, title ASC`);
  const sources: SourceRecord[] = [];

  while (stmt.step()) {
    const row = stmt.get();
    const cols = stmt.getColumnNames();
    const obj: any = {};
    cols.forEach((col, idx) => {
      obj[col] = row[idx];
    });
    sources.push(obj as SourceRecord);
  }
  stmt.free();
  return sources;
}

// -------------------------------------------------------------
// CHECKLIST PERSISTENCE (BACKEND DATABASE)
// -------------------------------------------------------------

export async function getChecklists(): Promise<ChecklistRecord[]> {
  const database = await getDatabase();
  const stmt = database.prepare(`SELECT * FROM checklists ORDER BY updated_at DESC`);
  const checklists: ChecklistRecord[] = [];

  while (stmt.step()) {
    const row = stmt.get();
    const cols = stmt.getColumnNames();
    const obj: any = {};
    cols.forEach((col, idx) => {
      obj[col] = row[idx];
    });

    // Fetch items for this checklist
    const itemStmt = database.prepare(`SELECT * FROM checklist_items WHERE checklist_id = ? ORDER BY required DESC, id ASC`);
    itemStmt.bind([obj.id]);
    const items: ChecklistItemRecord[] = [];
    while (itemStmt.step()) {
      const iRow = itemStmt.get();
      const iCols = itemStmt.getColumnNames();
      const iObj: any = {};
      iCols.forEach((c, i) => {
        iObj[c] = iRow[i];
      });
      items.push({
        id: iObj.id,
        checklist_id: iObj.checklist_id,
        title: iObj.title,
        description: iObj.description,
        required: Boolean(iObj.required),
        completed: Boolean(iObj.completed),
        source: iObj.source
      });
    }
    itemStmt.free();

    checklists.push({
      id: obj.id,
      title: obj.title,
      target_slug: obj.target_slug,
      target_type: obj.target_type,
      items,
      created_at: obj.created_at,
      updated_at: obj.updated_at
    });
  }
  stmt.free();
  return checklists;
}

export async function getChecklistById(id: string): Promise<ChecklistRecord | null> {
  const database = await getDatabase();
  const stmt = database.prepare(`SELECT * FROM checklists WHERE id = ?`);
  stmt.bind([id]);

  if (!stmt.step()) {
    stmt.free();
    return null;
  }

  const row = stmt.get();
  const cols = stmt.getColumnNames();
  const obj: any = {};
  cols.forEach((col, idx) => {
    obj[col] = row[idx];
  });
  stmt.free();

  const itemStmt = database.prepare(`SELECT * FROM checklist_items WHERE checklist_id = ? ORDER BY required DESC, id ASC`);
  itemStmt.bind([id]);
  const items: ChecklistItemRecord[] = [];
  while (itemStmt.step()) {
    const iRow = itemStmt.get();
    const iCols = itemStmt.getColumnNames();
    const iObj: any = {};
    iCols.forEach((c, i) => {
      iObj[c] = iRow[i];
    });
    items.push({
      id: iObj.id,
      checklist_id: iObj.checklist_id,
      title: iObj.title,
      description: iObj.description,
      required: Boolean(iObj.required),
      completed: Boolean(iObj.completed),
      source: iObj.source
    });
  }
  itemStmt.free();

  return {
    id: obj.id,
    title: obj.title,
    target_slug: obj.target_slug,
    target_type: obj.target_type,
    items,
    created_at: obj.created_at,
    updated_at: obj.updated_at
  };
}

export async function createChecklist(data: {
  title: string;
  target_slug?: string;
  target_type?: 'service' | 'scheme';
  items?: { title: string; description?: string; required?: boolean; source?: string }[];
}): Promise<ChecklistRecord> {
  const database = await getDatabase();
  const id = `chk-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
  const now = new Date().toISOString();

  database.run(
    `INSERT INTO checklists (id, title, target_slug, target_type, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [id, data.title, data.target_slug || null, data.target_type || null, now, now]
  );

  const createdItems: ChecklistItemRecord[] = [];
  if (data.items && Array.isArray(data.items)) {
    for (const item of data.items) {
      const itemId = `item-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
      database.run(
        `INSERT INTO checklist_items (id, checklist_id, title, description, required, completed, source)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [itemId, id, item.title, item.description || null, item.required ? 1 : 0, 0, item.source || null]
      );
      createdItems.push({
        id: itemId,
        checklist_id: id,
        title: item.title,
        description: item.description,
        required: item.required ?? true,
        completed: false,
        source: item.source
      });
    }
  }

  return {
    id,
    title: data.title,
    target_slug: data.target_slug,
    target_type: data.target_type,
    items: createdItems,
    created_at: now,
    updated_at: now
  };
}

export async function updateChecklistItem(checklistId: string, itemId: string, completed: boolean): Promise<boolean> {
  const database = await getDatabase();
  database.run(
    `UPDATE checklist_items SET completed = ? WHERE id = ? AND checklist_id = ?`,
    [completed ? 1 : 0, itemId, checklistId]
  );
  database.run(
    `UPDATE checklists SET updated_at = ? WHERE id = ?`,
    [new Date().toISOString(), checklistId]
  );
  return true;
}

export async function deleteChecklist(id: string): Promise<boolean> {
  const database = await getDatabase();
  database.run(`DELETE FROM checklist_items WHERE checklist_id = ?`, [id]);
  database.run(`DELETE FROM checklists WHERE id = ?`, [id]);
  return true;
}

// -------------------------------------------------------------
// ADMIN MANAGEMENT OPERATIONS (PROTECTED)
// -------------------------------------------------------------

export async function adminUpdateVerification(id: string, status: TrustStatus, notes?: string): Promise<boolean> {
  const database = await getDatabase();
  const now = new Date().toISOString().split('T')[0];
  database.run(
    `UPDATE sources SET verification_status = ?, last_verified = ? WHERE id = ?`,
    [status, now, id]
  );
  database.run(
    `UPDATE schemes SET status = ?, last_verified = ? WHERE slug = (SELECT associated_slug FROM sources WHERE id = ?)`,
    [status, now, id]
  );
  return true;
}

export async function adminUpdateScheme(id: number, data: Partial<GovernmentScheme>): Promise<boolean> {
  const database = await getDatabase();
  const now = new Date().toISOString().split('T')[0];

  const updates: string[] = [];
  const params: any[] = [];

  if (data.name) { updates.push('name = ?'); params.push(data.name); }
  if (data.benefit) { updates.push('benefit = ?'); params.push(data.benefit); }
  if (data.who_can_apply) { updates.push('who_can_apply = ?'); params.push(data.who_can_apply); }
  if (data.what_you_get) { updates.push('what_you_get = ?'); params.push(data.what_you_get); }
  if (data.official_source) { updates.push('official_source = ?'); params.push(data.official_source); }
  if (data.status) { updates.push('status = ?'); params.push(data.status); }
  if (data.department) { updates.push('department = ?'); params.push(data.department); }
  if (data.important_notes) { updates.push('important_notes = ?'); params.push(data.important_notes); }

  updates.push('last_verified = ?');
  params.push(now);

  params.push(id);
  database.run(`UPDATE schemes SET ${updates.join(', ')} WHERE id = ?`, params);
  return true;
}

