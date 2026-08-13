import initSqlJs, { Database } from 'sql.js';
import fs from 'fs';
import path from 'path';
import { GovernmentService, DocumentRequirement, ApplicationStep, CommonMistake, ServiceFAQ } from '../types.js';

let db: Database | null = null;
const dbDir = path.join(process.cwd(), 'data');
const dbPath = path.join(dbDir, 'govguide.db');

export async function getDatabase(): Promise<Database> {
  if (db) return db;

  const SQL = await initSqlJs();

  if (!fs.existsSync(dbDir)) {
    fs.mkdirSync(dbDir, { recursive: true });
  }

  if (fs.existsSync(dbPath)) {
    const filebuffer = fs.readFileSync(dbPath);
    db = new SQL.Database(filebuffer);
  } else {
    db = new SQL.Database();
    initTables(db);
    seedInitialData(db);
    saveDatabase(db);
  }

  return db;
}

function saveDatabase(database: Database) {
  const data = database.export();
  const buffer = Buffer.from(data);
  fs.writeFileSync(dbPath, buffer);
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
      icon TEXT NOT NULL
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
  `);
}

function seedInitialData(database: Database) {
  // 1. Passport
  database.run(`
    INSERT INTO services (id, name, slug, short_description, full_description, category, eligibility, official_website, processing_fee, processing_time, issuing_authority, icon)
    VALUES (
      1,
      'Passport (Ordinary / Tatkaal)',
      'passport',
      'Apply for a fresh Indian Passport or renew an existing passport for international travel.',
      'An Indian Passport is an official government travel document issued by the Ministry of External Affairs. It certifies the holder''s identity and citizenship for international travel and serves as a primary proof of identity and nationality.',
      'Identity & Travel',
      '["Indian Citizen by birth, descent, registration, or naturalization","Aged 18 or above (Separate minor passport process for age <18)","No pending criminal warrants or court restriction orders"]',
      'https://passportindia.gov.in',
      '₹1,500 (Fresh 36-page ordinary booklet), ₹2,000 (60-page booklet), ₹3,500 (Tatkaal passport)',
      'Normal: 15-30 working days; Tatkaal: 1-3 working days (Subject to police verification)',
      'Consular, Passport & Visa Division, Ministry of External Affairs',
      'FileText'
    );
  `);

  database.run(`
    INSERT INTO documents (service_id, category, name, description, is_mandatory, accepted_options)
    VALUES 
    (1, 'Address Proof', 'Proof of Present Address', 'Document verifying your residence for the last 1 year', 1, '["Aadhaar Card","Voter ID Card","Utility Bill (Electricity/Water/Gas - last 3 months)","Bank Passbook with photo & updated address","Registered Rent Agreement"]'),
    (1, 'Identity Proof', 'Proof of Date of Birth', 'Document certifying your birth date and identity', 1, '["Aadhaar Card / e-Aadhaar","Birth Certificate issued by Municipal Registrar","School Leaving Certificate / Class 10th Admit Card","PAN Card"]'),
    (1, 'ECR/Non-ECR', 'Proof of Non-ECR Status', 'Required if you passed 10th standard or higher to avoid Emigration Check Required status', 0, '["Class 10th (Matriculation) Mark Sheet or Passing Certificate","Higher Education Degree Certificate"]');

    INSERT INTO application_steps (service_id, step_number, title, description, location_type, tip)
    VALUES
    (1, 1, 'Register on Passport Seva Portal', 'Create an account on the official Passport Seva website (passportindia.gov.in) and log in.', 'Online', 'Always verify the exact URL is passportindia.gov.in to avoid scam sites.'),
    (1, 2, 'Fill Application Form Online', 'Click on "Apply for Fresh Passport / Re-issue of Passport" and fill personal, address, and family details.', 'Online', 'Cross-check spellings with your Aadhaar and Matriculation certificate.'),
    (1, 3, 'Pay Fee & Schedule Appointment', 'Pay the required passport fee online and choose your nearest Passport Seva Kendra (PSK) or Post Office PSK (POPSK).', 'Online', 'Morning appointment slots usually have shorter waiting queues.'),
    (1, 4, 'Visit PSK / POPSK for Document Verification', 'Arrive 15 minutes before slot with original documents and photocopies. Biometrics and photo will be taken.', 'Visit Center', 'Do not wear white clothing as the background photo screen is white.'),
    (1, 5, 'Police Verification & Delivery', 'Local police officer will visit your address for background check. Passport will be dispatched via India Post Speed Post upon clearance.', 'Hybrid', 'Keep original documents ready when the police officer visits or calls you to station.');

    INSERT INTO common_mistakes (service_id, mistake, impact, prevention)
    VALUES
    (1, 'Mismatch in parent name spellings', 'Application delayed or rejected during PSK verification counter.', 'Ensure parent names match exactly across your Class 10 mark sheet and Aadhaar.'),
    (1, 'Providing address proof where present stay is less than 1 year', 'Police verification failure or multi-station police review delays.', 'List all addresses lived in during the past 12 consecutive months if you recently relocated.'),
    (1, 'Paying on fake third-party websites', 'Financial fraud and exposure of private personal data.', 'Only use the official portal ending in .gov.in (passportindia.gov.in).');

    INSERT INTO service_faqs (service_id, question, answer)
    VALUES
    (1, 'Can I apply for Tatkaal passport if my address has changed?', 'Yes, provided you submit valid proof of current address along with Tatkaal eligibility documents.'),
    (1, 'Is police verification mandatory for minors?', 'Generally, police verification is waived for minors if at least one parent holds a valid passport with spouse name endorsed.');
  `);

  // 2. Aadhaar
  database.run(`
    INSERT INTO services (id, name, slug, short_description, full_description, category, eligibility, official_website, processing_fee, processing_time, issuing_authority, icon)
    VALUES (
      2,
      'Aadhaar Card (New Enrollment / Update)',
      'aadhaar',
      'Enroll for a new 12-digit Aadhaar number or update your demographic & biometric details.',
      'Aadhaar is a 12-digit unique identity number issued by UIDAI to all residents of India. It captures biometric (fingerprints and iris) and demographic data to serve as a universal identity and address proof.',
      'Identity & Residency',
      '["Resident of India (stayed in India for 182 days or more in the past 12 months)","Non-Resident Indians (NRIs) holding a valid Indian passport can enroll without 182-day wait","Minors (Baal Aadhaar for children under 5 years)"]',
      'https://uidai.gov.in',
      'Free for new enrollment; ₹50 for demographic update (Name/Address/DOB/Mobile); ₹100 for biometric update',
      '5 to 90 days (E-Aadhaar can be downloaded online once updated)',
      'Unique Identification Authority of India (UIDAI)',
      'CreditCard'
    );
  `);

  database.run(`
    INSERT INTO documents (service_id, category, name, description, is_mandatory, accepted_options)
    VALUES 
    (2, 'Identity Proof', 'Proof of Identity (PoI)', 'Document bearing name and photograph', 1, '["Passport","PAN Card","Voter ID","Driving Licence","Ration Card with photo"]'),
    (2, 'Address Proof', 'Proof of Address (PoA)', 'Document bearing name and current residential address', 1, '["Passport","Bank Passbook / Account Statement","Utility Bill (Electricity/Water/Gas - last 3 months)","Voter ID Card","Post Office Passbook"]'),
    (2, 'DOB Proof', 'Proof of Date of Birth (PoDB)', 'Document verifying exact date, month, and year of birth', 1, '["Birth Certificate issued by Registrar of Births","SSLC / Class 10th Certificate","Passport","PAN Card"]');

    INSERT INTO application_steps (service_id, step_number, title, description, location_type, tip)
    VALUES
    (2, 1, 'Locate Nearby Aadhaar Seva Kendra', 'Visit myaadhaar.uidai.gov.in or uidai.gov.in to book an online appointment at an official Aadhaar Seva Kendra or Bank/Post Office branch.', 'Online', 'Booking online saves hours of waiting in offline walk-in queues.'),
    (2, 2, 'Fill Enrollment / Correction Form', 'Fill in demographic details (Name, Address, Gender, DOB, Mobile Number, Email).', 'Visit Center', 'Ensure your mobile number is active; it is essential for receiving OTPs.'),
    (2, 3, 'Biometric & Photo Capture', 'Official operator will scan all 10 fingerprints, both irises, and capture a facial photograph.', 'Visit Center', 'Remove eyeglasses and eye contacts during iris scan.'),
    (2, 4, 'Collect Acknowledgement Slip', 'Obtain the 28-digit Enrollment ID (EID) slip containing timestamp and update tracking number.', 'Visit Center', 'Keep this slip safe until you download your updated e-Aadhaar.'),
    (2, 5, 'Track & Download e-Aadhaar', 'Check status online at myaadhaar.uidai.gov.in and download password-protected e-Aadhaar PDF.', 'Online', 'Password format is first 4 letters of your name in CAPITAL + year of birth (e.g., RAMA1990).');

    INSERT INTO common_mistakes (service_id, mistake, impact, prevention)
    VALUES
    (2, 'Not linking or updating mobile number', 'Inability to receive OTPs for online e-Aadhaar download, PAN linking, or government scheme benefits.', 'Always update your current active mobile number at the center during enrollment.'),
    (2, 'Attempting to change Date of Birth more than once', 'DOB update request gets rejected due to UIDAI limit guidelines.', 'DOB can only be updated ONCE in a lifetime. Submit verified birth certificate on first attempt.'),
    (2, 'Name spelling variations compared to school certificates', 'Fails automated authentication with passport and income tax portals.', 'Ensure exact letter-by-letter match with your Class 10 / Passport documents.');

    INSERT INTO service_faqs (service_id, question, answer)
    VALUES
    (2, 'Is e-Aadhaar equally valid as the physical printed Aadhaar card?', 'Yes! As per UIDAI circulars and IT Act, e-Aadhaar downloaded from official website is legally valid everywhere.'),
    (2, 'Can I update my address online without visiting a center?', 'Yes, if you have valid proof of address in your own name or Head of Family (HoF) consent, you can update address on myaadhaar.uidai.gov.in.');
  `);

  // 3. PAN Card
  database.run(`
    INSERT INTO services (id, name, slug, short_description, full_description, category, eligibility, official_website, processing_fee, processing_time, issuing_authority, icon)
    VALUES (
      3,
      'PAN Card (Permanent Account Number)',
      'pan-card',
      'Apply for a 10-digit alphanumeric PAN card required for financial transactions and tax filing.',
      'Permanent Account Number (PAN) is a ten-digit unique alphanumeric identifier issued by the Income Tax Department. It is essential for opening bank accounts, filing income tax returns, high-value financial transactions, and salary processing.',
      'Tax & Finance',
      '["Any individual citizen of India (including minors through parent/guardian)","Hindu Undivided Family (HUF), Companies, Firms, Trusts, & Associations","Foreign citizens doing business or earning taxable income in India"]',
      'https://www.incometax.gov.in',
      'Instant e-PAN via Aadhaar: FREE; Physical PAN Card delivery in India: ₹101 to ₹107; Foreign address delivery: ₹1,011',
      'Instant e-PAN: 10 minutes (PDF download); Physical PAN Card: 7-15 working days via Speed Post',
      'Income Tax Department (via NSDL e-Gov / Protean / UTIITSL / e-Filing Portal)',
      'Building'
    );
  `);

  database.run(`
    INSERT INTO documents (service_id, category, name, description, is_mandatory, accepted_options)
    VALUES 
    (3, 'e-KYC / Identity', 'Aadhaar Card (For Instant e-PAN)', 'Aadhaar card with linked mobile number for OTP e-KYC', 1, '["Aadhaar Card"]'),
    (3, 'Physical Application Docs', 'Proof of Identity & Address (For Paper / Non-eKYC)', 'Documents if applying without Aadhaar OTP', 1, '["Voter ID","Passport","Driving Licence","Bank Account Statement"]');

    INSERT INTO application_steps (service_id, step_number, title, description, location_type, tip)
    VALUES
    (3, 1, 'Choose Portal (e-Filing / Protean NSDL)', 'For Instant Free e-PAN, visit incometax.gov.in. For physical card or name correction, visit online-services.protean-tinpan.com or utiitsl.com.', 'Online', 'Instant e-PAN is 100% free and takes under 10 minutes if mobile is linked to Aadhaar.'),
    (3, 2, 'Enter Aadhaar Details & OTP Verification', 'Enter your 12-digit Aadhaar number and submit the OTP sent to your Aadhaar-registered mobile number.', 'Online', 'Ensure your Aadhaar name and DOB match your supporting records.'),
    (3, 3, 'Validate Personal Info & Submit', 'Review auto-fetched name, photo, address, and date of birth from Aadhaar records.', 'Online', 'For physical card delivery, check the checkbox "Yes, physical card required".'),
    (3, 4, 'Download e-PAN / Receive Physical Card', 'Instant e-PAN PDF will be generated immediately. Physical card arrives at Aadhaar address via Speed Post.', 'Online', 'PDF password is your Date of Birth in DDMMYYYY format (e.g., 15081995).');

    INSERT INTO common_mistakes (service_id, mistake, impact, prevention)
    VALUES
    (3, 'Applying for multiple PAN cards', 'Possessing more than one PAN is illegal under Section 272B of Income Tax Act and incurs a ₹10,000 penalty.', 'If you already have a PAN, apply for "Reprint / Correction" rather than a fresh PAN.'),
    (3, 'Unlinked Aadhaar and PAN', 'PAN becomes inoperative, blocking bank transactions, salary credit, and TDS refunds.', 'Link PAN with Aadhaar on the Income Tax portal immediately upon receipt.'),
    (3, 'Parent name omission in physical PAN form', 'Physical card gets delayed for physical document verification.', 'Ensure father''s or mother''s name is accurately filled in section 2 of application.');

    INSERT INTO service_faqs (service_id, question, answer)
    VALUES
    (3, 'Is Instant e-PAN legally valid everywhere?', 'Yes, e-PAN contains a QR code and digital signature, making it 100% legally valid at par with physical PAN card.'),
    (3, 'How do I open the password-protected e-PAN PDF file?', 'The password is your Date of Birth in DDMMYYYY format without slashes or spaces.');
  `);

  // 4. Driving Licence
  database.run(`
    INSERT INTO services (id, name, slug, short_description, full_description, category, eligibility, official_website, processing_fee, processing_time, issuing_authority, icon)
    VALUES (
      4,
      'Driving Licence (Learner & Permanent)',
      'driving-licence',
      'Step-by-step guide to obtaining a Learner''s Licence (LL) and Permanent Driving Licence (DL).',
      'A Driving Licence is an official document issued by state Regional Transport Offices (RTO) authorizing individuals to operate motor vehicles on public roads under the Motor Vehicles Act.',
      'Transport & Mobility',
      '["Age 16+ for gearless 50cc two-wheelers; Age 18+ for light motor vehicles (cars/motorcycles with gear); Age 20+ for transport/commercial vehicles","Valid Learner''s Licence (held for at least 30 days before taking permanent DL test)","Passed driving competency test & medical declaration"]',
      'https://parivahan.gov.in',
      'Learner Licence (LL): ₹150 + ₹50 test fee; Permanent DL: ₹200 + ₹300 driving test fee + ₹200 smart card fee (~₹700 total)',
      'Learner Licence: Instant online test; Permanent DL: Issued within 7-15 days post successful driving test',
      'Ministry of Road Transport & Highways (Parivahan Sewa) / State RTOs',
      'Car'
    );
  `);

  database.run(`
    INSERT INTO documents (service_id, category, name, description, is_mandatory, accepted_options)
    VALUES 
    (4, 'Age Proof', 'Proof of Age', 'Document confirming minimum age criteria', 1, '["Class 10th Certificate","Passport","Aadhaar Card","Birth Certificate","PAN Card"]'),
    (4, 'Address Proof', 'Proof of Current Address', 'Document verifying current residence within RTO jurisdiction', 1, '["Aadhaar Card","Voter ID","Passport","Electricity Bill / Rent Agreement"]'),
    (4, 'Medical Fitness', 'Form 1 & Form 1A Medical Certificate', 'Self-declaration (Form 1) or MBBS Doctor certificate (Form 1A for age >40 or commercial DL)', 1, '["Form 1 (Self declaration for non-transport under 40)","Form 1A signed by Registered Medical Practitioner"]');

    INSERT INTO application_steps (service_id, step_number, title, description, location_type, tip)
    VALUES
    (4, 1, 'Apply for Learner Licence (LL) Online', 'Visit sarathi.parivahan.gov.in, select your state, and click "Apply for Learner Licence".', 'Online', 'In many states, LL test can be taken online from home using Aadhaar authentication.'),
    (4, 2, 'Pass Online Road Safety Test', 'Complete the computer test covering traffic signs, road rules, and signals (12/15 pass score).', 'Online', 'Review Sarathi sample mock test questions online beforehand.'),
    (4, 3, 'Practice Driving during 30-day Mandatory Period', 'Hold LL for minimum 30 days (valid up to 6 months). Drive with a "L" board accompanied by a valid DL holder.', 'Offline', 'Ensure you practice parallel parking, incline restart, and 8-track maneuvers.'),
    (4, 4, 'Book DL Driving Test Slot', 'Log in to Parivahan, pay DL test fee, and select date & time slot at your local RTO track.', 'Online', 'Book your slot early as weekend/morning slots fill up quickly.'),
    (4, 5, 'Take RTO Practical Driving Test', 'Report to RTO track with vehicle, LL, Form 1, and documents. Pass track driving test before Motor Vehicle Inspector.', 'Visit Center', 'Always wear seatbelt/helmet, give correct turn indicators, and avoid stalling the engine.');

    INSERT INTO common_mistakes (service_id, mistake, impact, prevention)
    VALUES
    (4, 'Attempting DL test before completing 30 days of Learner Licence', 'Application rejected automatically by the system portal.', 'DL test slot booking only unlocks on the 31st day after LL issuance date.'),
    (4, 'Forgetting to carry original LL and vehicle registration (RC) & insurance', 'Disqualified from taking test on slot date.', 'Carry original physical LL printout, vehicle RC, valid Pollution Certificate (PUC), and Insurance card.'),
    (4, 'Failing turn signal or mirror check on RTO track', 'Failed test result, requiring 7-day waiting period before re-booking slot.', 'Explicitly check side mirrors and turn on indicators before every turn on the track.');

    INSERT INTO service_faqs (service_id, question, answer)
    VALUES
    (4, 'Can I take the Learner Licence test from home?', 'Yes, contactless Aadhaar-authenticated LL application lets you take the test online from home in most states.'),
    (4, 'What is the validity of a Learner Licence?', 'A Learner Licence is valid for 6 months across India. You can apply for permanent DL after 30 days.');
  `);

  // 5. Voter ID
  database.run(`
    INSERT INTO services (id, name, slug, short_description, full_description, category, eligibility, official_website, processing_fee, processing_time, issuing_authority, icon)
    VALUES (
      5,
      'Voter ID Card (EPIC - Form 6 / 8)',
      'voter-id',
      'Register as a new voter (Form 6) or update/shift address in existing Voter ID (Form 8).',
      'Elector Photo Identity Card (EPIC), commonly known as Voter ID, is issued by the Election Commission of India. It grants voting rights in democratic elections and serves as an official national identity and address proof.',
      'Electoral & Civic',
      '["Indian Citizen aged 18 or above as of qualifying date (Jan 1, Apr 1, Jul 1, Oct 1)","Ordinary resident of the constituency where registration is requested","Not disqualified under electoral laws or declared mentally unsound by court"]',
      'https://voters.eci.gov.in',
      '100% FREE for registration and e-EPIC download; ₹25 for duplicate physical card replacement if lost',
      '15 to 30 days (Booth Level Officer / BLO field verification process)',
      'Election Commission of India (ECI)',
      'CheckSquare'
    );
  `);

  database.run(`
    INSERT INTO documents (service_id, category, name, description, is_mandatory, accepted_options)
    VALUES 
    (5, 'Age Proof', 'Proof of Age', 'Document verifying age 18 or above', 1, '["Aadhaar Card","Birth Certificate","Class 10th Certificate","PAN Card","Passport"]'),
    (5, 'Address Proof', 'Proof of Residence', 'Document certifying residence in the electoral constituency', 1, '["Aadhaar Card","Current Passbook of Bank/Post Office","Utility Bill (Electricity/Water/Gas)","Passport","Registered Rent Agreement"]'),
    (5, 'Photograph', 'Passport Size Photo', 'Recent passport photo with light background', 1, '["Recent 3.5cm x 4.5cm color photograph in JPEG format"]');

    INSERT INTO application_steps (service_id, step_number, title, description, location_type, tip)
    VALUES
    (5, 1, 'Visit Voters Service Portal or Download ECINet App', 'Go to voters.eci.gov.in or open Voter Helpline App on mobile.', 'Online', 'Create an account using your mobile number and email ID.'),
    (5, 2, 'Fill Form 6 (New) or Form 8 (Correction / Shift)', 'Click "Form 6 - Application for New Voter" and fill state, assembly constituency, personal details, and address.', 'Online', 'Double check your Assembly Constituency (AC) number based on your pin code.'),
    (5, 3, 'Upload Documents & Photo', 'Upload scanned copies of age proof, address proof, and photograph.', 'Online', 'Ensure uploaded file sizes are under 2MB in JPEG or PNG format.'),
    (5, 4, 'Field Verification by Booth Level Officer (BLO)', 'A local BLO will visit your residence to verify address and document originals.', 'Hybrid', 'Inform family members or neighbors so they can confirm your residence if you are at work.'),
    (5, 5, 'EPIC Generation & e-EPIC Download', 'Once Electoral Registration Officer (ERO) approves, download digital e-EPIC PDF online or receive physical card via India Post.', 'Online', 'e-EPIC PDF is digitally signed and valid for voting at polling booths.');

    INSERT INTO common_mistakes (service_id, mistake, impact, prevention)
    VALUES
    (5, 'Selecting wrong Assembly Constituency', 'Application forwarded to incorrect ERO, causing rejection or long transfer delays.', 'Search your constituency using your family member''s Voter ID or pin code on voters.eci.gov.in.'),
    (5, 'Double registration in two different towns', 'Having duplicate voter registrations is an offense under Representation of the People Act.', 'File Form 8 (Shifting of Residence) to transfer your existing Voter ID rather than applying for a new Form 6.'),
    (5, 'Blurry document or photo upload', 'BLO marks verification status as incomplete.', 'Upload clear, well-lit scans where text and photo are easily legible.');

    INSERT INTO service_faqs (service_id, question, answer)
    VALUES
    (5, 'Can I vote if I hold e-EPIC PDF on my phone?', 'You can download e-EPIC, print it out, and carry it along with an official photo ID (Aadhaar/Passport/DL) to vote.'),
    (5, 'How do I track my Form 6 application status?', 'Enter your 11-digit Reference ID received via SMS on the voters.eci.gov.in "Track Application Status" page.');
  `);
}

export async function searchServices(query: string): Promise<GovernmentService[]> {
  const database = await getDatabase();
  const q = `%${query.toLowerCase()}%`;
  const res = database.exec(`
    SELECT id, name, slug, short_description, full_description, category, eligibility, official_website, processing_fee, processing_time, issuing_authority, icon
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

export async function getAllServices(): Promise<GovernmentService[]> {
  const database = await getDatabase();
  const res = database.exec(`
    SELECT id, name, slug, short_description, full_description, category, eligibility, official_website, processing_fee, processing_time, issuing_authority, icon
    FROM services ORDER BY id ASC
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
  const stmt = database.prepare(`SELECT * FROM services WHERE slug = :slug`);
  stmt.bind({ ':slug': slug });

  if (!stmt.step()) {
    stmt.free();
    return null;
  }

  const row = stmt.getAsObject();
  stmt.free();

  const serviceId = row.id as number;

  // Documents
  const docsStmt = database.prepare(`SELECT * FROM documents WHERE service_id = :sid ORDER BY id ASC`);
  docsStmt.bind({ ':sid': serviceId });
  const documents: DocumentRequirement[] = [];
  while (docsStmt.step()) {
    const d = docsStmt.getAsObject();
    documents.push({
      id: d.id as number,
      service_id: d.service_id as number,
      category: d.category as string,
      name: d.name as string,
      description: d.description as string,
      is_mandatory: Boolean(d.is_mandatory),
      accepted_options: JSON.parse((d.accepted_options as string) || '[]')
    });
  }
  docsStmt.free();

  // Steps
  const stepsStmt = database.prepare(`SELECT * FROM application_steps WHERE service_id = :sid ORDER BY step_number ASC`);
  stepsStmt.bind({ ':sid': serviceId });
  const steps: ApplicationStep[] = [];
  while (stepsStmt.step()) {
    const s = stepsStmt.getAsObject();
    steps.push({
      id: s.id as number,
      service_id: s.service_id as number,
      step_number: s.step_number as number,
      title: s.title as string,
      description: s.description as string,
      location_type: s.location_type as any,
      tip: s.tip as string
    });
  }
  stepsStmt.free();

  // Mistakes
  const mistakesStmt = database.prepare(`SELECT * FROM common_mistakes WHERE service_id = :sid ORDER BY id ASC`);
  mistakesStmt.bind({ ':sid': serviceId });
  const mistakes: CommonMistake[] = [];
  while (mistakesStmt.step()) {
    const m = mistakesStmt.getAsObject();
    mistakes.push({
      id: m.id as number,
      service_id: m.service_id as number,
      mistake: m.mistake as string,
      impact: m.impact as string,
      prevention: m.prevention as string
    });
  }
  mistakesStmt.free();

  // FAQs
  const faqsStmt = database.prepare(`SELECT * FROM service_faqs WHERE service_id = :sid ORDER BY id ASC`);
  faqsStmt.bind({ ':sid': serviceId });
  const faqs: ServiceFAQ[] = [];
  while (faqsStmt.step()) {
    const f = faqsStmt.getAsObject();
    faqs.push({
      id: f.id as number,
      service_id: f.service_id as number,
      question: f.question as string,
      answer: f.answer as string
    });
  }
  faqsStmt.free();

  return {
    id: row.id as number,
    name: row.name as string,
    slug: row.slug as string,
    short_description: row.short_description as string,
    full_description: row.full_description as string,
    overview: row.full_description as string,
    category: row.category as string,
    eligibility: JSON.parse((row.eligibility as string) || '[]'),
    official_website: row.official_website as string,
    processing_fee: row.processing_fee as string,
    processing_time: row.processing_time as string,
    processing_information: `${row.processing_fee as string}. ${row.processing_time as string}`,
    issuing_authority: row.issuing_authority as string,
    icon: row.icon as string,
    documents,
    steps,
    mistakes,
    faqs
  };
}
