'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

/* ══════════════════════════════════════════════════════════════
   CONSTANTS
══════════════════════════════════════════════════════════════ */
const STEP_LABELS = [
  { label: 'Identity',  sub: 'Name, photo, bio'   },
  { label: 'Expertise', sub: 'Skills & approach'  },
  { label: 'Sessions',  sub: 'Format & pricing'   },
  { label: 'Documents', sub: 'Verification'        },
  { label: 'Matching',  sub: 'Engine config'       },
];

const SPECIALITIES = [
  'heartbreak','loneliness','family','identity','anxiety','grief',
  'self-esteem','career','trauma','depression','relationships',
  'communication','confidence','cultural','lgbtq+','anger management',
];
const MODALITIES = [
  'CBT','DBT','ACT','IFS','narrative therapy','person-centred',
  'somatic','mindfulness-based','EMDR','psychodynamic','integrative','positive psychology',
];
const AGE_GROUPS = ['18-24','25-34','35-45','45+'];
const GENDERS    = ['Any gender','Women preferred','Men preferred'];
const TONES      = ['Warm & nurturing','Structured & goal-driven','Exploratory & open','Solution-focused','Quiet & reflective'];
const FORMATS    = ['🎥 Online','📍 In-person','Both'];
const DURATIONS  = ['45min','60min','90min'];
const AVAIL_ROWS = ['Morning (9AM–12PM)','Afternoon (12–4PM)','Evening (4–9PM)'];
const AVAIL_COLS = ['Mon–Wed','Thu–Fri','Sat','Sun'];

const MATCH_WEIGHTS_DEF = [
  { label: 'Loneliness & disconnection',     tag: 'Primary',   key: 'loneliness', def: 90 },
  { label: 'Heartbreak & relationships',      tag: 'Primary',   key: 'heartbreak', def: 95 },
  { label: 'Family pressure & expectations',  tag: 'Secondary', key: 'family',     def: 70 },
  { label: 'Work stress & future anxiety',    tag: 'Secondary', key: 'career',     def: 55 },
  { label: 'Identity & self-exploration',     tag: 'Secondary', key: 'identity',   def: 65 },
  { label: 'Everything at once (overwhelm)',  tag: 'Secondary', key: 'overwhelm',  def: 80 },
];

const DOC_DEFS = [
  { key: 'govt_id',   label: 'Government ID',                              required: true,  section: 'identity', desc: 'Aadhaar / PAN / Passport. Both sides if Aadhaar.' },
  { key: 'degree',    label: 'Degree Certificate / Transcript',             required: true,  section: 'identity', desc: 'Highest relevant qualification. Certified copy accepted.' },
  { key: 'license',   label: 'Professional License / RCI No.',              required: true,  section: 'identity', desc: 'Registration certificate from relevant body.' },
  { key: 'certs',     label: 'Additional Certifications',                   required: false, section: 'identity', desc: 'Optional. Any supplementary credentials.' },
  { key: 'bg_check',  label: 'Background Check Consent',                    required: true,  section: 'safety',   desc: 'Signed consent form for police verification.' },
  { key: 'insurance', label: 'Professional Indemnity Insurance',            required: false, section: 'safety',   desc: 'Optional. Strongly recommended for clinical roles.' },
  { key: 'agreement', label: 'Signed Platform Agreement & Code of Conduct', required: true,  section: 'safety',   desc: 'Sent via email once Step 4 is complete.' },
] as const;

/* ══════════════════════════════════════════════════════════════
   TYPES
══════════════════════════════════════════════════════════════ */
type Availability  = Record<string, boolean>;
type DocUploadStatus = 'pending' | 'uploading' | 'uploaded' | 'error';
interface DocState { status: DocUploadStatus; file_name?: string; file_url?: string; error?: string; }
type SaveStatus = 'idle' | 'saving' | 'saved' | 'error';
interface Toast  { type: 'success' | 'error' | 'info'; message: string; }

/* ══════════════════════════════════════════════════════════════
   VALIDATION
══════════════════════════════════════════════════════════════ */
function validateStep1(f: { fullName:string; pronouns:string; location:string; email:string; phone:string; tagline:string; ownWords:string }) {
  const e: Record<string,string> = {};
  if (!f.fullName.trim())            e.fullName  = 'Full name is required';
  else if (f.fullName.trim().length < 2) e.fullName = 'At least 2 characters';
  if (!f.pronouns)                   e.pronouns  = 'Please select pronouns';
  if (!f.location.trim())            e.location  = 'Location is required';
  if (!f.email.trim())               e.email     = 'Email is required';
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(f.email)) e.email = 'Invalid email address';
  if (!f.phone.trim())               e.phone     = 'Phone is required';
  if (!f.tagline.trim())             e.tagline   = 'Tagline is required';
  if (!f.ownWords.trim())            e.ownWords  = 'Quote is required';
  return { valid: Object.keys(e).length === 0, errors: e };
}
function validateStep2(f: { primaryRole:string; specialties:string[]; ageGroups:string[]; genderPrefs:string[] }) {
  const e: Record<string,string> = {};
  if (!f.primaryRole)              e.primaryRole = 'Primary role is required';
  if (f.specialties.length === 0)  e.specialties = 'Select at least one speciality';
  if (f.ageGroups.length === 0)    e.ageGroups   = 'Select at least one age group';
  if (f.genderPrefs.length === 0)  e.genderPrefs = 'Select at least one gender preference';
  return { valid: Object.keys(e).length === 0, errors: e };
}
function validateStep3(f: { formats:string[]; durations:string[]; price:number }) {
  const e: Record<string,string> = {};
  if (f.formats.length === 0)   e.formats   = 'Select at least one session format';
  if (f.durations.length === 0) e.durations = 'Select at least one duration';
  if (f.price < 0)              e.price     = 'Price cannot be negative';
  return { valid: Object.keys(e).length === 0, errors: e };
}

/* ══════════════════════════════════════════════════════════════
   SUB-COMPONENTS
══════════════════════════════════════════════════════════════ */
function CompletionRing({ step }: { step: number }) {
  const pct = step * 20;
  const r   = 22;
  const circ = 2 * Math.PI * r;
  const off  = circ - (pct / 100) * circ;
  return (
    <div className="ob-completion">
      <svg className="ob-ring-svg" width="56" height="56" viewBox="0 0 56 56">
        <circle cx="28" cy="28" r={r} fill="none" stroke="var(--ob-hm)" strokeWidth="4"/>
        <circle cx="28" cy="28" r={r} fill="none" stroke="var(--ob-dp)" strokeWidth="4"
          strokeLinecap="round" strokeDasharray={circ} strokeDashoffset={off}
          transform="rotate(-90 28 28)" style={{ transition:'stroke-dashoffset 400ms ease' }}/>
        <text x="28" y="33" textAnchor="middle" fontSize="11" fontWeight="500" fill="var(--ob-dp)">{pct}%</text>
      </svg>
      <div>
        <div className="ob-completion__pct">{pct}%</div>
        <div className="ob-completion__label">Profile complete</div>
      </div>
    </div>
  );
}

function FieldErr({ msg }: { msg?: string }) {
  if (!msg) return null;
  return <div className="ob-field__error">⚠ {msg}</div>;
}

