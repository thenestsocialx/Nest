export type BranchId =
  | 'loneliness'
  | 'anxiety'
  | 'low-mood'
  | 'relationship'
  | 'burnout'
  | 'grief'

// Special routing tokens used in QuestionOption.next
export type NextTarget =
  | string        // question ID
  | 'RESULT'      // last closing question done → fetch result
  | 'CRISIS'      // crisis answer → show crisis screen immediately
  | 'BRANCH_START' // INTENSITY question → shell resolves to branch's first question

export interface QuestionOption {
  label: string
  microcopy: string
  next: NextTarget
  branchId?: BranchId  // only set on Q1 options to record which branch is entered
}

export interface Question {
  id: string
  text: string
  subtext: string
  type?: 'chips' | 'text'  // default: 'chips'
  options: QuestionOption[]
  // Only for type === 'text' (open-ended question)
  textNext?: NextTarget
  textMicrocopy?: string
}

export interface AnswerRecord {
  questionId: string
  questionText: string
  answer: string
  microcopy: string
}

export type Phase = 'question' | 'pause' | 'loading' | 'result' | 'crisis'

export type PrimaryPathway = 'ally' | 'sai' | 'resources' | 'events'

export interface ResultData {
  headline: string
  summary: string
  pullquote: string
  primaryPathway: PrimaryPathway
  pathwayReason: string
}

export interface RecommendedAlly {
  id: string
  display_name: string
  primary_role: string | null
  photo_url: string | null
  specialties: string[]
  intro_price: number | null
  session_price: number
  tagline: string | null
  quote: string | null
}

export interface AssessmentState {
  phase: Phase
  currentQuestionId: string
  branch: BranchId | null
  history: string[]         // question IDs visited (for Back navigation)
  answers: AnswerRecord[]
  currentAnswer: { label: string; microcopy: string; next: NextTarget } | null
  result: ResultData | null
  error: string | null
  crisisFlag: boolean
  recommendedAllies: RecommendedAlly[]
}
