// ══════════════════════════════════════════════════════════════
// Nest · Ally Types
// ══════════════════════════════════════════════════════════════

export type DocType =
  | 'govt_id'
  | 'degree'
  | 'license'
  | 'certs'
  | 'bg_check'
  | 'insurance'
  | 'agreement'
  | 'photo';

export type DocStatus = 'pending' | 'uploading' | 'uploaded' | 'verified' | 'rejected' | 'error';

export type OnboardingStatus = 'draft' | 'submitted' | 'approved' | 'active' | 'rejected';

export interface AllyDocument {
  id: string;
  ally_id: string;
  doc_type: DocType;
  file_name: string | null;
  storage_path: string | null;
  file_url: string | null;
  file_size: number | null;
  mime_type: string | null;
  is_required: boolean;
  status: 'uploaded' | 'verified' | 'rejected';
  uploaded_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface AllyRow {
  id: string;
  user_id: string | null;

  // ── Step 1: Identity ─────────────────────────────────────────
  full_name: string | null;
  display_name: string | null;
  pronouns: string | null;
  location: string | null;
  email: string | null;
  phone: string | null;
  whatsapp: string | null;
  emergency_contact: string | null;
  tagline: string | null;
  quote: string | null;
  bio: string | null;
  photo_url: string | null;
  photo_storage_path: string | null;

  // ── Step 2: Expertise ────────────────────────────────────────
  primary_role: string | null;
  years_experience: number;
  highest_qualification: string | null;
  license_number: string | null;
  additional_certifications: string | null;
  specialties: string[];
  modalities: string[];
  age_groups: string[];
  gender_preferences: string[];
  languages_spoken: string | null;
  languages_therapy: string | null;
  approach_style: string | null;
  session_tones: string[];

  // ── Step 3: Sessions ─────────────────────────────────────────
  session_formats: string[];
  session_durations: string[];
  session_price: number;
  intro_price: number | null;
  max_clients_per_week: number;
  buffer_minutes: number;
  availability: Record<string, boolean>;
  visibility_search: boolean;
  visibility_bookings: boolean;
  visibility_matching: boolean;
  visibility_featured: boolean;

  // ── Step 4: Documents ────────────────────────────────────────
  admin_notes: string | null;
  doc_agreement_status: string;

  // ── Step 5: Matching ─────────────────────────────────────────
  match_weights: Record<string, number>;
  sort_priority: string;
  manual_priority_score: number;

  // ── Workflow / Meta ──────────────────────────────────────────
  onboarding_step: number;
  onboarding_status: OnboardingStatus;
  is_active: boolean;
  deleted_at: string | null;
  created_at: string;
  updated_at: string | null;

  // ── Zoho ─────────────────────────────────────────────────────
  zoho_staff_id: string | null;
  zoho_service_ids: Record<string, string> | null;
}

/** Fields the PATCH endpoint accepts (excludes immutable/Zoho-managed fields) */
export type AllyPatchPayload = Partial<
  Omit<AllyRow, 'id' | 'created_at' | 'zoho_staff_id' | 'zoho_service_ids' | 'deleted_at' | 'user_id'>
>;

export interface ZohoStaffInput {
  name: string;
  email: string;
  gender?: 'Male' | 'Female' | 'Other';
  role?: 'Admin' | 'Manager' | 'Staff';
  dob?: string; // "12-Aug-1999 00:00:00"
  additional_info?: string;
  phone?: string;
  designation?: string;
  assigned_services?: string[];
}

export interface ZohoStaffResult {
  id: string;
  name: string;
  email: string;
  status: 'success' | 'failure';
  message?: string;
}

export interface StepValidationResult {
  valid: boolean;
  errors: Record<string, string>;
}
