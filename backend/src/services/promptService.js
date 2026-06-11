export const generationTasks = [
  'campaign',
  'facebook_reel_captions',
  'viral_hooks',
  'hashtags',
  'customer_replies',
  'weekend_promos',
  'event_announcements',
  'catering_promotions',
  'email_campaigns',
  'menu_specials_lab',
  'weekly_planner'
];

const promptTemplates = {
  caption:
    'Create scroll-stopping captions for Savannah BBQ. Include local warmth, smoked food imagery, a clear CTA, and 4-8 hashtags.',
  promo:
    'Create weekend promo ideas for a Savannah BBQ food truck. Include title, offer, caption, CTA, and hashtags.',
  reply:
    'Draft friendly customer comment replies. Be concise, helpful, brand-safe, and never over-promise.',
  event:
    'Write event announcement copy for a food truck. Include date/time, location, menu hook, CTA, and hashtags.',
  catering:
    'Write catering promotion copy for BBQ catering leads. Mention offices, weddings, parties, and clear booking CTA.',
  email:
    'Write an email campaign with subject lines, preview text, body copy, CTA, and offer framing.'
};

export function buildPrompt(task, input = {}) {
  const context = JSON.stringify(input, null, 2);
  const platform = input.platform || 'Facebook';
  const tone = input.tone || 'Friendly';

  const prompts = {
    campaign: `Create a ${platform} campaign for Savannah BBQ in a ${tone} tone. Include promo angle, caption, CTA, hashtags, and posting notes.\nContext:\n${context}`,
    facebook_reel_captions: `${promptTemplates.caption}\nGenerate Facebook Reel captions.\nContext:\n${context}`,
    viral_hooks: `${promptTemplates.caption}\nGenerate short viral video hooks with captions.\nContext:\n${context}`,
    hashtags: `Generate hashtag sets for Savannah BBQ. Group by local, food, catering, and platform tags.\nContext:\n${context}`,
    customer_replies: `${promptTemplates.reply}\nReturn 5 reply options.\nContext:\n${context}`,
    weekend_promos: `${promptTemplates.promo}\nContext:\n${context}`,
    event_announcements: `${promptTemplates.event}\nContext:\n${context}`,
    catering_promotions: `${promptTemplates.catering}\nContext:\n${context}`,
    email_campaigns: `${promptTemplates.email}\nContext:\n${context}`,
    menu_specials_lab: `Build a practical Menu & Specials Lab plan for Savannah BBQ. Include featured items, weekly specials, happy hour/delivery offer, audience, campaign goal, 5 post ideas, and operational prep notes.\nContext:\n${context}`,
    weekly_planner: `Generate a 7-day Savannah BBQ campaign calendar. For each day include platform, focus, caption, CTA, hashtags, ideal posting time, and prep note.\nContext:\n${context}`
  };

  return prompts[task] || prompts.campaign;
}

export function demoGeneration(task, input = {}) {
  const platform = input.platform || 'Facebook';
  const topic = input.menuItem || input.goal || input.comment || 'Savannah BBQ';
  return [
    `Demo ${task.replaceAll('_', ' ')} for ${platform}`,
    '',
    `Hook: Savannah, the smoker is working overtime for ${topic}.`,
    `Caption: Pull up for slow-smoked BBQ, bold sides, and friendly service made for your next lunch rush, weekend craving, or catering table.`,
    `CTA: Message us to order, book catering, or ask what is coming off the pit today.`,
    `Hashtags: #SavannahBBQ #FoodTruck #BBQLovers #SavannahEats`
  ].join('\n');
}

export function estimateTokens(text = '') {
  return Math.ceil(text.length / 4);
}
