const { OpenAI } = require('openai');

const openai = process.env.OPENAI_API_KEY ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY }) : null;

// Keyword → topic mapping for heuristic fallback
const keywordTopics = [
  { key: 'food',     topic: 'food quality' },
  { key: 'service',  topic: 'service' },
  { key: 'wait',     topic: 'waiting time' },
  { key: 'ambience', topic: 'ambience' },
  { key: 'price',    topic: 'pricing' },
  { key: 'hygiene',  topic: 'hygiene' },
  { key: 'clean',    topic: 'cleanliness' },
  { key: 'wifi',     topic: 'wifi' },
  { key: 'room',     topic: 'room quality' }
];

// Pure function — no DB / external calls
function heuristicAnalysis(text, rating) {
  const lc = text.toLowerCase();
  let sentiment = 'neutral';
  if (rating >= 4) sentiment = 'positive';
  if (rating <= 2) sentiment = 'negative';

  const topics = keywordTopics
    .filter((entry) => lc.includes(entry.key))
    .map((entry) => entry.topic);

  const emotion   = sentiment === 'positive' ? 'happy' : sentiment === 'negative' ? 'frustrated' : 'neutral';
  const priority  = sentiment === 'negative' ? 'high'  : sentiment === 'neutral'  ? 'medium'     : 'low';

  return { sentiment, topics, emotion, priority };
}

// Uses OpenAI if key present, falls back to heuristic
async function analyzeReview(content, rating) {
  if (!openai) return heuristicAnalysis(content, rating);

  try {
    const completion = await openai.chat.completions.create({
      model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
      temperature: 0.2,
      response_format: { type: 'json_object' },
      messages: [
        {
          role: 'system',
          content:
            'You analyze hospitality reviews. Return JSON with sentiment, topics(array), emotion, priority. Sentiment one of positive|neutral|negative. Priority one of low|medium|high.'
        },
        { role: 'user', content: `Rating: ${rating}\nReview: ${content}` }
      ]
    });

    const parsed = JSON.parse(completion.choices[0].message.content || '{}');
    return {
      sentiment: parsed.sentiment || heuristicAnalysis(content, rating).sentiment,
      topics:    Array.isArray(parsed.topics) ? parsed.topics : [],
      emotion:   parsed.emotion  || 'neutral',
      priority:  parsed.priority || 'medium'
    };
  } catch {
    return heuristicAnalysis(content, rating);
  }
}

// Generates a suggested public reply to a customer review
async function suggestReply(review, businessName) {
  const fallback =
    review.sentiment === 'negative'
      ? 'We are sorry to hear this and appreciate your feedback. We will address this with our team and improve your next experience.'
      : 'Thank you for your feedback and for taking the time to share your experience with us.';

  if (!openai) return fallback;

  try {
    const completion = await openai.chat.completions.create({
      model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
      temperature: 0.4,
      messages: [
        {
          role: 'system',
          content: 'Generate a concise, professional, empathetic public reply to a customer review in 2-3 sentences.'
        },
        {
          role: 'user',
          content: `Business: ${businessName}\nSentiment: ${review.sentiment}\nReview: ${review.content}`
        }
      ]
    });
    return (completion.choices[0].message.content || fallback).trim();
  } catch {
    return fallback;
  }
}

// Aggregates reviews into sentiment + topic insights
function summarizeInsights(reviews) {
  const result = {
    total: reviews.length,
    sentiment:   { positive: 0, neutral: 0, negative: 0 },
    complaints:  {},
    compliments: {}
  };

  for (const r of reviews) {
    result.sentiment[r.sentiment] += 1;
    const bucket =
      r.sentiment === 'negative' ? result.complaints :
      r.sentiment === 'positive' ? result.compliments : null;

    if (bucket) {
      for (const t of r.topics || []) {
        bucket[t] = (bucket[t] || 0) + 1;
      }
    }
  }

  const toTopList = (obj, limit = 5) =>
    Object.entries(obj)
      .sort((a, b) => b[1] - a[1])
      .slice(0, limit)
      .map(([topic, count]) => ({ topic, count }));

  return {
    totalReviews:          result.total,
    sentimentDistribution: result.sentiment,
    topComplaints:         toTopList(result.complaints),
    topCompliments:        toTopList(result.compliments)
  };
}

