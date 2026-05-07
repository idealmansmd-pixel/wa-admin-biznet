export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
  analysis?: AIAnalysis;
}

export interface AIAnalysis {
  closingProbability: number; // 0-100
  friendliness: number; // 0-100
  aggressiveness: number; // 0-100
  intent: string;
}

export interface AIRule {
  id: string;
  condition: string;
  action: string;
}

export interface AIPrompt {
  id: string;
  type: 'system' | 'sales' | 'followUp' | 'complaint' | 'promo';
  content: string;
  version: number;
  updatedAt: number;
}

export interface AIPersonality {
  tone: 'natural' | 'strict' | 'aggressive';
  length: 'short' | 'medium' | 'long';
  useEmojis: boolean;
  forbiddenWords: string[];
  greeting: string;
  closingStyle: string;
  // Human Behavior
  splitMessages: boolean;
  maxSentencesPerBubble: number;
  typingDelayMode: 'fast' | 'normal' | 'slow';
  naturalPause: boolean;
}

export interface BusinessInfo {
  product: string;
  packages: {
    speed: string;
    price: string;
    description: string;
  }[];
  advantages: string[];
  promos: string[];
  followUpScripts: string[];
  coveredAreas: string[];
  // AI Specific
  personality: AIPersonality;
  prompts: AIPrompt[];
  rules: AIRule[];
}

export interface Lead {
  id: string;
  name: string;
  address: string;
  whatsapp: string;
  location: string;
  timestamp: number;
  status: 'new' | 'contacted' | 'installed';
}
