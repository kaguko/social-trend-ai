import { SocialTrend } from '../types';

export const INITIAL_TRENDS: SocialTrend[] = [
  {
    id: 'tr-1',
    title: 'Autonomous AI Agents & MCP (Model Context Protocol) Boom',
    platform: 'reddit',
    category: 'Tech & AI',
    score: 98,
    growthRate: '+420% this week',
    volume: '86.4K upvotes',
    sentiment: 'positive',
    sentimentScore: 89,
    summary: 'Explosive developer interest in local autonomous AI agents using Anthropic MCP and open-source orchestrators. Creators are building automated daily life pipelines.',
    sourceUrl: 'https://reddit.com/r/LocalLLaMA',
    authorOrChannel: 'r/LocalLLaMA & r/MachineLearning',
    keyTopics: ['Agentic AI', 'MCP Protocol', 'Local LLMs', 'Developer Tools'],
    demographics: {
      primaryAge: '22 - 38',
      topInterest: 'Software Development & Automation',
      genderSkew: '68% Male / 32% Female',
      peakPlatform: 'Reddit & GitHub'
    },
    audienceEngagement: 94,
    suggestedHooks: [
      'Stop using ChatGPT manually: autonomous agents just changed the game.',
      'This new protocol lets AI control any app on your computer in 3 lines of code.',
      'The biggest AI shift in 2026 isn’t bigger models, it’s MCP agents.'
    ],
    createdAt: '2 hours ago',
    isRealTime: true
  },
  {
    id: 'tr-2',
    title: 'The "Low Dopamine Morning" Routine Revolution',
    platform: 'youtube',
    category: 'Lifestyle & Culture',
    score: 93,
    growthRate: '+290% this month',
    volume: '3.8M views',
    sentiment: 'positive',
    sentimentScore: 92,
    summary: 'Viewers and creators are rejecting chaotic 5 AM multi-step routines in favor of zero-screen, slow-paced mornings that preserve mental clarity.',
    sourceUrl: 'https://youtube.com',
    authorOrChannel: 'Wellness & Mindfulness Creators',
    keyTopics: ['Dopamine Reset', 'Mental Health', 'Slow Productivity', 'Screen-Free Mornings'],
    demographics: {
      primaryAge: '19 - 34',
      topInterest: 'Productivity, Mindfulness & Aesthetics',
      genderSkew: '62% Female / 38% Male',
      peakPlatform: 'YouTube & TikTok'
    },
    audienceEngagement: 88,
    suggestedHooks: [
      'I stopped touching my phone for the first 90 minutes of the day—here is what happened.',
      'Why the hyper-productive hustle morning routine is secretly ruining your focus.',
      'How to do a "low dopamine morning" without feeling bored out of your mind.'
    ],
    createdAt: '5 hours ago',
    isRealTime: true
  },
  {
    id: 'tr-3',
    title: 'Nvidia RTX 5000 Series Real-World Creator Benchmarks',
    platform: 'youtube',
    category: 'Gaming',
    score: 95,
    growthRate: '+310% this week',
    volume: '5.1M views',
    sentiment: 'mixed',
    sentimentScore: 68,
    summary: 'Massive discussions debating video editing render times, local generative inference speedups, and power efficiency vs street pricing.',
    sourceUrl: 'https://youtube.com',
    authorOrChannel: 'Tech Reviewers & PC Builders',
    keyTopics: ['RTX 5090', '4K Video Editing', 'DLSS 4', 'VRAM Limits'],
    demographics: {
      primaryAge: '18 - 35',
      topInterest: 'PC Gaming & Creative Hardware',
      genderSkew: '76% Male / 24% Female',
      peakPlatform: 'YouTube & Reddit'
    },
    audienceEngagement: 91,
    suggestedHooks: [
      'Is the RTX 50-series actually worth it for creators, or just gamers?',
      'We tested local AI video generation on the new flagship GPU: results shocked us.',
      'The dirty secret behind GPU pricing this year.'
    ],
    createdAt: '8 hours ago',
    isRealTime: true
  },
  {
    id: 'tr-4',
    title: 'Micro-SaaS Built With Cursor & Claude 3.7 In 48 Hours',
    platform: 'twitter',
    category: 'Creator Economy',
    score: 89,
    growthRate: '+180% this week',
    volume: '1.2M impressions',
    sentiment: 'positive',
    sentimentScore: 84,
    summary: 'Solo founders sharing transparent MRR breakdowns of mini-apps coded entirely with AI code editors, sparking inspiration and quality debates.',
    sourceUrl: 'https://x.com',
    authorOrChannel: 'Indie Hackers & Build-in-Public',
    keyTopics: ['Build in Public', 'AI Coding', 'Micro-SaaS', 'MRR Milestones'],
    demographics: {
      primaryAge: '24 - 42',
      topInterest: 'Entrepreneurship & Tech Solopreneurs',
      genderSkew: '70% Male / 30% Female',
      peakPlatform: 'X/Twitter & Threads'
    },
    audienceEngagement: 86,
    suggestedHooks: [
      'He had zero coding skills 6 months ago. Today he crossed $8k MRR with this tool.',
      'How to build and ship your first AI wrapper in a single weekend.',
      '3 micro-SaaS ideas you can build right now with Cursor.'
    ],
    createdAt: '12 hours ago',
    isRealTime: false
  },
  {
    id: 'tr-5',
    title: 'High-Yield Cash Stacks & T-Bill Ladders in r/PersonalFinance',
    platform: 'reddit',
    category: 'Finance & Crypto',
    score: 87,
    growthRate: '+140% this week',
    volume: '34.2K upvotes',
    sentiment: 'positive',
    sentimentScore: 81,
    summary: 'Users are seeking guaranteed safety amid market volatility, sharing strategies for maximizing risk-free yields across banks and treasuries.',
    sourceUrl: 'https://reddit.com/r/personalfinance',
    authorOrChannel: 'r/personalfinance & r/Bogleheads',
    keyTopics: ['HYSA', 'Treasury Bills', 'Passive Cashflow', 'Interest Rate Cuts'],
    demographics: {
      primaryAge: '25 - 45',
      topInterest: 'Personal Finance & Wealth Preservation',
      genderSkew: '58% Male / 42% Female',
      peakPlatform: 'Reddit'
    },
    audienceEngagement: 83,
    suggestedHooks: [
      'Are you still leaving money in a 0.01% checking account? Do this instead.',
      'The lazy investor’s guide to earning $400/month risk-free on emergency cash.',
      'What happens to your high-yield savings account when interest rates drop?'
    ],
    createdAt: '14 hours ago',
    isRealTime: false
  },
  {
    id: 'tr-6',
    title: 'Short-Form Video "Anti-Hook" Storytelling Style',
    platform: 'tiktok',
    category: 'Creator Economy',
    score: 96,
    growthRate: '+520% this week',
    volume: '14.6M views',
    sentiment: 'positive',
    sentimentScore: 90,
    summary: 'Creators are abandoning loud "WAIT STOP SCROLLING" intros in favor of mid-sentence whispers, intimate camera angles, and immediate story payoffs.',
    sourceUrl: 'https://tiktok.com',
    authorOrChannel: 'Creative Directors & TikTok Storytellers',
    keyTopics: ['Content Retention', 'Anti-Hooks', 'Algorithm Hacks', 'Short-form Storytelling'],
    demographics: {
      primaryAge: '16 - 29',
      topInterest: 'Content Creation, Storytelling & Film',
      genderSkew: '55% Female / 45% Male',
      peakPlatform: 'TikTok & Reels'
    },
    audienceEngagement: 96,
    suggestedHooks: [
      'Stop screaming at your audience in the first 3 seconds. Here is what actually works now.',
      'The quiet video technique that got my client 4 million views last week.',
      'Why hyper-edited videos are losing engagement to raw camera monologues.'
    ],
    createdAt: '3 hours ago',
    isRealTime: true
  },
  {
    id: 'tr-7',
    title: 'Open Source AI Models Running Locally on Phones',
    platform: 'reddit',
    category: 'Tech & AI',
    score: 84,
    growthRate: '+210% this week',
    volume: '29.5K upvotes',
    sentiment: 'positive',
    sentimentScore: 86,
    summary: 'Demonstrations of quantised 1B-3B parameter vision-language models executing at 35 tokens/second fully offline on standard smartphones.',
    sourceUrl: 'https://reddit.com/r/LocalLLaMA',
    authorOrChannel: 'r/LocalLLaMA & r/Android',
    keyTopics: ['Edge AI', 'On-Device LLM', 'Privacy-First', 'Llama 3.2'],
    demographics: {
      primaryAge: '20 - 36',
      topInterest: 'Privacy, Mobile Tech & AI',
      genderSkew: '72% Male / 28% Female',
      peakPlatform: 'Reddit & YouTube'
    },
    audienceEngagement: 85,
    suggestedHooks: [
      'Your phone can now run full AI models without an internet connection.',
      'Why big tech companies are terrified of on-device AI.',
      'How to install a private ChatGPT clone directly onto your smartphone.'
    ],
    createdAt: '18 hours ago',
    isRealTime: false
  },
  {
    id: 'tr-8',
    title: 'Silent Walking & 10,000 Steps Outdoor Minimalism',
    platform: 'tiktok',
    category: 'Lifestyle & Culture',
    score: 81,
    growthRate: '+160% this month',
    volume: '8.4M views',
    sentiment: 'positive',
    sentimentScore: 88,
    summary: 'Walking without podcasts, audiobooks, or music to clear neural clutter, drawing millions of shares from stressed office workers and students.',
    sourceUrl: 'https://tiktok.com',
    authorOrChannel: 'Wellness Influencers',
    keyTopics: ['Mental Health', 'Walking Routine', 'Digital Detox', 'Longevity'],
    demographics: {
      primaryAge: '18 - 34',
      topInterest: 'Fitness, Well-being & Outdoors',
      genderSkew: '65% Female / 35% Male',
      peakPlatform: 'TikTok & Instagram'
    },
    audienceEngagement: 82,
    suggestedHooks: [
      'The easiest mental health hack that costs $0 and takes 30 minutes.',
      'I walked 10,000 steps in total silence for 30 days. It cured my creative burnout.',
      'Why you need to stop listening to podcasts while walking.'
    ],
    createdAt: '1 day ago',
    isRealTime: false
  }
];
