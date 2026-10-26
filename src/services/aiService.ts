import { GoogleGenAI } from '@google/genai';
import { getAllServices, getServiceBySlug, getAllSchemes, getSchemeBySlug } from '../db/database.js';
import { ChatResponse, GovernmentService, GovernmentScheme } from '../types.js';

let aiInstance: GoogleGenAI | null = null;

function getAiClient(): GoogleGenAI {
  if (!aiInstance) {
    const apiKey = process.env.GEMINI_API_KEY || '';
    aiInstance = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build'
        }
      }
    });
  }
  return aiInstance;
}

export async function processChatQuery(message: string, requestedServiceSlug?: string): Promise<ChatResponse> {
  const queryLower = message.toLowerCase();
  const allServices = await getAllServices();
  const allSchemes = await getAllSchemes();

  // Determine relevant service or scheme context
  let matchedService: GovernmentService | null = null;
  let matchedScheme: GovernmentScheme | null = null;

  if (requestedServiceSlug) {
    matchedService = await getServiceBySlug(requestedServiceSlug);
    if (!matchedService) {
      matchedScheme = await getSchemeBySlug(requestedServiceSlug);
    }
  }

  // Check matching scheme first
  if (!matchedService && !matchedScheme) {
    if (queryLower.includes('pudhumai') || queryLower.includes('penn') || queryLower.includes('moovalur')) {
      matchedScheme = await getSchemeBySlug('pudhumai-penn');
    } else if (queryLower.includes('tamil pudhalvan') || queryLower.includes('pudhalvan')) {
      matchedScheme = await getSchemeBySlug('tamil-pudhalvan');
    } else if (queryLower.includes('magalir') || queryLower.includes('urimai') || queryLower.includes('kmut') || queryLower.includes('kalaignar magalir')) {
      matchedScheme = await getSchemeBySlug('kalaignar-magalir-urimai-thittam');
    } else if (queryLower.includes('vidiyal') || queryLower.includes('free bus') || queryLower.includes('women bus')) {
      matchedScheme = await getSchemeBySlug('vidiyal-payanam-women-bus-travel');
    } else if (queryLower.includes('naan mudhalvan') || queryLower.includes('mudhalvan') || queryLower.includes('skill')) {
      matchedScheme = await getSchemeBySlug('naan-mudhalvan');
    } else if (queryLower.includes('breakfast') || queryLower.includes('kamarajar')) {
      matchedScheme = await getSchemeBySlug('chief-ministers-breakfast-scheme');
    } else if (queryLower.includes('pm kisan') || queryLower.includes('pm-kisan') || queryLower.includes('farmer')) {
      matchedScheme = await getSchemeBySlug('pm-kisan-income-support');
    } else if (queryLower.includes('old age') || queryLower.includes('oap') || queryLower.includes('pension')) {
      matchedScheme = await getSchemeBySlug('old-age-pension-scheme');
    } else if (queryLower.includes('uyegp') || queryLower.includes('self employment') || queryLower.includes('self-employment') || queryLower.includes('unemployed youth') || queryLower.includes('msme loan') || queryLower.includes('business loan tn')) {
      matchedScheme = await getSchemeBySlug('uyegp-self-employment');
    }
  }

  // Then check matching core service
  if (!matchedService && !matchedScheme) {
    if (queryLower.includes('passport')) {
      matchedService = await getServiceBySlug('passport');
    } else if (queryLower.includes('aadhaar') || queryLower.includes('aadhar') || queryLower.includes('uidai')) {
      matchedService = await getServiceBySlug('aadhaar');
    } else if (queryLower.includes('pan') || queryLower.includes('incometax')) {
      matchedService = await getServiceBySlug('pan-card');
    } else if (queryLower.includes('driving') || queryLower.includes('licence') || queryLower.includes('license') || queryLower.includes('dl') || queryLower.includes('parivahan') || queryLower.includes('rto')) {
      matchedService = await getServiceBySlug('driving-licence');
    } else if (queryLower.includes('voter') || queryLower.includes('epic') || queryLower.includes('election')) {
      matchedService = await getServiceBySlug('voter-id');
    }
  }

  let dbContextText = '';
  if (matchedScheme) {
    dbContextText = `
[RELEVANT GOVERNMENT SCHEME CONTEXT FROM VERIFIED DATABASE]:
Scheme Name: ${matchedScheme.name}
Category: ${matchedScheme.category}
Department: ${matchedScheme.department}
Authority / Jurisdiction: ${matchedScheme.state_or_central}
Trust Status: ${matchedScheme.status} (Verified Date: ${matchedScheme.last_verified})
Official Source: ${matchedScheme.official_source}
Financial / Social Benefit: ${matchedScheme.benefit}

Who Can Apply:
${matchedScheme.who_can_apply}

Detailed Entitlement:
${matchedScheme.what_you_get}

Eligibility Criteria:
${matchedScheme.eligibility.map(e => '- ' + e).join('\n')}

Required Documents:
${matchedScheme.documents.map(d => '- ' + d).join('\n')}

Application Procedure Steps:
${matchedScheme.application_steps.map(s => `${s.step_number}. ${s.title} (${s.location_type}): ${s.description}`).join('\n')}

Important Operational Notes:
${matchedScheme.important_notes || 'Verify latest guidelines on official portal.'}
`;
  } else if (matchedService) {
    dbContextText = `
[RELEVANT GOVERNMENT SERVICE CONTEXT FROM VERIFIED DATABASE]:
Service Name: ${matchedService.name}
Category: ${matchedService.category}
Official Website: ${matchedService.official_website}
Processing Fee: ${matchedService.processing_fee}
Processing Time: ${matchedService.processing_time}
Issuing Authority: ${matchedService.issuing_authority}

Overview:
${matchedService.full_description}

Eligibility:
${matchedService.eligibility.map(e => '- ' + e).join('\n')}

Required Documents:
${(matchedService.documents || []).map(d => `- [${d.category}] ${d.name}: ${d.description}. Accepted: ${d.accepted_options.join(', ')}`).join('\n')}

Application Steps:
${(matchedService.steps || []).map(s => `${s.step_number}. ${s.title} (${s.location_type}): ${s.description}${s.tip ? ' Tip: ' + s.tip : ''}`).join('\n')}

Common Mistakes to Avoid:
${(matchedService.mistakes || []).map(m => `- Mistake: ${m.mistake} | Impact: ${m.impact} | Prevention: ${m.prevention}`).join('\n')}

Frequently Asked Questions:
${(matchedService.faqs || []).map(f => `Q: ${f.question}\nA: ${f.answer}`).join('\n')}
`;
  } else {
    dbContextText = `
[AVAILABLE GOVERNMENT SERVICES IN SYSTEM]:
${allServices.map(s => `- ${s.name} (${s.slug}): ${s.short_description}. Website: ${s.official_website}`).join('\n')}

[AVAILABLE VERIFIED GOVERNMENT SCHEMES]:
${allSchemes.map(s => `- ${s.name} (${s.slug}): ${s.benefit}. Target: ${s.who_can_apply}. Source: ${s.official_source}`).join('\n')}
`;
  }

  const systemInstruction = `
You are GovGuide AI, an empathetic, educational citizen guidance assistant for Indian government service procedures and welfare schemes.
Your job is to explain government service procedures (Passport, Aadhaar, PAN Card, Driving Licence, Voter ID) and key welfare schemes (such as Kalaignar Magalir Urimai Thittam, Pudhumai Penn, Tamil Pudhalvan, Vidiyal Payanam, Naan Mudhalvan, PM-KISAN, etc.) in simple, clean, accessible language.

CRITICAL COMPLIANCE & ACCURACY RULES:
1. Act purely as an educational guidance tool. NEVER claim to be an official government portal, official employee, or legal authority.
2. NEVER claim to submit applications or issue official certificates on behalf of the user.
3. Base your answers strictly on factual database information provided in the context when available. Do not invent fees, eligibility rules, or timelines.
4. When stating eligibility, use responsible language: "You may be eligible based on the current criteria. Please verify with official portal..."
5. Keep answers concise, nicely structured with bullet points or numbered steps, bold headings, and clean markdown formatting.
6. Always include a brief reminder at the end directing users to verify details on the official government portal.
`;

  const prompt = `
User Question: "${message}"

${dbContextText}

Please provide a helpful, easy-to-understand response using the verified information above.
`;

  try {
    const ai = getAiClient();
    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        systemInstruction,
        temperature: 0.3
      }
    });

    const text = response.text || "I'm sorry, I couldn't generate a response at this moment. Please try asking again or check the official government portal.";

    let defaultSuggested: string[] = [];
    if (matchedScheme) {
      defaultSuggested = [
        `What documents are required for ${matchedScheme.name}?`,
        `Who is eligible for ${matchedScheme.name}?`,
        `What is the official website for ${matchedScheme.name}?`
      ];
    } else if (matchedService) {
      defaultSuggested = [
        `What are the common mistakes for ${matchedService.name}?`,
        `How much does ${matchedService.name} cost?`,
        `What is the official website for ${matchedService.name}?`
      ];
    } else {
      defaultSuggested = [
        "What documents do I need for a fresh passport?",
        "Who is eligible for Pudhumai Penn ₹1,000 scheme?",
        "How do I apply for UYEGP self-employment loan in Tamil Nadu?",
        "What are the guidelines for Tamil Pudhalvan scheme?"
      ];
    }

    const title = matchedScheme ? matchedScheme.name : (matchedService ? matchedService.name : undefined);
    const source = matchedScheme ? matchedScheme.official_source : (matchedService ? matchedService.official_website : 'https://india.gov.in');

    return {
      answer: text,
      service: title,
      source: source,
      suggestedQuestions: defaultSuggested,
      groundingContext: title ? [`Verified database entry: ${title}`] : undefined
    };
  } catch (error: any) {
    console.error('Gemini API Error:', error);

    // Safe fallback if Gemini API call fails or key is missing
    let fallbackText = '';
    if (matchedScheme) {
      fallbackText = `### ${matchedScheme.name} Guidance\n\n**Benefit:** ${matchedScheme.benefit}\n**Official Portal:** [${matchedScheme.official_source}](${matchedScheme.official_source})\n**Department:** ${matchedScheme.department}\n\n**Eligibility Highlights:**\n${matchedScheme.eligibility.map(e => `- ${e}`).join('\n')}\n\n**Key Documents Needed:**\n${matchedScheme.documents.map(d => `- ${d}`).join('\n')}\n\n*Note: AI assistance is currently operating in offline database guidance mode. Please visit [${matchedScheme.official_source}](${matchedScheme.official_source}) for direct registration.*`;
    } else if (matchedService) {
      fallbackText = `### ${matchedService.name} Guidance\n\n**Official Portal:** [${matchedService.official_website}](${matchedService.official_website})\n\n**Fee:** ${matchedService.processing_fee}\n**Processing Time:** ${matchedService.processing_time}\n\n**Key Documents Needed:**\n${(matchedService.documents || []).map(d => `- **${d.name}**: ${d.description}`).join('\n')}\n\n*Note: AI assistance is currently operating in offline database guidance mode. Please visit the official portal for live application tracking.*`;
    } else {
      fallbackText = `GovGuide AI provides step-by-step guidance for **Passport**, **Aadhaar**, **PAN Card**, **Driving Licence**, **Voter ID**, and **Welfare Schemes** (such as *Pudhumai Penn*, *Tamil Pudhalvan*, *Kalaignar Magalir Urimai Thittam*, *Vidiyal Payanam*, *Naan Mudhalvan*).\n\nPlease select one of the cards from the Schemes or Services directory or visit official portal [india.gov.in](https://india.gov.in).`;
    }

    const title = matchedScheme ? matchedScheme.name : (matchedService ? matchedService.name : undefined);
    const source = matchedScheme ? matchedScheme.official_source : (matchedService ? matchedService.official_website : 'https://india.gov.in');

    return {
      answer: fallbackText,
      service: title,
      source: source,
      suggestedQuestions: [
        "What documents do I need for Pudhumai Penn?",
        "How do I apply for Magalir Urimai Thittam?",
        "What is the procedure for Tamil Pudhalvan?"
      ]
    };
  }
}

