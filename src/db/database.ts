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
  SchemeMatchResult
} from '../types.js';

let db: Database | null = null;
const dbDir = path.join(process.cwd(), 'data');
const dbPath = path.join(dbDir, 'govguide.db');

export async function getDatabase(): Promise<Database> {
  if (db) return db;

  const SQL = await initSqlJs();

  if (!fs.existsSync(dbDir)) {
    fs.mkdirSync(dbDir, { recursive: true });
  }

  // Always re-initialize in memory or ensure tables exist
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
      eligibility TEXT NOT NULL, -- JSON string
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
      accepted_options TEXT NOT NULL, -- JSON string
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
      eligibility TEXT NOT NULL, -- JSON string
      documents TEXT NOT NULL, -- JSON string
      application_steps TEXT NOT NULL, -- JSON string
      status TEXT NOT NULL,
      official_source TEXT NOT NULL,
      source_verified_authority TEXT NOT NULL,
      last_verified TEXT NOT NULL,
      effective_date TEXT,
      important_notes TEXT,
      target_demographics TEXT NOT NULL, -- JSON string
      education_level TEXT, -- JSON string
      min_age INTEGER,
      max_age INTEGER,
      income_limit_annual INTEGER,
      gender TEXT
    );
  `);
}

function seedInitialData(database: Database) {
  // -------------------------------------------------------------
  // 1. SEED 5 CORE SERVICES
  // -------------------------------------------------------------

  // 1. Passport
  database.run(`
    INSERT INTO services (id, name, slug, short_description, full_description, category, eligibility, official_website, processing_fee, processing_time, issuing_authority, icon, last_verified, important_notes)
    VALUES (
      1,
      'Indian Passport',
      'passport',
      'Official travel and identity document for Indian citizens traveling abroad. Issued by CPV Division, Ministry of External Affairs.',
      'An Indian Passport is a legal travel document issued by the Government of India under the Passports Act 1967. It certifies the identity and nationality of the holder for international travel and serves as primary proof of Indian citizenship. Services include Fresh Passport, Renewal/Re-issue, and Tatkaal (expedited processing).',
      'Identity & Travel',
      '${JSON.stringify([
        'Must be an Indian citizen by birth, descent, or naturalization',
        'Must have valid address proof for the current residence (minimum 1 year of continuous stay)',
        'Must not have unresolved criminal proceedings or pending non-bailable warrants',
        'Minors (under 18 years) require consent of both parents along with parents passport copies'
      ])}',
      'https://passportindia.gov.in',
      '₹1,500 (Normal 36-page, 10-year) | ₹2,000 (Normal 60-page) | ₹3,500 (Tatkaal 36-page)',
      '10 to 15 working days (Normal) | 1 to 3 working days (Tatkaal, post-police clearance)',
      'Consular, Passport & Visa (CPV) Division, Ministry of External Affairs (MEA)',
      'FileText',
      '2026-08-01',
      'Police verification is mandatory for fresh passports. Ensure your local address matches all supporting utility or bank records exactly.'
    );
  `);

  // Documents for Passport
  database.run(`
    INSERT INTO documents (service_id, category, name, description, is_mandatory, accepted_options) VALUES
    (1, 'Proof of Date of Birth', 'DOB Certificate / Matriculation', 'Document establishing the exact birth date of the applicant.', 1, '${JSON.stringify(['Birth Certificate issued by Municipal Authority/Registrar', '10th Class / Matriculation Passing Certificate mentioning DOB', 'PAN Card issued by Income Tax Department', 'Aadhaar Card / e-Aadhaar'])}'),
    (1, 'Proof of Present Address', 'Current Residential Address Proof', 'Document validating your current stay for the last 1 year.', 1, '${JSON.stringify(['Aadhaar Card with current address', 'Active Bank Passbook with photo & branch stamp (Scheduled Commercial Banks)', 'Electricity / Water Bill (not older than 3 months)', 'Voter ID (EPIC Card)', 'Registered Rent Agreement (minimum 1-year tenure)'])}'),
    (1, 'Proof of Identity', 'Photo Identity Proof', 'Valid government-issued photo identity.', 1, '${JSON.stringify(['Aadhaar Card', 'Voter Identity Card', 'PAN Card', 'Driving Licence'])}'),
    (1, 'Non-ECR Supporting Proof', 'Educational Qualification (Optional for ECNR)', 'Required for non-Emigration Check Required (ECR) category stamping.', 0, '${JSON.stringify(['Matriculation / 10th Class passing certificate or higher degree', 'Income Tax Returns proof of last 3 years', 'Proof of staying abroad for 3+ years'])}');
  `);

  // Steps for Passport
  database.run(`
    INSERT INTO application_steps (service_id, step_number, title, description, location_type, tip) VALUES
    (1, 1, 'Register on Official Passport Seva Portal', 'Create an account on passportindia.gov.in. Choose your nearest Regional Passport Office (RPO) jurisdiction based on your current residential city.', 'Online', 'Do not use third-party broker websites. Official portal is passportindia.gov.in only.'),
    (1, 2, 'Fill Online Application Form (Form 1)', 'Select "Apply for Fresh Passport / Re-issue" and carefully enter your personal details, parentage, spouse name, current address, and emergency contact.', 'Online', 'Ensure spelling matches your Matriculation certificate and Aadhaar identically.'),
    (1, 3, 'Pay Application Fee & Schedule PSK Slot', 'Pay online via SBI ePay, Debit/Credit Card, or Internet Banking. Select your preferred Passport Seva Kendra (PSK) or Post Office PSK (POPSK) date and time slot.', 'Online', 'Slots open daily at specific regional times (usually 11:00 AM or 3:00 PM depending on state).'),
    (1, 4, 'Visit Passport Seva Kendra (PSK) with Originals', 'Arrive 15 minutes before your scheduled appointment time. Carry ARN receipt, two sets of self-attested photocopies, and all original documents for physical biometric scanning and document counter verification (Counters A, B, and C).', 'Visit Center', 'No personal paper photographs are needed for adults; photos are captured digitally in Counter A.'),
    (1, 5, 'Police Verification & Passport Dispatch', 'Your local police station will contact you to verify resident status. After clearance, the printed passport is securely dispatched via India Post Speed Post with SMS tracking.', 'Hybrid', 'Keep original address documents and two references ready for the police officer visit.');
  `);

  // Common Mistakes for Passport
  database.run(`
    INSERT INTO common_mistakes (service_id, mistake, impact, prevention) VALUES
    (1, 'Name or Initials Discrepancy with 10th Certificate', 'Application placed on hold at Counter B; applicant referred to RPO main branch.', 'Ensure your First Name and Surname on the application match your 10th / School Leaving Certificate letter for letter.'),
    (1, 'Unregistered / Incomplete Address History (< 1 year)', 'Police verification reports adverse remarks; penalty up to ₹5,000.', 'If you have lived at more than one address in the preceding 12 months, list all previous addresses in the history section.'),
    (1, 'Booking through fake/fraudulent intermediary domains', 'Financial loss, stolen identity documents, and unissued appointment.', 'Only navigate to official https://passportindia.gov.in. Genuine government portals always end in .gov.in.');
  `);

  // FAQs for Passport
  database.run(`
    INSERT INTO service_faqs (service_id, question, answer) VALUES
    (1, 'Is physical photograph required to be carried to the PSK for adults?', 'No. For all adult applicants, live digital photography and biometric fingerprints are captured at Counter A inside the Passport Seva Kendra.'),
    (1, 'What is the validity of an adult Indian passport?', 'Standard adult passports are issued with 10 years of validity from the date of issue.'),
    (1, 'Can I apply for a passport under Tatkaal scheme without an Annexure verification certificate?', 'Yes. Under revised guidelines, Tatkaal applications can be submitted with 3 accepted identity/address documents (e.g. Aadhaar, PAN, Voter ID) without needing a Class-1 officer Annexure verification certificate.');
  `);

  // 2. Aadhaar
  database.run(`
    INSERT INTO services (id, name, slug, short_description, full_description, category, eligibility, official_website, processing_fee, processing_time, issuing_authority, icon, last_verified, important_notes)
    VALUES (
      2,
      'Aadhaar Card',
      'aadhaar',
      '12-digit unique biometric identity number issued by UIDAI for residents of India.',
      'Aadhaar is a 12-digit individual identification number issued by the Unique Identification Authority of India (UIDAI) on behalf of the Government of India. It serves as proof of identity and proof of address anywhere in India. UIDAI offers services for new enrollment, mandatory biometric updates for children, demographic updates, and document verification.',
      'Identity & Resident Records',
      '${JSON.stringify([
        'Must be a resident of India (resided in India for 182 days or more in the past 12 months)',
        'Available for all individuals regardless of age or gender (including newborns)',
        'Mandatory biometric update required for children upon reaching age 5 and age 15'
      ])}',
      'https://uidai.gov.in',
      'Free for Fresh Enrollment & Mandatory Child Biometric Update | ₹50 for Demographic Update | ₹100 for Biometric Update',
      '15 to 30 days (Updates often reflect within 5-7 working days online)',
      'Unique Identification Authority of India (UIDAI), Ministry of Electronics & IT',
      'CreditCard',
      '2026-08-01',
      'Always keep your mobile number linked with Aadhaar to access online OTP-based e-services and self-service address update portals.'
    );
  `);

  // Documents for Aadhaar
  database.run(`
    INSERT INTO documents (service_id, category, name, description, is_mandatory, accepted_options) VALUES
    (2, 'Proof of Identity (PoI)', 'Identity Verification Document', 'Document containing name and photograph of the resident.', 1, '${JSON.stringify(['Passport', 'PAN Card', 'Voter ID (EPIC)', 'Driving Licence', 'Ration Card / PDS Photo Card', 'Government Photo ID Card'])}'),
    (2, 'Proof of Address (PoA)', 'Residential Verification Document', 'Document validating residential address.', 1, '${JSON.stringify(['Electricity Bill (not older than 3 months)', 'Water Bill (not older than 3 months)', 'Bank Account Statement / Passbook with photo & stamp', 'Voter ID', 'Passport', 'Registered Rent Agreement'])}'),
    (2, 'Proof of Date of Birth (PoB)', 'Date of Birth Record', 'Document certifying legal date of birth.', 1, '${JSON.stringify(['Birth Certificate', 'SSLC / 10th Standard Passing Certificate', 'Passport', 'PAN Card'])}'),
    (2, 'Proof of Relationship (PoR)', 'Relationship Document (For Minor Enrollment)', 'Required when enrolling child with Head of Family (HoF).', 0, '${JSON.stringify(['Birth Certificate mentioning parents names', 'Ration Card', 'Passport of Parent'])}');
  `);

  // Steps for Aadhaar
  database.run(`
    INSERT INTO application_steps (service_id, step_number, title, description, location_type, tip) VALUES
    (2, 1, 'Locate Aadhaar Seva Kendra or Book Appointment Online', 'Visit myaadhaar.uidai.gov.in and click "Book an Appointment" to reserve a time slot at your nearest Aadhaar Seva Kendra (ASK) or authorized bank/post office branch.', 'Online', 'Booking an appointment online eliminates waiting in walk-in queues.'),
    (2, 2, 'Prepare Original Documents & Enrolment Form', 'Fill out the Aadhaar Enrolment / Correction form. Keep original Proof of Identity, Address, and Date of Birth documents ready for physical scanning.', 'Offline', 'Ensure spelling matches across your identity and address documents.'),
    (2, 3, 'Visit Enrollment Center for Biometric & Demographic Capture', 'Visit the Kendra on your appointment date. The operator captures 10 fingerprints, both iris scans, live photo, and scans original documents into the UIDAI system.', 'Visit Center', 'Verify all typed details on the operator dual-screen before biometric sign-off.'),
    (2, 4, 'Collect Enrolment Slip (EID) with 28-digit Number', 'Obtain the physical printed acknowledgement receipt containing the 14-digit Enrolment ID and 14-digit timestamp.', 'Visit Center', 'Store this slip securely; it is required to track status or download e-Aadhaar before card dispatch.'),
    (2, 5, 'Track Status & Download e-Aadhaar', 'Track processing status on myaadhaar.uidai.gov.in using your EID. Once generated, download password-protected e-Aadhaar PDF using OTP sent to registered mobile.', 'Online', 'The password to open e-Aadhaar is FIRST 4 LETTERS OF NAME in CAPITAL + YEAR OF BIRTH.');
  `);

  // Common Mistakes for Aadhaar
  database.run(`
    INSERT INTO common_mistakes (service_id, mistake, impact, prevention) VALUES
    (2, 'Not linking an active mobile number during enrollment', 'Cannot access online update portal, DigiLocker, or instant OTP verifications.', 'Always provide your own personal active mobile number to the enrollment operator.'),
    (2, 'Submitting unverified photocopy without showing original document', 'Application rejected instantly by UIDAI backend validation.', 'Always carry original physical documents to the center. Operators only scan originals.'),
    (2, 'Ignoring mandatory biometric updates at age 5 and age 15', 'Aadhaar becomes dormant and fails biometric authentication for scholarships/exams.', 'Children must undergo free biometric updates between ages 5-7 and ages 15-17.');
  `);

  // FAQs for Aadhaar
  database.run(`
    INSERT INTO service_faqs (service_id, question, answer) VALUES
    (2, 'Is e-Aadhaar downloaded from UIDAI website equally valid as the physical PVC card?', 'Yes. Under the Aadhaar Act, digital e-Aadhaar downloaded from uidai.gov.in is legally equivalent to the physical letter/card for all official purposes.'),
    (2, 'Can I update my residential address in Aadhaar online without visiting a center?', 'Yes. If your mobile number is linked, you can submit an address update request on myaadhaar.uidai.gov.in by uploading a valid address proof or through Head of Family (HoF) consent.'),
    (2, 'Is new Aadhaar enrollment free of cost?', 'Yes, fresh Aadhaar enrollment and mandatory child biometric updates at age 5 and 15 are 100% free at all authorized government centers.');
  `);

  // 3. PAN Card
  database.run(`
    INSERT INTO services (id, name, slug, short_description, full_description, category, eligibility, official_website, processing_fee, processing_time, issuing_authority, icon, last_verified, important_notes)
    VALUES (
      3,
      'PAN Card (Permanent Account Number)',
      'pan-card',
      '10-digit alphanumeric tax identifier issued by the Income Tax Department for financial transactions.',
      'Permanent Account Number (PAN) is a unique 10-character alphanumeric identifier issued by the Income Tax Department of India. It serves as universal tax identification and is legally mandatory for opening bank accounts, filing tax returns, making investments, and conducting high-value financial transactions. Available via Instant e-PAN (paperless Aadhaar-based) or standard physical card application (Form 49A).',
      'Taxation & Finance',
      '${JSON.stringify([
        'Any individual Indian citizen, minor, firm, or company',
        'Instant e-PAN requires a valid Aadhaar card with an active linked mobile number and age 18+',
        'Minors (under 18) can apply for PAN Card through parent/guardian representation (Form 49A)'
      ])}',
      'https://www.incometax.gov.in',
      'Free for Instant e-PAN (Digital PDF) | ₹107 (Physical Card in India) | ₹1,017 (Foreign dispatch)',
      'Instant (10 minutes for e-PAN) | 10 to 15 working days for physical card dispatch',
      'Income Tax Department, Ministry of Finance (Facilitated via Protean / UTIITSL)',
      'CreditCard',
      '2026-08-01',
      'Instant e-PAN is 100% free of cost on incometax.gov.in. It carries the same legal validity as a laminated physical card.'
    );
  `);

  // Documents for PAN
  database.run(`
    INSERT INTO documents (service_id, category, name, description, is_mandatory, accepted_options) VALUES
    (3, 'Proof of Identity (PoI)', 'Identity Document for PAN', 'Official proof validating applicant name and photo.', 1, '${JSON.stringify(['Aadhaar Card', 'Voter ID Card', 'Passport', 'Driving Licence', 'Arm\'s Licence'])}'),
    (3, 'Proof of Address (PoA)', 'Residential Address Proof for PAN', 'Document confirming permanent residential address.', 1, '${JSON.stringify(['Aadhaar Card', 'Voter ID', 'Passport', 'Electricity / Landline / Broadband Bill (last 3 months)', 'Bank Account Statement (last 3 months)'])}'),
    (3, 'Proof of Date of Birth (PoB)', 'DOB Proof Document for PAN', 'Document establishing birth date.', 1, '${JSON.stringify(['Aadhaar Card', 'Birth Certificate', '10th Class Matriculation Certificate', 'Passport'])}');
  `);

  // Steps for PAN
  database.run(`
    INSERT INTO application_steps (service_id, step_number, title, description, location_type, tip) VALUES
    (3, 1, 'Choose Application Route (Instant e-PAN vs Physical Card)', 'Option A: For 100% free instant paperless PAN in 10 minutes, visit incometax.gov.in e-Filing portal. Option B: For physical laminated plastic card, visit Protean (tin-nsdl.com) or UTIITSL portal (Form 49A).', 'Online', 'If you only need PAN for bank KYC or internships, Instant e-PAN is generated immediately with zero fees.'),
    (3, 2, 'Submit Aadhaar OTP Authentication (Instant Route)', 'Enter your 12-digit Aadhaar number on the Income Tax e-Filing portal. Enter the 6-digit OTP received on your Aadhaar-linked mobile phone to validate identity.', 'Online', 'Ensure your mobile phone is charged and active to receive the Aadhaar OTP within the 10-minute timer.'),
    (3, 3, 'Confirm Demographic Details & Generate PAN', 'The portal auto-fetches your Name, Date of Birth, Gender, Address, and Photograph directly from UIDAI database. Confirm details and submit request.', 'Online', 'Verify that your surname and father name are correctly reflected.'),
    (3, 4, 'Download Digitally Signed e-PAN PDF', 'Check status within 10 minutes using your Aadhaar number. Download the digitally signed e-PAN PDF containing a verifiable QR code.', 'Online', 'Password to open e-PAN PDF is your Date of Birth in DDMMYYYY format without slashes.'),
    (3, 5, 'Optional: Request Physical Reprint (₹50)', 'If you need a physical plastic laminated card later, visit the Protean/UTIITSL reprint portal, enter your newly generated PAN, pay ₹50, and it will be delivered by Speed Post.', 'Online', 'Physical reprint requests take approximately 7-10 days for home delivery.');
  `);

  // Common Mistakes for PAN
  database.run(`
    INSERT INTO common_mistakes (service_id, mistake, impact, prevention) VALUES
    (3, 'Applying for multiple PAN cards', 'Possessing more than one PAN is illegal under Section 272B of Income Tax Act with penalty up to ₹10,000.', 'Never apply for a second PAN. If you lost your card, apply for Reprint/Duplicate of existing PAN.'),
    (3, 'Mismatch between Aadhaar and Matriculation details', 'Instant e-PAN generation fails during UIDAI backend authentication.', 'Update your Aadhaar name/DOB first to match your educational certificates before generating PAN.'),
    (3, 'Paying ₹200–₹500 to unauthorized internet cafes for Instant e-PAN', 'Unnecessary expense and exposure of private financial documents.', 'Instant e-PAN is completely free on official government portal incometax.gov.in.');
  `);

  // FAQs for PAN
  database.run(`
    INSERT INTO service_faqs (service_id, question, answer) VALUES
    (3, 'Is Instant e-PAN accepted for opening bank accounts and stock demat accounts?', 'Yes. Digitally signed e-PAN issued by the Income Tax Department carries equal legal validity as the physical laminated card as per CBDT notifications.'),
    (3, 'Can a student under 18 years get a PAN Card?', 'Yes, minors can apply for a PAN card under Form 49A with parent/guardian acting as representative assessee. Instant e-PAN requires age 18+.'),
    (3, 'Is Aadhaar-PAN linking mandatory?', 'Yes, linking PAN with Aadhaar is legally mandatory for all individual taxpayers under the Income Tax Act.');
  `);

  // 4. Driving Licence
  database.run(`
    INSERT INTO services (id, name, slug, short_description, full_description, category, eligibility, official_website, processing_fee, processing_time, issuing_authority, icon, last_verified, important_notes)
    VALUES (
      4,
      'Driving Licence (Learner & Permanent DL)',
      'driving-licence',
      'Official permit to operate motor vehicles on public roads in India. Managed via MoRTH Sarathi portal.',
      'A Driving Licence is an official document issued by state Regional Transport Offices (RTO) authorizing an individual to operate a motor vehicle on public roads. The process involves two phases: 1) Learner Licence (LL) test valid for 6 months, followed by 2) Practical driving skill test at RTO for Permanent Driving Licence (DL).',
      'Transport & Licensing',
      '${JSON.stringify([
        'Age 16+ for Gearless 2-Wheeler (up to 50cc) with parent consent',
        'Age 18+ for Non-Transport light motor vehicles (Motorcycle with Gear & Car / LMV)',
        'Age 20+ for Commercial / Transport vehicles (minimum 1 year holding LMV licence)',
        'Must pass computerized traffic signals & road safety test for Learner Licence'
      ])}',
      'https://parivahan.gov.in',
      '₹150 to ₹200 (Learner Licence) | ₹300 (DL Test) + ₹200 (Smart Card DL issuance)',
      'Same day for Learner Licence (Online) | 7 to 15 days for Permanent Smart Card DL post-test',
      'Regional Transport Offices (RTO), State Transport Departments / MoRTH',
      'Car',
      '2026-08-01',
      'You can apply for Permanent DL after 30 days from Learner Licence issuance, and before expiry of 180 days (6 months).'
    );
  `);

  // Documents for Driving Licence
  database.run(`
    INSERT INTO documents (service_id, category, name, description, is_mandatory, accepted_options) VALUES
    (4, 'Proof of Age', 'Age Verification Document for DL', 'Document certifying minimum legal driving age.', 1, '${JSON.stringify(['10th Standard Matriculation Certificate', 'Birth Certificate', 'Passport', 'Aadhaar Card', 'PAN Card'])}'),
    (4, 'Proof of Address', 'Residential Address Proof for Local RTO', 'Valid proof establishing residence under chosen RTO jurisdiction.', 1, '${JSON.stringify(['Aadhaar Card', 'Voter ID (EPIC)', 'Passport', 'Current Electricity / Water Bill', 'Registered Rent Agreement'])}'),
    (4, 'Medical Fitness Declaration', 'Form 1 / Form 1A', 'Self-declaration of physical fitness or medical certificate.', 1, '${JSON.stringify(['Form 1 (Self-declaration for non-commercial applicants under 40)', 'Form 1A (Signed by registered MBBS Doctor for commercial or applicants above 40)'])}'),
    (4, 'Valid Learner Licence (LL)', 'Existing Learner Licence Number', 'Mandatory for booking Permanent DL driving skill test.', 1, '${JSON.stringify(['Active Learner Licence issued at least 30 days prior'])}');
  `);

  // Steps for Driving Licence
  database.run(`
    INSERT INTO application_steps (service_id, step_number, title, description, location_type, tip) VALUES
    (4, 1, 'Apply for Learner Licence on Sarathi Portal', 'Visit parivahan.gov.in -> Online Services -> Drivers/Learners Licence. Select your state and choose "Apply for Learner Licence".', 'Online', 'Select Aadhaar Authentication mode for contact-less online LL test from home in eligible states.'),
    (4, 2, 'Complete Road Safety Tutorial & Online LL Test', 'Watch mandatory road safety educational video on Sarathi portal and take the computerized 15-question traffic signs test (Pass score: 60%+).', 'Online', 'Revise traffic signs, road lane markings, and basic vehicle hand signals before starting.'),
    (4, 3, 'Download Form 3 Learner Licence (Valid for 6 Months)', 'Upon passing test, instantly download and print your Learner Licence (Form 3). You can now drive with a permanent DL holder beside you and "L" board displayed.', 'Online', 'Learner Licence is valid across India for 180 days.'),
    (4, 4, 'Book Permanent DL Driving Test Slot (After 30 Days)', 'After minimum 30 days of holding LL, log in to Sarathi portal, select "Apply for Driving Licence", pay DL test fee (₹500 approx), and book an RTO test track slot.', 'Online', 'Do not delay past 5 months; LL cannot be renewed once 180 days expire without re-testing.'),
    (4, 5, 'Appear for RTO Driving Test & Receive Smart Card', 'Bring your vehicle, active LL, insurance, PUC certificate, and original ID proofs to RTO test track. Demonstrate "H" track, "8" track, gradient start, and reverse parking.', 'Visit Center', 'Always wear seatbelt/helmet, adjust mirrors, and use turn indicators during the RTO test.');
  `);

  // Common Mistakes for Driving Licence
  database.run(`
    INSERT INTO common_mistakes (service_id, mistake, impact, prevention) VALUES
    (4, 'Waiting past 180 days after LL issuance to book DL test', 'Learner Licence lapses completely; applicant must pay fees and restart LL test from beginning.', 'Book your practical test slot on Sarathi as soon as the 30-day learning window completes.'),
    (4, 'Bringing vehicle with expired Insurance or PUC to RTO test', 'Motor Vehicle Inspector disqualifies applicant from driving test on the spot.', 'Ensure vehicle used for test has valid Pollution Certificate (PUC), active Insurance, and matching class.'),
    (4, 'Failing to use turn indicators and mirror checks during RTO test', 'Instant deduction of driving test points leading to test failure.', 'Exaggerate head movements for rear-view mirror checks and engage indicators 30 meters before turning.');
  `);

  // FAQs for Driving Licence
  database.run(`
    INSERT INTO service_faqs (service_id, question, answer) VALUES
    (4, 'Can I take the Learner Licence test from home on mobile/computer?', 'Yes. In states participating in the Aadhaar-based faceless scheme on sarathi.parivahan.gov.in, applicants with Aadhaar-linked mobile can take the online LL test from home.'),
    (4, 'What is the minimum gap required between Learner Licence and Permanent DL test?', 'You must hold the Learner Licence for at least 30 continuous days before you become eligible to take the practical DL driving test.'),
    (4, 'Is a digital Driving Licence stored in DigiLocker or mParivahan legally accepted during traffic police checks?', 'Yes. Digital Driving Licences and RC books in DigiLocker or mParivahan are legally recognized across India as per MoRTH notifications.');
  `);

  // 5. Voter ID
  database.run(`
    INSERT INTO services (id, name, slug, short_description, full_description, category, eligibility, official_website, processing_fee, processing_time, issuing_authority, icon, last_verified, important_notes)
    VALUES (
      5,
      'Voter ID Card (EPIC Registration)',
      'voter-id',
      'Elector Photo Identity Card (EPIC) issued by Election Commission of India for voting rights.',
      'The Elector Photo Identity Card (EPIC), commonly known as Voter ID, is an identity document issued by the Election Commission of India (ECI) to adult Indian citizens. It serves as primary proof of electoral franchise, citizenship, and residential address. Services include New Voter Registration (Form 6), Overseas Citizen Registration (Form 6A), and Correction/Shifting of Residence (Form 8).',
      'Electoral & Citizenship',
      '${JSON.stringify([
        'Must be an Indian citizen',
        'Must be 18 years of age or older on the qualifying date (1st of Jan, April, July, or Oct)',
        'Must be ordinarily resident in the constituency/assembly area where applying',
        'Must not be disqualified as an elector under any law'
      ])}',
      'https://voters.eci.gov.in',
      '100% Free of Cost (New Registration & Corrections)',
      '15 to 30 days (Digital e-EPIC available immediately upon ERO approval)',
      'Election Commission of India (ECI) & State Chief Electoral Officers (CEO)',
      'FileCheck',
      '2026-08-01',
      'Citizens turning 18 can now register in advance on four qualifying dates (Jan 1, Apr 1, Jul 1, Oct 1) on voters.eci.gov.in.'
    );
  `);

  // Documents for Voter ID
  database.run(`
    INSERT INTO documents (service_id, category, name, description, is_mandatory, accepted_options) VALUES
    (5, 'Proof of Age', 'Age Proof Document for Voter ID', 'Document establishing age 18+ on qualifying date.', 1, '${JSON.stringify(['Birth Certificate', 'Aadhaar Card', 'PAN Card', 'Driving Licence', '10th / 12th CBSE/State Board Passing Certificate', 'Indian Passport'])}'),
    (5, 'Proof of Ordinary Residence', 'Current Residential Address Proof', 'Document validating your stay in the constituency.', 1, '${JSON.stringify(['Aadhaar Card', 'Water / Electricity / Gas Connection Bill (1 year)', 'Current Bank Passbook with address', 'Indian Passport', 'Registered Rent Agreement / Sale Deed'])}'),
    (5, 'Passport-size Photograph', 'Recent Color Photograph', 'White background passport photo for EPIC card.', 1, '${JSON.stringify(['Recent color photograph (4.5cm x 3.5cm) with frontal face view'])}');
  `);

  // Steps for Voter ID
  database.run(`
    INSERT INTO application_steps (service_id, step_number, title, description, location_type, tip) VALUES
    (5, 1, 'Visit Official ECI Voters Service Portal', 'Go to voters.eci.gov.in (or download Voter Helpline Mobile App). Sign up using your mobile number and email.', 'Online', 'Do not use unverified third-party voter portals. ECI official portal is voters.eci.gov.in.'),
    (5, 2, 'Fill Form 6 (New Voter Registration)', 'Select "Form 6 - Application for New Voters". Choose your State, District, and Parliamentary / Assembly Constituency.', 'Online', 'Check which Assembly Constituency your street falls under before starting.'),
    (5, 3, 'Enter Personal Details & Upload Documents', 'Enter personal name, family member details, current residential address, and upload self-attested copies of Age Proof, Address Proof, and Photo.', 'Online', 'Ensure the uploaded photo has a clear plain white background and is under 2MB.'),
    (5, 4, 'Submit Declaration & Note Reference Number', 'Review your entries, complete the legal declaration, and submit. You will receive an instant 12-character Reference ID via SMS to track your application.', 'Online', 'Save the SMS Reference ID to check Booth Level Officer (BLO) verification status.'),
    (5, 5, 'BLO Field Verification & e-EPIC Download', 'Your assigned Booth Level Officer (BLO) may visit your residence to verify address. Once approved by Electoral Registration Officer (ERO), download your digital e-EPIC card instantly with photo and QR code.', 'Hybrid', 'Digital e-EPIC can be downloaded instantly from the portal and carries 100% legal validity for voting.');
  `);

  // Common Mistakes for Voter ID
  database.run(`
    INSERT INTO common_mistakes (service_id, mistake, impact, prevention) VALUES
    (5, 'Filling Form 6 when already registered in another constituency', 'Dual enrollment in electoral roll is a punishable offense under Section 31 of Representation of the People Act 1950.', 'If shifting residence to a new house/city, use Form 8 (Shifting of Residence), never Form 6.'),
    (5, 'Entering wrong Assembly Constituency number', 'Application forwarded to incorrect Electoral Registration Officer causing rejection.', 'Look up your polling booth or ask family members for the exact Assembly Constituency name.'),
    (5, 'Uploading blurred photograph or cropped selfie', 'EPIC printed with unrecognized photo or rejected during administrative review.', 'Upload a clean, high-resolution passport-style photo with neutral expression.');
  `);

  // FAQs for Voter ID
  database.run(`
    INSERT INTO service_faqs (service_id, question, answer) VALUES
    (5, 'Is there any fee to apply for a Voter ID Card?', 'No. Voter ID registration (Form 6) and correction (Form 8) are 100% free of cost on the ECI portal.'),
    (5, 'Can I vote if I have an e-EPIC digital copy on my mobile phone?', 'Yes, as long as your name is listed on the active Electoral Roll, you can vote at your assigned polling booth showing your Voter ID or accepted alternative photo identity proofs (e.g. Aadhaar, Driving Licence, Passport).'),
    (5, 'What is the qualifying date for turning 18 to register as a voter?', 'ECI has 4 qualifying dates every year: January 1, April 1, July 1, and October 1. You can submit advance applications in the quarter you turn 18.');
  `);

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
      benefit: '₹1,000 per month direct bank transfer (DBT)',
      who_can_apply: 'Girl students who studied from Class 6 to Class 12 in Tamil Nadu Government Schools and are pursuing higher education.',
      what_you_get: 'A monthly financial assistance of ₹1,000 deposited directly into the student\'s Aadhaar-linked bank account until completion of undergraduate degree, diploma, or ITI course.',
      eligibility: [
        'Must be a female student',
        'Must have studied continuously from Class 6 to 12 in Tamil Nadu Government Schools (or Model/Corporation schools)',
        'Must be enrolled in recognized higher education (UG Degree, Engineering, Medicine, Agriculture, Arts & Science, Diploma, or ITI)',
        'No income ceiling limit applies'
      ],
      documents: [
        'Aadhaar Card of the student',
        'Active Bank Account Passbook (with IFSC and Aadhaar linked)',
        'Class 10 and Class 12 Marksheets / EMIS ID proof of Government School education',
        'College / Polytechnic / ITI Admission Proof & Bonafide Certificate'
      ],
      steps: [
        { step_number: 1, title: 'College Verification on UMIS Portal', description: 'During admission, student provides EMIS number to college nodal officer for verification on penkalvi.tn.gov.in portal.', location_type: 'Online' },
        { step_number: 2, title: 'Document & Aadhaar Seeding Check', description: 'Department verifies government school study history and confirms Aadhaar-linked DBT bank account.', location_type: 'Online' },
        { step_number: 3, title: 'Monthly DBT Disbursement', description: 'Upon approval, ₹1,000 is credited monthly directly into the beneficiary bank account without any intermediary.', location_type: 'Online' }
      ],
      status: 'VERIFIED',
      official_source: 'https://penkalvi.tn.gov.in',
      source_verified_authority: 'Social Welfare & Women Empowerment Dept, TN',
      last_verified: '2026-08-01',
      effective_date: '2022-09-05',
      important_notes: 'Students can avail this scheme alongside other Merit and Post-Matric scholarships without restriction.',
      target_demographics: ['student', 'women', 'college', 'girl student'],
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
      benefit: '₹1,000 per month direct bank transfer (DBT)',
      who_can_apply: 'Boy students who studied from Class 6 to Class 12 in Tamil Nadu Government Schools and enrolled in higher education.',
      what_you_get: 'Monthly financial assistance of ₹1,000 to assist boy students from government schools in purchasing textbooks, study materials, and managing college living expenses.',
      eligibility: [
        'Must be a male student',
        'Must have completed Class 6 to 12 in Tamil Nadu Government schools (including Tamil medium in aided schools)',
        'Must be actively enrolled in Undergraduate Degree, Professional Courses (Engineering/Law/Medicine), Diploma, or ITI programs',
        'Valid Aadhaar-seeded bank account in student\'s own name'
      ],
      documents: [
        'Aadhaar Card',
        'EMIS Number / School Study Certificate (Classes 6 to 12)',
        'College Bonafide Certificate & Identity Card',
        'Bank Account Passbook (Aadhaar linked)'
      ],
      steps: [
        { step_number: 1, title: 'Registration via College Portal', description: 'Submit your EMIS details to your college designated scholarship desk during admission.', location_type: 'Online' },
        { step_number: 2, title: 'Institutional Verification', description: 'Higher education institution verifies student attendance and enrollment on the state portal.', location_type: 'Online' },
        { step_number: 3, title: 'Monthly Credit via DBT', description: 'Monthly ₹1,000 allowance is disbursed directly to the verified bank account.', location_type: 'Online' }
      ],
      status: 'VERIFIED',
      official_source: 'https://umis.tn.gov.in',
      source_verified_authority: 'Higher Education Department, Government of Tamil Nadu',
      last_verified: '2026-08-01',
      effective_date: '2024-08-09',
      important_notes: 'Aadhaar seeding with bank account (NPCI mapping) is mandatory to receive the DBT credit.',
      target_demographics: ['student', 'boy student', 'youth', 'college'],
      education_level: ['College', 'ITI / Polytechnic', 'Graduate'],
      min_age: 17,
      max_age: 26,
      gender: 'Male'
    },
    {
      name: 'Perunthalaivar Kamarajar Free Breakfast Scheme (Chief Minister\'s Breakfast Scheme)',
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
      benefit: '100% Free Travel on all Ordinary Town Buses',
      who_can_apply: 'All women, transwomen, and persons with disabilities accompanied by an attendant.',
      what_you_get: 'Free travel across all government-operated state transport corporation (TNSTC/MTC) white-board ordinary town buses in Tamil Nadu with zero ticket charges.',
      eligibility: [
        'All female residents of all age groups (children, students, working women, senior citizens)',
        'Transgender women / Persons with disability',
        'Applicable on all ordinary fare town buses (White Board buses)'
      ],
      documents: [
        'No pass or ID registration required; zero-fare ticket is issued by the bus conductor on board.'
      ],
      steps: [
        { step_number: 1, title: 'Board Ordinary Town Bus', description: 'Board any ordinary (white board / destination board) city/town government bus in Tamil Nadu.', location_type: 'Offline' },
        { step_number: 2, title: 'Collect Zero-Rupee Travel Ticket', description: 'Conductor issues a ₹0 ticket for passenger counting and government subsidy settlement.', location_type: 'Offline' }
      ],
      status: 'VERIFIED',
      official_source: 'https://transport.tn.gov.in',
      source_verified_authority: 'Government of Tamil Nadu',
      last_verified: '2026-08-01',
      effective_date: '2021-05-08',
      important_notes: 'Covers over 5 million women daily commuters across Tamil Nadu, promoting economic mobility and savings.',
      target_demographics: ['women', 'mother', 'female', 'senior citizen', 'student'],
      gender: 'Female'
    },
    {
      name: 'Kalaignar Magalir Urimai Thittam (Women Basic Income Entitlement)',
      slug: 'kalaignar-magalir-urimai-thittam',
      category: 'Women & Family',
      department: 'Special Programme Implementation Department & Revenue Administration, Tamil Nadu',
      state_or_central: 'Tamil Nadu State Government',
      benefit: '₹1,000 per month direct bank transfer (DBT)',
      who_can_apply: 'Eligible female heads of households in Tamil Nadu meeting basic income and asset criteria.',
      what_you_get: 'Monthly basic income support of ₹1,000 deposited on the 15th of every month into the woman\'s bank account to recognize unpaid domestic labor and improve family financial security.',
      eligibility: [
        'Must be a woman aged 21 years or older',
        'Must be designated as the Female Head in the Family Smart Ration Card',
        'Annual family income should be below ₹2,50,000',
        'Family landholding less than 5 acres (wetland) or 10 acres (dryland)',
        'Annual household electricity consumption below 3,600 units'
      ],
      documents: [
        'Smart Family Ration Card (showing applicant as female head)',
        'Aadhaar Card of the applicant',
        'Bank Account Passbook (Aadhaar linked for DBT)',
        'Electricity Consumer Number (TANGEDCO receipt)'
      ],
      steps: [
        { step_number: 1, title: 'Camp Registration / e-Sevai Application', description: 'Apply at special ration shop camps or designated e-Sevai centers with biometric verification.', location_type: 'Offline' },
        { step_number: 2, title: 'Field & Aadhaar DBT Verification', description: 'Revenue staff verify ration card and land/power consumption records.', location_type: 'Online' },
        { step_number: 3, title: 'Monthly Direct Transfer', description: '₹1,000 is credited automatically to the bank account with SMS alert on the 15th of every month.', location_type: 'Online' }
      ],
      status: 'VERIFIED',
      official_source: 'https://kmut.tn.gov.in',
      source_verified_authority: 'Revenue Administration & SPI Dept, TN',
      last_verified: '2026-08-01',
      effective_date: '2023-09-15',
      important_notes: 'Over 1.15 crore women in Tamil Nadu currently benefit from this basic income entitlement.',
      target_demographics: ['women', 'mother', 'homemaker', 'head of family'],
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
      benefit: '100% Free Industry-Certified Skill Courses, Mentorship & Campus Placement',
      who_can_apply: 'College students studying in Engineering, Arts & Science, ITI, and Polytechnic colleges in Tamil Nadu.',
      what_you_get: 'Free access to high-demand industry curriculum (Data Science, Cloud Computing, AI, Robotics, Banking & Financial Markets, Spoken English, Competitive Exam Coaching) integrated into university semester credits with placement drives.',
      eligibility: [
        'Enrolled in recognized College / Polytechnic / University in Tamil Nadu',
        'Undergraduate and Postgraduate students across all years'
      ],
      documents: [
        'College Student ID Card & EMIS / Roll Number',
        'Aadhaar Card'
      ],
      steps: [
        { step_number: 1, title: 'Login via naanmudhalvan.tn.gov.in', description: 'Register with college institutional email / student ID.', location_type: 'Online' },
        { step_number: 2, title: 'Select Domain Track', description: 'Choose your specialized industry course (e.g. Full Stack, AI, Cambridge English, UPSC foundation).', location_type: 'Online' },
        { step_number: 3, title: 'Certification & Placement Drives', description: 'Complete practical labs and participate in state mega job fairs organized under Naan Mudhalvan.', location_type: 'Hybrid' }
      ],
      status: 'VERIFIED',
      official_source: 'https://naanmudhalvan.tn.gov.in',
      source_verified_authority: 'Tamil Nadu Skill Development Corporation (TNSDC)',
      last_verified: '2026-08-01',
      effective_date: '2022-03-01',
      important_notes: 'Over 1.5 million college students trained annually across 1,500+ higher educational institutions.',
      target_demographics: ['student', 'job seeker', 'youth', 'college'],
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
    database.run(`
      INSERT INTO schemes (
        name, slug, category, department, state_or_central, benefit, who_can_apply, what_you_get,
        eligibility, documents, application_steps, status, official_source,
        source_verified_authority, last_verified, effective_date, important_notes,
        target_demographics, education_level, min_age, max_age, income_limit_annual, gender
      ) VALUES (
        '${s.name.replace(/'/g, "''")}',
        '${s.slug}',
        '${s.category}',
        '${s.department.replace(/'/g, "''")}',
        '${s.state_or_central.replace(/'/g, "''")}',
        '${s.benefit.replace(/'/g, "''")}',
        '${s.who_can_apply.replace(/'/g, "''")}',
        '${s.what_you_get.replace(/'/g, "''")}',
        '${JSON.stringify(s.eligibility).replace(/'/g, "''")}',
        '${JSON.stringify(s.documents).replace(/'/g, "''")}',
        '${JSON.stringify(s.steps).replace(/'/g, "''")}',
        '${s.status}',
        '${s.official_source}',
        '${s.source_verified_authority.replace(/'/g, "''")}',
        '${s.last_verified}',
        ${s.effective_date ? `'${s.effective_date}'` : 'NULL'},
        ${s.important_notes ? `'${s.important_notes.replace(/'/g, "''")}'` : 'NULL'},
        '${JSON.stringify(s.target_demographics).replace(/'/g, "''")}',
        ${s.education_level ? `'${JSON.stringify(s.education_level).replace(/'/g, "''")}'` : 'NULL'},
        ${s.min_age !== undefined ? s.min_age : 'NULL'},
        ${s.max_age !== undefined ? s.max_age : 'NULL'},
        ${s.income_limit_annual !== undefined ? s.income_limit_annual : 'NULL'},
        ${s.gender ? `'${s.gender}'` : 'NULL'}
      );
    `);
  }
}

// -------------------------------------------------------------
// HELPER QUERY FUNCTIONS FOR SERVICES
// -------------------------------------------------------------

export async function getAllServices(): Promise<GovernmentService[]> {
  const database = await getDatabase();
  const res = database.exec(`
    SELECT id, name, slug, short_description, full_description, category, eligibility, official_website, processing_fee, processing_time, issuing_authority, icon, last_verified, important_notes
    FROM services
    ORDER BY id ASC
  `);

  if (!res.length || !res[0].values) return [];

  const columns = res[0].columns;
  return res[0].values.map((row) => {
    const obj: any = {};
    columns.forEach((col, idx) => {
      obj[col] = row[idx];
    });
    return {
      ...obj,
      overview: obj.full_description,
      processing_information: `${obj.processing_fee}. ${obj.processing_time}`,
      eligibility: JSON.parse(obj.eligibility || '[]')
    };
  });
}

export async function getServiceBySlug(slug: string): Promise<GovernmentService | null> {
  const database = await getDatabase();
  const serviceRes = database.exec(`
    SELECT id, name, slug, short_description, full_description, category, eligibility, official_website, processing_fee, processing_time, issuing_authority, icon, last_verified, important_notes
    FROM services
    WHERE slug = '${slug.replace(/'/g, "''")}'
    LIMIT 1
  `);

  if (!serviceRes.length || !serviceRes[0].values.length) return null;

  const row = serviceRes[0].values[0];
  const columns = serviceRes[0].columns;
  const serviceObj: any = {};
  columns.forEach((col, idx) => {
    serviceObj[col] = row[idx];
  });

  const serviceId = serviceObj.id;

  // Documents
  const docsRes = database.exec(`
    SELECT id, service_id, category, name, description, is_mandatory, accepted_options
    FROM documents
    WHERE service_id = ${serviceId}
    ORDER BY id ASC
  `);
  const documents: DocumentRequirement[] = docsRes.length && docsRes[0].values
    ? docsRes[0].values.map((dRow) => {
        const dObj: any = {};
        docsRes[0].columns.forEach((col, idx) => {
          dObj[col] = dRow[idx];
        });
        return {
          id: dObj.id,
          service_id: dObj.service_id,
          category: dObj.category,
          name: dObj.name,
          description: dObj.description,
          is_mandatory: Boolean(dObj.is_mandatory),
          accepted_options: JSON.parse(dObj.accepted_options || '[]')
        };
      })
    : [];

  // Steps
  const stepsRes = database.exec(`
    SELECT id, service_id, step_number, title, description, location_type, tip
    FROM application_steps
    WHERE service_id = ${serviceId}
    ORDER BY step_number ASC
  `);
  const steps: ApplicationStep[] = stepsRes.length && stepsRes[0].values
    ? stepsRes[0].values.map((sRow) => {
        const sObj: any = {};
        stepsRes[0].columns.forEach((col, idx) => {
          sObj[col] = sRow[idx];
        });
        return {
          id: sObj.id,
          service_id: sObj.service_id,
          step_number: sObj.step_number,
          title: sObj.title,
          description: sObj.description,
          location_type: sObj.location_type as any,
          tip: sObj.tip || undefined
        };
      })
    : [];

  // Mistakes
  const mistakesRes = database.exec(`
    SELECT id, service_id, mistake, impact, prevention
    FROM common_mistakes
    WHERE service_id = ${serviceId}
    ORDER BY id ASC
  `);
  const mistakes: CommonMistake[] = mistakesRes.length && mistakesRes[0].values
    ? mistakesRes[0].values.map((mRow) => {
        const mObj: any = {};
        mistakesRes[0].columns.forEach((col, idx) => {
          mObj[col] = mRow[idx];
        });
        return {
          id: mObj.id,
          service_id: mObj.service_id,
          mistake: mObj.mistake,
          impact: mObj.impact,
          prevention: mObj.prevention
        };
      })
    : [];

  // FAQs
  const faqsRes = database.exec(`
    SELECT id, service_id, question, answer
    FROM service_faqs
    WHERE service_id = ${serviceId}
    ORDER BY id ASC
  `);
  const faqs: ServiceFAQ[] = faqsRes.length && faqsRes[0].values
    ? faqsRes[0].values.map((fRow) => {
        const fObj: any = {};
        faqsRes[0].columns.forEach((col, idx) => {
          fObj[col] = fRow[idx];
        });
        return {
          id: fObj.id,
          service_id: fObj.service_id,
          question: fObj.question,
          answer: fObj.answer
        };
      })
    : [];

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
    min_age: obj.min_age !== null ? obj.min_age : undefined,
    max_age: obj.max_age !== null ? obj.max_age : undefined,
    income_limit_annual: obj.income_limit_annual !== null ? obj.income_limit_annual : undefined,
    gender: obj.gender || 'All'
  };
}

export async function getAllSchemes(category?: string, status?: string): Promise<GovernmentScheme[]> {
  const database = await getDatabase();
  let query = `SELECT * FROM schemes WHERE 1=1`;

  if (category && category.trim()) {
    query += ` AND category = '${category.replace(/'/g, "''")}'`;
  }
  if (status && status.trim()) {
    query += ` AND status = '${status.replace(/'/g, "''")}'`;
  }

  query += ` ORDER BY id ASC`;

  const res = database.exec(query);
  if (!res.length || !res[0].values) return [];

  const columns = res[0].columns;
  return res[0].values.map((row) => mapSchemeRow(columns, row));
}

