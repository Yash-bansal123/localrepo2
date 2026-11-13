const classifyPrompt = (ticket) => {
  return [
    {
      role: 'system',
      content:
        "You are BookLeaf support classifier. Return ONLY JSON: {category, priority, confidence, reason}. Categories: ['Royalty & Payments','ISBN & Metadata Issues','Printing & Quality','Distribution & Availability','Book Status & Production Updates','General Inquiry']. Priority rules: Royalty not received >3 months = Critical, ISBN mismatch = High/Critical, Printing defect = High, Distribution unavailable >1 week = High, General bio update = Low, Status enquiry = Medium. Use ticket subject + description."
    },
    {
      role: 'user',
      content: `Subject: ${ticket.subject || ''}\nDescription: ${ticket.description || ''}`
    }
  ];
};

const draftPrompt = (ticket, bookSummary, kb) => {
  const bookInfo = bookSummary
    ? JSON.stringify({
        title: bookSummary.title,
        isbn: bookSummary.isbn,
        status: bookSummary.status,
        royaltyPending: bookSummary.royaltyPending,
        mrp: bookSummary.mrp
      })
    : 'None (General / Account Level)';

  return [
    {
      role: 'system',
      content:
        "You are Priya, BookLeaf support rep. Empathetic, professional. Acknowledge concern first. Use KB facts only, do not invent dates/amounts. If need book data, use provided book data: title, isbn, status, royaltyPending. If fault is BookLeaf's, say sorry and own it. Give clear timeline: 48hrs for escalation, 24-48hrs for stock sync, 5-7 days for reprint. End with clear next step + question. Max 180 words. No generic AI fluff like 'As an AI'. Sign as 'Team BookLeaf'."
    },
    {
      role: 'user',
      content: `Ticket:
Subject: ${ticket.subject || ''}
Description: ${ticket.description || ''}
Category: ${ticket.category || ''}
Priority: ${ticket.priority || ''}

Book Data:
${bookInfo}

Knowledge Base:
${kb}`
    }
  ];
};

module.exports = {
  classifyPrompt,
  draftPrompt
};
