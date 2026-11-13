const OpenAI = require('openai');
const { SHORT_KB } = require('./knowledgeBase');
const { classifyPrompt, draftPrompt } = require('./aiPrompts');

const getOpenAIClient = () => {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey || !apiKey.trim()) {
    return null;
  }

  const trimmed = apiKey.trim();

  if (trimmed === 'demo' || trimmed === 'mock' || trimmed.startsWith('mock-')) {
    return {
      chat: {
        completions: {
          create: async ({ model, messages, response_format }) => {
            const userMsg = messages.find((m) => m.role === 'user')?.content || '';
            const lower = userMsg.toLowerCase();

            if (response_format && response_format.type === 'json_object') {
              let result = {
                category: 'General Inquiry',
                priority: 'Medium',
                confidence: 82,
                reason: 'Classified general inquiry based on ticket description.'
              };

              if (lower.includes('royalt') || lower.includes('payment') || lower.includes('earning') || lower.includes('quarter')) {
                const isCritical =
                  lower.includes('6 month') ||
                  lower.includes('2 quarter') ||
                  lower.includes('>3 month') ||
                  lower.includes('months');
                result = {
                  category: 'Royalty & Payments',
                  priority: isCritical ? 'Critical' : 'High',
                  confidence: 94,
                  reason: 'Author reports delayed royalty payouts exceeding 3 months.'
                };
              } else if (lower.includes('isbn') || lower.includes('metadata') || lower.includes('barcode')) {
                result = {
                  category: 'ISBN & Metadata Issues',
                  priority: 'High',
                  confidence: 92,
                  reason: 'Reported mismatch between printed ISBN and distribution channel listing.'
                };
              } else if (lower.includes('bio') || lower.includes('photo') || lower.includes('profile')) {
                result = {
                  category: 'General Inquiry',
                  priority: 'Low',
                  confidence: 90,
                  reason: 'Routine author profile and biography update request.'
                };
              } else if (lower.includes('print') || lower.includes('defect') || lower.includes('paper') || lower.includes('spine')) {
                result = {
                  category: 'Printing & Quality',
                  priority: 'High',
                  confidence: 91,
                  reason: 'Printing quality defect reported.'
                };
              } else if (lower.includes('distribut') || lower.includes('amazon') || lower.includes('flipkart') || lower.includes('unavailable')) {
                result = {
                  category: 'Distribution & Availability',
                  priority: 'High',
                  confidence: 89,
                  reason: 'Distribution channel stock sync issue.'
                };
              }

              return {
                choices: [{ message: { content: JSON.stringify(result) } }],
                usage: { total_tokens: 145 }
              };
            }

            let draftText = '';
            if (lower.includes('royalt') || lower.includes('quarter') || lower.includes('payment')) {
              draftText =
                "Hello,\n\nI completely understand your concern regarding your delayed royalty payment and sincerely apologize for the inconvenience caused. Let me look into your account right away.\n\nAt BookLeaf, royalties are 80% of net profit (MRP minus printing, platform commission, and shipping), disbursed quarterly within 45 days of quarter end. The minimum payout threshold is Rs. 1,000; amounts below this automatically roll over to the next quarter.\n\nI have escalated this to our finance team for immediate audit. We will share your detailed payout ledger within 48 hours.\n\nCould you please confirm if your registered bank account details are up to date in your author profile?\n\nWarm regards,\nTeam BookLeaf";
            } else if (lower.includes('isbn') || lower.includes('metadata')) {
              draftText =
                "Hello,\n\nThank you for bringing this ISBN discrepancy to our attention. I understand how confusing this is for your readers, and we take full responsibility for ensuring metadata accuracy.\n\nEach BookLeaf title receives a unique BookLeaf imprint ISBN. Metadata sync issues with retail platforms like Amazon are treated with high priority. I have directly escalated this to our production team to initiate a metadata re-sync, which typically resolves within 24–48 hours.\n\nWe will monitor the listing closely until Amazon reflects the correct ISBN.\n\nCould you please share the direct Amazon listing link and the printed ISBN on your book copy so we can verify the mismatch?\n\nWarm regards,\nTeam BookLeaf";
            } else if (lower.includes('bio') || lower.includes('profile')) {
              draftText =
                "Hello,\n\nThank you for reaching out to us. We would be delighted to help you update your author bio and profile photo.\n\nPlease reply with your updated bio description (under 250 words) and a high-resolution portrait photograph. Once received, our author relations team will update your BookLeaf author profile within 24–48 hours.\n\nIs there any specific social media link or website you would also like us to include on your page?\n\nWarm regards,\nTeam BookLeaf";
            } else {
              draftText =
                "Hello,\n\nThank you for reaching out to BookLeaf author support. I acknowledge your query and am here to help.\n\nOur team is reviewing the details provided and will escalate to the relevant department within 48 hours. If this pertains to printing quality, reprints are processed in 5–7 business days upon photo verification; distribution re-syncs take 24–48 hours.\n\nPlease let us know if you have any additional details or screenshots to share.\n\nWarm regards,\nTeam BookLeaf";
            }

            return {
              choices: [{ message: { content: draftText } }],
              usage: { total_tokens: 280 }
            };
          }
        }
      }
    };
  }

  try {
    return new OpenAI({ apiKey: trimmed });
  } catch (err) {
    console.error('Error initializing OpenAI client:', err.message);
    return null;
  }
};