export async function getSchemeBySlug(slug: string): Promise<GovernmentScheme | null> {
  const database = await getDatabase();
  const res = database.exec(`SELECT * FROM schemes WHERE slug = '${slug.replace(/'/g, "''")}' LIMIT 1`);

  if (!res.length || !res[0].values.length) return null;
  return mapSchemeRow(res[0].columns, res[0].values[0]);
}

export async function findSchemesForCitizen(profile: CitizenProfile): Promise<SchemeMatchResult[]> {
  const database = await getDatabase();
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
  const res = database.exec(`
    SELECT id, name, slug, short_description, full_description, category, eligibility, official_website, processing_fee, processing_time, issuing_authority, icon, last_verified, important_notes
    FROM services
    WHERE LOWER(name) LIKE '${q.replace(/'/g, "''")}'
       OR LOWER(short_description) LIKE '${q.replace(/'/g, "''")}'
       OR LOWER(full_description) LIKE '${q.replace(/'/g, "''")}'
       OR LOWER(category) LIKE '${q.replace(/'/g, "''")}'
    ORDER BY id ASC
  `);

  if (!res.length || !res[0].values) return [];

  const columns = res[0].columns;
  return res[0].values.map((row) => {
    const obj: any = {};
    columns.forEach((col, idx) => {
      obj[col] = row[idx];
    });
    return {
      ...obj,
      overview: obj.full_description,
      processing_information: `${obj.processing_fee}. ${obj.processing_time}`,
      eligibility: JSON.parse(obj.eligibility || '[]')
    };
  });
}

export async function searchUnified(query: string): Promise<{
  services: GovernmentService[];
  schemes: GovernmentScheme[];
}> {
  const database = await getDatabase();
  const q = `%${query.toLowerCase()}%`;

  const services = await searchServices(query);

  const schemeRes = database.exec(`
    SELECT * FROM schemes
    WHERE LOWER(name) LIKE '${q.replace(/'/g, "''")}'
       OR LOWER(category) LIKE '${q.replace(/'/g, "''")}'
       OR LOWER(benefit) LIKE '${q.replace(/'/g, "''")}'
       OR LOWER(who_can_apply) LIKE '${q.replace(/'/g, "''")}'
       OR LOWER(what_you_get) LIKE '${q.replace(/'/g, "''")}'
       OR LOWER(department) LIKE '${q.replace(/'/g, "''")}'
    ORDER BY id ASC
  `);

  const schemes = schemeRes.length && schemeRes[0].values
    ? schemeRes[0].values.map((row) => mapSchemeRow(schemeRes[0].columns, row))
    : [];

  return { services, schemes };
}
