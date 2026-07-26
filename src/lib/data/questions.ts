import type { LucideIcon } from 'lucide-react';
import { BriefcaseBusiness, Laugh, Layers, PartyPopper, UserRoundSearch } from 'lucide-react';

export interface QuestionCategory {
  key: 'Me' | 'Projects' | 'Skills' | 'Fun' | 'Contact';
  label: string;
  icon: LucideIcon;
  color: string;
  /** The question fired when the tile is clicked. */
  primary: string;
  /** Shown in the chat's suggestion drawer. */
  questions: string[];
}

export const QUESTION_CATEGORIES: QuestionCategory[] = [
  {
    key: 'Me',
    label: 'Me',
    icon: Laugh,
    color: '#329696',
    primary: 'Who are you? Tell me about yourself.',
    questions: [
      'Who are you? Tell me about yourself.',
      'Where are you from and where do you study?',
      'What are you like to work with?',
      "What's your story - how did you get into software?",
      'What are you learning right now?',
    ],
  },
  {
    key: 'Projects',
    label: 'Projects',
    icon: BriefcaseBusiness,
    color: '#3E9858',
    primary: "What are your projects? What are you working on right now?",
    questions: [
      'What are your projects? What are you working on right now?',
      "What's the project you're most proud of?",
      'Show me something you built for a client.',
      'Tell me about Muaz OS.',
      'Have you built anything with Flutter?',
    ],
  },
  {
    key: 'Skills',
    label: 'Skills',
    icon: Layers,
    color: '#856ED9',
    primary: 'What are your skills? Give me a technical overview.',
    questions: [
      'What are your skills? Give me a technical overview.',
      'What is your strongest area?',
      "What's your weak spot, honestly?",
      'Can I see your resume?',
      'How do you use AI in your work?',
    ],
  },
  {
    key: 'Fun',
    label: 'Fun',
    icon: PartyPopper,
    color: '#B95F9D',
    primary: "What's the craziest thing you've ever built?",
    questions: [
      "What's the craziest thing you've ever built?",
      'Tell me something surprising about you.',
      'What do you do when you are not coding?',
      'What was your weirdest client request?',
      'Why do you own five portfolios?',
    ],
  },
  {
    key: 'Contact',
    label: 'Contact',
    icon: UserRoundSearch,
    color: '#C19433',
    primary: 'How can I reach you? Are you open to work?',
    questions: [
      'How can I reach you? Are you open to work?',
      'Are you available for an internship?',
      'Can I hire you for a freelance project?',
      'What kind of role are you looking for?',
      'What are your rates?',
    ],
  },
];

/** Rotated through the landing-page input placeholder. */
export const PLACEHOLDER_QUESTIONS = [
  'Ask me anything…',
  'What have you built?',
  'Are you open to work?',
  'What is Muaz OS?',
  'What are you good at?',
];
