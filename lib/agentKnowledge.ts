// What a good bookkeeper, CRM manager and ERP administrator knows, written for the agent.
// Built from standard small-business practice: quote-to-cash billing steps (quotation, order, tax invoice,
// payment status paid/partial/unpaid, ageing of receivables), common CRM pipeline stages
// (contact, lead, prospect, opportunity, customer, lost) and the words Indian owners actually use.
// It is plain text inside the agent prompt. Keep it short: every word is paid for on every call.

export const AGENT_KNOWLEDGE = `HOW TO UNDERSTAND OWNERS (they write fast, mix English, Hindi and Hinglish, and skip details):
- Money coming in: "paid", "received", "mil gaye", "aa gaye", "de diye", "transfer kiya", "UPI aaya" mean a payment arrived. "Advance" or "token" is a part payment.
- Money still owed to the owner: "baaki", "pending", "udhaar", "due", "outstanding", "nahi diya" mean unpaid. Owed BY the owner to a supplier is a Bill (Expenses, Type Bill, Status Unpaid).
- Money going out: "kharcha", "spent", "paid rent", "salary diya", "bought" are Expenses. Salary paid is an Expense with Category Salary.
- Stock words: "maal", "stock", "pieces", "units" and "aaya" (arrived) or "gaya" (sent) refer to Inventory. "Wapas" or "returned" is a Returns record.
- Document words: "bill", "invoice" and "bill banao" mean an Invoice. "Quote", "estimate", "quotation" mean a Quotation, never an Invoice. A quotation becomes an invoice only when the owner says the client accepted and work or delivery is done or billed.
- Time words: "aaj" today, "kal" tomorrow (or yesterday, use context: "kal bhejna" is tomorrow, "kal mila" is yesterday), "parso" day after tomorrow, "agle hafte" next week, "month end" is the last day of the month.
- Amounts: "15k", "15,000", "15 hazaar" are 15000. "1.5 lakh", "ek lakh" are 150000, "2 crore" is 20000000.

HOW A BUSINESS FLOWS (use it to decide which records a sentence needs):
- Selling: lead (CRM) then quotation then agreed deal (CRM Status Converted, a Projects record for the work if it is a service) then invoice then payment then follow-up on unpaid.
- A client with a price ("one website for 15000") is a Converted client plus an Unpaid invoice plus the work in Projects. A repeating fee ("2000 a month") is a Projects record, not an invoice, until it is billed.
- Payment status of an invoice is Paid, part paid or Unpaid. A payment smaller than the invoice amount is a part payment: send the amount in mark_paid and the system keeps the balance due. Never mark an invoice fully paid for a smaller amount.
- CRM stages: New (just came in), Contacted (spoke or messaged, "will think", "interested"), Converted (said yes, got the work, paid), Lost (said no, "not interested", went to someone else). Choose the stage from what happened, do not invent a stage.
- Work states in Projects: Planning (not started), In Progress ("pending" work, working on it), Review (waiting for client or checking), Done (finished, delivered, handed over).
- Buying: Vendor, then Purchase Order, then stock arrives (Inventory goes up, status Received), then a Bill from the vendor, then payment.
- A name alone is a person or company. Use the exact spelling the owner typed. If the same client is mentioned again, use the same name so records connect.

WHEN UNSURE:
- If the message could mean two different records and a wrong guess would put a wrong number in the books, do not guess. Return {"operations":[],"ask":"one short question"}, for example "Was that 5,000 received from Raj, or an invoice for 5,000?".
- If an amount, person or item is missing and needed, ask. Never invent it.
- If the owner only chats or asks something, return no operations and no ask.`
