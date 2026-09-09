import { VoterToken } from './types';

// Types for the Survey Management System (custom, user-created surveys).
// The built-in Kubara survey is NOT represented here — it keeps its original
// components and data model untouched.

export type CustomQuestionType =
  | 'section'
  | 'slider'
  | 'single_choice'
  | 'multi_choice'
  | 'yes_no'
  | 'yes_no_dontknow'
  | 'text';

export interface CustomOption {
  value: string;
  label: string;
}

export interface CustomQuestion {
  id: string;
  type: CustomQuestionType;
  title: string;
  subtitle?: string;
  help?: string;
  required?: boolean;
  // slider
  min?: number;
  max?: number;
  minLabel?: string;
  maxLabel?: string;
  // choices (single/multi/yes_no*)
  options?: CustomOption[];
  allowComment?: boolean;
}

export interface CustomResponse {
  id: string;
  createdAt: string;
  tokenUsed?: string;
  answers: Record<string, number | string | string[]>;
  comments?: Record<string, string>;
  excludedFromReport?: boolean;
}

export interface CustomSurvey {
  id: string;
  slug: string;
  title: string;
  subjectName?: string;
  companyName?: string;
  description?: string;
  introText?: string;
  status: 'active' | 'inactive';
  isAnonymous?: boolean;
  requireToken?: boolean;
  createdAt: string;
  questions: CustomQuestion[];
  tokens: VoterToken[];
  responses: CustomResponse[];
}

export interface SurveyListItem {
  id: string;
  builtIn: boolean;
  slug?: string;
  title: string;
  subjectName?: string;
  companyName?: string;
  status: string;
  tokensCount: number;
  responsesCount: number;
  questionsCount?: number;
  createdAt: string | null;
}

export const QUESTION_TYPE_LABELS: Record<CustomQuestionType, string> = {
  section: 'Nagłówek sekcji',
  slider: 'Suwak / skala (zakres)',
  single_choice: 'Wybór jednokrotny',
  multi_choice: 'Wybór wielokrotny',
  yes_no: 'Tak / Nie',
  yes_no_dontknow: 'Tak / Nie / Nie wiem',
  text: 'Odpowiedź tekstowa',
};

export const QUESTION_TYPE_HINTS: Record<CustomQuestionType, string> = {
  section: 'Wizualny nagłówek grupujący kolejne pytania.',
  slider: 'Ocena na skali, np. 1–5, 1–10 lub nawet 1–3.',
  single_choice: 'Respondent wybiera jedną opcję.',
  multi_choice: 'Respondent może zaznaczyć wiele opcji.',
  yes_no: 'Proste pytanie zamknięte Tak / Nie.',
  yes_no_dontknow: 'Tak / Nie z dodatkową opcją „Nie wiem”.',
  text: 'Otwarta odpowiedź tekstowa.',
};
