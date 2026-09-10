export type DimensionKey = 'komunikacja' | 'terminowosc' | 'jakosc' | 'wklad_wlasny';

export type ScoreTier = 'high' | 'mid' | 'low'; // high (7-10), mid (4-6), low (1-3)

export interface BehavioralFactor {
  id: string;
  label: string; // The bullet point text e.g. "Naprawdę rzetelnie i dokładnie wykonuje swoją pracę"
  tier: ScoreTier; // Which score range activates this bullet point
  dimension: DimensionKey;
  sentiment: 'positive' | 'neutral' | 'constructive_improvement';
}

export interface ScoreLevelDescription {
  score: number; // 1 to 10
  shortLabel: string; // e.g. "Wybitny standard", "Solidny poziom", "Wymaga wsparcia"
  summary: string;
}

export interface SubQuestion {
  id: string; // e.g., "kom_task", "kom_perception", "kom_relation"
  label: string; // e.g., "Ocena zadaniowa"
  text: string;
  scoreDescriptions?: ScoreLevelDescription[];
}

export interface SurveyQuestion {
  id: string;
  dimension: DimensionKey;
  dimensionTitle: string;
  dimensionSubtitle: string;
  subQuestions: SubQuestion[];
  contextHelp: string;
  scoreDescriptions?: ScoreLevelDescription[];
  factors: {
    high: string[];
    mid: string[];
    low: string[];
  };
}

export type SurveyFieldType =
  | 'short_text'
  | 'long_text'
  | 'single_choice'
  | 'multi_choice'
  | 'scale'
  | 'yes_no'
  | 'number';

export interface SurveyField {
  id: string;
  type: SurveyFieldType;
  label: string;
  help?: string;
  required: boolean;
  options?: string[];
  scaleMin?: number;
  scaleMax?: number;
}

export type SurveyEngine = 'generic' | '360';
export type SurveyStatus = 'draft' | 'live' | 'closed';

export interface ManagedSurvey {
  id: string;
  slug: string;
  title: string;
  description: string;
  status: SurveyStatus;
  engine: SurveyEngine;
  fields: SurveyField[];
  createdAt: string;
  updatedAt: string;
}

export interface SurveyResponse {
  id: string;
  createdAt: string;
  tokenUsed: string;
  surveyId?: string;
  answers: Record<string, number | string | string[]>;
  selectedFactors: Record<string, string[]>;
  dimensionComments: Record<string, string>;
  collaborationContext: string;
  teamRelation: string;
  excludedFromReport?: boolean;
}

export interface VoterToken {
  id: string;
  code: string;
  label: string;
  used: boolean;
  usedAt?: string;
  responseId?: string;
  surveyId?: string;
}

export interface SurveyConfig {
  employeeName: string;
  companyName: string;
  tenure: string;
  targetRoleOrGoal: string;
  questions: SurveyQuestion[];
}

export interface FactorCount {
  text: string;
  count: number;
  percentage: number;
  sentiment?: 'positive' | 'neutral' | 'constructive';
}

export interface DimensionStats {
  dimension: DimensionKey;
  title: string;
  average: number; // 1.0 - 10.0
  averageOutOfFive: number; // converted for quick reference 1.0 - 5.0
  totalVotes: number;
  distribution: { [score: number]: number }; // counts for 1..10
  topPositiveFactors: FactorCount[];
  topImprovementFactors: FactorCount[];
  businessImpactAnalysis: string;
}