// Topic → actionable advice map
const TOPIC_ADVICE = {
  'waiting time': { title: 'Reduce Wait Times',             description: 'Multiple customers report long waiting times. This is a high-impact issue that affects repeat visits.',              actionItems: ['Increase kitchen staff during peak hours (7–10 PM)', 'Implement a table management or queue system', 'Set clear wait-time expectations at entry', 'Streamline prep for highest-ordered dishes'] },
  'service':      { title: 'Improve Service Quality',       description: 'Service quality issues appear repeatedly. Consistent service is key to customer loyalty.',                           actionItems: ['Schedule regular staff training sessions', 'Introduce service quality checklists per shift', 'Empower staff to resolve complaints on the spot', 'Collect internal service feedback weekly'] },
  'hygiene':      { title: 'Address Hygiene Concerns',      description: 'Hygiene complaints are critical and can damage reputation quickly if unaddressed.',                                  actionItems: ['Conduct a thorough cleanliness audit this week', 'Set up visible hygiene checklists at each station', 'Assign dedicated cleaning staff during service hours', 'Consider a third-party hygiene inspection'] },
  'cleanliness':  { title: 'Improve Cleanliness Standards', description: 'Cleanliness issues mentioned in reviews reflect on the overall customer experience.',                                actionItems: ['Schedule deep cleaning before every opening', 'Add post-meal cleaning checklists for each table', 'Inspect washrooms every 30 minutes during service', 'Train staff on presentation and tidiness standards'] },
  'pricing':      { title: 'Address Pricing Perception',    description: 'Customers frequently flag pricing concerns. Better value communication can improve satisfaction.',                   actionItems: ['Introduce combo or value-for-money meal options', 'Highlight premium ingredients and preparation on the menu', 'Test a loyalty or return-visit discount programme', 'Review portion sizes vs competitors in the segment'] },
  'food quality': { title: 'Maintain Food Quality',         description: 'Food quality is your core product. Addressing any slip is critical for retaining customers.',                        actionItems: ['Conduct a weekly quality check with the chef team', 'Introduce consistent recipe and plating standards', 'Source fresher or higher-quality ingredients', 'Gather feedback from regulars on favourite dishes'] },
  'ambience':     { title: 'Leverage Ambience as a Strength', description: 'Customers praise your ambience. Doubling down on it in marketing can attract more footfall.',                     actionItems: ['Feature ambience photos in Google and Zomato profiles', 'Create Instagram-worthy zones or setups', 'Use ambience as a pillar in promotional campaigns', 'Offer special occasion setups as an add-on'] },
  'wifi':         { title: 'Upgrade Network Reliability',   description: 'Wifi issues affect business travellers and remote workers significantly.',                                            actionItems: ['Upgrade to a business-grade router with higher bandwidth', 'Set up a dedicated guest network', 'Test wifi speeds daily from different room locations', 'Display wifi speeds in listing descriptions'] },
  'room quality': { title: 'Improve Room Amenities',        description: 'Room quality directly affects guest satisfaction scores and return rates.',                                           actionItems: ['Audit all rooms for maintenance issues monthly', 'Upgrade soft furnishings or mattresses in low-rated rooms', 'Ensure all amenities (AC, TV, shower) work before check-in', 'Add small premium touches like welcome notes or snacks'] }
};

// Builds an actionable recommendations list from summarized insights
function buildRecommendations(summary) {
  const recs = [];

  for (const complaint of summary.topComplaints.slice(0, 4)) {
    const advice = TOPIC_ADVICE[complaint.topic];
    if (advice) {
      recs.push({ ...advice, impact: complaint.count >= 3 ? 'high' : complaint.count >= 2 ? 'medium' : 'low' });
    } else {
      recs.push({
        title:       `Address "${complaint.topic}" Concerns`,
        description: `Multiple customers have mentioned issues with ${complaint.topic}. Proactive improvement here will boost review scores.`,
        actionItems: [
          `Investigate root cause of ${complaint.topic} complaints`,
          'Brief the team and set a measurable improvement target',
          'Monitor review scores over the next 30 days'
        ],
        impact: complaint.count >= 3 ? 'high' : 'medium'
      });
    }
  }

  if (summary.topCompliments.length > 0) {
    const top = summary.topCompliments[0];
    const strengthAdvice = TOPIC_ADVICE[top.topic];
    if (strengthAdvice) recs.push({ ...strengthAdvice, impact: 'low' });
  }

  if (recs.length === 0) {
    recs.push({
      title:       'Maintain Standards & Engage Customers',
      description: 'No major issues detected. Focus on sustaining quality and building an active review habit.',
      actionItems: [
        'Respond to all reviews within 24 hours',
        'Prompt happy customers to leave a Google review',
        'Share positive reviews on your social media pages'
      ],
      impact: 'low'
    });
  }

  return recs;
}

module.exports = {
  heuristicAnalysis,
  analyzeReview,
  suggestReply,
  summarizeInsights,
  buildRecommendations
};