/* ══════════════════════════════════════════════════════════════
   MAIN PAGE
══════════════════════════════════════════════════════════════ */
export default function OnboardAllyPage() {
  const router       = useRouter();
  const searchParams = useSearchParams();

  const [allyId,      setAllyId]      = useState<string | null>(searchParams.get('ally'));
  const [isLoading,   setIsLoading]   = useState(!!searchParams.get('ally'));
  const [saveStatus,  setSaveStatus]  = useState<SaveStatus>('idle');
  const [toast,       setToast]       = useState<Toast | null>(null);
  const [step,        setStep]        = useState(1);
  const [errors,      setErrors]      = useState<Record<string,string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted,   setSubmitted]   = useState(false);
  const [zohoStaffId, setZohoStaffId] = useState<string | null>(null);

  const saveTimerRef  = useRef<ReturnType<typeof setTimeout> | null>(null);
  const photoInputRef = useRef<HTMLInputElement>(null);
  const docInputRefs  = useRef<Record<string, HTMLInputElement | null>>({});

  /* ── Step 1 ── */
  const [fullName,    setFullName]    = useState('');
  const [displayName, setDisplayName] = useState('');
  const [pronouns,    setPronouns]    = useState('');
  const [location,    setLocation]    = useState('');
  const [email,       setEmail]       = useState('');
  const [phone,       setPhone]       = useState('');
  const [whatsapp,    setWhatsapp]    = useState('');
  const [emergency,   setEmergency]   = useState('');
  const [tagline,     setTagline]     = useState('');
  const [ownWords,    setOwnWords]    = useState('');
  const [bio,         setBio]         = useState('');
  const [photoUrl,    setPhotoUrl]    = useState('');
  const [photoPath,   setPhotoPath]   = useState('');
  const [photoUploading, setPhotoUploading] = useState(false);

  /* ── Step 2 ── */
  const [primaryRole,   setPrimaryRole]   = useState('');
  const [experience,    setExperience]    = useState(7);
  const [qualification, setQualification] = useState('');
  const [licenseNo,     setLicenseNo]     = useState('');
  const [extraCerts,    setExtraCerts]    = useState('');
  const [specialties,   setSpecialties]   = useState<string[]>([]);
  const [modalities,    setModalities]    = useState<string[]>([]);
  const [ageGroups,     setAgeGroups]     = useState<string[]>([]);
  const [genderPrefs,   setGenderPrefs]   = useState<string[]>([]);
  const [langSpoken,    setLangSpoken]    = useState('English');
  const [langTherapy,   setLangTherapy]   = useState('English');
  const [approachStyle, setApproachStyle] = useState('');
  const [sessionTones,  setSessionTones]  = useState<string[]>([]);

  /* ── Step 3 ── */
  const [formats,    setFormats]    = useState<string[]>(['🎥 Online']);
  const [durations,  setDurations]  = useState<string[]>(['60min']);
  const [price,      setPrice]      = useState(1200);
  const [introPrice, setIntroPrice] = useState('');
  const [maxClients, setMaxClients] = useState(12);
  const [bufferMin,  setBufferMin]  = useState('15');
  const [avail,      setAvail]      = useState<Availability>({
    'Morning (9AM–12PM)_Mon–Wed': true,
    'Afternoon (12–4PM)_Thu–Fri': true,
    'Evening (4–9PM)_Mon–Wed':    true,
  });
  const [visibility, setVisibility] = useState({
    search: false, bookings: false, matching: true, featured: false,
  });

  /* ── Step 4 ── */
  const [docs, setDocs] = useState<Record<string, DocState>>(
    Object.fromEntries(DOC_DEFS.map(d => [d.key, { status: 'pending' as DocUploadStatus }]))
  );
  const [adminNotes, setAdminNotes] = useState('');

  /* ── Step 5 ── */
  const [weights,       setWeights]       = useState<Record<string,number>>(
    Object.fromEntries(MATCH_WEIGHTS_DEF.map(m => [m.key, m.def]))
  );
  const [sortPriority,  setSortPriority]  = useState('Earliest availability');
  const [priorityScore, setPriorityScore] = useState(7);

  /* ═══════════════════════════════════════════
     LOAD EXISTING DRAFT
  ═══════════════════════════════════════════ */
  useEffect(() => {
    const id = searchParams.get('ally');
    if (!id) return;
    setIsLoading(true);
    fetch(`/api/v1/allies/${id}`)
      .then(r => r.json())
      .then(({ ally, documents }) => {
        if (!ally) return;
        // Step 1
        if (ally.full_name)        setFullName(ally.full_name);
        if (ally.display_name)     setDisplayName(ally.display_name);
        if (ally.pronouns)         setPronouns(ally.pronouns);
        if (ally.location)         setLocation(ally.location);
        if (ally.email)            setEmail(ally.email);
        if (ally.phone)            setPhone(ally.phone);
        if (ally.whatsapp)         setWhatsapp(ally.whatsapp);
        if (ally.emergency_contact) setEmergency(ally.emergency_contact);
        if (ally.tagline)          setTagline(ally.tagline);
        if (ally.quote)            setOwnWords(ally.quote);
        if (ally.bio)              setBio(ally.bio);
        if (ally.photo_url)        setPhotoUrl(ally.photo_url);
        if (ally.photo_storage_path) setPhotoPath(ally.photo_storage_path);
        // Step 2
        if (ally.primary_role)     setPrimaryRole(ally.primary_role);
        if (ally.years_experience != null)   setExperience(ally.years_experience);
        if (ally.highest_qualification)      setQualification(ally.highest_qualification);
        if (ally.license_number)             setLicenseNo(ally.license_number);
        if (ally.additional_certifications)  setExtraCerts(ally.additional_certifications);
        if (ally.specialties?.length)        setSpecialties(ally.specialties);
        if (ally.modalities?.length)         setModalities(ally.modalities);
        if (ally.age_groups?.length)         setAgeGroups(ally.age_groups);
        if (ally.gender_preferences?.length) setGenderPrefs(ally.gender_preferences);
        if (ally.languages_spoken)           setLangSpoken(ally.languages_spoken);
        if (ally.languages_therapy)          setLangTherapy(ally.languages_therapy);
        if (ally.approach_style)             setApproachStyle(ally.approach_style);
        if (ally.session_tones?.length)      setSessionTones(ally.session_tones);
        // Step 3
        if (ally.session_formats?.length)    setFormats(ally.session_formats);
        if (ally.session_durations?.length)  setDurations(ally.session_durations);
        if (ally.session_price != null)      setPrice(ally.session_price);
        if (ally.intro_price != null)        setIntroPrice(String(ally.intro_price));
        if (ally.max_clients_per_week != null) setMaxClients(ally.max_clients_per_week);
        if (ally.buffer_minutes != null)     setBufferMin(String(ally.buffer_minutes));
        if (ally.availability && Object.keys(ally.availability).length) setAvail(ally.availability);
        setVisibility({
          search:   ally.visibility_search   ?? false,
          bookings: ally.visibility_bookings ?? false,
          matching: ally.visibility_matching ?? true,
          featured: ally.visibility_featured ?? false,
        });
        // Step 4
        if (ally.admin_notes)  setAdminNotes(ally.admin_notes);
        if (documents?.length) {
          const map: Record<string, DocState> = Object.fromEntries(
            DOC_DEFS.map(d => [d.key, { status: 'pending' as DocUploadStatus }])
          );
          for (const doc of documents) {
            map[doc.doc_type] = { status: 'uploaded', file_name: doc.file_name, file_url: doc.file_url };
          }
          setDocs(map);
        }
        // Step 5
        if (ally.match_weights && Object.keys(ally.match_weights).length) setWeights(ally.match_weights);
        if (ally.sort_priority)             setSortPriority(ally.sort_priority);
        if (ally.manual_priority_score != null) setPriorityScore(ally.manual_priority_score);
        if (ally.onboarding_step)           setStep(ally.onboarding_step);
        if (ally.zoho_staff_id)             { setZohoStaffId(ally.zoho_staff_id); setSubmitted(true); }
      })
      .catch(console.error)
      .finally(() => setIsLoading(false));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* ═══════════════════════════════════════════
     TOAST
  ═══════════════════════════════════════════ */
  const showToast = useCallback((type: Toast['type'], message: string) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 4500);
  }, []);

  /* ═══════════════════════════════════════════
     BUILD SAVE PAYLOAD
  ═══════════════════════════════════════════ */
  const buildPayload = useCallback(() => ({
    full_name:                  fullName.trim() || null,
    display_name:               displayName.trim() || fullName.split(' ')[0] || '',
    pronouns:                   pronouns  || null,
    location:                   location.trim()  || null,
    email:                      email.trim()     || null,
    phone:                      phone.trim()     || null,
    whatsapp:                   whatsapp.trim()  || null,
    emergency_contact:          emergency.trim() || null,
    tagline:                    tagline.trim()   || null,
    quote:                      ownWords.trim()  || null,
    bio:                        bio.trim()       || null,
    photo_url:                  photoUrl         || null,
    photo_storage_path:         photoPath        || null,
    primary_role:               primaryRole      || null,
    years_experience:           experience,
    highest_qualification:      qualification.trim() || null,
    license_number:             licenseNo.trim()     || null,
    additional_certifications:  extraCerts.trim()    || null,
    specialties,
    modalities,
    age_groups:                 ageGroups,
    gender_preferences:         genderPrefs,
    languages_spoken:           langSpoken.trim()  || null,
    languages_therapy:          langTherapy.trim() || null,
    approach_style:             approachStyle.trim() || null,
    session_tones:              sessionTones,
    session_formats:            formats,
    session_durations:          durations,
    session_price:              price,
    intro_price:                introPrice ? Number(introPrice) : null,
    max_clients_per_week:       maxClients,
    buffer_minutes:             Number(bufferMin),
    availability:               avail,
    visibility_search:          visibility.search,
    visibility_bookings:        visibility.bookings,
    visibility_matching:        visibility.matching,
    visibility_featured:        visibility.featured,
    admin_notes:                adminNotes.trim() || null,
    match_weights:              weights,
    sort_priority:              sortPriority,
    manual_priority_score:      priorityScore,
    onboarding_step:            step,
  }), [
    fullName, displayName, pronouns, location, email, phone, whatsapp, emergency,
    tagline, ownWords, bio, photoUrl, photoPath,
    primaryRole, experience, qualification, licenseNo, extraCerts,
    specialties, modalities, ageGroups, genderPrefs, langSpoken, langTherapy,
    approachStyle, sessionTones,
    formats, durations, price, introPrice, maxClients, bufferMin, avail, visibility,
    adminNotes, weights, sortPriority, priorityScore, step,
  ]);

  /* ═══════════════════════════════════════════
     SAVE (core function used by debounce + flush)
  ═══════════════════════════════════════════ */
  const doSave = useCallback(async (currentAllyId: string, payload: Record<string, unknown>) => {
    const res = await fetch(`/api/v1/allies/${currentAllyId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      throw new Error((data as { error?: string }).error ?? 'Save failed');
    }
  }, []);

  /* Ensure we have an ally ID, creating one if needed */
  const ensureAllyId = useCallback(async (): Promise<string> => {
    if (allyId) return allyId;
    const res = await fetch('/api/v1/allies', { method: 'POST' });
    const data = await res.json() as { id: string };
    if (!res.ok) throw new Error((data as unknown as { error: string }).error ?? 'Create failed');
    const newId = data.id;
    setAllyId(newId);
    const params = new URLSearchParams(searchParams.toString());
    params.set('ally', newId);
    router.replace(`?${params.toString()}`, { scroll: false });
    return newId;
  }, [allyId, searchParams, router]);

  /* Schedule auto-save with debounce */
  const scheduleAutoSave = useCallback(() => {
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    setSaveStatus('saving');
    saveTimerRef.current = setTimeout(async () => {
      try {
        const id = await ensureAllyId();
        await doSave(id, buildPayload());
        setSaveStatus('saved');
        setTimeout(() => setSaveStatus('idle'), 3000);
      } catch (err) {
        setSaveStatus('error');
        console.error('Auto-save failed:', err);
      }
    }, 1500);
  }, [ensureAllyId, doSave, buildPayload]);

  /* Flush save immediately (used before step changes) */
  const flushSave = useCallback(async () => {
    if (saveTimerRef.current) { clearTimeout(saveTimerRef.current); saveTimerRef.current = null; }
    setSaveStatus('saving');
    try {
      const id = await ensureAllyId();
      await doSave(id, buildPayload());
      setSaveStatus('saved');
      setTimeout(() => setSaveStatus('idle'), 3000);
      return id;
    } catch (err) {
      setSaveStatus('error');
      console.error('Flush save failed:', err);
      throw err;
    }
  }, [ensureAllyId, doSave, buildPayload]);

  /* ═══════════════════════════════════════════
     CHIP TOGGLE
  ═══════════════════════════════════════════ */
  const toggleChip = (arr: string[], setArr: (v: string[]) => void, val: string) => {
    setArr(arr.includes(val) ? arr.filter(x => x !== val) : [...arr, val]);
  };

  /* ═══════════════════════════════════════════
     PHOTO UPLOAD
  ═══════════════════════════════════════════ */
  const handlePhotoChange = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!['image/jpeg','image/png','image/webp'].includes(file.type)) {
      showToast('error', 'Photo must be JPEG, PNG or WebP'); return;
    }
    if (file.size > 5 * 1024 * 1024) {
      showToast('error', 'Photo must be under 5 MB'); return;
    }
    setPhotoUploading(true);
    // Instant local preview via object URL
    setPhotoUrl(URL.createObjectURL(file));
    try {
      const id = await ensureAllyId();
      const fd = new FormData();
      fd.append('file', file);
      const res = await fetch(`/api/v1/allies/${id}/photo`, { method: 'POST', body: fd });
      const data = await res.json() as { photo_url?: string; storage_path?: string; error?: string };
      if (!res.ok) throw new Error(data.error ?? 'Upload failed');
      setPhotoUrl(data.photo_url!);
      setPhotoPath(data.storage_path!);
      showToast('success', 'Photo uploaded ✓');
    } catch (err) {
      showToast('error', `Photo upload failed: ${err instanceof Error ? err.message : String(err)}`);
      setPhotoUrl('');
    } finally {
      setPhotoUploading(false);
      e.target.value = '';
    }
  }, [ensureAllyId, showToast]);

  /* ═══════════════════════════════════════════
     DOCUMENT UPLOAD
  ═══════════════════════════════════════════ */
  const handleDocChange = useCallback(async (docKey: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setDocs(prev => ({ ...prev, [docKey]: { status: 'uploading' } }));
    try {
      const id = await ensureAllyId();
      const fd = new FormData();
      fd.append('file', file);
      fd.append('doc_type', docKey);
      const res = await fetch(`/api/v1/allies/${id}/documents`, { method: 'POST', body: fd });
      const data = await res.json() as { document?: { file_name: string; file_url: string }; error?: string };
      if (!res.ok) throw new Error(data.error ?? 'Upload failed');
      setDocs(prev => ({
        ...prev,
        [docKey]: { status: 'uploaded', file_name: data.document!.file_name, file_url: data.document!.file_url ?? '' },
      }));
      showToast('success', `${DOC_DEFS.find(d => d.key === docKey)?.label ?? 'Document'} uploaded ✓`);
    } catch (err) {
      setDocs(prev => ({ ...prev, [docKey]: { status: 'error', error: String(err) } }));
      showToast('error', `Upload failed: ${err instanceof Error ? err.message : String(err)}`);
    } finally {
      e.target.value = '';
    }
  }, [ensureAllyId, showToast]);

  /* ═══════════════════════════════════════════
     STEP NAVIGATION
  ═══════════════════════════════════════════ */
  const goToStep = useCallback(async (n: number) => {
    // Going back — no validation needed
    if (n < step) { setErrors({}); setStep(n); return; }
    // Validate current step
    let result = { valid: true, errors: {} as Record<string,string> };
    if (step === 1) result = validateStep1({ fullName, pronouns, location, email, phone, tagline, ownWords });
    if (step === 2) result = validateStep2({ primaryRole, specialties, ageGroups, genderPrefs });
    if (step === 3) result = validateStep3({ formats, durations, price });
    if (!result.valid) { setErrors(result.errors); return; }
    setErrors({});
    try { await flushSave(); } catch { /* toast already shown */ }
    setStep(n);
  }, [step, fullName, pronouns, location, email, phone, tagline, ownWords,
      primaryRole, specialties, ageGroups, genderPrefs, formats, durations, price, flushSave]);

  /* ═══════════════════════════════════════════
     FINAL SUBMIT
  ═══════════════════════════════════════════ */
  const handleSubmit = useCallback(async () => {
    const v1 = validateStep1({ fullName, pronouns, location, email, phone, tagline, ownWords });
    if (!v1.valid) { setErrors(v1.errors); setStep(1); showToast('error', 'Please complete Step 1 first'); return; }
    setIsSubmitting(true);
    try {
      const id = await flushSave();
      const res = await fetch(`/api/v1/allies/${id}/submit`, { method: 'POST' });
      const data = await res.json() as { ok?: boolean; error?: string };
      if (!res.ok) throw new Error(data.error ?? 'Submission failed');
      setSubmitted(true);
      showToast('success', `✓ Application submitted — pending admin review`);
    } catch (err) {
      showToast('error', `Submission failed: ${err instanceof Error ? err.message : String(err)}`);
    } finally {
      setIsSubmitting(false);
    }
  }, [fullName, pronouns, location, email, phone, tagline, ownWords, flushSave, showToast]);

  /* ═══════════════════════════════════════════
     DERIVED PREVIEW VALUES
  ═══════════════════════════════════════════ */
  const previewName     = fullName || 'Ally Name';
  const previewInitials = fullName ? fullName.split(' ').map(w => w[0]).join('').slice(0,2).toUpperCase() : '?';
  const previewTagline  = tagline  || 'Role · Experience · City';
  const previewTags     = specialties.slice(0, 4);
  const uploadedCount   = Object.values(docs).filter(d => d.status === 'uploaded').length;

  /* ═══════════════════════════════════════════
     LOADING STATE
  ═══════════════════════════════════════════ */
  if (isLoading) {
    return (
      <div style={{ display:'flex', alignItems:'center', justifyContent:'center', height:'60vh' }}>
        <div style={{ textAlign:'center', color:'var(--ob-moss)', fontSize:13, display:'flex', flexDirection:'column', alignItems:'center', gap:12 }}>
          <div className="ob-spinner" style={{ width:22, height:22, borderWidth:3 }}/>
          Loading draft…
        </div>
      </div>
    );
  }

  /* ═══════════════════════════════════════════
     RENDER
  ═══════════════════════════════════════════ */
  return (
    <>
      {/* Toast notification */}
      {toast && (
        <div className={`ns-toast ns-toast--${toast.type}`}
          style={{ position:'fixed', bottom:24, right:24, zIndex:1000, maxWidth:380 }}>
          {toast.message}
        </div>
      )}

      {/* Full-height layout shell — escapes ns-admin-content padding */}
      <div className="ob-page-shell">

        {/* ── STABLE STEP NAVIGATION ── */}
        <nav className="ob-step-progress" aria-label="Onboarding steps" role="tablist">
          {STEP_LABELS.map((s, i) => {
            const n = i + 1;
            const isActive = n === step;
            const isDone   = n < step;
            return (
              <button key={n} type="button" role="tab" aria-selected={isActive}
                onClick={() => { void goToStep(n); }}
                className={`ob-step-item${isActive?' ob-step-item--active':''}${isDone?' ob-step-item--done':''}`}>
                <div className="ob-step-item__num">{isDone ? '✓' : n}</div>
                <div className="ob-step-item__label">{s.label}</div>
                <div className="ob-step-item__sub">{s.sub}</div>
              </button>
            );
          })}
        </nav>

        {/* ── BODY GRID (form + preview) ── */}
        <div className="ob-body-grid">

          {/* ══ FORM COLUMN ══ */}
          <div className="ob-form-col">
            {/* Scrollable area — only this scrolls */}
            <div className="ob-form-col__scroller">
            <div className="ob-form-panel">

              {/* ════════════════════════════════════
                  STEP 1 — Personal Identity
              ════════════════════════════════════ */}
              {step === 1 && (
                <>
                  <div className="ob-panel-header">
                    <div className="ob-panel-header__eyebrow">Step 1 of 5</div>
                    <div className="ob-panel-header__title">Personal Identity</div>
                    <div className="ob-panel-header__sub">
                      The face, the name, the words that make clients feel safe enough to book.
                    </div>
                  </div>

                  {/* Core identity */}
                  <div className="ob-form-section">
                    <div className="ob-section-title">Core identity</div>
                    <div className="ob-grid-2">
                      <div className="ob-field">
                        <label className="ob-field__label">Full name <span style={{color:'var(--ob-terra)'}}>*</span></label>
                        <input className={`ob-field__input${errors.fullName?' ob-field__input--error':''}`}
                          placeholder="e.g. Priya Nair" value={fullName}
                          onChange={e => { setFullName(e.target.value); scheduleAutoSave(); }}/>
                        <FieldErr msg={errors.fullName}/>
                      </div>
                      <div className="ob-field">
                        <label className="ob-field__label">Display name</label>
                        <input className="ob-field__input" placeholder="e.g. Priya" value={displayName}
                          onChange={e => { setDisplayName(e.target.value); scheduleAutoSave(); }}/>
                        <div className="ob-field__hint">Shown on card. Defaults to first name.</div>
                      </div>
                      <div className="ob-field">
                        <label className="ob-field__label">Pronouns <span style={{color:'var(--ob-terra)'}}>*</span></label>
                        <select className={`ob-field__select${errors.pronouns?' ob-field__select--error':''}`}
                          value={pronouns} onChange={e => { setPronouns(e.target.value); scheduleAutoSave(); }}>
                          <option value="">Select pronouns</option>
                          <option>she / her</option>
                          <option>he / him</option>
                          <option>they / them</option>
                          <option>she / they</option>
                          <option>he / they</option>
                          <option>any pronouns</option>
                          <option>prefer not to say</option>
                        </select>
                        <FieldErr msg={errors.pronouns}/>
                      </div>
                      <div className="ob-field">
                        <label className="ob-field__label">City / Location <span style={{color:'var(--ob-terra)'}}>*</span></label>
                        <input className={`ob-field__input${errors.location?' ob-field__input--error':''}`}
                          placeholder="e.g. Bangalore" value={location}
                          onChange={e => { setLocation(e.target.value); scheduleAutoSave(); }}/>
                        <FieldErr msg={errors.location}/>
                      </div>
                    </div>
                  </div>

                  {/* Profile photo */}
                  <div className="ob-form-section">
                    <div className="ob-section-title">Profile photo</div>
                    <div className="ob-photo-upload">
                      <div className="ob-photo-preview" onClick={() => !photoUploading && photoInputRef.current?.click()}
                        style={{ cursor:'pointer', overflow:'hidden', position:'relative' }}>
                        {photoUrl ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={photoUrl} alt="Profile preview"
                            style={{ width:'100%', height:'100%', objectFit:'cover', borderRadius:'inherit' }}/>
                        ) : photoUploading ? (
                          <div className="ob-spinner"/>
                        ) : (
                          <>
                            <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                              <circle cx="12" cy="8" r="4" stroke="#5C7A66" strokeWidth="1.3"/>
                              <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" stroke="#5C7A66" strokeWidth="1.3" strokeLinecap="round"/>
                            </svg>
                            <span className="ob-photo-preview__label">Photo</span>
                          </>
                        )}
                      </div>
                      <div className="ob-photo-meta">
                        <div style={{fontSize:13, fontWeight:500, color:'var(--ob-dp)'}}>
                          {photoUrl ? 'Photo uploaded' : 'Upload profile photo'}
                        </div>
                        <div style={{fontSize:11, color:'var(--ob-moss)', opacity:0.6, lineHeight:1.5}}>
                          Square, at least 400×400px. JPEG, PNG or WebP. Max 5 MB.
                        </div>
                        <button type="button" className="ob-btn-upload" disabled={photoUploading}
                          onClick={() => photoInputRef.current?.click()}>
                          <svg width="13" height="13" viewBox="0 0 14 14" fill="none">
                            <path d="M7 1v9M3 5l4-4 4 4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                          {photoUploading ? 'Uploading…' : photoUrl ? 'Change photo' : 'Choose file'}
                        </button>
                      </div>
                      <input ref={photoInputRef} type="file" accept="image/jpeg,image/png,image/webp"
                        style={{display:'none'}} onChange={handlePhotoChange}/>
                    </div>
                  </div>

                  {/* Voice & bio */}
                  <div className="ob-form-section">
                    <div className="ob-section-title">Voice &amp; bio</div>
                    <div className="ob-grid-1">
                      <div className="ob-field">
                        <label className="ob-field__label">Short tagline <span style={{color:'var(--ob-terra)'}}>*</span></label>
                        <input className={`ob-field__input${errors.tagline?' ob-field__input--error':''}`}
                          maxLength={80} placeholder="Counsellor · 7 years · Bangalore"
                          value={tagline} onChange={e => { setTagline(e.target.value); scheduleAutoSave(); }}/>
                        <div style={{display:'flex', justifyContent:'space-between', alignItems:'center'}}>
                          <FieldErr msg={errors.tagline}/>
                          <div className="ob-char-counter">{tagline.length}/80</div>
                        </div>
                      </div>
                      <div className="ob-field">
                        <label className="ob-field__label">In their own words <span style={{color:'var(--ob-terra)'}}>*</span></label>
                        <textarea className={`ob-field__textarea${errors.ownWords?' ob-field__textarea--error':''}`}
                          maxLength={200} rows={3} placeholder="A personal quote that appears on the ally card…"
                          value={ownWords} onChange={e => { setOwnWords(e.target.value); scheduleAutoSave(); }}/>
                        <div style={{display:'flex', justifyContent:'space-between', alignItems:'center'}}>
                          <FieldErr msg={errors.ownWords}/>
                          <div className="ob-char-counter">{ownWords.length}/200</div>
                        </div>
                        <div className="ob-field__hint">Personal quote shown on profile card</div>
                      </div>
                      <div className="ob-field">
                        <label className="ob-field__label">Full bio</label>
                        <textarea className="ob-field__textarea" maxLength={600} rows={4}
                          placeholder="Background, approach, and what makes this ally unique…"
                          value={bio} onChange={e => { setBio(e.target.value); scheduleAutoSave(); }}/>
                        <div className="ob-char-counter">{bio.length}/600</div>
                        <div className="ob-field__hint">3–4 sentences for the expanded profile</div>
                      </div>
                    </div>
                  </div>

                  {/* Contact */}
                  <div className="ob-form-section">
                    <div className="ob-section-title">Contact &amp; onboarding</div>
                    <div className="ob-grid-2">
                      <div className="ob-field">
                        <label className="ob-field__label">Email <span style={{color:'var(--ob-terra)'}}>*</span></label>
                        <input className={`ob-field__input${errors.email?' ob-field__input--error':''}`}
                          type="email" placeholder="ally@example.com" value={email}
                          onChange={e => { setEmail(e.target.value); scheduleAutoSave(); }}/>
                        <FieldErr msg={errors.email}/>
                      </div>
                      <div className="ob-field">
                        <label className="ob-field__label">Phone <span style={{color:'var(--ob-terra)'}}>*</span></label>
                        <input className={`ob-field__input${errors.phone?' ob-field__input--error':''}`}
                          type="tel" placeholder="+91 98765 43210" value={phone}
                          onChange={e => { setPhone(e.target.value); scheduleAutoSave(); }}/>
                        <FieldErr msg={errors.phone}/>
                      </div>
                      <div className="ob-field">
                        <label className="ob-field__label">WhatsApp number</label>
                        <input className="ob-field__input" type="tel" placeholder="+91 98765 43210"
                          value={whatsapp} onChange={e => { setWhatsapp(e.target.value); scheduleAutoSave(); }}/>
                        <div className="ob-field__hint">Used for session reminders</div>
                      </div>
                      <div className="ob-field">
                        <label className="ob-field__label">Emergency / Admin contact</label>
                        <input className="ob-field__input" placeholder="Name · number"
                          value={emergency} onChange={e => { setEmergency(e.target.value); scheduleAutoSave(); }}/>
                        <div className="ob-field__hint">Internal use only</div>
                      </div>
                    </div>
                  </div>

                </>
              )}

              {/* ════════════════════════════════════
                  STEP 2 — Expertise & Approach
              ════════════════════════════════════ */}
              {step === 2 && (
                <>
                  <div className="ob-panel-header">
                    <div className="ob-panel-header__eyebrow">Step 2 of 5</div>
                    <div className="ob-panel-header__title">Expertise &amp; Approach</div>
                    <div className="ob-panel-header__sub">
                      Powers the matching engine. The more precisely defined, the better the client–ally fit.
                    </div>
                  </div>

                  {/* Credentials */}
                  <div className="ob-form-section">
                    <div className="ob-section-title">Credentials</div>
                    <div className="ob-grid-2">
                      <div className="ob-field">
                        <label className="ob-field__label">Primary role <span style={{color:'var(--ob-terra)'}}>*</span></label>
                        <select className={`ob-field__select${errors.primaryRole?' ob-field__select--error':''}`}
                          value={primaryRole} onChange={e => { setPrimaryRole(e.target.value); scheduleAutoSave(); }}>
                          <option value="">Select role</option>
                          <option>Counsellor</option>
                          <option>Psychologist (RCI Registered)</option>
                          <option>Clinical Psychologist</option>
                          <option>Therapist</option>
                          <option>Life Coach (Certified)</option>
                          <option>Peer Support Specialist</option>
                          <option>Ally (Trained Listener)</option>
                        </select>
                        <FieldErr msg={errors.primaryRole}/>
                      </div>
                      <div className="ob-field">
                        <label className="ob-field__label">Years of experience</label>
                        <div className="ob-range-row">
                          <input type="range" min={0} max={30} value={experience}
                            onChange={e => { setExperience(Number(e.target.value)); scheduleAutoSave(); }}/>
                          <span style={{fontSize:15,fontWeight:500,color:'var(--ob-dp)',minWidth:48,textAlign:'right'}}>
                            {experience} yrs
                          </span>
                        </div>
                      </div>
                      <div className="ob-field">
                        <label className="ob-field__label">Highest qualification</label>
                        <input className="ob-field__input" placeholder="e.g. M.Phil Clinical Psychology, NIMHANS"
                          value={qualification} onChange={e => { setQualification(e.target.value); scheduleAutoSave(); }}/>
                      </div>
                      <div className="ob-field">
                        <label className="ob-field__label">License / Registration no.</label>
                        <input className="ob-field__input" placeholder="e.g. RCI/2019/KA/04821"
                          value={licenseNo} onChange={e => { setLicenseNo(e.target.value); scheduleAutoSave(); }}/>
                      </div>
                      <div className="ob-field ob-field--span2">
                        <label className="ob-field__label">Additional certifications</label>
                        <textarea className="ob-field__textarea" rows={2}
                          placeholder="List any additional certifications, one per line…"
                          value={extraCerts} onChange={e => { setExtraCerts(e.target.value); scheduleAutoSave(); }}/>
                      </div>
                    </div>
                  </div>

                  {/* Specialisations */}
                  <div className="ob-form-section">
                    <div className="ob-section-title">Specialisations</div>
                    <div className="ob-notice ob-notice--info" style={{marginBottom:14}}>
                      <svg className="ob-notice__icon" width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="var(--ob-moss)" strokeWidth="1.4" strokeLinecap="round"><circle cx="8" cy="8" r="6"/><path d="M8 7v4M8 5.5V6"/></svg>
                      <div className="ob-notice__body">First 2 selected specialities appear as filled tags on the ally card</div>
                    </div>
                    {errors.specialties && <div className="ob-field__error" style={{marginBottom:8}}>⚠ {errors.specialties}</div>}
                    <div className="ob-chip-group">
                      {SPECIALITIES.map(s => (
                        <button key={s} type="button"
                          className={`ob-chip-opt${specialties.includes(s)?' selected':''}`}
                          onClick={() => { toggleChip(specialties, setSpecialties, s); scheduleAutoSave(); }}>
                          {s}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Modalities */}
                  <div className="ob-form-section">
                    <div className="ob-section-title">Therapeutic modalities</div>
                    <div className="ob-chip-group">
                      {MODALITIES.map(m => (
                        <button key={m} type="button"
                          className={`ob-chip-opt${modalities.includes(m)?' selected':''}`}
                          onClick={() => { toggleChip(modalities, setModalities, m); scheduleAutoSave(); }}>
                          {m}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Client fit */}
                  <div className="ob-form-section">
                    <div className="ob-section-title">Client fit</div>
                    <div className="ob-grid-2">
                      <div className="ob-field">
                        <label className="ob-field__label">Age groups <span style={{color:'var(--ob-terra)'}}>*</span></label>
                        {errors.ageGroups && <div className="ob-field__error">⚠ {errors.ageGroups}</div>}
                        <div className="ob-chip-group" style={{padding:10}}>
                          {AGE_GROUPS.map(a => (
                            <button key={a} type="button"
                              className={`ob-chip-opt${ageGroups.includes(a)?' selected':''}`}
                              onClick={() => { toggleChip(ageGroups, setAgeGroups, a); scheduleAutoSave(); }}>
                              {a}
                            </button>
                          ))}
                        </div>
                      </div>
                      <div className="ob-field">
                        <label className="ob-field__label">Gender preference <span style={{color:'var(--ob-terra)'}}>*</span></label>
                        {errors.genderPrefs && <div className="ob-field__error">⚠ {errors.genderPrefs}</div>}
                        <div className="ob-chip-group" style={{padding:10}}>
                          {GENDERS.map(g => (
                            <button key={g} type="button"
                              className={`ob-chip-opt${genderPrefs.includes(g)?' selected':''}`}
                              onClick={() => { toggleChip(genderPrefs, setGenderPrefs, g); scheduleAutoSave(); }}>
                              {g}
                            </button>
                          ))}
                        </div>
                      </div>
                      <div className="ob-field">
                        <label className="ob-field__label">Languages spoken</label>
                        <input className="ob-field__input" value={langSpoken}
                          onChange={e => { setLangSpoken(e.target.value); scheduleAutoSave(); }}/>
                      </div>
                      <div className="ob-field">
                        <label className="ob-field__label">Languages for therapy</label>
                        <input className="ob-field__input" value={langTherapy}
                          onChange={e => { setLangTherapy(e.target.value); scheduleAutoSave(); }}/>
                      </div>
                    </div>
                  </div>

                  {/* Approach style */}
                  <div className="ob-form-section">
                    <div className="ob-section-title">Approach style</div>
                    <div className="ob-grid-1">
                      <div className="ob-field">
                        <label className="ob-field__label">Session style description</label>
                        <textarea className="ob-field__textarea" rows={3}
                          placeholder="Describe your approach to sessions…"
                          value={approachStyle} onChange={e => { setApproachStyle(e.target.value); scheduleAutoSave(); }}/>
                      </div>
                      <div className="ob-field">
                        <label className="ob-field__label">Session tone</label>
                        <div className="ob-chip-group">
                          {TONES.map(t => (
                            <button key={t} type="button"
                              className={`ob-chip-opt${sessionTones.includes(t)?' selected':''}`}
                              onClick={() => { toggleChip(sessionTones, setSessionTones, t); scheduleAutoSave(); }}>
                              {t}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>

                </>
              )}

              {/* ════════════════════════════════════
                  STEP 3 — Session Format & Availability
              ════════════════════════════════════ */}
              {step === 3 && (
                <>
                  <div className="ob-panel-header">
                    <div className="ob-panel-header__eyebrow">Step 3 of 5</div>
                    <div className="ob-panel-header__title">Session Format &amp; Availability</div>
                    <div className="ob-panel-header__sub">
                      Controls what clients see on the booking card and what the scheduler uses to surface available slots.
                    </div>
                  </div>

                  {/* Format & pricing */}
                  <div className="ob-form-section">
                    <div className="ob-section-title">Format &amp; pricing</div>
                    <div className="ob-grid-2">
                      <div className="ob-field">
                        <label className="ob-field__label">Session format <span style={{color:'var(--ob-terra)'}}>*</span></label>
                        {errors.formats && <div className="ob-field__error">⚠ {errors.formats}</div>}
                        <div className="ob-chip-group" style={{padding:10}}>
                          {FORMATS.map(f => (
                            <button key={f} type="button"
                              className={`ob-chip-opt${formats.includes(f)?' selected':''}`}
                              onClick={() => { toggleChip(formats, setFormats, f); scheduleAutoSave(); }}>
                              {f}
                            </button>
                          ))}
                        </div>
                      </div>
                      <div className="ob-field">
                        <label className="ob-field__label">Session duration <span style={{color:'var(--ob-terra)'}}>*</span></label>
                        {errors.durations && <div className="ob-field__error">⚠ {errors.durations}</div>}
                        <div className="ob-chip-group" style={{padding:10}}>
                          {DURATIONS.map(d => (
                            <button key={d} type="button"
                              className={`ob-chip-opt${durations.includes(d)?' selected':''}`}
                              onClick={() => { toggleChip(durations, setDurations, d); scheduleAutoSave(); }}>
                              {d}
                            </button>
                          ))}
                        </div>
                      </div>
                      <div className="ob-field">
                        <label className="ob-field__label">Session price (₹) <span style={{color:'var(--ob-terra)'}}>*</span></label>
                        <div className="ob-price-row">
                          <div className="ob-price-prefix">₹</div>
                          <input className={`ob-field__input${errors.price?' ob-field__input--error':''}`}
                            type="number" min={0} style={{borderRadius:'0 9px 9px 0'}}
                            value={price} onChange={e => { setPrice(Number(e.target.value)); scheduleAutoSave(); }}/>
                        </div>
                        <FieldErr msg={errors.price}/>
                      </div>
                      <div className="ob-field">
                        <label className="ob-field__label">Intro session price (₹) <span style={{fontSize:11,color:'var(--ob-moss)',opacity:0.6}}>optional</span></label>
                        <div className="ob-price-row">
                          <div className="ob-price-prefix">₹</div>
                          <input className="ob-field__input" type="number" min={0} placeholder="800"
                            style={{borderRadius:'0 9px 9px 0'}} value={introPrice}
                            onChange={e => { setIntroPrice(e.target.value); scheduleAutoSave(); }}/>
                        </div>
                      </div>
                      <div className="ob-field">
                        <label className="ob-field__label">Max clients / week</label>
                        <div className="ob-range-row">
                          <input type="range" min={1} max={30} value={maxClients}
                            onChange={e => { setMaxClients(Number(e.target.value)); scheduleAutoSave(); }}/>
                          <span style={{fontSize:15,fontWeight:500,color:'var(--ob-dp)',minWidth:48,textAlign:'right'}}>{maxClients}</span>
                        </div>
                      </div>
                      <div className="ob-field">
                        <label className="ob-field__label">Buffer between sessions</label>
                        <select className="ob-field__select" value={bufferMin}
                          onChange={e => { setBufferMin(e.target.value); scheduleAutoSave(); }}>
                          <option value="10">10 min</option>
                          <option value="15">15 min</option>
                          <option value="30">30 min</option>
                          <option value="45">45 min</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* Availability grid */}
                  <div className="ob-form-section">
                    <div className="ob-section-title">Typical weekly availability</div>
                    <div className="ob-avail-grid">
                      <div className="ob-avail-cell header"/>
                      {AVAIL_COLS.map(col => <div key={col} className="ob-avail-cell header">{col}</div>)}
                      {AVAIL_ROWS.map(row => (
                        <>
                          <div key={`${row}-lbl`} className="ob-avail-cell day-header">{row}</div>
                          {AVAIL_COLS.map(col => {
                            const key = `${row}_${col}`;
                            return (
                              <div key={key}
                                className={`ob-avail-cell${avail[key] ? ' selected' : ''}`}
                                onClick={() => {
                                  setAvail(prev => ({ ...prev, [key]: !prev[key] }));
                                  scheduleAutoSave();
                                }}>
                                {avail[key] ? '✓ Available' : 'Tap to add'}
                              </div>
                            );
                          })}
                        </>
                      ))}
                    </div>
                  </div>

                  {/* Visibility toggles */}
                  <div className="ob-form-section">
                    <div className="ob-section-title">Platform visibility settings</div>
                    <div style={{display:'flex',flexDirection:'column',gap:10}}>
                      {([
                        { key:'search',   label:'Visible in search results',     desc:'Toggle off during onboarding review' },
                        { key:'bookings', label:'Accepting new bookings',         desc:'Enable once documents are verified' },
                        { key:'matching', label:'Include in matching algorithm',  desc:'Shows up in post-assessment suggestions' },
                        { key:'featured', label:'Featured ally',                  desc:'Shown at top of match results with a subtle highlight' },
                      ] as const).map(t => (
                        <div key={t.key} className="ob-toggle-row">
                          <div className="ob-toggle-row__info">
                            <div className="ob-toggle-row__title">{t.label}</div>
                            <div className="ob-toggle-row__desc">{t.desc}</div>
                          </div>
                          <label className="ns-toggle">
                            <input type="checkbox" checked={visibility[t.key]}
                              onChange={e => { setVisibility(v => ({...v,[t.key]:e.target.checked})); scheduleAutoSave(); }}/>
                            <div className="ns-toggle__track"/>
                            <div className="ns-toggle__thumb"/>
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>

                </>
              )}

              {/* ════════════════════════════════════
                  STEP 4 — Document Verification
              ════════════════════════════════════ */}
              {step === 4 && (
                <>
                  <div className="ob-panel-header">
                    <div className="ob-panel-header__eyebrow">Step 4 of 5</div>
                    <div className="ob-panel-header__title">Document Verification</div>
                    <div className="ob-panel-header__sub">
                      Required before the ally goes live. Marked documents are mandatory.
                    </div>
                  </div>

                  {/* Identity & credentials docs */}
                  <div className="ob-form-section">
                    <div className="ob-section-title">Identity &amp; credentials</div>
                    <div className="ob-doc-grid">
                      {DOC_DEFS.filter(d => d.section === 'identity').map(d => {
                        const docState = docs[d.key];
                        const isUploaded = docState?.status === 'uploaded';
                        const isUploading = docState?.status === 'uploading';
                        return (
                          <div key={d.key} className={`ob-doc-card${isUploaded?' uploaded':''}`}>
                            {d.required && <div className="ob-doc-required">Required</div>}
                            <div className="ob-doc-card__icon">
                              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"><rect x="3" y="1" width="10" height="14" rx="1.5"/><path d="M6 5h4M6 8h4M6 11h2"/></svg>
                            </div>
                            <div className="ob-doc-card__name">{d.label}</div>
                            <div className="ob-doc-card__meta">{d.desc}</div>
                            <div className={`ob-doc-card__status ${isUploaded?'ob-doc-card__status--ok':'ob-doc-card__status--pending'}`}>
                              {isUploaded && <svg width="10" height="10" viewBox="0 0 10 10" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><path d="M2 5l2.5 2.5 3.5-4"/></svg>}
                              {isUploading ? 'Uploading…' : isUploaded ? 'Uploaded' : 'Pending upload'}
                            </div>
                            {isUploaded && docState.file_name && (
                              <div className="ob-doc-card__filename">{docState.file_name}</div>
                            )}
                            {docState?.status === 'error' && (
                              <div className="ob-field__error">⚠ {docState.error ?? 'Upload failed'}</div>
                            )}
                            <button type="button" className="ob-doc-card__upload-btn"
                              disabled={isUploading}
                              onClick={() => docInputRefs.current[d.key]?.click()}>
                              {isUploading ? <><div className="ob-spinner"/>&nbsp;Uploading…</> :
                               isUploaded  ? <>↑ Replace file</> :
                               <><svg width="11" height="11" viewBox="0 0 14 14" fill="none"><path d="M7 1v9M3 5l4-4 4 4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/></svg>&nbsp;Upload</>}
                            </button>
                            <input
                              ref={el => { docInputRefs.current[d.key] = el; }}
                              type="file" accept=".pdf,image/jpeg,image/png"
                              style={{display:'none'}}
                              onChange={e => handleDocChange(d.key, e)}/>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Safety & compliance docs */}
                  <div className="ob-form-section">
                    <div className="ob-section-title">Safety &amp; compliance</div>
                    <div className="ob-doc-grid">
                      {DOC_DEFS.filter(d => d.section === 'safety').map(d => {
                        const docState = docs[d.key];
                        const isUploaded = docState?.status === 'uploaded';
                        const isUploading = docState?.status === 'uploading';
                        const isAgreement = d.key === 'agreement';
                        return (
                          <div key={d.key}
                            className={`ob-doc-card${isUploaded?' uploaded':''}${d.key==='agreement'?' ob-field--span2':''}`}
                            style={d.key==='agreement'?{gridColumn:'1 / -1'}:{}}>
                            {d.required && <div className="ob-doc-required">Required</div>}
                            <div className="ob-doc-card__icon">
                              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"><path d="M8 2Q12 3 13 7Q13 11 8 14Q3 11 3 7Q4 3 8 2Z"/></svg>
                            </div>
                            <div className="ob-doc-card__name">{d.label}</div>
                            <div className="ob-doc-card__meta">{d.desc}</div>
                            <div className={`ob-doc-card__status ${isUploaded?'ob-doc-card__status--ok':'ob-doc-card__status--pending'}`}>
                              {isUploaded && <svg width="10" height="10" viewBox="0 0 10 10" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><path d="M2 5l2.5 2.5 3.5-4"/></svg>}
                              {isUploading ? 'Uploading…' : isUploaded ? 'Uploaded' : isAgreement ? 'Awaiting review stage' : 'Pending upload'}
                            </div>
                            {isUploaded && docState.file_name && (
                              <div className="ob-doc-card__filename">{docState.file_name}</div>
                            )}
                            {!isAgreement && (
                              <>
                                <button type="button" className="ob-doc-card__upload-btn"
                                  disabled={isUploading}
                                  onClick={() => docInputRefs.current[d.key]?.click()}>
                                  {isUploading ? <><div className="ob-spinner"/>&nbsp;Uploading…</> :
                                   isUploaded  ? <>↑ Replace file</> :
                                   <><svg width="11" height="11" viewBox="0 0 14 14" fill="none"><path d="M7 1v9M3 5l4-4 4 4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/></svg>&nbsp;Upload</>}
                                </button>
                                <input
                                  ref={el => { docInputRefs.current[d.key] = el; }}
                                  type="file" accept=".pdf,image/jpeg,image/png"
                                  style={{display:'none'}}
                                  onChange={e => handleDocChange(d.key, e)}/>
                              </>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Admin notes */}
                  <div className="ob-form-section">
                    <div className="ob-section-title">Admin notes (internal)</div>
                    <div className="ob-field">
                      <textarea className="ob-field__textarea" rows={4}
                        placeholder="Internal notes about this application. Not visible to the ally or clients."
                        value={adminNotes} onChange={e => { setAdminNotes(e.target.value); scheduleAutoSave(); }}/>
                      <div className="ob-field__hint">Internal only — not visible to the ally or clients.</div>
                    </div>
                  </div>

                </>
              )}

              {/* ════════════════════════════════════
                  STEP 5 — Matching Engine Config
              ════════════════════════════════════ */}
              {step === 5 && (
                <>
                  <div className="ob-panel-header">
                    <div className="ob-panel-header__eyebrow">Step 5 of 5</div>
                    <div className="ob-panel-header__title">Matching Engine Configuration</div>
                    <div className="ob-panel-header__sub">
                      These weights tell the algorithm how strongly to surface this ally for specific assessment outcomes.
                    </div>
                  </div>

                  {submitted && zohoStaffId ? (
                    /* ── Success state ── */
                    <div className="ob-submit-success">
                      <div className="ob-submit-success__icon">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M20 6L9 17l-5-5"/>
                        </svg>
                      </div>
                      <div className="ob-submit-success__title">Ally submitted &amp; created in Zoho</div>
                      <div className="ob-submit-success__sub">
                        The staff profile has been created in Zoho Bookings.<br/>
                        Enable visibility toggles on Step 3 when documents are verified.
                      </div>
                      <div className="ob-submit-success__badge">
                        <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"><circle cx="8" cy="8" r="6"/><path d="M8 5v3l2 2"/></svg>
                        Zoho Staff ID: {zohoStaffId}
                      </div>
                    </div>
                  ) : (
                    <>
                      {/* Match weights */}
                      <div className="ob-form-section">
                        <div className="ob-section-title">Assessment → Ally match weights</div>
                        <div className="ob-notice ob-notice--info" style={{marginBottom:16}}>
                          <svg className="ob-notice__icon" width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="var(--ob-moss)" strokeWidth="1.4" strokeLinecap="round"><circle cx="8" cy="8" r="6"/><path d="M8 7v4M8 5.5V6"/></svg>
                          <div className="ob-notice__body">
                            Higher weights increase likelihood this ally appears for users whose assessment matches that category.
                          </div>
                        </div>
                        <div style={{display:'flex',flexDirection:'column',gap:10}}>
                          {MATCH_WEIGHTS_DEF.map(m => (
                            <div key={m.key} className="ob-match-row">
                              <div className="ob-match-row__label">{m.label}</div>
                              <span className={`ob-match-row__tag ${m.tag==='Primary'?'ob-tag-primary':'ob-tag-secondary'}`}>{m.tag}</span>
                              <div className="ob-match-bar">
                                <input type="range" min={0} max={100} value={weights[m.key] ?? m.def}
                                  onChange={e => {
                                    setWeights(prev => ({...prev,[m.key]:Number(e.target.value)}));
                                    scheduleAutoSave();
                                  }}
                                  style={{flex:1,height:4,borderRadius:4,outline:'none',cursor:'pointer'}}/>
                                <span style={{fontSize:11,color:'var(--ob-moss)',width:36,textAlign:'right',opacity:0.8}}>
                                  {weights[m.key] ?? m.def}%
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Tiebreaker */}
                      <div className="ob-form-section">
                        <div className="ob-section-title">Tiebreaker preferences</div>
                        <div className="ob-grid-2">
                          <div className="ob-field">
                            <label className="ob-field__label">Sort order priority</label>
                            <select className="ob-field__select" value={sortPriority}
                              onChange={e => { setSortPriority(e.target.value); scheduleAutoSave(); }}>
                              <option>Earliest availability</option>
                              <option>Lowest price</option>
                              <option>Featured status</option>
                              <option>Random</option>
                            </select>
                          </div>
                          <div className="ob-field">
                            <label className="ob-field__label">Manual priority score (0–10)</label>
                            <input className="ob-field__input" type="number" min={0} max={10}
                              value={priorityScore}
                              onChange={e => { setPriorityScore(Number(e.target.value)); scheduleAutoSave(); }}/>
                            <div className="ob-field__hint">Boosts ranking slightly when scores are equal</div>
                          </div>
                        </div>
                      </div>

                      {/* Review notice */}
                      <div className="ob-form-section">
                        <div className="ob-section-title">Review &amp; submit</div>
                        <div className="ob-notice ob-notice--warn">
                          <svg className="ob-notice__icon" width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="var(--ob-terra)" strokeWidth="1.4" strokeLinecap="round"><path d="M8 3v5M8 10.5V11"/><path d="M3 13L8 3l5 10H3z"/></svg>
                          <div className="ob-notice__body">
                            <strong>Not yet live.</strong> Submitting creates the staff profile in Zoho Bookings.
                            To make them visible to clients, enable visibility toggles on Step 3 after documents are verified.
                          </div>
                        </div>
                      </div>
                    </>
                  )}

                </>
              )}

            </div>{/* /ob-form-panel */}
            </div>{/* /ob-form-col__scroller */}

            {/* ── ALWAYS-VISIBLE FOOTER — direct flex child of ob-form-col ── */}
            <div className="ob-panel-footer">
              <div className="ob-panel-footer__left">
                <span className={`ob-save-status ob-save-status--${saveStatus}`}>
                  {step === 4 && `${uploadedCount} of ${DOC_DEFS.length} documents uploaded`}
                  {step === 5 && (submitted ? `Zoho ID: ${zohoStaffId}` : 'Draft · Not yet published')}
                  {step < 4 && (
                    <>
                      {saveStatus === 'saving' && <><div className="ob-spinner"/>Saving…</>}
                      {saveStatus === 'saved'  && '✓ Saved'}
                      {saveStatus === 'error'  && '✗ Save failed'}
                      {saveStatus === 'idle'   && 'Auto-save on'}
                    </>
                  )}
                </span>
              </div>
              <div className="ob-footer-actions">
                {step === 1 && (
                  <>
                    <button type="button" className="ob-btn ob-btn--ghost ob-btn--sm"
                      onClick={() => { void flushSave(); }}>Save draft</button>
                    <button type="button" className="ob-btn ob-btn--primary"
                      onClick={() => { void goToStep(2); }}>Next: Expertise →</button>
                  </>
                )}
                {step === 2 && (
                  <>
                    <button type="button" className="ob-btn ob-btn--ghost ob-btn--sm" onClick={() => { void goToStep(1); }}>Back</button>
                    <button type="button" className="ob-btn ob-btn--ghost ob-btn--sm" onClick={() => { void flushSave(); }}>Save draft</button>
                    <button type="button" className="ob-btn ob-btn--primary" onClick={() => { void goToStep(3); }}>Next: Sessions →</button>
                  </>
                )}
                {step === 3 && (
                  <>
                    <button type="button" className="ob-btn ob-btn--ghost ob-btn--sm" onClick={() => { void goToStep(2); }}>Back</button>
                    <button type="button" className="ob-btn ob-btn--ghost ob-btn--sm" onClick={() => { void flushSave(); }}>Save draft</button>
                    <button type="button" className="ob-btn ob-btn--primary" onClick={() => { void goToStep(4); }}>Next: Documents →</button>
                  </>
                )}
                {step === 4 && (
                  <>
                    <button type="button" className="ob-btn ob-btn--ghost ob-btn--sm" onClick={() => { void goToStep(3); }}>Back</button>
                    <button type="button" className="ob-btn ob-btn--ghost ob-btn--sm" onClick={() => { void flushSave(); }}>Save draft</button>
                    <button type="button" className="ob-btn ob-btn--primary" onClick={() => { void goToStep(5); }}>Next: Matching →</button>
                  </>
                )}
                {step === 5 && !submitted && (
                  <>
                    <button type="button" className="ob-btn ob-btn--ghost ob-btn--sm" onClick={() => { void goToStep(4); }}>Back</button>
                    <button type="button" className="ob-btn ob-btn--secondary" onClick={() => { void flushSave(); }}>Save as draft</button>
                    <button type="button" className="ob-btn ob-btn--primary"
                      disabled={isSubmitting}
                      onClick={() => { void handleSubmit(); }}>
                      {isSubmitting
                        ? <><div className="ob-spinner" style={{borderTopColor:'var(--ob-cream)'}}/>&nbsp;Submitting…</>
                        : 'Submit for review →'}
                    </button>
                  </>
                )}
                {step === 5 && submitted && (
                  <button type="button" className="ob-btn ob-btn--ghost ob-btn--sm"
                    onClick={() => router.push('/admin/allies')}>
                    View all allies →
                  </button>
                )}
              </div>
            </div>

          </div>{/* /ob-form-col */}

          {/* ══ PREVIEW COLUMN ══ */}
          <div className="ob-preview-scroll">

            <CompletionRing step={step}/>

            {/* Profile card preview */}
            <div className="ob-preview-card">
              <div className="ob-preview-left">
                <div className="ob-preview-avatar" style={{overflow:'hidden'}}>
                  {photoUrl
                    // eslint-disable-next-line @next/next/no-img-element
                    ? <img src={photoUrl} alt="" style={{width:'100%',height:'100%',objectFit:'cover',borderRadius:'inherit'}}/>
                    : previewInitials}
                </div>
                <div className="ob-preview-name">{previewName}</div>
                <div className="ob-preview-role">{previewTagline}</div>
                <div className="ob-preview-badges">
                  {pronouns && <span className="ob-preview-badge">{pronouns}</span>}
                  {location && <span className="ob-preview-badge">{location}</span>}
                </div>
              </div>
              <div className="ob-preview-right">
                <div>
                  <div className="ob-preview-label">Specialises in</div>
                  <div className="ob-preview-tags">
                    {previewTags.slice(0,2).map(t => (
                      <span key={t} className="ob-preview-tag ob-preview-tag--filled">{t}</span>
                    ))}
                    {previewTags.slice(2).map(t => (
                      <span key={t} className="ob-preview-tag ob-preview-tag--outline">{t}</span>
                    ))}
                    {previewTags.length === 0 && (
                      <span className="ob-preview-tag ob-preview-tag--outline" style={{opacity:0.4}}>Specialities appear here</span>
                    )}
                  </div>
                </div>
                {ownWords && <div className="ob-preview-quote">&ldquo;{ownWords}&rdquo;</div>}
                <div className="ob-preview-divider"/>
                <div className="ob-preview-row">
                  <svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"><rect x="2" y="2" width="12" height="12" rx="2"/><path d="M8 5v4M6 9h4"/></svg>
                  {durations[0] ?? '60min'}
                </div>
                <div className="ob-preview-row">
                  <svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"><path d="M8 2a4 4 0 0 1 4 4c0 5-4 8-4 8S4 11 4 6a4 4 0 0 1 4-4z"/><circle cx="8" cy="6" r="1.5"/></svg>
                  {formats[0]?.replace('🎥 ','').replace('📍 ','') ?? 'Online'}
                </div>
                <div className="ob-preview-row">
                  <svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"><circle cx="8" cy="8" r="6"/><path d="M8 5v3l2 2"/></svg>
                  ₹{price.toLocaleString('en-IN')}/session
                </div>
              </div>
            </div>

            {/* Match strength preview */}
            <div className="ob-match-score">
              <div className="ob-match-score__title">
                <svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"><circle cx="8" cy="8" r="2.5"/><path d="M8 1v2M8 13v2M1 8h2M13 8h2M3 3l1.4 1.4M11.6 11.6L13 13M3 13l1.4-1.4M11.6 4.4L13 3"/></svg>
                Match strength preview
              </div>
              <div className="ob-match-bar-row">
                {(['loneliness','heartbreak','family','overwhelm'] as const).map(k => (
                  <div key={k} className="ob-match-bar-item">
                    <div className="ob-match-bar-label" style={{textTransform:'capitalize'}}>{k}</div>
                    <div className="ob-match-bar-track">
                      <div className="ob-match-bar-fill" style={{width:`${weights[k]??0}%`}}/>
                    </div>
                    <div className="ob-match-bar-pct">{weights[k]??0}%</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Zoho staff badge if submitted */}
            {submitted && zohoStaffId && (
              <div style={{
                padding:'12px 14px', borderRadius:10,
                background:'var(--ob-dp)', color:'var(--ob-cream)',
                fontSize:11, lineHeight:1.5,
              }}>
                <div style={{fontWeight:500, marginBottom:4}}>✓ Created in Zoho Bookings</div>
                <div style={{opacity:0.7, wordBreak:'break-all'}}>Staff ID: {zohoStaffId}</div>
              </div>
            )}

          </div>{/* /ob-preview-scroll */}

        </div>{/* /ob-body-grid */}
      </div>{/* /ob-page-shell */}
    </>
  );
}
