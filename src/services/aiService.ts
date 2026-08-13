import { GoogleGenAI } from '@google/genai';
import { getAllServices, getServiceBySlug } from '../db/database.js';
import { ChatResponse, GovernmentService } from '../types.js';

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

  // Determine relevant service context
  let matchedService: GovernmentService | null = null;

  if (requestedServiceSlug) {
    matchedService = await getServiceBySlug(requestedServiceSlug);
  }

  if (!matchedService) {
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
  if (matchedService) {
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
`;
  }

  const systemInstruction = `
You are GovGuide AI, an empathetic, educational citizen guidance assistant for Indian government service procedures.
Your job is to explain government service procedures (Passport, Aadhaar, PAN Card, Driving Licence, Voter ID) in simple, clean, accessible language.

CRITICAL COMPLIANCE RULES:
1. Act purely as an educational guidance tool. NEVER claim to be an official government portal, official employee, or legal authority.
2. NEVER claim to submit applications or issue official certificates on behalf of the user.
3. Base your answers strictly on factual database information provided in the context when available. Do not invent fees, timelines, or requirements.
4. Keep answers concise, nicely structured with bullet points or numbered steps, bold headings, and clean markdown formatting.
5. If the user asks about a service outside the 5 supported services (Passport, Aadhaar, PAN, Driving Licence, Voter ID), gently inform them that GovGuide AI Version 1 supports these 5 primary services and answer with general guidance if appropriate while directing them to official portals.
6. Always include a brief reminder at the end directing users to verify details on the official government portal.
`;

  const prompt = `
User Question: "${message}"

${dbContextText}

Please provide a helpful, easy-to-understand response using the information above.
`;

  try {
    const ai = getAiClient();
    const response = await ai.models.generateContent({
      model: 'gemini-3.6-flash',
      contents: prompt,
      config: {
        systemInstruction,
        temperature: 0.3
      }
    });

    const text = response.text || "I'm sorry, I couldn't generate a response at this moment. Please try asking again or check the official government portal.";

    const defaultSuggested = matchedService ? [
      `What are the common mistakes for ${matchedService.name}?`,
      `How much does ${matchedService.name} cost?`,
      `What is the official website for ${matchedService.name}?`
    ] : [
      "What documents do I need for a fresh passport?",
      "How to get a free Instant e-PAN card?",
      "What is the procedure for a driving licence test?"
    ];

    return {
      answer: text,
      service: matchedService ? matchedService.name : undefined,
      source: matchedService ? matchedService.official_website : 'https://india.gov.in',
      suggestedQuestions: defaultSuggested,
      groundingContext: matchedService ? [`Verified database entry: ${matchedService.name}`] : undefined
    };
  } catch (error: any) {
    console.error('Gemini API Error:', error);

    // Safe fallback if Gemini API call fails or key is missing
    let fallbackText = '';
    if (matchedService) {
      fallbackText = `### ${matchedService.name} Guidance\n\n**Official Portal:** [${matchedService.official_website}](${matchedService.official_website})\n\n**Fee:** ${matchedService.processing_fee}\n**Processing Time:** ${matchedService.processing_time}\n\n**Key Documents Needed:**\n${(matchedService.documents || []).map(d => `- **${d.name}**: ${d.description}`).join('\n')}\n\n*Note: AI assistance is currently operating in offline database guidance mode. Please visit the official portal for live application tracking.*`;
    } else {
      fallbackText = `GovGuide AI provides step-by-step guidance for **Passport**, **Aadhaar**, **PAN Card**, **Driving Licence**, and **Voter ID**.\n\nPlease select one of the service cards from the home page or visit official portal [india.gov.in](https://india.gov.in).`;
    }

    return {
      answer: fallbackText,
      service: matchedService ? matchedService.name : undefined,
      source: matchedService ? matchedService.official_website : 'https://india.gov.in',
      suggestedQuestions: [
        "What documents do I need for a passport?",
        "How do I apply for a PAN card?",
        "How to download e-Aadhaar?"
      ]
    };
  }
}