const classifyTicket = async (ticket) => {
  const fallback = {
    category: 'General Inquiry',
    priority: 'Medium',
    confidence: 0,
    reason: 'AI failed'
  };

  try {
    const openai = getOpenAIClient();
    if (!openai) {
      return fallback;
    }

    const messages = classifyPrompt(ticket);
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages,
      temperature: 0.2,
      max_tokens: 250,
      response_format: { type: 'json_object' }
    });

    if (completion.usage) {
      console.log(
        `AI tokens used: ${completion.usage.total_tokens} for ticket ${ticket._id || ticket.id || 'new'}`
      );
    }

    const content = completion.choices[0]?.message?.content;
    if (!content) return fallback;

    const parsed = JSON.parse(content);
    const validCategories = [
      'Royalty & Payments',
      'ISBN & Metadata Issues',
      'Printing & Quality',
      'Distribution & Availability',
      'Book Status & Production Updates',
      'General Inquiry'
    ];
    const validPriorities = ['Critical', 'High', 'Medium', 'Low'];

    return {
      category: validCategories.includes(parsed.category) ? parsed.category : 'General Inquiry',
      priority: validPriorities.includes(parsed.priority) ? parsed.priority : 'Medium',
      confidence:
        typeof parsed.confidence === 'number'
          ? (parsed.confidence > 1 ? parsed.confidence : Math.round(parsed.confidence * 100))
          : 85,
      reason: parsed.reason || 'Classified by AI'
    };
  } catch (error) {
    console.error('AI Classification error:', error.message);
    return fallback;
  }
};

const generateDraft = async (ticket, book) => {
  try {
    const openai = getOpenAIClient();
    if (!openai) {
      return '';
    }

    const bookSummary = book
      ? {
          title: book.title,
          isbn: book.isbn,
          status: book.status,
          royaltyPending: book.royaltyPending,
          mrp: book.mrp
        }
      : null;

    const messages = draftPrompt(ticket, bookSummary, SHORT_KB);
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages,
      temperature: 0.4,
      max_tokens: 500
    });

    if (completion.usage) {
      console.log(
        `AI tokens used: ${completion.usage.total_tokens} for ticket ${ticket._id || ticket.id || 'draft'}`
      );
    }

    return completion.choices[0]?.message?.content?.trim() || '';
  } catch (error) {
    console.error('AI Draft generation error:', error.message);
    return '';
  }
};

module.exports = {
  getOpenAIClient,
  classifyTicket,
  generateDraft
};
