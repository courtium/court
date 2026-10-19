// React types are unavailable in this project; suppress TypeScript declaration and JSX errors.
// @ts-nocheck
// @ts-ignore
import React, { createContext, useContext, useEffect, useRef, useState } from "react"
import courtiumLogo from "./assets/Courtium-logo.png"
import courtiumLogoLabel from "./assets/Courtium-logo-label.png"
import stateIcon from "./assets/State_Icon.svg"
import nigeriaLocations from "./data/nigeria-locations.json"

// ── Shared tokens ─────────────────────────────────────────────────────────

const T = {
  teal: "#2D7D7A",
  tealDark: "#1F5F5C",
  cream: "#EDE8DF",
  backdrop: "#6B8A92",
  headingDark: "#1A3C40",
  bodyMuted: "#4A6B6F",
  border: "#C8D8DA",
  shieldBg: "#FFF8E1",
  shieldStroke: "#B8860B",
}

const APP_BACKGROUND =
  "radial-gradient(ellipse at 24% 12%, rgba(45,125,122,0.18), transparent 45%), radial-gradient(ellipse at 76% 88%, rgba(45,125,122,0.12), transparent 40%), linear-gradient(135deg, #E8F4F3 0%, #D9E9E7 50%, #CDE4E2 100%)"
const SUCCESS_DIALOG_BACKGROUND =
  "radial-gradient(ellipse at 100% 0%, rgba(45,125,122,0.16), transparent 42%), radial-gradient(ellipse at 0% 100%, rgba(237,232,223,0.72), transparent 46%), linear-gradient(145deg, #FFFFFF 0%, #F1FAF8 58%, #E4F2EF 100%)"
const NOTICE_DIALOG_BACKGROUND =
  "radial-gradient(ellipse at 100% 0%, rgba(184,134,11,0.12), transparent 42%), radial-gradient(ellipse at 0% 100%, rgba(45,125,122,0.12), transparent 46%), linear-gradient(145deg, #FFFFFF 0%, #FBF8EF 58%, #EEF6F4 100%)"

// ── Shared types ──────────────────────────────────────────────────────────

type ProgressState = {
  firstName: string
  gender: string
  age: number | null
  selectedPlan: {
    name: string
    amount: number
  } | null
  questionnaireLocation: {
    state: string
    localGovernment: string
  }
  questionnaireOrigin: {
    state: string
    localGovernment: string
  }
  questionnaireReligion: string
  partnerReligionPreference: string
  preferredPartnerReligion: string
  preferredPartnerAgeRange: string
  questionnaireAdditionalAnswers: Record<string, string | string[]>
  questionnaireComplete: boolean
  lastSavedAt: string | null
  lockedUntil: string | null
  profilePhoto: string | null

  // questionnaire UI state persisted so resume is exact
  questionnaireCurrentQuestion: number | null
  questionnaireShowSummary: boolean
  questionnaireShowLockedModal: boolean
}

type ProgressContextValue = ProgressState & {
  setFirstName: (firstName: string) => void
  setGender: (gender: string) => void
  setAge: (age: number | null) => void
  setSelectedPlan: (plan: ProgressState["selectedPlan"]) => void
  setQuestionnaireLocation: (location: ProgressState["questionnaireLocation"]) => void
  setQuestionnaireOrigin: (location: ProgressState["questionnaireOrigin"]) => void
  setQuestionnaireReligion: (religion: string) => void
  setPartnerReligionPreference: (preference: string) => void
  setPreferredPartnerReligion: (religion: string) => void
  setPreferredPartnerAgeRange: (ageRange: string) => void
  setQuestionnaireAdditionalAnswers: (answers: Record<string, string | string[]>) => void
  setQuestionnaireComplete: (complete: boolean) => void
  setLastSavedAt: (iso: string | null) => void
  setLockedUntil: (iso: string | null) => void
  setProfilePhoto: (dataUrl: string | null) => void

  setQuestionnaireCurrentQuestion: (n: number | null) => void
  setQuestionnaireShowSummary: (v: boolean) => void
  setQuestionnaireShowLockedModal: (v: boolean) => void
}

const EMPTY_PROGRESS: ProgressState = {
  firstName: "",
  gender: "",
  age: null,
  selectedPlan: null,
  questionnaireLocation: { state: "", localGovernment: "" },
  questionnaireOrigin: { state: "", localGovernment: "" },
  questionnaireReligion: "",
  partnerReligionPreference: "",
  preferredPartnerReligion: "",
  preferredPartnerAgeRange: "",
  questionnaireAdditionalAnswers: {},
  questionnaireComplete: false,
  lastSavedAt: null,
  lockedUntil: null,
  profilePhoto: null,

  questionnaireCurrentQuestion: null,
  questionnaireShowSummary: false,
  questionnaireShowLockedModal: false,
}

const PROGRESS_STORAGE_KEY = "courtium-progress"
const CREDENTIALS_STORAGE_KEY = "courtium-credentials"
const RESUME_STORAGE_KEY = "courtium-resume"

const ProgressContext = createContext<ProgressContextValue | null>(null)

function readStoredProgress(): ProgressState {
  try {
    const stored = sessionStorage.getItem(PROGRESS_STORAGE_KEY)
    if (!stored) return EMPTY_PROGRESS

    const parsed = JSON.parse(stored)
    return {
      firstName: typeof parsed.firstName === "string" ? parsed.firstName : "",
      gender: typeof parsed.gender === "string" ? parsed.gender : "",
      age: typeof parsed.age === "number" ? parsed.age : null,
      selectedPlan:
        parsed.selectedPlan &&
        typeof parsed.selectedPlan.name === "string" &&
        typeof parsed.selectedPlan.amount === "number"
          ? parsed.selectedPlan
          : null,
      questionnaireLocation:
        parsed.questionnaireLocation &&
        typeof parsed.questionnaireLocation.state === "string" &&
        typeof parsed.questionnaireLocation.localGovernment === "string"
          ? parsed.questionnaireLocation
          : { state: "", localGovernment: "" },
      questionnaireOrigin:
        parsed.questionnaireOrigin &&
        typeof parsed.questionnaireOrigin.state === "string" &&
        typeof parsed.questionnaireOrigin.localGovernment === "string"
          ? parsed.questionnaireOrigin
          : { state: "", localGovernment: "" },
      questionnaireReligion:
        typeof parsed.questionnaireReligion === "string"
          ? parsed.questionnaireReligion
          : "",
      partnerReligionPreference:
        typeof parsed.partnerReligionPreference === "string"
          ? parsed.partnerReligionPreference
          : "",
      preferredPartnerReligion:
        typeof parsed.preferredPartnerReligion === "string"
          ? parsed.preferredPartnerReligion
          : "",
      preferredPartnerAgeRange:
        typeof parsed.preferredPartnerAgeRange === "string"
          ? parsed.preferredPartnerAgeRange
          : "",
      questionnaireAdditionalAnswers:
        parsed.questionnaireAdditionalAnswers &&
        typeof parsed.questionnaireAdditionalAnswers === "object" &&
        !Array.isArray(parsed.questionnaireAdditionalAnswers)
          ? parsed.questionnaireAdditionalAnswers
          : {},
      questionnaireComplete: parsed.questionnaireComplete === true,
      lastSavedAt: typeof parsed.lastSavedAt === "string" ? parsed.lastSavedAt : null,
      lockedUntil: typeof parsed.lockedUntil === "string" ? parsed.lockedUntil : null,
      profilePhoto: typeof parsed.profilePhoto === "string" ? parsed.profilePhoto : null,

      questionnaireCurrentQuestion:
        typeof parsed.questionnaireCurrentQuestion === "number"
          ? parsed.questionnaireCurrentQuestion
          : null,
      questionnaireShowSummary: parsed.questionnaireShowSummary === true,
      questionnaireShowLockedModal: parsed.questionnaireShowLockedModal === true,
    }
  } catch {
    return EMPTY_PROGRESS
  }
}

function ProgressProvider({ children }: { children: React.ReactNode }) {
  const [progress, setProgress] = useState<ProgressState>(readStoredProgress)

  useEffect(() => {
    try {
      sessionStorage.setItem(PROGRESS_STORAGE_KEY, JSON.stringify(progress))
    } catch {
      // Session storage is optional; the in-memory context remains usable.
    }
  }, [progress])

  const value: ProgressContextValue = {
    ...progress,
    setFirstName: (firstName) => setProgress((current) => ({ ...current, firstName })),
    setGender: (gender) => setProgress((current) => ({ ...current, gender })),
    setAge: (age) => setProgress((current) => ({ ...current, age })),
    setSelectedPlan: (selectedPlan) =>
      setProgress((current) => ({ ...current, selectedPlan })),
    setQuestionnaireLocation: (questionnaireLocation) =>
      setProgress((current) => ({ ...current, questionnaireLocation })),
    setQuestionnaireOrigin: (questionnaireOrigin) =>
      setProgress((current) => ({ ...current, questionnaireOrigin })),
    setQuestionnaireReligion: (questionnaireReligion) =>
      setProgress((current) => ({ ...current, questionnaireReligion })),
    setPartnerReligionPreference: (partnerReligionPreference) =>
      setProgress((current) => ({ ...current, partnerReligionPreference })),
    setPreferredPartnerReligion: (preferredPartnerReligion) =>
      setProgress((current) => ({ ...current, preferredPartnerReligion })),
    setPreferredPartnerAgeRange: (preferredPartnerAgeRange) =>
      setProgress((current) => ({ ...current, preferredPartnerAgeRange })),
    setQuestionnaireAdditionalAnswers: (questionnaireAdditionalAnswers) =>
      setProgress((current) => ({
        ...current,
        questionnaireAdditionalAnswers,
      })),
    setQuestionnaireComplete: (questionnaireComplete) =>
      setProgress((current) => ({ ...current, questionnaireComplete })),
    setLastSavedAt: (lastSavedAt) =>
      setProgress((current) => ({ ...current, lastSavedAt })),
    setLockedUntil: (lockedUntil) =>
      setProgress((current) => ({ ...current, lockedUntil })),
    setProfilePhoto: (profilePhoto) =>
      setProgress((current) => ({ ...current, profilePhoto })),
    setQuestionnaireCurrentQuestion: (questionnaireCurrentQuestion) =>
      setProgress((current) => ({ ...current, questionnaireCurrentQuestion })),
    setQuestionnaireShowSummary: (questionnaireShowSummary) =>
      setProgress((current) => ({ ...current, questionnaireShowSummary })),
    setQuestionnaireShowLockedModal: (questionnaireShowLockedModal) =>
      setProgress((current) => ({ ...current, questionnaireShowLockedModal })),
  }

  return <ProgressContext.Provider value={value}>{children}</ProgressContext.Provider>
}

function useProgress() {
  const context = useContext(ProgressContext)
  if (!context) {
    throw new Error("useProgress must be used within ProgressProvider")
  }
  return context
}

function formatNaira(amount: number) {
  return `₦${new Intl.NumberFormat("en-NG").format(amount)}`
}

function getPlanAmount(price: string) {
  const amount = Number(price.replace(/[^\d]/g, ""))
  if (!Number.isFinite(amount)) {
    throw new Error(`Invalid membership plan price: ${price}`)
  }
  return amount
}

function getAge(dob: string): number | null {
  const parts = dob.includes("-") ? dob.split("-") : dob.split("/")
  if (parts.length !== 3) return null

  const [dd, mm, yyyy] =
    dob.includes("-")
      ? [parts[2], parts[1], parts[0]].map((part) => parseInt(part, 10))
      : parts.map((part) => parseInt(part.trim(), 10))

  if ([dd, mm, yyyy].some(Number.isNaN) || yyyy < 1900) return null
  const birth = new Date(yyyy, mm - 1, dd)
  if (
    birth.getFullYear() !== yyyy ||
    birth.getMonth() !== mm - 1 ||
    birth.getDate() !== dd
  ) {
    return null
  }
  const today = new Date()
  let age = today.getFullYear() - birth.getFullYear()
  const beforeBirthday =
    today.getMonth() < birth.getMonth() ||
    (today.getMonth() === birth.getMonth() && today.getDate() < birth.getDate())
  if (beforeBirthday) age--
  return age
}

// ── Shared icons ──────────────────────────────────────────────────────────

function LogoIcon({ className = "w-8 h-8" }: { className?: string }) {
  return <img src={courtiumLogo} className={className} alt="" aria-hidden="true" />
}

function LogoLabel({ className = "h-auto w-32" }: { className?: string }) {
  return <img src={courtiumLogoLabel} className={className} alt="Courtium" />
}

function ShieldCheckIcon({ color = T.shieldStroke }: { color?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="w-8 h-8">
      <path
        d="M12 2L4 6v6c0 5.25 3.5 10.15 8 11.35C16.5 22.15 20 17.25 20 12V6l-8-4z"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M9 12l2 2 4-4"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

// ── Layout shell shared by onboarding forms ───────────────────────────────

function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="relative isolate flex min-h-dvh flex-col"
      style={{ background: APP_BACKGROUND }}
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10 overflow-hidden"
      >
        <div className="absolute -right-32 -top-40 h-[35rem] w-[35rem] rounded-full bg-white/40 blur-3xl" />
        <div className="absolute -bottom-32 -left-28 h-[32rem] w-[32rem] rounded-full bg-[#2D7D7A]/8 blur-3xl" />
      </div>
      <header className="sticky top-0 z-30 flex shrink-0 items-center justify-between border-b border-[#2D7D7A]/10 bg-[#E8F4F3]/95 px-4 pb-3 pt-[max(0.75rem,env(safe-area-inset-top))] shadow-sm backdrop-blur-md sm:px-6 sm:py-4">
        <div className="flex items-center gap-3" style={{ color: "white" }}>
          <LogoIcon className="h-8 w-8 sm:h-9 sm:w-9" />
          <LogoLabel className="h-auto w-[104px] sm:w-32" />
        </div>
      </header>
      <div className="flex-1 flex items-center justify-center px-3 pb-[max(1rem,env(safe-area-inset-bottom))] pt-4 sm:px-4 sm:py-8">
        {children}
      </div>
    </div>
  )
}

// ── Screen 1: Splash ──────────────────────────────────────────────────────

function SplashScreen({
  onGetStarted,
  onSignIn,
}: {
  onGetStarted: () => void
  onSignIn: () => void
}) {
  return (
    <div
      className="relative isolate flex min-h-dvh flex-col items-center justify-center overflow-hidden px-5 pb-[max(1.5rem,env(safe-area-inset-bottom))] pt-[max(1.5rem,env(safe-area-inset-top))] sm:min-h-screen sm:px-6 sm:py-0"
      style={{
        background: APP_BACKGROUND,
      }}
    >
      <div
        aria-hidden="true"
        className="splash-glow-one pointer-events-none absolute -right-28 -top-32 -z-10 h-[28rem] w-[28rem] rounded-full bg-[#2D7D7A]/10 blur-3xl sm:right-[4%] sm:top-[-15rem] sm:h-[36rem] sm:w-[36rem]"
      />
      <div
        aria-hidden="true"
        className="splash-glow-two pointer-events-none absolute -bottom-40 -left-32 -z-10 h-[30rem] w-[30rem] rounded-full bg-white/70 blur-3xl sm:bottom-[-18rem] sm:left-[5%] sm:h-[38rem] sm:w-[38rem]"
      />
      <svg
        aria-hidden="true"
        className="splash-relationship-art pointer-events-none absolute -right-20 top-[8%] -z-10 h-[min(70vw,34rem)] w-[min(70vw,34rem)] text-[#2D7D7A] opacity-[0.13] sm:right-[8%] sm:top-[4%]"
        viewBox="0 0 520 520"
        fill="none"
      >
        <circle cx="206" cy="258" r="138" stroke="currentColor" strokeWidth="1.5" />
        <circle cx="314" cy="258" r="138" stroke="currentColor" strokeWidth="1.5" />
        <path
          className="splash-heartbeat"
          d="M260 353c-7-6-79-61-79-112 0-27 20-46 45-46 16 0 28 8 34 21 7-13 19-21 35-21 25 0 45 19 45 46 0 51-72 106-80 112Z"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinejoin="round"
        />
      </svg>
      <div
        aria-hidden="true"
        className="pointer-events-none absolute bottom-[13%] left-[12%] -z-10 hidden h-3 w-3 rounded-full bg-[#2D7D7A]/30 sm:block"
      />
      <div className="splash-content relative z-10 flex w-full max-w-sm flex-col items-center gap-6">
        <div className="splash-logo-mark splash-logo mb-2" style={{ color: T.teal }}>
          <LogoIcon className="h-[100px] w-[100px]" />
        </div>
        <LogoLabel className="splash-wordmark h-auto w-[229px]" />
        <p className="text-xl font-semibold text-center" style={{ color: T.teal }}>
          Real Dates, Real Values, No Noise.
        </p>
        <div className="flex flex-col gap-3 w-full mt-6">
          <button
            onClick={onGetStarted}
            className="w-full py-4 rounded-xl text-base font-semibold transition-all duration-200 cursor-pointer hover:-translate-y-px"
            style={{ backgroundColor: T.teal, color: T.cream }}
          >
            Get Started
          </button>
          <button
            onClick={onSignIn}
            className="w-full py-4 rounded-xl text-base font-semibold transition-all duration-200 cursor-pointer hover:-translate-y-px"
            style={{
              backgroundColor: "transparent",
              color: T.teal,
              border: `2px solid ${T.teal}`,
            }}
          >
            Sign In
          </button>
        </div>
      </div>
    </div>
  )
}

// ── Check Fit form ────────────────────────────────────────────────────────

const inputBase: React.CSSProperties = {
  width: "100%",
  padding: "12px 14px",
  borderRadius: "10px",
  borderWidth: "1.5px",
  borderStyle: "solid",
  borderColor: T.border,
  outline: "none",
  fontSize: "14px",
  color: T.headingDark,
  backgroundColor: "white",
  fontFamily: "inherit",
}

function FieldLabel({ children }: { children: React.ReactNode }) {
  return (
    <label
      className="block text-sm font-semibold mb-1.5"
      style={{ color: T.headingDark }}
    >
      {children}
    </label>
  )
}

type AgeError = "too_young" | null

function AgeModal({ type, onExit }: { type: AgeError; onExit: () => void }) {
  if (!type) return null
  const message = "You need to be at least 25 years to register."

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center px-4"
      style={{ backgroundColor: "rgba(0,0,0,0.45)" }}
    >
      <div
        className="relative flex w-full max-w-sm flex-col items-center gap-5 overflow-hidden rounded-[24px] border border-[#2D7D7A]/20 p-6 text-center shadow-[0_24px_70px_rgba(20,70,74,0.22)] sm:gap-6 sm:p-8"
        style={{ background: NOTICE_DIALOG_BACKGROUND }}
      >
        <svg
          viewBox="0 0 48 48"
          className="animate-modal-icon h-12 w-12 shrink-0 text-[#B8860B] sm:h-14 sm:w-14"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <path d="M24 4 8 11v11c0 10 6.6 17.6 16 22 9.4-4.4 16-12 16-22V11L24 4Z" />
          <path d="M24 15v10" />
          <circle cx="24" cy="32" r="1.4" fill="currentColor" stroke="none" />
        </svg>

        <p
          className="max-w-[28ch] break-words text-balance text-center text-[15px] font-semibold leading-relaxed sm:text-base"
          style={{ color: T.headingDark }}
        >
          {message}
        </p>

        <button
          onClick={onExit}
          className="w-full py-3.5 rounded-xl text-sm font-semibold cursor-pointer transition-colors"
          style={{ backgroundColor: T.teal, color: "white" }}
          onMouseEnter={(e) =>
            (e.currentTarget.style.backgroundColor = T.tealDark)
          }
          onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = T.teal)}
        >
          Exit
        </button>
      </div>
    </div>
  )
}

function CheckFitScreen({
  onBack,
  onProceed,
}: {
  onBack: () => void
  onProceed: () => void
}) {
  const { setFirstName, setGender, setAge } = useProgress()
  const [form, setForm] = useState({
    firstName: "",
    surname: "",
    gender: "",
    dob: "",
  })
  const [focused, setFocused] = useState<string | null>(null)
  const [ageError, setAgeError] = useState<AgeError>(null)
  const [showNinConfirmation, setShowNinConfirmation] = useState(false)
  const [touched, setTouched] =
    useState<Partial<Record<keyof typeof form, boolean>>>({})
  const [submitAttempted, setSubmitAttempted] = useState(false)

  const errors: Partial<Record<keyof typeof form, string>> = {
    firstName: form.firstName.trim() ? undefined : "First name is required",
    surname: form.surname.trim() ? undefined : "Surname is required",
    gender: form.gender ? undefined : "Gender is required",
    dob: form.dob.trim() ? undefined : "Date of birth is required",
  }

  const showError = (k: keyof typeof form) =>
    !!(errors[k] && (touched[k] || submitAttempted))

  const fieldStyle = (name: keyof typeof form): React.CSSProperties => {
    if (showError(name))
      return {
        ...inputBase,
        borderColor: "#DC2626",
        boxShadow: "0 0 0 3px #DC262622",
      }
    if (focused === name)
      return {
        ...inputBase,
        borderColor: T.teal,
        boxShadow: `0 0 0 3px ${T.teal}22`,
      }
    return inputBase
  }

  const set =
    (k: keyof typeof form) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
      setForm((f) => ({ ...f, [k]: e.target.value }))
      if (k === "firstName") setFirstName(e.target.value)
      if (k === "gender") setGender(e.target.value)
    }

  const blur = (k: keyof typeof form) => {
    setFocused(null)
    setTouched((t) => ({ ...t, [k]: true }))
  }

  const handleDobBlur = () => {
    blur("dob")
    const age = getAge(form.dob)
    if (age === null) return
    if (age < 25) setAgeError("too_young")
  }

  const handleProceed = () => {
    setSubmitAttempted(true)
    const hasErrors = Object.values(errors).some(Boolean)
    if (hasErrors || !form.dob.trim()) return

    const age = getAge(form.dob)
    if (age === null) return
    if (age < 25) {
      setAgeError("too_young")
      return
    }

    setAge(age)
    setShowNinConfirmation(true)
  }

  return (
    <AppShell>
      <AgeModal type={ageError} onExit={() => setAgeError(null)} />

      {showNinConfirmation && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 px-4 py-6">
          <section
            className="flex w-full max-w-[420px] flex-col items-center rounded-[24px] border border-[#2D7D7A]/20 px-6 py-8 text-center shadow-[0_24px_70px_rgba(20,70,74,0.22)] sm:px-12 sm:py-11"
            style={{ background: NOTICE_DIALOG_BACKGROUND }}
            role="dialog"
            aria-modal="true"
            aria-labelledby="nin-confirmation-title"
          >
            <svg
              viewBox="0 0 48 48"
              className="animate-modal-icon h-14 w-14 shrink-0 text-[#B8860B] sm:h-16 sm:w-16"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M24 4 8 11v11c0 10 6.6 17.6 16 22 9.4-4.4 16-12 16-22V11L24 4Z" />
              <path d="M19 20a5 5 0 0 1 10 0c0 3-5 4-5 8" />
              <circle cx="24" cy="34" r="1.2" fill="currentColor" stroke="none" />
            </svg>
            <h3
              id="nin-confirmation-title"
              className="mt-7 max-w-[30ch] break-words text-balance text-[17px] font-bold leading-[1.35] text-[#183d4d] sm:mt-11 sm:text-[18px]"
            >
              Are you sure all your details are the same as those on your NIN?
            </h3>
            <div className="mt-8 flex w-full max-w-[274px] gap-3 sm:mt-11 sm:gap-8">
              <button
                type="button"
                onClick={() => {
                  setShowNinConfirmation(false)
                  onBack()
                }}
                className="h-[30px] flex-1 rounded-[8px] border border-[#147b86] text-[13px] font-bold text-[#147b86] hover:bg-[#eefafa]"
              >
                NO
              </button>

              <button
                type="button"
                onClick={() => {
                  const age = getAge(form.dob)
                  if (age === null) {
                    setShowNinConfirmation(false)
                    return
                  }
                  if (age < 25) {
                    setAgeError("too_young")
                    setShowNinConfirmation(false)
                    return
                  }
                  setAge(age)
                  setShowNinConfirmation(false)
                  onProceed()
                }}
                className="h-[30px] flex-1 rounded-[8px] bg-[#20777b] text-[13px] font-bold text-white hover:bg-[#1a666a]"
              >
                YES
              </button>
            </div>
          </section>
        </div>
      )}

      <div
        className="signup-card relative isolate max-h-[calc(100dvh-7rem)] w-full max-w-lg overflow-y-auto overflow-x-hidden overscroll-contain rounded-[26px] border border-[#2D7D7A]/45 p-5 sm:max-h-none sm:overflow-visible sm:rounded-[30px] sm:p-8"
        style={{
          background:
            "radial-gradient(ellipse at 100% 0%, rgba(45,125,122,0.12), transparent 38%), linear-gradient(145deg, rgba(255,255,255,0.99), rgba(247,251,249,0.98) 65%, rgba(237,244,239,0.98))",
          boxShadow:
            "0 0 0 2px rgba(45,125,122,0.16), 0 0 22px 5px rgba(45,125,122,0.3), 0 20px 48px rgba(31,95,92,0.18)",
        }}
      >
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -right-16 -top-20 -z-10 h-48 w-48 rounded-full bg-[#2D7D7A]/10 blur-3xl"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -bottom-20 -left-16 -z-10 h-44 w-44 rounded-full bg-[#EDE8DF]/75 blur-3xl"
        />
        <div className="relative z-10">
          <div className="mb-4 flex justify-center sm:mb-5">
            <div className="animate-modal-icon flex h-[68px] w-[68px] items-center justify-center rounded-[22px] border border-[#2D7D7A]/15 bg-white/85 text-[#2D7D7A] shadow-[0_10px_24px_rgba(45,125,122,0.12)] sm:h-[76px] sm:w-[76px]">
              <ShieldCheckIcon />
            </div>
          </div>

          <div className="mb-2 flex justify-center">
            <span className="rounded-full border border-[#2D7D7A]/15 bg-[#2D7D7A]/[0.07] px-3 py-1 text-[10px] font-bold uppercase tracking-[0.16em] text-[#2D7D7A]">
              Secure identity check
            </span>
          </div>

          <h2
            className="mx-auto max-w-[30ch] text-balance text-center text-[21px] font-bold leading-[1.2] tracking-[-0.035em] sm:text-[25px]"
            style={{ color: T.headingDark }}
          >
            Please input your details exactly as they appear on your NIN
          </h2>

          <p className="mx-auto mb-6 mt-2 max-w-[42ch] text-balance text-center text-[13px] leading-relaxed text-[#4A6B6F] sm:mb-7 sm:text-sm">
            Your details should match your National Identification Number (NIN).
          </p>

          <div className="flex flex-col gap-4">
            <div>
              <FieldLabel>
                First Name <span style={{ color: "#DC2626" }}>*</span>
              </FieldLabel>
              <input
                type="text"
                value={form.firstName}
                onChange={set("firstName")}
                onFocus={() => setFocused("firstName")}
                onBlur={() => blur("firstName")}
                style={fieldStyle("firstName")}
              />
              {showError("firstName") && (
                <p className="text-xs mt-1 px-1" style={{ color: "#DC2626" }}>
                  {errors.firstName}
                </p>
              )}
            </div>

            <div>
              <FieldLabel>
                Surname <span style={{ color: "#DC2626" }}>*</span>
              </FieldLabel>
              <input
                type="text"
                value={form.surname}
                onChange={set("surname")}
                onFocus={() => setFocused("surname")}
                onBlur={() => blur("surname")}
                style={fieldStyle("surname")}
              />
              {showError("surname") && (
                <p className="text-xs mt-1 px-1" style={{ color: "#DC2626" }}>
                  {errors.surname}
                </p>
              )}
            </div>

            <div>
              <FieldLabel>
                Gender <span style={{ color: "#DC2626" }}>*</span>
              </FieldLabel>
              <div className="relative">
                <select
                  value={form.gender}
                  onChange={set("gender")}
                  onFocus={() => setFocused("gender")}
                  onBlur={() => blur("gender")}
                  style={{
                    ...fieldStyle("gender"),
                    appearance: "none",
                    paddingRight: "36px",
                    color: form.gender ? T.headingDark : T.bodyMuted,
                  }}
                >
                  <option value="" disabled>
                    Select gender
                  </option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                </select>
                <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2">
                  <svg
                    viewBox="0 0 24 24"
                    className="w-4 h-4"
                    fill="none"
                    stroke={T.bodyMuted}
                    strokeWidth="2"
                  >
                    <polyline
                      points="6 9 12 15 18 9"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>
              </div>
              {showError("gender") && (
                <p className="text-xs mt-1 px-1" style={{ color: "#DC2626" }}>
                  {errors.gender}
                </p>
              )}
            </div>

            <div>
              <FieldLabel>
                Date of Birth <span style={{ color: "#DC2626" }}>*</span>
              </FieldLabel>
              <input
                type="date"
                value={form.dob}
                onChange={set("dob")}
                onFocus={() => setFocused("dob")}
                onBlur={handleDobBlur}
                style={fieldStyle("dob")}
              />
              {showError("dob") && (
                <p className="text-xs mt-1 px-1" style={{ color: "#DC2626" }}>
                  {errors.dob}
                </p>
              )}
            </div>
          </div>

          <div className="-mx-5 -mb-5 sticky bottom-0 z-20 mt-7 flex gap-3 border-t border-[#2D7D7A]/10 bg-[#F7FBF9]/95 px-5 pb-[max(1.25rem,env(safe-area-inset-bottom))] pt-3 backdrop-blur-md sm:static sm:mx-0 sm:mb-0 sm:mt-8 sm:gap-4 sm:border-0 sm:bg-transparent sm:px-0 sm:pb-0 sm:pt-0 sm:backdrop-blur-none">
            <button
              onClick={onBack}
              className="min-h-12 flex-1 rounded-xl text-sm font-semibold cursor-pointer transition-colors hover:bg-teal-50"
              style={{
                backgroundColor: "white",
                color: T.teal,
                border: `2px solid ${T.teal}`,
              }}
            >
              Back
            </button>
            <button
              onClick={handleProceed}
              className="min-h-12 flex-1 rounded-xl text-sm font-bold text-white shadow-[0_10px_22px_rgba(45,125,122,0.2)] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_14px_28px_rgba(45,125,122,0.28)]"
              style={{ backgroundColor: T.teal }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.backgroundColor = T.tealDark)
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.backgroundColor = T.teal)
              }
            >
              Proceed
            </button>
          </div>
        </div>
      </div>
    </AppShell>
  )
}

// ── Screen 4: Community Questions ────────────────────────────────────────

interface RadioOptionProps {
  label: string
  selected: boolean
  onSelect: () => void
}

function RadioOption({ label, selected, onSelect }: RadioOptionProps) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className="flex items-center gap-3 w-full px-4 py-3.5 rounded-xl text-sm text-left cursor-pointer transition-all duration-150"
      style={{
        borderWidth: "1.5px",
        borderStyle: "solid",
        borderColor: selected ? T.teal : T.border,
        backgroundColor: selected ? `${T.teal}0d` : "white",
        color: T.headingDark,
      }}
    >
      <span
        className="flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center transition-all duration-150"
        style={{
          borderWidth: "1.5px",
          borderStyle: "solid",
          borderColor: selected ? T.teal : "#B0C4C6",
          backgroundColor: "transparent",
        }}
      >
        {selected && (
          <span
            className="w-2.5 h-2.5 rounded-full"
            style={{ backgroundColor: T.teal }}
          />
        )}
      </span>
      {label}
    </button>
  )
}

interface Question {
  id: string
  text: string
  options: string[]
}

const COMMUNITY_QUESTIONS: Question[] = [
  {
    id: "readiness",
    text: "How ready are you to settle down?",
    options: ["Very Ready", "Somewhat Ready", "Not Ready"],
  },
  {
    id: "timeline",
    text: "With the right person, how soon are you looking to settle down?",
    options: ["6 months", "1 year +", "Over 2 years"],
  },
]

function CommunityQuestionsScreen({
  onBack,
  onFit,
  onIneligible,
}: {
  onBack: () => void
  onFit: () => void
  onIneligible: () => void
}) {
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [submitAttempted, setSubmitAttempted] = useState(false)
  const [resultModal, setResultModal] = useState<null | "fit" | "ineligible">(
    null,
  )

  const allAnswered = COMMUNITY_QUESTIONS.every((q) => answers[q.id])

  const isOptionC = (qId: string) =>
    answers[qId] === COMMUNITY_QUESTIONS.find((q) => q.id === qId)?.options[2]

  const handleContinue = () => {
    setSubmitAttempted(true)
    if (!allAnswered) return
    const anyC = COMMUNITY_QUESTIONS.some((q) => isOptionC(q.id))
    setResultModal(anyC ? "ineligible" : "fit")
  }

  return (
    <AppShell>
      {resultModal === "fit" && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center px-4"
          style={{ backgroundColor: "rgba(0,0,0,0.45)" }}
        >
          <div
            className="w-full max-w-[560px] mx-auto rounded-[20px] border border-[#2D7D7A]/20 bg-white p-5 shadow-[0_24px_70px_rgba(20,70,74,0.22)] sm:p-8"
            style={{ background: SUCCESS_DIALOG_BACKGROUND }}
            role="dialog"
            aria-modal="true"
            aria-labelledby="fit-modal-title"
          >
            <div className="flex flex-col items-center text-center gap-4">
              <div className="mb-1 flex h-14 w-14 items-center justify-center rounded-lg bg-white/80 text-[#2D7D7A] sm:h-16 sm:w-16">
                <svg viewBox="0 0 64 72" className="h-10 w-10 sm:h-14 sm:w-14" fill="none" aria-hidden="true">
                  <path d="M32 3 5 13v19c0 18 11 29 27 37 16-8 27-19 27-37V13L32 3Z" stroke="currentColor" strokeWidth="2.6" strokeLinejoin="round" />
                  <path d="m20 35 8 8 17-18" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>

              <h3
                id="fit-modal-title"
                className="mx-auto max-w-[42ch] text-[20px] sm:text-[22px] font-bold leading-snug text-[#183d4d]"
                style={{ lineHeight: 1.18 }}
              >
                Welcome to Courtium, let’s create your account
              </h3>

              <p className="mx-auto max-w-[48ch] text-sm text-[#4A6B6F]">
                Courtium is a paid elite match-making community, are you happy to proceed?
              </p>

              <div className="mt-3 w-full flex flex-col gap-3 sm:flex-row sm:justify-center">
                <button
                  type="button"
                  onClick={() => { setResultModal(null); onIneligible(); }}
                  className="h-11 w-full rounded-[10px] border-2 border-[#147b86] px-4 text-sm font-bold text-[#147b86] hover:bg-[#eefafa] sm:w-[150px]"
                >
                  No
                </button>

                <button
                  type="button"
                  onClick={() => { setResultModal(null); onFit(); }}
                  className="h-11 w-full rounded-[10px] bg-[#20777b] px-4 text-sm font-bold text-white hover:bg-[#1a666a] sm:w-[170px]"
                >
                  Yes
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {resultModal === "ineligible" && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center px-4"
          style={{ backgroundColor: "rgba(0,0,0,0.45)" }}
        >
          <div
            className="flex w-full max-w-sm flex-col items-center gap-5 rounded-[24px] border border-[#B8860B]/20 p-6 text-center shadow-[0_24px_70px_rgba(70,56,20,0.2)] sm:gap-6 sm:p-8"
            style={{ background: NOTICE_DIALOG_BACKGROUND }}
          >
            <svg
              viewBox="0 0 48 48"
              className="animate-modal-icon h-12 w-12 shrink-0 text-[#B8860B] sm:h-14 sm:w-14"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M24 5 4.5 40h39L24 5Z" />
              <path d="M24 17v10" />
              <circle cx="24" cy="33" r="1.3" fill="currentColor" stroke="none" />
            </svg>
            <div className="text-center">
              <h3
                className="mb-2 break-words text-balance text-lg font-bold leading-tight"
                style={{ color: T.headingDark }}
              >
                Not eligible at this time
              </h3>
              <p
                className="mx-auto max-w-[34ch] break-words text-balance text-sm leading-relaxed"
                style={{ color: T.bodyMuted }}
              >
                Based on some of your answers, you are ineligible to join
                Courtium at the moment, please try again in 6 months' time.
              </p>
            </div>
            <button
              onClick={() => { setResultModal(null); onIneligible() }}
              className="w-full py-3.5 rounded-xl text-sm font-semibold cursor-pointer transition-colors"
              style={{ backgroundColor: T.teal, color: "white" }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.backgroundColor = T.tealDark)
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.backgroundColor = T.teal)
              }
            >
              Exit
            </button>
          </div>
        </div>
      )}

      <div
        className="signup-card relative isolate w-full max-w-2xl overflow-hidden rounded-[26px] border border-white/80 p-5 shadow-[0_24px_70px_rgba(31,95,92,0.2)] sm:rounded-[30px] sm:p-8"
        style={{
          background:
            "radial-gradient(ellipse at 100% 0%, rgba(45,125,122,0.12), transparent 38%), linear-gradient(145deg, rgba(255,255,255,0.98), rgba(247,251,249,0.98) 65%, rgba(237,244,239,0.98))",
        }}
      >
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -right-16 -top-20 -z-10 h-52 w-52 rounded-full bg-[#2D7D7A]/10 blur-3xl"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -bottom-20 -left-16 -z-10 h-48 w-48 rounded-full bg-[#EDE8DF]/70 blur-3xl"
        />
        <div className="relative z-10">
          <div className="flex flex-col items-center px-1 pb-5 pt-1 sm:px-3 sm:pb-6 sm:pt-2">
            <div className="animate-modal-icon mb-4 flex h-[68px] w-[68px] items-center justify-center rounded-[22px] border border-[#2D7D7A]/15 bg-white/85 text-[#2D7D7A] shadow-[0_10px_24px_rgba(45,125,122,0.12)] sm:mb-5 sm:h-[76px] sm:w-[76px]">
              <ShieldCheckIcon />
            </div>
            <h2
              className="text-balance text-center text-[24px] font-bold leading-tight tracking-[-0.04em] sm:text-[29px]"
              style={{ color: T.headingDark }}
            >
              Let's know your intentions
            </h2>
            <p className="mt-2 max-w-[38ch] text-balance text-center text-[13px] leading-relaxed text-[#4A6B6F] sm:mt-3 sm:text-sm">
              Your answers help us create a more meaningful community for you.
            </p>
          </div>

          <div className="flex flex-col gap-6 px-1 pb-2 sm:gap-7 sm:px-3">
            {COMMUNITY_QUESTIONS.map((q) => (
              <div
                key={q.id}
                className="rounded-[18px] border border-[#2D7D7A]/10 bg-white/75 p-3 shadow-[0_8px_24px_rgba(31,95,92,0.05)] sm:p-5"
              >
                <h3
                  className="mb-3 text-balance text-[15px] font-bold leading-snug tracking-[-0.025em] sm:text-lg"
                  style={{ color: T.headingDark }}
                >
                  {q.text}
                </h3>
                <div className="flex flex-col gap-2">
                  {q.options.map((opt) => (
                    <RadioOption
                      key={opt}
                      label={opt}
                      selected={answers[q.id] === opt}
                      onSelect={() => setAnswers((a) => ({ ...a, [q.id]: opt }))}
                    />
                  ))}
                </div>
                {submitAttempted && !answers[q.id] && (
                  <p className="text-xs mt-1.5 px-1" style={{ color: "#DC2626" }}>
                    Please select an option to continue.
                  </p>
                )}
              </div>
            ))}
          </div>

          <div className="mt-4 flex gap-3 border-t border-[#2D7D7A]/10 bg-white/65 px-1 py-4 sm:gap-4 sm:px-3 sm:py-5">
            <button
              onClick={onBack}
              className="min-h-12 flex-1 rounded-xl text-sm font-semibold cursor-pointer transition-colors hover:bg-teal-50"
              style={{
                backgroundColor: "white",
                color: T.teal,
                border: `2px solid ${T.teal}`,
              }}
            >
              Back
            </button>
            <button
              onClick={handleContinue}
              className="min-h-12 flex-1 rounded-xl text-sm font-bold text-white shadow-[0_10px_22px_rgba(45,125,122,0.2)] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_14px_28px_rgba(45,125,122,0.28)]"
              style={{ backgroundColor: T.teal }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.backgroundColor = T.tealDark)
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.backgroundColor = T.teal)
              }
            >
              Continue
            </button>
          </div>
        </div>
      </div>
    </AppShell>
  )
}

// ── Screen 5: Sign Up ─────────────────────────────────────────────────────

function SignUpScreen({
  onShowOverlay,
  onSignIn,
}: {
  onShowOverlay?: (
    destination: "payment" | "payment-female" | "payment-27-37",
  ) => void
  onSignIn?: () => void
}) {
  const { gender, age } = useProgress()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [focused, setFocused] = useState<string | null>(null)
  const [touched, setTouched] = useState<Record<string, boolean>>({})
  const [submitAttempted, setSubmitAttempted] = useState(false)
  const [showVerificationModal, setShowVerificationModal] = useState(false)

  const emailError = !email.trim()
    ? "Email address is required"
    : !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
      ? "Enter a valid email address"
      : undefined

  const passwordError = !password
    ? "Password is required"
    : password.length < 8
      ? "Password must be at least 8 characters"
      : undefined

  const showErr = (k: string, err?: string) =>
    !!(err && (touched[k] || submitAttempted))

  const inputStyle = (name: string, hasError: boolean): React.CSSProperties => {
    if (hasError && (touched[name] || submitAttempted))
      return {
        ...inputBase,
        padding: "14px 15px",
        borderRadius: "12px",
        backgroundColor: "#FFFDFC",
        borderColor: "#DC2626",
        boxShadow: "0 0 0 3px #DC262622",
      }
    if (focused === name)
      return {
        ...inputBase,
        padding: "14px 15px",
        borderRadius: "12px",
        backgroundColor: "#FFFFFF",
        borderColor: T.teal,
        boxShadow: `0 0 0 3px ${T.teal}22`,
      }
    return {
      ...inputBase,
      padding: "14px 15px",
      borderRadius: "12px",
      backgroundColor: "#F8FBFB",
    }
  }

  const handleSubmit = () => {
    setSubmitAttempted(true)
    if (emailError || passwordError) return

    try {
      sessionStorage.setItem(CREDENTIALS_STORAGE_KEY, JSON.stringify({ email, password }))
    } catch {
      // ignore storage errors
    }

    setShowVerificationModal(true)
  }

  return (
    <AppShell>
      <div
        className="signup-card relative isolate w-full max-w-lg overflow-hidden rounded-[26px] border border-white/80 p-5 shadow-[0_24px_70px_rgba(31,95,92,0.2)] sm:rounded-[30px] sm:p-10"
        style={{
          background:
            "radial-gradient(ellipse at 100% 0%, rgba(45,125,122,0.12), transparent 38%), linear-gradient(145deg, rgba(255,255,255,0.98), rgba(247,251,249,0.98) 65%, rgba(237,244,239,0.98))",
        }}
      >
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -right-16 -top-20 -z-10 h-52 w-52 rounded-full bg-[#2D7D7A]/10 blur-3xl"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -bottom-20 -left-16 -z-10 h-48 w-48 rounded-full bg-[#EDE8DF]/70 blur-3xl"
        />

        <div className="relative z-10">
          <div className="mb-5 flex justify-center sm:mb-6">
            <div className="flex h-[68px] w-[68px] items-center justify-center rounded-[22px] border border-[#2D7D7A]/15 bg-white/80 shadow-[0_10px_24px_rgba(45,125,122,0.12)] sm:h-[76px] sm:w-[76px]">
              <img src={stateIcon} alt="" aria-hidden="true" className="h-12 w-12 sm:h-14 sm:w-14" />
            </div>
          </div>

          <div className="mb-2 flex justify-center">
            <span className="rounded-full border border-[#2D7D7A]/15 bg-[#2D7D7A]/[0.07] px-3 py-1 text-[10px] font-bold uppercase tracking-[0.16em] text-[#2D7D7A]">
              Your next chapter
            </span>
          </div>
          <h2
            className="text-balance text-center text-[25px] font-bold leading-tight tracking-[-0.04em] sm:text-[30px]"
            style={{ color: T.headingDark }}
          >
            Create your account
          </h2>
          <p className="mx-auto mb-7 mt-2 max-w-[34ch] text-balance text-center text-[13px] leading-relaxed text-[#4A6B6F] sm:mb-8 sm:mt-3 sm:text-sm">
            A more meaningful connection is just one step away. Add your email
            and create a password to get started.
          </p>

          <div className="flex flex-col gap-4 sm:gap-5">
            <div>
              <FieldLabel>
                Email address <span style={{ color: "#DC2626" }}>*</span>
              </FieldLabel>
              <input
                type="email"
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onFocus={() => setFocused("email")}
                onBlur={() => {
                  setFocused(null)
                  setTouched((t) => ({ ...t, email: true }))
                }}
                style={inputStyle("email", !!emailError)}
              />
              {showErr("email", emailError) && (
                <p className="text-xs mt-1 px-1" style={{ color: "#DC2626" }}>
                  {emailError}
                </p>
              )}
            </div>

            <div>
              <FieldLabel>
                Password <span style={{ color: "#DC2626" }}>*</span>
              </FieldLabel>
              <input
                type="password"
                placeholder="Create your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onFocus={() => setFocused("password")}
                onBlur={() => {
                  setFocused(null)
                  setTouched((t) => ({ ...t, password: true }))
                }}
                style={inputStyle("password", !!passwordError)}
              />
              {showErr("password", passwordError) && (
                <p className="text-xs mt-1 px-1" style={{ color: "#DC2626" }}>
                  {passwordError}
                </p>
              )}
            </div>
          </div>

          <button
            onClick={handleSubmit}
            className="mt-7 w-full cursor-pointer rounded-xl py-4 text-sm font-bold text-white shadow-[0_10px_22px_rgba(45,125,122,0.22)] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_14px_28px_rgba(45,125,122,0.3)] sm:mt-8"
            style={{ backgroundColor: T.teal }}
            onMouseEnter={(e) =>
              (e.currentTarget.style.backgroundColor = T.tealDark)
            }
            onMouseLeave={(e) =>
              (e.currentTarget.style.backgroundColor = T.teal)
            }
          >
            Create account
          </button>
          <p className="mt-4 flex items-center justify-center gap-2 text-center text-[11px] leading-relaxed text-[#678187]">
            <svg
              viewBox="0 0 20 20"
              className="h-4 w-4 shrink-0 text-[#2D7D7A]"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.6"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <rect x="3.5" y="8" width="13" height="9" rx="2" />
              <path d="M6.5 8V5.5a3.5 3.5 0 0 1 7 0V8" />
            </svg>
            Your details are private and secure.
          </p>
        </div>
      </div>

      {showVerificationModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4 animate-modal-backdrop"
          role="presentation"
        >
          <div
            className="w-full max-w-sm rounded-[24px] border border-[#2D7D7A]/20 p-6 text-center shadow-[0_24px_70px_rgba(20,70,74,0.22)] animate-modal-pop sm:p-8"
            style={{ background: SUCCESS_DIALOG_BACKGROUND }}
            role="dialog"
            aria-modal="true"
            aria-labelledby="verification-title"
          >
            <svg
              viewBox="0 0 48 48"
              className="animate-modal-icon mx-auto mb-4 h-12 w-12 text-[#2D7D7A] sm:h-14 sm:w-14"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <rect x="5" y="11" width="38" height="27" rx="5" />
              <path d="m7 15 17 12 17-12" />
              <path d="m30 34 4 4 8-9" />
            </svg>
            <h3
              id="verification-title"
              className="mx-auto max-w-[22ch] break-words text-balance text-xl font-bold leading-tight"
              style={{ color: T.headingDark }}
            >
              Check your mail for verification
            </h3>
            <p
              className="mx-auto mt-2 max-w-[32ch] break-words text-balance text-sm leading-relaxed"
              style={{ color: T.bodyMuted }}
            >
              We sent a verification link to your email address.
            </p>

            <button
              type="button"
              onClick={() => {
                setShowVerificationModal(false)
                onSignIn?.()
              }}
              className="mt-7 w-full rounded-xl py-3 text-sm font-semibold text-white transition-colors hover:opacity-90"
              style={{ backgroundColor: T.teal }}
            >
              OK
            </button>
          </div>
        </div>
      )}
    </AppShell>
  )
}

// ── New: Login (Sign In) screen ───────────────────────────────────────────

function LoginScreen({
  onBack,
  onProceedToOverlay,
}: {
  onBack: () => void
  onProceedToOverlay: (destination: string) => void
}) {
  const { gender, age } = useProgress()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [focused, setFocused] = useState<string | null>(null)
  const [touched, setTouched] = useState<Record<string, boolean>>({})
  const [submitAttempted, setSubmitAttempted] = useState(false)

  useEffect(() => {
    try {
      const raw = sessionStorage.getItem(CREDENTIALS_STORAGE_KEY)
      if (raw) {
        const parsed = JSON.parse(raw)
        if (parsed && typeof parsed === "object") {
          if (typeof parsed.email === "string") setEmail(parsed.email)
          if (typeof parsed.password === "string") setPassword(parsed.password)
        }
      }
    } catch {
      // ignore
    }
  }, [])

  const emailError = !email.trim()
    ? "Email address is required"
    : !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
      ? "Enter a valid email address"
      : undefined

  const passwordError = !password
    ? "Password is required"
    : password.length < 8
      ? "Password must be at least 8 characters"
      : undefined

  const showErr = (k: string, err?: string) =>
    !!(err && (touched[k] || submitAttempted))

  const inputStyle = (name: string, hasError: boolean): React.CSSProperties => {
    if (hasError && (touched[name] || submitAttempted))
      return {
        ...inputBase,
        padding: "14px 15px",
        borderRadius: "12px",
        backgroundColor: "#FFFDFC",
        borderColor: "#DC2626",
        boxShadow: "0 0 0 3px #DC262622",
      }
    if (focused === name)
      return {
        ...inputBase,
        padding: "14px 15px",
        borderRadius: "12px",
        backgroundColor: "#FFFFFF",
        borderColor: T.teal,
        boxShadow: `0 0 0 3px ${T.teal}22`,
      }
    return {
      ...inputBase,
      padding: "14px 15px",
      borderRadius: "12px",
      backgroundColor: "#F8FBFB",
    }
  }

  const handleSubmit = () => {
    setSubmitAttempted(true)
    if (emailError || passwordError) return

    try {
      const rawResume = sessionStorage.getItem(RESUME_STORAGE_KEY)
      if (rawResume) {
        const parsedResume = JSON.parse(rawResume)
        if (parsedResume && typeof parsedResume.screen === "string") {
          onProceedToOverlay(parsedResume.screen)
          return
        }
      }
    } catch {
      // ignore parse errors and fallback
    }

    const destination =
      gender === "female"
        ? "payment-female"
        : age !== null && age >= 27 && age <= 37
        ? "payment-27-37"
        : "payment"

    onProceedToOverlay(destination)
  }

  return (
    <AppShell>
      <div
        className="signup-card relative isolate w-full max-w-lg overflow-hidden rounded-[26px] border border-white/80 p-5 shadow-[0_24px_70px_rgba(31,95,92,0.2)] sm:rounded-[30px] sm:p-10"
        style={{
          background:
            "radial-gradient(ellipse at 100% 0%, rgba(45,125,122,0.12), transparent 38%), linear-gradient(145deg, rgba(255,255,255,0.98), rgba(247,251,249,0.98) 65%, rgba(237,244,239,0.98))",
        }}
      >
        <div aria-hidden className="pointer-events-none absolute -right-16 -top-20 -z-10 h-52 w-52 rounded-full bg-[#2D7D7A]/10 blur-3xl" />
        <div aria-hidden className="pointer-events-none absolute -bottom-20 -left-16 -z-10 h-48 w-48 rounded-full bg-[#EDE8DF]/70 blur-3xl" />

        <div className="relative z-10">
          <div className="mb-5 flex justify-center sm:mb-6">
            <div className="flex h-[68px] w-[68px] items-center justify-center rounded-[22px] border border-[#2D7D7A]/15 bg-white/80 shadow-[0_10px_24px_rgba(45,125,122,0.12)] sm:h-[76px] sm:w-[76px]">
              <img src={stateIcon} alt="" aria-hidden="true" className="h-12 w-12 sm:h-14 sm:w-14" />
            </div>
          </div>

          <div className="mb-2 flex justify-center">
            <span className="rounded-full border border-[#2D7D7A]/15 bg-[#2D7D7A]/[0.07] px-3 py-1 text-[10px] font-bold uppercase tracking-[0.16em] text-[#2D7D7A]">
              Welcome back
            </span>
          </div>

          <h2 className="text-balance text-center text-[25px] font-bold leading-tight tracking-[-0.04em] sm:text-[30px]" style={{ color: T.headingDark }}>
            Sign in to your account
          </h2>

          <p className="mx-auto mb-7 mt-2 max-w-[34ch] text-balance text-center text-[13px] leading-relaxed text-[#4A6B6F] sm:mb-8 sm:mt-3 sm:text-sm">
            Continue your Courtium onboarding.
          </p>

          <div className="flex flex-col gap-4 sm:gap-5">
            <div>
              <FieldLabel>
                Email address <span style={{ color: "#DC2626" }}>*</span>
              </FieldLabel>
              <input
                type="email"
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onFocus={() => setFocused("email")}
                onBlur={() => {
                  setFocused(null)
                  setTouched((t) => ({ ...t, email: true }))
                }}
                style={inputStyle("email", !!emailError)}
              />
              {showErr("email", emailError) && (
                <p className="text-xs mt-1 px-1" style={{ color: "#DC2626" }}>
                  {emailError}
                </p>
              )}
            </div>

            <div>
              <FieldLabel>
                Password <span style={{ color: "#DC2626" }}>*</span>
              </FieldLabel>
              <input
                type="password"
                placeholder="Your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onFocus={() => setFocused("password")}
                onBlur={() => {
                  setFocused(null)
                  setTouched((t) => ({ ...t, password: true }))
                }}
                style={inputStyle("password", !!passwordError)}
              />
              {showErr("password", passwordError) && (
                <p className="text-xs mt-1 px-1" style={{ color: "#DC2626" }}>
                  {passwordError}
                </p>
              )}
            </div>
          </div>

          <div className="mt-6 flex gap-3">
            <button
              type="button"
              onClick={onBack}
              className="flex-1 rounded-xl border-2 border-[#147b86] px-4 py-3 text-sm font-bold text-[#147b86] hover:bg-[#eefafa]"
            >
              Back
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              className="flex-1 rounded-xl bg-[#147b86] px-4 py-3 text-sm font-bold text-white hover:bg-[#106b73]"
            >
              Sign in
            </button>
          </div>
        </div>
      </div>
    </AppShell>
  )
}

// ── Dashboard screen ───────────────────────────────────────────────────────

function LogoMark() {
  return <LogoIcon className="h-8 w-8" />
}

function DashboardNavIcon({ item }: { item: string }) {
  const iconPaths = {
    Home: (
      <>
        <path d="m3 10 9-7 9 7" />
        <path d="M5 9v11h14V9M9 20v-7h6v7" />
      </>
    ),
    Profile: (
      <>
        <circle cx="12" cy="8" r="4" />
        <path d="M5 21v-1a7 7 0 0 1 14 0v1" />
      </>
    ),
    "My Questionnaire": (
      <>
        <path d="M8 4H6a2 2 0 0 0-2 2v14h16V6a2 2 0 0 0-2-2h-2" />
        <rect x="8" y="2" width="8" height="4" rx="1" />
        <path d="M8 11h8M8 15h8" />
      </>
    ),
    Recommendations: (
      <>
        <path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1.1-1.1a5.5 5.5 0 0 0-7.8 7.8l1.1 1.1L12 21l7.8-7.5 1.1-1.1a5.5 5.5 0 0 0-.1-7.8Z" />
        <path d="m12 8 1 2.5 2.5 1-2.5 1L12 15l-1-2.5-2.5-1 2.5-1L12 8Z" />
      </>
    ),
    Dates: (
      <>
        <rect x="3" y="5" width="18" height="16" rx="2" />
        <path d="M16 3v4M8 3v4M3 10h18M8 14h3" />
      </>
    ),
    "Contact Us": (
      <>
        <path d="M21 11.5a8.4 8.4 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.4 8.4 0 0 1-3.8-.9L3 21l1.9-5.7a8.4 8.4 0 0 1-.9-3.8A8.5 8.5 0 0 1 8.7 3.9a8.4 8.4 0 0 1 3.8-.9h.5a8.5 8.5 0 0 1 8 8v.5Z" />
        <path d="M8 12h.01M12 12h.01M16 12h.01" />
      </>
    ),
    Location: (
      <>
        <path d="M20 10c0 5-8 11-8 11S4 15 4 10a8 8 0 1 1 16 0Z" />
        <circle cx="12" cy="10" r="2.5" />
      </>
    ),
    "Report User": (
      <>
        <path d="M12 22s8-4 8-11V5l-8-3-8 3v6c0 7 8 11 8 11Z" />
        <path d="M12 8v5M12 16h.01" />
      </>
    ),
    "Refer a friend": (
      <>
        <circle cx="9" cy="8" r="3" />
        <path d="M3 20v-1a6 6 0 0 1 12 0v1M16 5a3 3 0 0 1 0 6M18 14a5 5 0 0 1 3 5v1" />
      </>
    ),
    "Book a 1-2-1 session": (
      <>
        <rect x="3" y="5" width="18" height="16" rx="2" />
        <path d="M16 3v4M8 3v4M3 10h18M12 13v3l2 1" />
      </>
    ),
    Convein: (
      <>
        <circle cx="12" cy="8" r="3" />
        <circle cx="5" cy="17" r="2" />
        <circle cx="19" cy="17" r="2" />
        <path d="M9.5 10 6.5 15M14.5 10l3 5M7 17h10" />
      </>
    ),
    "Sign Out": (
      <>
        <path d="M10 17l5-5-5-5M15 12H3" />
        <path d="M12 3h6a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-6" />
      </>
    ),
  }

  return (
    <svg
      viewBox="0 0 24 24"
      className="h-5 w-5 shrink-0"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {iconPaths[item as keyof typeof iconPaths]}
    </svg>
  )
}

function DashboardScreen({
  onOpenQuestionnaire,
  onSignOut,
}: {
  onOpenQuestionnaire?: () => void
  onSignOut: () => void
}) {
  const { firstName, selectedPlan, questionnaireComplete, profilePhoto } = useProgress()
  const [isNavOpen, setIsNavOpen] = useState(
    () => typeof window !== "undefined" && window.innerWidth >= 768,
  )
  const [profileMenuOpen, setProfileMenuOpen] = useState(false)
  const profileMenuRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    function handleDocClick(e: MouseEvent) {
      if (profileMenuRef.current && !profileMenuRef.current.contains(e.target as Node)) {
        setProfileMenuOpen(false)
      }
    }
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") setProfileMenuOpen(false)
    }
    document.addEventListener("click", handleDocClick)
    document.addEventListener("keydown", handleKey)
    return () => {
      document.removeEventListener("click", handleDocClick)
      document.removeEventListener("keydown", handleKey)
    }
  }, [])

  const navItems = [
    "Home",
    "Profile",
    "My Questionnaire",
    "Recommendations",
    "Dates",
    "Contact Us",
    "Location",
    "Report User",
    "Refer a friend",
    "Book a 1-2-1 session",
    "Convein",
    "Sign Out",
  ]

  return (
    <div
      className="min-h-dvh sm:p-3 md:p-[11px]"
      style={{ background: APP_BACKGROUND }}
    >
      <div className="relative mx-auto flex min-h-dvh max-w-[1420px] overflow-hidden shadow-[0_12px_26px_rgba(40,61,66,0.1)] sm:min-h-[calc(100vh-24px)] sm:rounded-[18px] sm:border sm:border-[#d4dfe2] md:min-h-[calc(100vh-22px)]">
        {isNavOpen && (
          <button
            type="button"
            aria-label="Close navigation menu"
            onClick={() => setIsNavOpen(false)}
            className="absolute inset-0 z-30 bg-[#173744]/35 md:hidden"
          />
        )}

        <aside
          id="dashboard-navigation"
          className={[
            "absolute inset-y-0 left-0 z-40 w-[min(82vw,280px)] shrink-0 rounded-r-[22px] border-r border-[#d7e1e4] bg-[#f7fafa] px-3 py-4 shadow-xl transition-all duration-200 md:relative md:z-auto md:translate-x-0 md:rounded-none md:shadow-none",
            isNavOpen
              ? "translate-x-0 md:w-[256px]"
              : "-translate-x-full border-r-0 px-0 py-0 md:w-16 md:border-r md:px-2 md:py-4",
          ].join(" ")}
        >
          <div
            className={[
              "flex items-center gap-3 py-2 text-[#167b83]",
              isNavOpen ? "px-2" : "justify-center px-0",
            ].join(" ")}
          >
            <LogoMark />
            <div className="hidden sm:block">
              {isNavOpen && <LogoLabel className="h-auto w-[116px]" />}
            </div>
            {isNavOpen && (
              <button
                type="button"
                aria-label="Close navigation menu"
                onClick={() => setIsNavOpen(false)}
                className="ml-auto flex h-10 w-10 items-center justify-center rounded-lg text-[#147b86] hover:bg-[#edf5f6] md:hidden"
              >
                <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
                  <path d="M6 6l12 12M18 6L6 18" />
                </svg>
              </button>
            )}
          </div>

          <nav className="mt-7 space-y-1.5">
            {navItems.map((item) => {
              const isAvailableBeforeQuestionnaire = [
                "Home",
                "Profile",
                "My Questionnaire",
                "Sign Out",
              ].includes(item)
              const isLocked =
                !questionnaireComplete && !isAvailableBeforeQuestionnaire

              return (
                <button
                  key={item}
                  type="button"
                  aria-label={`${isLocked ? "Locked " : ""}${item}`}
                  title={isNavOpen ? undefined : `${isLocked ? "Locked " : ""}${item}`}
                  onClick={() => {
                    if (isLocked) return
                    if (item === "My Questionnaire" && onOpenQuestionnaire) {
                      onOpenQuestionnaire()
                      return
                    }
                    if (item === "Sign Out") {
                      onSignOut()
                      return
                    }
                    setIsNavOpen(false)
                  }}
                  disabled={isLocked}
                  className={[
                    "relative flex min-h-10 w-full items-center rounded-[8px] text-[13px] font-medium transition-colors",
                    isNavOpen ? "justify-start gap-2 px-3 text-left" : "justify-center px-0",
                    isLocked
                      ? 'cursor-not-allowed text-[#9aa9ad] opacity-60'
                      : 'text-[#21495a] hover:bg-[#edf5f6]',
                    !isLocked && item === 'Home'
                      ? 'bg-[#e8f3f5] font-bold text-[#147b86]'
                      : '',
                  ].join(' ')}
                >
                  <span className="relative flex h-5 w-5 shrink-0 items-center justify-center">
                    <DashboardNavIcon item={item} />
                  </span>
                  {isNavOpen && <span className="min-w-0 flex-1 whitespace-nowrap">{item}</span>}
                </button>
              )
            })}
          </nav>
        </aside>

        <div className="flex min-w-0 flex-1 flex-col bg-[#f1f6f7]">
          <header className="sticky top-0 z-20 flex items-center justify-between min-h-[60px] border-b border-[#d7e1e4] bg-white px-3 pt-[env(safe-area-inset-top)] sm:px-6 sm:pt-0 md:px-7">
            <div className="flex items-center gap-3">
              <button
                type="button"
                aria-label={isNavOpen ? "Collapse navigation menu" : "Open navigation menu"}
                aria-expanded={isNavOpen}
                aria-controls="dashboard-navigation"
                onClick={() => setIsNavOpen((open) => !open)}
                className="flex h-10 w-10 items-center justify-center rounded-lg text-[#147b86] transition-colors hover:bg-[#eefafa] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#147b86]"
              >
                <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
                  {isNavOpen ? <path d="M6 6l12 12M18 6L6 18" /> : <path d="M4 6h16M4 12h16M4 18h16" />}
                </svg>
              </button>

              <div className="flex items-center gap-2">
                <LogoMark />
                {!isNavOpen && (
                  <div className="ml-2">
                    <LogoLabel className="h-auto w-[96px] sm:w-[116px]" />
                  </div>
                )}
              </div>
            </div>

            <div className="flex items-center gap-4">
              <nav className="hidden md:flex items-center gap-5 text-[11px] font-bold text-[#183d4d]">
                <a href="#home">Home</a>
                <a className="hidden lg:inline" href="#contact">Contact us</a>
                <a className="hidden lg:inline" href="#report">Report user</a>
                <button type="button" onClick={onSignOut} className="text-inherit hidden lg:inline">Sign Out</button>
              </nav>

              <div className="relative" ref={profileMenuRef}>
                <button
                  type="button"
                  onClick={() => setProfileMenuOpen((s) => !s)}
                  aria-haspopup="menu"
                  aria-expanded={profileMenuOpen}
                  className="flex items-center gap-2 rounded-full focus:outline-none focus-visible:ring-2 focus-visible:ring-[#147b86] p-1"
                >
                  {profilePhoto ? (
                    <img
                      src={profilePhoto}
                      alt="Profile"
                      className="h-10 w-10 rounded-full object-cover ring-2 ring-[#dbecec]"
                    />
                  ) : (
                    <div className="h-10 w-10 rounded-full bg-[#e8f3f5] flex items-center justify-center text-[#147b86] font-bold">
                      {firstName ? firstName.charAt(0).toUpperCase() : "C"}
                    </div>
                  )}
                </button>

                {profileMenuOpen && (
                  <div
                    role="menu"
                    aria-label="Profile menu"
                    className="absolute right-0 mt-2 w-48 rounded-md bg-white border shadow-lg ring-1 ring-black/5 z-50"
                  >
                    <div className="py-1">
                      <button
                        type="button"
                        role="menuitem"
                        onClick={() => { setProfileMenuOpen(false); }}
                        className="w-full text-left px-4 py-2 text-sm text-[#1c4050] hover:bg-[#f1f6f7]"
                      >
                        Profile
                      </button>
                      <button
                        type="button"
                        role="menuitem"
                        onClick={() => { setProfileMenuOpen(false); if (onOpenQuestionnaire) onOpenQuestionnaire() }}
                        className="w-full text-left px-4 py-2 text-sm text-[#1c4050] hover:bg-[#f1f6f7]"
                      >
                        My Questionnaire
                      </button>
                      <button
                        type="button"
                        role="menuitem"
                        onClick={() => { setProfileMenuOpen(false); onSignOut() }}
                        className="w-full text-left px-4 py-2 text-sm text-[#1c4050] hover:bg-[#f1f6f7]"
                      >
                        Sign Out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </header>

          <main className="flex-1 overflow-auto px-4 py-5 pb-[calc(6rem+env(safe-area-inset-bottom))] sm:px-6 sm:py-8 sm:pb-24 md:px-9 md:pb-8">
            <div className="mx-auto w-full max-w-[900px]">
              <h1 className="text-[24px] font-bold tracking-[-0.04em] text-[#183d4d] sm:text-[27px]">
                {firstName ? `Welcome ${firstName}` : "Welcome"}
              </h1>
              <p className="mt-1 text-[13px] leading-5 text-[#7892a0]">
                Your Courtium journey continues here.
              </p>

              <section className="mt-6 rounded-[15px] border border-[#d9e3e7] bg-white p-5 sm:mt-7 sm:px-6 sm:py-5">
                <h2 className="text-[17px] font-bold text-[#1c4050] sm:text-[18px]">Welcome to Courtium</h2>
                <p className="mt-2 text-[13px] leading-5 text-[#7892a0]">
                  Complete your onboarding steps to unlock your full dashboard experience.
                </p>
              </section>

              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                <section className="min-h-[132px] rounded-[15px] border border-[#d9e3e7] bg-white p-5 sm:min-h-[168px] sm:px-6 sm:py-5">
                  <h2 className="text-[15px] font-bold text-[#1c4050] sm:text-[16px]">Your membership</h2>
                  <dl className="mt-3 space-y-2 text-[12px] leading-5">
                    <div className="flex flex-wrap gap-x-2">
                      <dt className="font-semibold text-[#315b68]">Status:</dt>
                      <dd className="text-[#7892a0]">Not matched yet</dd>
                    </div>
                    <div className="flex flex-wrap gap-x-2">
                      <dt className="font-semibold text-[#315b68]">Plan:</dt>
                      <dd className="text-[#7892a0]">
                        {selectedPlan?.name ?? "No plan selected"}
                      </dd>
                    </div>
                  </dl>
                </section>
                <section className="min-h-[132px] rounded-[15px] border border-[#d9e3e7] bg-white p-5 sm:min-h-[168px] sm:px-6 sm:py-5">
                  <h2 className="text-[15px] font-bold text-[#1c4050] sm:text-[16px]">Next step</h2>
                  <p className="mt-3 text-[12px] leading-5 text-[#7892a0]">After payment, continue to your questionnaire.</p>
                </section>
              </div>

              <section className="mx-auto mt-4 max-w-[560px] rounded-[15px] border border-[#e5ecee] bg-white p-5 sm:px-6 sm:py-6">
                <h2 className="max-w-[440px] text-[19px] font-bold leading-[1.2] tracking-[-0.04em] text-[#183d4d] sm:text-[21px]">Let’s get to know more about you and your desired partner</h2>
                <p className="mt-2 text-[12px] text-[#7892a0]">This will take about 10 minutes to complete.</p>
                <button type="button" onClick={onOpenQuestionnaire} disabled={!onOpenQuestionnaire} className="mt-4 h-11 w-full rounded-[9px] bg-[#147b86] text-[13px] font-bold text-white transition-colors hover:bg-[#106b73] sm:w-[177px]">Continue</button>
              </section>
            </div>
          </main>
        </div>
      </div>
    </div>
  )
}

// ── Additional questionnaire questions ───────────────────────────────────

const ADDITIONAL_QUESTIONNAIRE_QUESTIONS = [
  {
    id: "childrenCount",
    text: "How many Child(ren) do you have?",
    options: ["0", "1", "2", "3+"],
  },
  {
    id: "partnerChildren",
    text: "Can you be with a partner who already has children?",
    options: ["Yes", "No", "Depending on how many"],
  },
  {
    id: "partnerChildrenMaximum",
    text: "What is the maximum number of children you can deal with if your prospective partner already has a kid(s)?",
    options: ["1", "2", "3+"],
    showWhen: {
      questionId: "partnerChildren",
      values: ["Yes", "Depending on how many"],
    },
  },
  {
    id: "moreChildren",
    text: "Are you looking to ever have (more) kids?",
    options: ["Yes", "No"],
  },
  {
    id: "bodySizeNeckToWaist",
    text: "Which of the options below closely matches your body size from neck to waist?",
    options: ["Small", "Medium", "Large", "XL", "XXL+"],
  },
  {
    id: "bodySizeWaistToAnkle",
    text: "Which of the options below closely matches your body size from waist to Ankle?",
    options: ["Small", "Medium", "Large", "XL", "XXL+"],
  },
  {
    id: "bodyTypePreference",
    text: "Do you have a strong preference for a partner's body type?",
    options: ["Yes", "No", "I’m Indifferent"],
  },
  {
    id: "preferredBodySizeNeckToWaist",
    text: "What is the strong preference you are looking for? We won’t match you with anyone that doesn’t fit your preference — Body size from neck to waist",
    options: ["Small", "Medium", "Large", "XL", "XXL+"],
    showWhen: { questionId: "bodyTypePreference", values: ["Yes"] },
  },
  {
    id: "preferredBodySizeWaistToAnkle",
    text: "What is the strong preference you are looking for? We won’t match you with anyone that doesn’t fit your preference — Body size from waist to ankle",
    options: ["Small", "Medium", "Large", "XL", "XXL+"],
    showWhen: { questionId: "bodyTypePreference", values: ["Yes"] },
  },
  {
    id: "height",
    text: "Which of the option ranges below closely matches your height?",
    options: ["Below 150cm", "150cm - 159cm", "161 cm - 170cm", "170cm+"],
  },
  {
    id: "heightPreference",
    text: "Do you have a strong preference for a partner's height?",
    options: ["Yes", "No", "I’m Indifferent"],
  },
  {
    id: "preferredPartnerHeight",
    text: "What is the strong preference you are looking for? We won’t match you with anyone that doesn’t fit your preference — Desired Partner’s Height",
    options: ["Below 150cm", "150cm - 159cm", "161 cm - 170cm", "170cm+"],
    showWhen: { questionId: "heightPreference", values: ["Yes"] },
  },
  {
    id: "relationshipCommunication",
    text: "What kind of partner are you in a relationship?",
    options: [
      "I prefer to talk to my partner all the time and share my whole day with them in real-time.",
      "I prefer to hear from my partner at least daily, and talk about the whole day at some point.",
      "I prefer to hear from my partner days apart and catch up then.",
    ],
  },
  {
    id: "conflictResolution",
    text: "In the event of conflict, how do you prefer to handle the situation?",
    options: [
      "Address it immediately",
      "Need some hours to think",
      "Need days to think",
      "Avoid it until it blows over",
    ],
  },
  {
    id: "partnerAnger",
    text: "How do you react when your partner gets angry at you?",
    options: [
      "I give it back hot",
      "I try to calm my partner down to address the issue",
      "I walk away",
    ],
  },
  {
    id: "showLove",
    text: "How do you show love to your partner?",
    options: [
      "Words of Affection",
      "Shower them with compliments",
      "Buy them gifts",
      "Acts of service",
      "Take them out",
      "I do nothing, I expect them to know I love them",
    ],
    multiple: true,
  },
  {
    id: "emotionalAvailability",
    text: "Think about your current job or engagements; Do you think you are emotionally available to be involved in a relationship?",
    options: ["Yes", "No", "I can try to"],
  },
  {
    id: "manFinancialResponsibility",
    text: "In a relationship/marriage, I believe a man should be:",
    options: [
      "A provider and fully financially responsible for their partner",
      "Partly responsible financially (50/50) for their partner",
      "Responsible for only himself",
    ],
  },
  {
    id: "financialResponsibilityPreference",
    text: "What’s your take on 50/50 financial responsibility in a relationship?",
    options: [
      "That’s my ideal relationship",
      "I can’t deal with that",
      "I am indifferent",
    ],
  },
  {
    id: "splitBills",
    text: "Are you happy to split bills with your partner on dates etc. before and into the relationship?",
    options: ["Yes", "No", "Maybe Sometimes"],
  },
]

// ── Questionnaire summary modal & lock flow ──────────────────────────────

function LockedModal({ until, onOk }: { until: string | null; onOk: () => void }) {
  if (!until) return null
  const formatted = new Date(until).toLocaleDateString()
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4" style={{ backgroundColor: "rgba(0,0,0,0.45)" }}>
      <div className="relative flex w-full max-w-sm flex-col items-center gap-5 overflow-hidden rounded-[24px] border border-[#B8860B]/20 p-6 text-center shadow-[0_24px_70px_rgba(70,56,20,0.2)] sm:gap-6 sm:p-8" style={{ background: NOTICE_DIALOG_BACKGROUND }}>
        <svg viewBox="0 0 48 48" className="h-12 w-12 shrink-0 text-[#B8860B]" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M24 4 8 11v11c0 10 6.6 17.6 16 22 9.4-4.4 16-12 16-22V11L24 4Z" />
          <path d="M24 15v10" />
          <circle cx="24" cy="32" r="1.4" fill="currentColor" stroke="none" />
        </svg>

        <h3 className="text-[17px] font-bold text-[#183d4d]">Your responses are locked</h3>
        <p className="text-sm text-[#4A6B6F]">Your questionnaire was saved and locked until {formatted}. You can access your dashboard.</p>

        <button
          onClick={onOk}
          className="mt-3 w-full rounded-xl py-3 text-sm font-semibold text-white"
          style={{ backgroundColor: T.teal }}
          onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = T.tealDark)}
          onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = T.teal)}
        >
          Okay
        </button>
      </div>
    </div>
  )
}

function SummaryModal({
  visible,
  onClose,
  onFinalize,
}: {
  visible: boolean
  onClose: () => void
  onFinalize: () => void
}) {
  const {
    questionnaireLocation,
    questionnaireOrigin,
    questionnaireReligion,
    partnerReligionPreference,
    preferredPartnerReligion,
    preferredPartnerAgeRange,
    questionnaireAdditionalAnswers,
    setLockedUntil,
    setQuestionnaireComplete,
  } = useProgress()

  const [stage, setStage] = useState<null | "confirm" | "saved">(null)

  if (!visible) return null

  const renderAdditionalAnswers = () =>
    ADDITIONAL_QUESTIONNAIRE_QUESTIONS.map((q) => {
      const ans = questionnaireAdditionalAnswers[q.id]
      if (ans === undefined || (Array.isArray(ans) && ans.length === 0) || (typeof ans === "string" && ans.trim() === "")) return null
      const display = Array.isArray(ans) ? ans.join(", ") : String(ans)
      return (
        <div key={q.id} className="mb-3 text-sm">
          <div className="font-semibold text-[#1c4050]">{q.text}</div>
          <div className="text-[#7892a0]">{display}</div>
        </div>
      )
    })

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center px-4"
      style={{ backgroundColor: "rgba(0,0,0,0.45)" }}
    >
      <section
        className="w-full max-w-[720px] flex flex-col rounded-[20px] border p-0 shadow-[0_24px_70px_rgba(20,70,74,0.22)]"
        style={{
          background: SUCCESS_DIALOG_BACKGROUND,
          maxHeight: "90vh",
        }}
        role="dialog"
        aria-modal="true"
        aria-labelledby="summary-title"
      >
        <div className="flex items-start gap-4 p-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-white/70 p-2 text-[#2D7D7A]">
            <ShieldCheckIcon color={T.teal} />
          </div>
          <div className="flex-1 pr-2">
            <h2 id="summary-title" className="text-lg font-bold text-[#183d4d]">
              Review your responses
            </h2>
            <p className="mt-1 text-sm text-[#4A6B6F]">
              Check your answers below. Edit to make changes, or Save to confirm and lock them for 3 months.
            </p>
          </div>
          <button type="button" onClick={onClose} className="ml-2 text-sm font-semibold text-[#147b86]">
            Close
          </button>
        </div>

        <div className="px-4 pb-4 overflow-y-auto" style={{ flex: 1 }}>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <div className="text-xs font-semibold text-[#1c4050]">Location</div>
              <div className="mt-1 text-sm text-[#7892a0]">
                {questionnaireLocation.state || "—"}, {questionnaireLocation.localGovernment || "—"}
              </div>
            </div>
            <div>
              <div className="text-xs font-semibold text-[#1c4050]">State of Origin</div>
              <div className="mt-1 text-sm text-[#7892a0]">
                {questionnaireOrigin.state || "—"}, {questionnaireOrigin.localGovernment || "—"}
              </div>
            </div>
            <div>
              <div className="text-xs font-semibold text-[#1c4050]">Your Religion</div>
              <div className="mt-1 text-sm text-[#7892a0]">{questionnaireReligion || "—"}</div>
            </div>
            <div>
              <div className="text-xs font-semibold text-[#1c4050]">Partner religion preference</div>
              <div className="mt-1 text-sm text-[#7892a0]">
                {partnerReligionPreference || "—"}
              </div>
            </div>
            {partnerReligionPreference === "Yes" && (
              <div>
                <div className="text-xs font-semibold text-[#1c4050]">Preferred Partner Religion</div>
                <div className="mt-1 text-sm text-[#7892a0]">
                  {preferredPartnerReligion || "—"}
                </div>
              </div>
            )}
            <div>
              <div className="text-xs font-semibold text-[#1c4050]">Preferred Partner Age Range</div>
              <div className="mt-1 text-sm text-[#7892a0]">
                {preferredPartnerAgeRange || "—"}
              </div>
            </div>
          </div>

          <div className="mt-4">
            <div className="text-xs font-semibold text-[#1c4050]">Additional answers</div>
            <div className="mt-2 text-sm text-[#7892a0]">{renderAdditionalAnswers()}</div>
          </div>
        </div>

        <div className="border-t border-[#e6efef] bg-white/5 p-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              type="button"
              onClick={onClose}
              className="w-full sm:w-auto flex-1 rounded-[10px] border-2 border-[#147b86] px-4 py-2 text-sm font-bold text-[#147b86] hover:bg-[#eefafa]"
            >
              Edit
            </button>

            <div className="w-full sm:flex-1">
              <button
                type="button"
                onClick={() => setStage("confirm")}
                className="w-full rounded-[10px] bg-[#147b86] px-4 py-2 text-sm font-bold text-white hover:bg-[#106b73]"
              >
                Save
              </button>
            </div>
          </div>

          {stage === "confirm" && (
            <div className="mt-3 rounded-[10px] border border-[#dcdcdc] bg-white p-3 text-center">
              <p className="mb-3 font-semibold text-[#183d4d]">
                Are you satisfied with all your responses?
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <button
                  type="button"
                  onClick={() => setStage(null)}
                  className="w-full sm:w-auto rounded-[8px] border-2 border-[#147b86] px-4 py-2 font-bold text-[#147b86] hover:bg-[#eefafa]"
                >
                  No
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const lockDate = new Date()
                    lockDate.setMonth(lockDate.getMonth() + 3)
                    setLockedUntil(lockDate.toISOString())
                    setQuestionnaireComplete(true)
                    setStage("saved")
                  }}
                  className="w-full sm:w-auto rounded-[8px] bg-[#147b86] px-4 py-2 font-bold text-white hover:bg-[#106b73]"
                >
                  Yes
                </button>
              </div>
            </div>
          )}

          {stage === "saved" && (
            <div className="mt-3 rounded-[10px] border border-[#dcdcdc] bg-white p-3 text-center">
              <p className="mb-3 font-bold text-[#183d4d]">
                Your responses have been saved and locked, you won’t be able to change them until after 3 months
              </p>
              <div className="flex justify-center">
                <button
                  type="button"
                  onClick={onFinalize}
                  className="rounded-[8px] bg-[#147b86] px-4 py-2 font-bold text-white hover:bg-[#106b73]"
                >
                  Okay
                </button>
              </div>
            </div>
          )}
        </div>
      </section>
    </div>
  )
}

// ── Questionnaire screen ──────────────────────────────────────────────────

function QuestionnaireScreen({
  onComplete,
  onLater,
  onSignOut,
}: {
  onComplete: () => void
  onLater: () => void
  onSignOut: () => void
}) {
  const {
    questionnaireLocation,
    setQuestionnaireLocation,
    questionnaireOrigin,
    setQuestionnaireOrigin,
    questionnaireReligion,
    setQuestionnaireReligion,
    partnerReligionPreference,
    setPartnerReligionPreference,
    preferredPartnerReligion,
    setPreferredPartnerReligion,
    preferredPartnerAgeRange,
    setPreferredPartnerAgeRange,
    questionnaireAdditionalAnswers,
    setQuestionnaireAdditionalAnswers,
    setQuestionnaireComplete,
    setLastSavedAt,
    lockedUntil,

    questionnaireCurrentQuestion,
    setQuestionnaireCurrentQuestion,
    questionnaireShowSummary,
    setQuestionnaireShowSummary,
    questionnaireShowLockedModal,
    setQuestionnaireShowLockedModal,
  } = useProgress()

  useEffect(() => {
    if (!lockedUntil) return
    const now = Date.now()
    const lockTime = new Date(lockedUntil).getTime()
    if (!isNaN(lockTime) && lockTime > now) {
      setQuestionnaireShowLockedModal(true)
    }
  }, [lockedUntil, setQuestionnaireShowLockedModal])

  const isLocationComplete =
    questionnaireLocation.state.trim() !== "" &&
    questionnaireLocation.localGovernment.trim() !== ""
  const isOriginComplete =
    questionnaireOrigin.state.trim() !== "" &&
    questionnaireOrigin.localGovernment.trim() !== ""
  const isReligionComplete =
    typeof questionnaireReligion === "string" &&
    questionnaireReligion.trim() !== ""
  const isPartnerReligionPreferenceComplete =
    partnerReligionPreference === "Yes" ||
    partnerReligionPreference === "No" ||
    partnerReligionPreference === "I’m Indifferent"
  const isPreferredPartnerReligionComplete =
    preferredPartnerReligion === "Christianity" ||
    preferredPartnerReligion === "Islam" ||
    preferredPartnerReligion === "Traditional"

  const isPreferredPartnerAgeRangeComplete =
    preferredPartnerAgeRange === "27-32" ||
    preferredPartnerAgeRange === "33-38" ||
    preferredPartnerAgeRange === "38+" ||
    preferredPartnerAgeRange === "I am indifferent"

  const needsPreferredReligion = partnerReligionPreference === "Yes"
  const ageRangeQuestion = needsPreferredReligion ? 6 : 5

  const visibleAdditionalQuestions = ADDITIONAL_QUESTIONNAIRE_QUESTIONS.filter(
    (question) => {
      if (!question.showWhen) return true
      const trigger = questionnaireAdditionalAnswers[question.showWhen.questionId]
      if (trigger === undefined || trigger === null) return false

      if (Array.isArray(trigger)) {
        return trigger.some((t) => question.showWhen!.values.includes(String(t)))
      }
      return question.showWhen.values.includes(String(trigger))
    },
  )

  const totalQuestions = ageRangeQuestion + visibleAdditionalQuestions.length

  const firstIncompleteAdditionalQuestion = visibleAdditionalQuestions.findIndex(
    (question) => {
      const answer = questionnaireAdditionalAnswers[question.id]
      return question.multiple
        ? !Array.isArray(answer) || answer.length === 0
        : typeof answer !== "string" || answer.trim() === ""
    },
  )

  const computeInitialQuestion = () =>
    !isLocationComplete
      ? 1
      : !isOriginComplete
        ? 2
        : !isReligionComplete
          ? 3
          : !isPartnerReligionPreferenceComplete
            ? 4
            : needsPreferredReligion &&
                !isPreferredPartnerReligionComplete
              ? 5
              : !isPreferredPartnerAgeRangeComplete
                ? ageRangeQuestion
                : firstIncompleteAdditionalQuestion >= 0
                  ? ageRangeQuestion + firstIncompleteAdditionalQuestion + 1
                  : 1

  useEffect(() => {
    if (questionnaireCurrentQuestion === null || questionnaireCurrentQuestion === undefined) {
      setQuestionnaireCurrentQuestion(computeInitialQuestion())
    } else {
      const clamped = Math.max(1, Math.min(totalQuestions || 1, questionnaireCurrentQuestion))
      if (clamped !== questionnaireCurrentQuestion) setQuestionnaireCurrentQuestion(clamped)
    }
  }, [totalQuestions, questionnaireCurrentQuestion, setQuestionnaireCurrentQuestion])

  const currentQuestion = questionnaireCurrentQuestion ?? computeInitialQuestion()

  const getVisibleQuestionNumbers = () => {
    const nums: number[] = [1, 2, 3, 4]
    if (needsPreferredReligion) nums.push(5)
    nums.push(ageRangeQuestion)
    for (let i = 0; i < visibleAdditionalQuestions.length; i++) {
      nums.push(ageRangeQuestion + 1 + i)
    }
    return nums
  }

  const currentAdditionalQuestion =
    currentQuestion > ageRangeQuestion
      ? visibleAdditionalQuestions[currentQuestion - ageRangeQuestion - 1]
      : null
  const currentAdditionalAnswer = currentAdditionalQuestion
    ? questionnaireAdditionalAnswers[currentAdditionalQuestion.id]
    : undefined
  const isCurrentAdditionalQuestionComplete = currentAdditionalQuestion
    ? currentAdditionalQuestion.multiple
      ? Array.isArray(currentAdditionalAnswer) &&
        currentAdditionalAnswer.length > 0
      : typeof currentAdditionalAnswer === "string" &&
        currentAdditionalAnswer.trim() !== ""
    : true
  const selectedLocationState = nigeriaLocations.find(
    (location) => location.state === questionnaireLocation.state,
  )
  const selectedOriginState = nigeriaLocations.find(
    (location) => location.state === questionnaireOrigin.state,
  )

  const updateOrigin = (
    field: keyof typeof questionnaireOrigin,
    value: string,
  ) => {
    setQuestionnaireOrigin({
      ...questionnaireOrigin,
      [field]: value,
    })
  }

  const getQuestionTitle = (qNum: number) => {
    if (qNum > ageRangeQuestion) {
      const idx = qNum - ageRangeQuestion - 1
      return visibleAdditionalQuestions[idx]?.text ?? ""
    }
    switch (qNum) {
      case 1:
        return "Where are you located?"
      case 2:
        return "What is your state of Origin?"
      case 3:
        return "What is your religion?"
      case 4:
        return "Do you have a strong preference for a partner's religion?"
      case 5:
        return "What is the strong preference you are looking for? We won’t match you with anyone that doesn’t fit your preference"
      default:
        return "What is the preferred age range you are looking for in a partner?"
    }
  }

  const getQuestionPreview = (qNum: number): string[] => {
    if (qNum > ageRangeQuestion) {
      const idx = qNum - ageRangeQuestion - 1
      return visibleAdditionalQuestions[idx]?.options ?? []
    }
    switch (qNum) {
      case 1:
        return questionnaireLocation.state ? [questionnaireLocation.state] : ["State selector"]
      case 2:
        return questionnaireOrigin.state ? [questionnaireOrigin.state] : ["State of origin selector"]
      case 3:
        return ["Christianity", "Islam", "Traditional", "All in one", "None"]
      case 4:
        return ["Yes", "No", "I’m Indifferent"]
      case 5:
        return ["Christianity", "Islam", "Traditional"]
      default:
        return ["27-32", "33-38", "38+", "I am indifferent"]
    }
  }

  const goToNext = () => {
    const visible = getVisibleQuestionNumbers()
    const cur = currentQuestion
    const idx = visible.indexOf(cur)
    if (idx === -1) {
      const next = visible.find((n) => n > cur) ?? visible[visible.length - 1]
      setQuestionnaireCurrentQuestion(next)
      return
    }
    if (idx < visible.length - 1) {
      setQuestionnaireCurrentQuestion(visible[idx + 1])
    } else {
      setQuestionnaireCurrentQuestion(visible[visible.length - 1])
    }
  }

  const goToPrevious = () => {
    const visible = getVisibleQuestionNumbers()
    const cur = currentQuestion
    const idx = visible.indexOf(cur)
    if (idx === -1) {
      const prev = [...visible].reverse().find((n) => n < cur) ?? visible[0]
      setQuestionnaireCurrentQuestion(prev)
      return
    }
    if (idx > 0) {
      setQuestionnaireCurrentQuestion(visible[idx - 1])
    } else {
      setQuestionnaireCurrentQuestion(visible[0])
    }
  }

  const finishQuestionnaire = () => {
    if (
      !isPartnerReligionPreferenceComplete ||
      (needsPreferredReligion && !isPreferredPartnerReligionComplete) ||
      !isPreferredPartnerAgeRangeComplete ||
      !visibleAdditionalQuestions.every((question) => {
        const answer = questionnaireAdditionalAnswers[question.id]
        return question.multiple
          ? Array.isArray(answer) && answer.length > 0
          : typeof answer === "string" && answer.trim() !== ""
      })
    ) {
      return
    }
    setQuestionnaireComplete(true)
    onComplete()
  }

  const handleDoItLater = () => {
    setLastSavedAt(new Date().toISOString())
    setQuestionnaireComplete(false)
    onLater()
  }

  const isPrimaryDisabled =
    currentQuestion === 1
      ? !isLocationComplete
      : currentQuestion === 2
        ? !isOriginComplete
        : currentQuestion === 3
          ? !isReligionComplete
          : currentQuestion === 4
            ? !isPartnerReligionPreferenceComplete
            : needsPreferredReligion && currentQuestion === 5
              ? !isPreferredPartnerReligionComplete
              : currentQuestion > ageRangeQuestion
                ? !isCurrentAdditionalQuestionComplete
                : !isPreferredPartnerAgeRangeComplete

  const handlePrimaryAction = () => {
    const visible = getVisibleQuestionNumbers()
    const curIdx = visible.indexOf(currentQuestion)
    const isLastVisible = curIdx === visible.length - 1

    if (isLastVisible) {
      if (!isPrimaryDisabled) {
        setQuestionnaireShowSummary(true)
      }
      return
    }

    goToNext()
  }

  const visibleNumbers = getVisibleQuestionNumbers()
  const currentIdx = visibleNumbers.indexOf(currentQuestion)
  const prevQuestionNumber = currentIdx > 0 ? visibleNumbers[currentIdx - 1] : null
  const prevQuestionTitle = prevQuestionNumber ? getQuestionTitle(prevQuestionNumber) : ""
  const prevQuestionPreview = prevQuestionNumber ? getQuestionPreview(prevQuestionNumber) : []

  return (
    <>
      <DashboardScreen onSignOut={onSignOut} />
      <div className="fixed inset-0 z-40 flex items-center justify-center overflow-y-auto bg-[#49626b]/60 px-3 py-4 sm:px-6">
        <section
          className="relative flex max-h-[calc(100vh-2rem)] min-h-[min(650px,calc(100vh-2rem))] w-full max-w-[906px] flex-col overflow-y-auto rounded-[20px] bg-white px-4 py-6 text-[#183d4d] shadow-[0_18px_50px_rgba(25,47,54,0.2)] sm:px-8 sm:py-9"
          role="dialog"
          aria-modal="true"
          aria-labelledby="questionnaire-title"
        >
          {prevQuestionNumber && (
            <div className="absolute left-3 top-4 z-50">
              <div className="relative group">
                <button
                  type="button"
                  onClick={goToPrevious}
                  aria-label="Back"
                  className="inline-flex items-center justify-center rounded-full p-2 text-[#1c4050] hover:bg-[#eef6f6] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#147b86]"
                >
                  <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="M15 18l-6-6 6-6" />
                  </svg>
                </button>

                <div
                  role="tooltip"
                  className="pointer-events-none absolute left-full ml-3 top-1/2 -translate-y-1/2 w-48 rounded-md border bg-white px-3 py-2 text-sm text-[#1c4050] shadow-md opacity-0 translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-200"
                >
                  <div className="font-semibold">{prevQuestionTitle}</div>
                  {prevQuestionPreview.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-1">
                      {prevQuestionPreview.slice(0, 6).map((opt) => (
                        <span
                          key={opt}
                          className="inline-block rounded px-2 py-0.5 text-xs bg-[#f1f6f7] text-[#1c4050] border border-[#e6f0f0] shadow-sm"
                        >
                          {opt}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          <header className="text-center">
            <h1 id="questionnaire-title" className="text-[25px] font-bold tracking-[-0.03em] sm:text-[28px]">
              My Questionnaire
            </h1>
            <p className="mt-1 text-[13px] font-semibold text-[#7892a0]">
              You, Your Values and Your Prospective Partner
            </p>
          </header>

          <div className="mt-9 grid grid-cols-2 items-center gap-2 rounded-[14px] border border-[#70b3b7] px-3 py-3 text-center text-[11px] font-semibold text-[#7892a0] sm:mt-10 sm:grid-cols-[112px_1fr_180px_1.5fr] sm:gap-4">
            <span className="rounded-full bg-[#f1f6f7] px-3 py-1 text-[#147b86]">
              Q{String(currentQuestion).padStart(2, "0")}
            </span>
            <span className="col-span-1 text-left sm:text-center">
              Section 1 · About You
            </span>
            <div
              className="col-span-2 h-[9px] overflow-hidden rounded-full bg-[#dce8eb] sm:col-span-1"
              role="progressbar"
              aria-label="Questionnaire progress"
              aria-valuemin={0}
              aria-valuemax={totalQuestions}
              aria-valuenow={currentQuestion}
            >
              <div
                className="h-full rounded-full bg-[#147b86] transition-[width] duration-500"
                style={{ width: `${(currentQuestion / Math.max(1, totalQuestions)) * 100}%` }}
              />
            </div>
            <span className="col-span-2 sm:col-span-1 sm:text-right">
              Question {currentQuestion} of {totalQuestions} · Your progress can be saved and resumed later.
            </span>
          </div>

          <main className="mx-auto mt-12 w-full max-w-[742px] sm:mt-20">
            <h2 className="text-[20px] font-bold tracking-[-0.02em] sm:text-[22px]">
              {currentAdditionalQuestion
                ? currentAdditionalQuestion.text
                : currentQuestion === 1
                  ? "Where are you located?"
                  : currentQuestion === 2
                    ? "What is your state of Origin?"
                    : currentQuestion === 3
                      ? "What is your religion?"
                      : currentQuestion === 4
                        ? "Do you have a strong preference for a partner's religion?"
                        : needsPreferredReligion && currentQuestion === 5
                          ? "What is the strong preference you are looking for? We won’t match you with anyone that doesn’t fit your preference"
                          : "What is the preferred age range you are looking for in a partner?"}
            </h2>

            {currentQuestion < 3 ? (
              <div className="mt-9 grid gap-5 sm:grid-cols-2 sm:gap-6">
                <label className="block text-[13px] font-bold">
                  State
                  <select
                    value={
                      currentQuestion === 1
                        ? questionnaireLocation.state
                        : questionnaireOrigin.state
                    }
                    onChange={(event) => {
                      if (currentQuestion === 1) {
                        setQuestionnaireLocation({
                          state: event.target.value,
                          localGovernment: "",
                        })
                      } else {
                        setQuestionnaireOrigin({
                          state: event.target.value,
                          localGovernment: "",
                        })
                      }
                    }}
                    className="mt-2 h-[50px] w-full rounded-[11px] border border-[#d0dfe4] bg-white px-4 text-[13px] font-normal text-[#21495a] outline-none focus:border-[#147b86] focus:ring-2 focus:ring-[#147b86]/15"
                  >
                    <option value="">Select state</option>
                    {nigeriaLocations.map((location) => (
                      <option key={location.state} value={location.state}>
                        {location.state === "Federal Capital Territory" ? "FCT (Federal Capital Territory)" : location.state}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="block text-[13px] font-bold">
                  Local Government
                  <select
                    value={
                      currentQuestion === 1
                        ? questionnaireLocation.localGovernment
                        : questionnaireOrigin.localGovernment
                    }
                    onChange={(event) => {
                      if (currentQuestion === 1) {
                        setQuestionnaireLocation({
                          ...questionnaireLocation,
                          localGovernment: event.target.value,
                        })
                      } else {
                        updateOrigin("localGovernment", event.target.value)
                      }
                    }}
                    disabled={
                      currentQuestion === 1
                        ? !selectedLocationState
                        : !selectedOriginState
                    }
                    className="mt-2 h-[50px] w-full rounded-[11px] border border-[#d0dfe4] bg-white px-4 text-[13px] font-normal text-[#21495a] outline-none placeholder:text-[#8da4af] focus:border-[#147b86] focus:ring-2 focus:ring-[#147b86]/15"
                  >
                    <option value="">
                      {(currentQuestion === 1 ? selectedLocationState : selectedOriginState)
                        ? "Select local government"
                        : "Select state first"}
                    </option>
                    {(currentQuestion === 1 ? selectedLocationState : selectedOriginState)?.lgas.map((localGovernment) => (
                      <option key={localGovernment} value={localGovernment}>
                        {localGovernment}
                      </option>
                    ))}
                  </select>
                </label>
              </div>
            ) : currentQuestion === 3 ? (
              <fieldset className="mt-8">
                <legend className="sr-only">Religion</legend>
                <div className="grid gap-3 sm:grid-cols-2">
                  {[
                    "Christianity",
                    "Islam",
                    "Traditional",
                    "All in one",
                    "None",
                  ].map((religion) => (
                    <label
                      key={religion}
                      className={[
                        "flex min-h-12 cursor-pointer items-center gap-3 rounded-xl border px-4 py-3 text-sm transition-colors",
                        questionnaireReligion === religion
                          ? "border-[#2D7D7A] bg-[#2D7D7A]/[0.05] text-[#1A3C40]"
                          : "border-[#C8D8DA] bg-white text-[#1A3C40] hover:border-[#2D7D7A]",
                      ].join(" ")}
                    >
                      <input
                        type="radio"
                        name="questionnaire-religion"
                        value={religion}
                        checked={questionnaireReligion === religion}
                        onChange={() => setQuestionnaireReligion(religion)}
                        className="h-5 w-5 shrink-0 accent-[#2D7D7A] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#147b86]"
                      />
                      <span>{religion}</span>
                    </label>
                  ))}
                </div>
              </fieldset>
            ) : currentQuestion === 4 ? (
              <fieldset className="mt-8">
                <legend className="sr-only">
                  Do you have a strong preference for a partner's religion?
                </legend>
                <div className="grid gap-3 sm:grid-cols-2">
                  {["Yes", "No", "I’m Indifferent"].map((preference) => (
                    <label
                      key={preference}
                      className={[
                        "flex min-h-12 cursor-pointer items-center gap-3 rounded-xl border px-4 py-3 text-sm transition-colors",
                        partnerReligionPreference === preference
                          ? "border-[#2D7D7A] bg-[#2D7D7A]/[0.05] text-[#1A3C40]"
                          : "border-[#C8D8DA] bg-white text-[#1A3C40] hover:border-[#2D7D7A]",
                      ].join(" ")}
                    >
                      <input
                        type="radio"
                        name="partner-religion-preference"
                        value={preference}
                        checked={partnerReligionPreference === preference}
                        onChange={() => {
                          setPartnerReligionPreference(preference)
                          if (preference !== "Yes") {
                            setPreferredPartnerReligion("")
                            setQuestionnaireCurrentQuestion(4)
                          } else if (
                            partnerReligionPreference !== "Yes" &&
                            currentQuestion > 4
                          ) {
                            setQuestionnaireCurrentQuestion(4)
                          }
                        }}
                        className="h-5 w-5 shrink-0 accent-[#2D7D7A] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#147b86]"
                      />
                      <span>{preference}</span>
                    </label>
                  ))}
                </div>
              </fieldset>
            ) : needsPreferredReligion && currentQuestion === 5 ? (
              <fieldset className="mt-8">
                <legend className="sr-only">
                  What is the strong preference you are looking for?
                </legend>
                <div className="grid gap-3 sm:grid-cols-2">
                  {["Christianity", "Islam", "Traditional"].map((religion) => (
                    <label
                      key={religion}
                      className={[
                        "flex min-h-12 cursor-pointer items-center gap-3 rounded-xl border px-4 py-3 text-sm transition-colors",
                        preferredPartnerReligion === religion
                          ? "border-[#2D7D7A] bg-[#2D7D7A]/[0.05] text-[#1A3C40]"
                          : "border-[#C8D8DA] bg-white text-[#1A3C40] hover:border-[#2D7D7A]",
                      ].join(" ")}
                    >
                      <input
                        type="radio"
                        name="preferred-partner-religion"
                        value={religion}
                        checked={preferredPartnerReligion === religion}
                        onChange={() => setPreferredPartnerReligion(religion)}
                        className="h-5 w-5 shrink-0 accent-[#2D7D7A] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#147b86]"
                      />
                      <span>{religion}</span>
                    </label>
                  ))}
                </div>
              </fieldset>
            ) : currentQuestion === ageRangeQuestion ? (
              <fieldset className="mt-8">
                <legend className="sr-only">
                  Preferred age range for a partner
                </legend>
                <div className="grid gap-3 sm:grid-cols-2">
                  {["27-32", "33-38", "38+", "I am indifferent"].map(
                    (ageRange) => (
                      <label
                        key={ageRange}
                        className={[
                          "flex min-h-12 cursor-pointer items-center gap-3 rounded-xl border px-4 py-3 text-sm transition-colors",
                          preferredPartnerAgeRange === ageRange
                            ? "border-[#2D7D7A] bg-[#2D7D7A]/[0.05] text-[#1A3C40]"
                            : "border-[#C8D8DA] bg-white text-[#1A3C40] hover:border-[#2D7D7A]",
                        ].join(" ")}
                      >
                        <input
                          type="radio"
                          name="preferred-partner-age-range"
                          value={ageRange}
                          checked={preferredPartnerAgeRange === ageRange}
                          onChange={() => setPreferredPartnerAgeRange(ageRange)}
                          className="h-5 w-5 shrink-0 accent-[#2D7D7A] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#147b86]"
                        />
                        <span>{ageRange}</span>
                      </label>
                    ),
                  )}
                </div>
              </fieldset>
            ) : currentAdditionalQuestion ? (
              <fieldset className="mt-8">
                <legend className="sr-only">
                  {currentAdditionalQuestion.text}
                </legend>
                <div className="grid gap-3 sm:grid-cols-2">
                  {currentAdditionalQuestion.options.map((option) => {
                    const selected = currentAdditionalQuestion.multiple
                      ? Array.isArray(currentAdditionalAnswer) &&
                        currentAdditionalAnswer.includes(option)
                      : currentAdditionalAnswer === option

                    return (
                      <label
                        key={option}
                        className={[
                          "flex min-h-12 cursor-pointer items-center gap-3 rounded-xl border px-4 py-3 text-sm transition-colors",
                          selected
                            ? "border-[#2D7D7A] bg-[#2D7D7A]/[0.05] text-[#1A3C40]"
                            : "border-[#C8D8DA] bg-white text-[#1A3C40] hover:border-[#2D7D7A]",
                        ].join(" ")}
                      >
                        <input
                          type={currentAdditionalQuestion.multiple ? "checkbox" : "radio"}
                          name={`questionnaire-${currentAdditionalQuestion.id}`}
                          value={option}
                          checked={selected}
                          onChange={() => {
                            const previousAnswer = questionnaireAdditionalAnswers[currentAdditionalQuestion.id]
                            const nextAnswer = currentAdditionalQuestion.multiple
                              ? Array.isArray(previousAnswer)
                                ? previousAnswer.includes(option)
                                  ? previousAnswer.filter((answer) => answer !== option)
                                  : [...previousAnswer, option]
                                : [option]
                              : option
                            setQuestionnaireAdditionalAnswers({
                              ...questionnaireAdditionalAnswers,
                              [currentAdditionalQuestion.id]: nextAnswer,
                            })
                          }}
                          className="h-5 w-5 shrink-0 accent-[#2D7D7A] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#147b86]"
                        />
                        <span>{option}</span>
                      </label>
                    )
                  })}
                </div>
              </fieldset>
            ) : null}
          </main>

          <footer className="mt-auto flex flex-col justify-center gap-3 pt-16 sm:flex-row sm:gap-3">
            <button
              type="button"
              onClick={handleDoItLater}
              className="h-12 w-full rounded-[12px] border-2 border-[#147b86] px-8 text-[14px] font-bold text-[#147b86] transition-colors hover:bg-[#eefafa] sm:w-[156px]"
            >
              Do It Later
            </button>

            <button
              type="button"
              onClick={handlePrimaryAction}
              disabled={isPrimaryDisabled}
              className="h-12 w-full rounded-[12px] bg-[#147b86] px-8 text-[14px] font-bold text-white transition-colors hover:bg-[#106b73] disabled:cursor-not-allowed disabled:opacity-50 sm:w-[194px]"
            >
              {currentQuestion < totalQuestions ? "Save and Continue" : "Save and Finish"}
            </button>
          </footer>
        </section>
      </div>

      {questionnaireShowSummary && (
        <SummaryModal
          visible={questionnaireShowSummary}
          onClose={() => setQuestionnaireShowSummary(false)}
          onFinalize={() => {
            setQuestionnaireComplete(true)
            setQuestionnaireShowSummary(false)
            onComplete()
          }}
        />
      )}

      {questionnaireShowLockedModal && (
        <LockedModal
          until={lockedUntil}
          onOk={() => {
            setQuestionnaireShowLockedModal(false)
            onComplete()
          }}
        />
      )}
    </>
  )
}

// ── Payment screens ─────────────────────────────────────────────────────

const PREMIUM_PLAN_FEATURES = [
  "Get connected to community members who are a value-fit.",
  "Free Soft Date Venue Recommendations",
]

const EXCLUSIVE_PLAN_FEATURES = [
  "Get connected to community members who are a value-fit.",
  "One Optional 1-2-1 monthly sessions booking with a community guide to get support on relationship and life issues.",
  "Free Soft Date Venue Recommendations",
  "Automatic membership to our professional Networking community- Convein for online and physical events.",
  "Access to invite-only dinner and red carpet events on Convein.",
]

type PaymentPlan = {
  id: string
  name: string
  price: string
  features: string[]
}

function PaymentPlanCard({
  plan,
  selected,
  onSelect,
}: {
  plan: PaymentPlan
  selected: boolean
  onSelect: () => void
}) {
  return (
    <button
      type="button"
      aria-pressed={selected}
      onClick={onSelect}
      className={[
        'group relative flex h-full min-h-0 flex-col overflow-hidden rounded-[16px] border p-4 text-left transition-all duration-200 hover:-translate-y-1 hover:shadow-[0_16px_32px_rgba(20,80,90,0.13)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#147b86] sm:min-h-[340px] sm:rounded-[18px] sm:p-5',
        selected
          ? 'border-[#147b86] bg-gradient-to-br from-[#f0fbfa] via-white to-[#e8f5f4] shadow-[0_0_0_2px_#147b86,0_12px_28px_rgba(20,123,134,0.14)]'
          : 'border-[#d5e3e6] bg-white hover:border-[#78b5b8]',
      ].join(' ')}
    >
      <span className="mb-3 flex items-start justify-between gap-2 sm:mb-4">
        <span className="text-[18px] font-bold leading-tight tracking-[-0.03em] text-[#1c4050] sm:text-[21px]">
          {plan.name}
        </span>
        {selected && (
          <span className="shrink-0 rounded-full bg-[#147b86] px-2.5 py-1 text-[10px] font-bold text-white">
            Selected
          </span>
        )}
      </span>
      <span className="text-[13px] font-medium text-[#7892a0]">
        Quarterly membership
      </span>
      <span className="mt-1 text-[26px] font-bold tracking-[-0.04em] text-[#087d83] sm:text-[28px]">
        {plan.price}
      </span>
      <ul className="mt-4 space-y-2.5 text-[12px] leading-[1.45] text-[#315b68] sm:mt-5 sm:space-y-3 sm:text-[14px] sm:leading-[1.55]">
        {plan.features.map((feature) => {
          const conveinMatch = feature.includes("Convein")
          const content = conveinMatch
            ? feature.split("Convein").map((part, index, arr) =>
                index === arr.length - 1
                  ? part
                  : (
                    <React.Fragment key={`${part}-${index}`}>
                      {part}
                      <strong style={{ fontWeight: 800 }}>Convein</strong>
                    </React.Fragment>
                  ),
              )
            : feature

          return (
            <li key={feature} className="flex items-start gap-2">
              <span
                className="mt-[0.55rem] h-1.5 w-1.5 shrink-0 rounded-full bg-[#16818a]"
                aria-hidden="true"
              />
              <span
                className={
                  feature.startsWith("Get connected")
                    ? "font-bold text-[#1c4050]"
                    : ""
                }
              >
                {content}
              </span>
            </li>
          )
        })}
      </ul>
    </button>
  )
}

function PaymentOverlayScreen({
  onBack,
  onProceedToMain,
  onSignOut,
}: {
  onBack: () => void
  onProceedToMain?: () => void
  onSignOut: () => void
}) {
  const paymentPlans = [
    {
      id: 'premium',
      name: 'Premium Plan',
      price: '₦5,000',
      features: PREMIUM_PLAN_FEATURES,
    },
    {
      id: 'exclusive',
      name: 'Exclusive Plan',
      price: '₦10,000',
      features: EXCLUSIVE_PLAN_FEATURES,
    },
  ]

  const {
    firstName,
    selectedPlan: savedPlan,
    setSelectedPlan: saveSelectedPlan,
  } = useProgress()
  const [selectedPlan, setSelectedPlan] = useState(
    () => paymentPlans.find((plan) => plan.name === savedPlan?.name)?.id ?? 'premium',
  )

  useEffect(() => {
    const plan = paymentPlans.find((item) => item.id === selectedPlan)
    if (plan) {
      saveSelectedPlan({
        name: plan.name,
        amount: getPlanAmount(plan.price),
      })
    }
  }, [saveSelectedPlan, selectedPlan])

  return (
    <div className="relative min-h-screen">
      <DashboardScreen onSignOut={onSignOut} />

      <div className="fixed inset-0 z-40 flex items-center justify-center bg-[#49626b]/55 px-3 py-4 sm:px-4 sm:py-6">
        <section
          className="max-h-[calc(100dvh-2rem)] w-full max-w-[670px] overflow-y-auto rounded-[18px] bg-white px-4 py-5 shadow-[0_18px_50px_rgba(25,47,54,0.2)] sm:max-h-[calc(100vh-3rem)] sm:rounded-[20px] sm:px-8 sm:py-6 md:px-9"
          role="dialog"
          aria-modal="true"
          aria-labelledby="payment-plan-title"
        >
          <div className="flex flex-col-reverse gap-2 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
            <div className="min-w-0">
              {firstName && (
                <p className="mb-1 text-[14px] font-semibold text-[#147b86]">
                  Hello {firstName}
                </p>
              )}
              <h1
                id="payment-plan-title"
                className="text-[21px] font-bold leading-[1.15] tracking-[-0.035em] text-[#183d4d] sm:text-[26px]"
              >
                Choose your quarterly plan
              </h1>
              <p className="mt-2 max-w-[560px] text-[12px] leading-[1.55] text-[#708a99] sm:text-[13px] sm:leading-5">
                Select your preferred membership tier.
              </p>
            </div>
            <button
              type="button"
              onClick={onSignOut}
              className="min-h-9 self-end text-[12px] font-bold text-[#147b86] hover:text-[#0e5e67] sm:shrink-0 sm:self-auto sm:pt-1"
            >
              Sign Out
            </button>
          </div>

          <p className="mt-5 text-[12px] leading-[1.55] text-[#708a99] sm:mt-10">
            Membership subscription is billed every 3 months.
          </p>

          <div className="mt-4 grid gap-3 sm:mt-6 sm:grid-cols-2 sm:gap-4">
            {paymentPlans.map((plan) => {
              const selected = selectedPlan === plan.id
              return (
                <PaymentPlanCard
                  key={plan.id}
                  plan={plan}
                  selected={selected}
                  onSelect={() => setSelectedPlan(plan.id)}
                />
              )
            })}
          </div>

          <div className="sticky bottom-[-1.25rem] z-10 mt-5 flex justify-center bg-white/95 py-2 backdrop-blur-sm">
            <button
              type="button"
              onClick={onProceedToMain}
              className="h-11 w-full max-w-[260px] rounded-[10px] bg-[#147b86] px-4 text-[13px] font-bold text-white hover:bg-[#106b73] sm:h-10 sm:min-w-[190px] sm:w-auto sm:px-6"
            >
              Proceed to Payment
            </button>
          </div>
        </section>
      </div>
    </div>
  )
}

function OverLayThingsScreen({
  onBack,
  onProceedToMain,
  onSignOut,
}: {
  onBack?: () => void
  onProceedToMain?: () => void
  onSignOut: () => void
}) {
  return (
    <PaymentOverlayScreen
      onBack={onBack ?? (() => undefined)}
      onProceedToMain={onProceedToMain}
      onSignOut={onSignOut}
    />
  )
}

function PaymentOverlayFemaleScreen({
  onBack,
  onProceedToMain,
  onSignOut,
}: {
  onBack: () => void
  onProceedToMain?: () => void
  onSignOut: () => void
}) {
  const femalePlans = [
    {
      id: 'premium',
      name: 'Premium Plan',
      price: '₦5,000',
      features: PREMIUM_PLAN_FEATURES,
    },
    {
      id: 'exclusive',
      name: 'Exclusive Plan',
      price: '₦10,000',
      features: EXCLUSIVE_PLAN_FEATURES,
    },
  ]

  const {
    firstName,
    selectedPlan: savedPlan,
    setSelectedPlan: saveSelectedPlan,
  } = useProgress()
  const [selectedPlan, setSelectedPlan] = useState(
    () => femalePlans.find((plan) => plan.name === savedPlan?.name)?.id ?? 'premium',
  )

  useEffect(() => {
    const plan = femalePlans.find((item) => item.id === selectedPlan)
    if (plan) {
      saveSelectedPlan({
        name: plan.name,
        amount: getPlanAmount(plan.price),
      })
    }
  }, [saveSelectedPlan, selectedPlan])

  return (
    <div className="relative min-h-screen">
      <DashboardScreen onSignOut={onSignOut} />

      <div className="fixed inset-0 z-40 flex items-center justify-center bg-[#49626b]/55 px-3 py-4 sm:px-4 sm:py-6">
        <section
          className="max-h-[calc(100dvh-2rem)] w-full max-w-[670px] overflow-y-auto rounded-[18px] bg-white px-4 py-5 shadow-[0_18px_50px_rgba(25,47,54,0.2)] sm:max-h-[calc(100vh-3rem)] sm:rounded-[20px] sm:px-8 sm:py-6 md:px-9"
          role="dialog"
          aria-modal="true"
          aria-labelledby="female-payment-plan-title"
        >
          <div className="flex flex-col-reverse gap-2 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
            <div className="min-w-0">
              {firstName && (
                <p className="mb-1 text-[14px] font-semibold text-[#147b86]">
                  Hello {firstName}
                </p>
              )}
              <h1
                id="female-payment-plan-title"
                className="text-[21px] font-bold leading-[1.15] tracking-[-0.035em] text-[#183d4d] sm:text-[26px]"
              >
                Choose your quarterly plan
              </h1>
              <p className="mt-2 max-w-[560px] text-[12px] leading-[1.55] text-[#708a99] sm:text-[13px] sm:leading-5">
                Membership subscription is billed every 3 months.
              </p>
            </div>
            <button
              type="button"
              onClick={onSignOut}
              className="min-h-9 self-end text-[12px] font-bold text-[#147b86] hover:text-[#0e5e67] sm:shrink-0 sm:self-auto sm:pt-1"
            >
              Sign Out
            </button>
          </div>

          <div className="mt-4 grid gap-3 sm:mt-6 sm:grid-cols-2 sm:gap-4">
            {femalePlans.map((plan) => {
              const selected = selectedPlan === plan.id
              return (
                <PaymentPlanCard
                  key={plan.id}
                  plan={plan}
                  selected={selected}
                  onSelect={() => setSelectedPlan(plan.id)}
                />
              )
            })}
          </div>

          <div className="sticky bottom-[-1.25rem] z-10 mt-5 flex justify-center bg-white/95 py-2 backdrop-blur-sm">
            <button
              type="button"
              onClick={onProceedToMain}
              className="h-11 w-full max-w-[260px] rounded-[10px] bg-[#147b86] px-4 text-[13px] font-bold text-white hover:bg-[#106b73] sm:h-10 sm:min-w-[190px] sm:w-auto sm:px-6"
            >
              Proceed to Payment
            </button>
          </div>
        </section>
      </div>
    </div>
  )
}

function Overlay27_37Screen({
  onBack,
  onProceedToMain,
  onSignOut,
}: {
  onBack: () => void
  onProceedToMain?: () => void
  onSignOut: () => void
}) {
  const plans27To37 = [
    {
      id: "premium",
      name: "Premium Plan",
      price: "₦5,000",
      features: PREMIUM_PLAN_FEATURES,
    },
    {
      id: "exclusive",
      name: "Exclusive Plan",
      price: "₦10,000",
      features: EXCLUSIVE_PLAN_FEATURES,
    },
  ]

  const {
    firstName,
    selectedPlan: savedPlan,
    setSelectedPlan: saveSelectedPlan,
  } = useProgress()
  const [selectedPlan, setSelectedPlan] = useState(
    () => plans27To37.find((plan) => plan.name === savedPlan?.name)?.id ?? "premium",
  )

  useEffect(() => {
    const plan = plans27To37.find((item) => item.id === selectedPlan)
    if (plan) {
      saveSelectedPlan({
        name: plan.name,
        amount: getPlanAmount(plan.price),
      })
    }
  }, [saveSelectedPlan, selectedPlan])

  return (
    <div className="relative min-h-screen">
      <DashboardScreen onSignOut={onSignOut} />

      <div className="fixed inset-0 z-40 flex items-center justify-center bg-[#49626b]/55 px-3 py-4 sm:px-4 sm:py-6">
        <section
          className="max-h-[calc(100dvh-2rem)] w-full max-w-[670px] overflow-y-auto rounded-[18px] bg-white px-4 py-5 shadow-[0_18px_50px_rgba(25,47,54,0.2)] sm:max-h-[calc(100vh-3rem)] sm:rounded-[20px] sm:px-8 sm:py-6 md:px-9"
          role="dialog"
          aria-modal="true"
          aria-labelledby="age-27-37-payment-title"
        >
          <div className="flex flex-col-reverse gap-2 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
            <div className="min-w-0">
              {firstName && (
                <p className="mb-1 text-[14px] font-semibold text-[#147b86]">
                  Hello {firstName}
                </p>
              )}
              <h1
                id="age-27-37-payment-title"
                className="text-[21px] font-bold leading-[1.15] tracking-[-0.035em] text-[#183d4d] sm:text-[26px]"
              >
                Choose your quarterly plan
              </h1>
              <p className="mt-2 text-[12px] leading-[1.55] text-[#708a99] sm:text-[13px] sm:leading-5">
                Select your preferred membership tier.
              </p>
            </div>
            <button
              type="button"
              onClick={onSignOut}
              className="min-h-9 self-end text-[12px] font-bold text-[#147b86] hover:text-[#0e5e67] sm:shrink-0 sm:self-auto sm:pt-1"
            >
              Sign Out
            </button>
          </div>

          <p className="mt-5 text-[12px] leading-[1.55] text-[#708a99] sm:mt-10">
            Membership subscription is billed every 3 months.
          </p>

          <div className="mt-4 grid gap-3 sm:mt-6 sm:grid-cols-2 sm:gap-4">
            {plans27To37.map((plan) => {
              const selected = selectedPlan === plan.id
              return (
                <PaymentPlanCard
                  key={plan.id}
                  plan={plan}
                  selected={selected}
                  onSelect={() => setSelectedPlan(plan.id)}
                />
              )
            })}
          </div>

          <div className="sticky bottom-[-1.25rem] z-10 mt-5 flex justify-center bg-white/95 py-2 backdrop-blur-sm">
            <button
              type="button"
              onClick={onProceedToMain}
              className="h-11 w-full max-w-[260px] rounded-[10px] bg-[#147b86] px-4 text-[13px] font-bold text-white hover:bg-[#106b73] sm:h-10 sm:min-w-[190px] sm:w-auto sm:px-6"
            >
              Proceed to Payment
            </button>
          </div>
        </section>
      </div>
    </div>
  )
}

function MainPaymentScreen({
  onBack,
  onPayNow,
  onSignOut,
}: {
  onBack: () => void
  onPayNow?: () => void
  onSignOut: () => void
}) {
  const [paymentOption, setPaymentOption] = useState('Option 1')
  const [isProcessingPayment, setIsProcessingPayment] = useState(false)
  const { firstName, selectedPlan } = useProgress()
  const plan = selectedPlan ?? {
    name: "Premium Plan",
    amount: 5000,
  }

  useEffect(() => {
    if (!isProcessingPayment) return

    const timer = window.setTimeout(() => {
      onPayNow?.()
    }, 5000)

    return () => window.clearTimeout(timer)
  }, [isProcessingPayment, onPayNow])

  return (
    <div className="relative min-h-screen">
      <DashboardScreen onSignOut={onSignOut} />

      {isProcessingPayment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#49626b]/65 px-4 py-6">
          <section
            className="flex w-full max-w-sm flex-col items-center rounded-[20px] bg-white px-8 py-10 text-center shadow-[0_18px_50px_rgba(25,47,54,0.2)]"
            role="dialog"
            aria-modal="true"
            aria-labelledby="payment-processing-title"
            aria-busy="true"
          >
            <div
              className="mb-6 h-14 w-14 animate-spin rounded-full border-[5px] border-[#d9e9e7] border-t-[#147b86]"
              role="status"
              aria-label="Processing payment"
            />
            <h2
              id="payment-processing-title"
              className="text-xl font-bold text-[#183d4d]"
            >
              Processing your payment
            </h2>
            <p className="mt-2 text-sm text-[#708a99]">
              Please wait while we confirm your payment.
            </p>
          </section>
        </div>
      )}

      <div className="fixed inset-0 z-40 flex items-center justify-center bg-[#49626b]/55 px-3 py-4 sm:px-4 sm:py-6">
        <section
          className="flex max-h-[calc(100dvh-2rem)] w-full max-w-[670px] flex-col overflow-y-auto rounded-[18px] bg-white px-4 py-5 shadow-[0_18px_50px_rgba(25,47,54,0.2)] sm:max-h-[calc(100vh-3rem)] sm:rounded-[20px] sm:px-8 sm:py-6 md:px-9"
          role="dialog"
          aria-modal="true"
          aria-labelledby="main-payment-title"
        >
          <div className="flex flex-col-reverse gap-2 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
            <div className="min-w-0">
              {firstName && (
                <p className="mb-1 text-[14px] font-semibold text-[#147b86]">
                  Hello {firstName}
                </p>
              )}
              <h1
                id="main-payment-title"
                className="text-[21px] font-bold leading-[1.15] tracking-[-0.035em] text-[#183d4d] sm:text-[26px]"
              >
                Complete your payment
              </h1>
              <p className="mt-2 text-[12px] leading-5 text-[#708a99] sm:text-[13px]">
                Proceed with the selected plan to continue your Courtium onboarding.
              </p>
            </div>
            <button
              type="button"
              onClick={onSignOut}
              className="min-h-9 self-end text-[12px] font-bold text-[#147b86] hover:text-[#0e5e67] sm:shrink-0 sm:self-auto sm:pt-1"
            >
              Sign Out
            </button>
          </div>

          <p className="mt-4 text-[12px] font-bold leading-[1.5] text-[#708a99] sm:mt-6">
            Selected plan: {plan.name}
          </p>

          <div className="mt-4 grid gap-3 sm:mt-5 sm:gap-5 md:grid-cols-[1fr_1.08fr]">
            <div>
              <div className="rounded-[15px] border border-[#d9e3e7] bg-[#f5f9fa] px-4 py-4 sm:px-5">
                <h2 className="text-[18px] font-bold text-[#1c4050]">Order summary</h2>
                <p className="mt-3 text-[11px] font-medium text-[#7892a0]">
                  Quarterly {plan.name} membership
                </p>
                <div className="mt-5 space-y-2 sm:mt-8">
                  <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1 text-[11px] text-[#7892a0]">
                    <span>Plan amount</span>
                    <span>{formatNaira(plan.amount)}</span>
                  </div>
                  <div className="border-t border-[#d9e3e7] pt-3">
                    <p className="text-[11px] text-[#7892a0]">Amount payable</p>
                    <p className="mt-1 text-[25px] font-bold tracking-[-0.04em] text-[#087d83]">
                      {formatNaira(plan.amount)}
                    </p>
                  </div>
                </div>
              </div>

              <label
                className="mt-5 block text-[11px] font-bold text-[#21495a] sm:mt-10"
                htmlFor="billing-contact"
              >
                Billing contact
              </label>
              <input
                id="billing-contact"
                type="email"
                placeholder="name@example.com"
                className="mt-2 h-10 w-full rounded-[9px] border border-[#d0dfe4] px-3 text-[11px] text-[#21495a] outline-none placeholder:text-[#8da4af] focus:border-[#147b86]"
              />
              <p className="mt-3 text-[11px] leading-5 text-[#8aa0aa] sm:mt-5">
                After payment, you will be redirected back to the dashboard.
              </p>
            </div>

            <div className="rounded-[15px] border border-[#d9e3e7] px-4 py-4 sm:px-5">
              <h2 className="text-[18px] font-bold text-[#1c4050]">Payment options</h2>
              <p className="mt-2 text-[11px] text-[#7892a0]">Choose a payment option below</p>
              <div className="mt-5 space-y-2">
                {['Option 1', 'Option 2', 'Option 3'].map((option) => {
                  const selected = paymentOption === option

                  return (
                    <button
                      key={option}
                      type="button"
                      onClick={() => setPaymentOption(option)}
                      className={[
                        'flex h-11 w-full items-center gap-3 rounded-[10px] border px-3 text-left text-[11px] font-bold text-[#21495a] transition-colors',
                        selected
                          ? 'border-[#147b86] bg-[#f7fbfb]'
                          : 'border-[#d0dfe4] hover:border-[#147b86]',
                      ].join(' ')}
                    >
                      <span
                        className={[
                          'flex h-4 w-4 items-center justify-center rounded-full border-2 border-[#147b86]',
                          selected ? 'bg-[#147b86]' : 'bg-white',
                        ].join(' ')}
                      >
                        {selected && <span className="h-1.5 w-1.5 rounded-full bg-white" />}
                      </span>
                      {option}
                    </button>
                  )
                })}
              </div>
            </div>
          </div>

          <div className="sticky bottom-[-1.25rem] z-10 -mx-4 mt-7 flex flex-col-reverse justify-center gap-2 bg-white/95 px-4 py-2 backdrop-blur-sm sm:static sm:mx-0 sm:mt-14 sm:flex-row sm:gap-3 sm:bg-transparent sm:px-0 sm:py-0 sm:backdrop-blur-none">
            <button
              type="button"
              onClick={onBack}
              className="h-11 w-full rounded-[10px] border-2 border-[#147b86] px-4 text-[13px] font-bold text-[#147b86] hover:bg-[#eefafa] sm:h-10 sm:w-auto sm:min-w-[125px] sm:px-6"
            >
              Back
            </button>
            <button
              type="button"
              onClick={() => setIsProcessingPayment(true)}
              disabled={isProcessingPayment}
              className="h-11 w-full rounded-[10px] bg-[#147b86] px-4 py-3 text-[13px] font-bold text-white hover:bg-[#106b73] sm:h-10 sm:w-auto sm:min-w-[166px] sm:px-6"
            >
              Pay Now
            </button>
          </div>
        </section>
      </div>
    </div>
  )
}

function PaymentSuccessfulScreen({
  onContinue,
  onSignOut,
}: {
  onContinue: () => void
  onSignOut: () => void
}) {
  return (
    <div className="relative min-h-screen">
      <DashboardScreen onSignOut={onSignOut} />

      <div className="fixed inset-0 z-40 flex items-center justify-center bg-[#49626b]/55 px-3 py-4 sm:px-4 sm:py-6">
        <section
          className="flex max-h-[calc(100dvh-2rem)] min-h-0 w-full max-w-[524px] flex-col items-center justify-center overflow-y-auto rounded-[22px] border border-[#2D7D7A]/20 px-5 py-7 text-center shadow-[0_24px_70px_rgba(20,70,74,0.24)] sm:min-h-[450px] sm:rounded-[24px] sm:px-10 sm:py-10"
          style={{ background: SUCCESS_DIALOG_BACKGROUND }}
          role="dialog"
          aria-modal="true"
          aria-labelledby="payment-success-title"
        >
          <svg
            viewBox="0 0 48 48"
            className="animate-modal-icon h-14 w-14 shrink-0 text-[#2D7D7A] sm:h-16 sm:w-16"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <circle cx="24" cy="24" r="19" />
            <path d="m15 24 6 6 12-13" />
          </svg>

          <h1
            id="payment-success-title"
            className="mt-5 max-w-[24ch] break-words text-balance text-[24px] font-bold leading-tight tracking-[-0.04em] text-[#183d4d] sm:text-[29px]"
          >
            Payment successful
          </h1>
          <p className="mt-2 max-w-[32ch] break-words text-balance text-sm leading-relaxed text-[#4A6B6F]">
            Your membership payment has been confirmed.
            <br />
            You can now continue to your dashboard.
          </p>

          <button
            type="button"
            onClick={onContinue}
            className="mt-10 h-11 w-full max-w-[280px] rounded-[10px] bg-[#147b86] px-5 text-[13px] font-bold text-white hover:bg-[#106b73] sm:mt-24 sm:w-auto sm:px-6"
          >
            Ok
          </button>
        </section>
      </div>
    </div>
  )
}

function ContinueToDashboardScreen({
  onContinue,
  onSignOut,
}: {
  onContinue: () => void
  onSignOut: () => void
}) {
  return (
    <div className="relative min-h-screen">
      <DashboardScreen onSignOut={onSignOut} />
      <div className="fixed inset-0 z-40 flex items-center justify-center bg-[#49626b]/60 px-4 py-6">
        <section
          className="flex min-h-[354px] w-full max-w-[708px] flex-col rounded-[24px] bg-white px-8 py-10 shadow-[0_18px_50px_rgba(25,47,54,0.2)] sm:px-9 md:px-10"
          role="dialog"
          aria-modal="true"
          aria-labelledby="continue-dashboard-title"
        >
          <h1
            id="continue-dashboard-title"
            className="text-[20px] font-bold tracking-[-0.03em] text-[#183d4d] sm:text-[21px]"
          >
            Let’s get to know more about you and your desired partner
          </h1>
          <p className="mt-12 text-center text-[12px] text-[#7892a0]">
            This will take about 10 minutes to complete.
          </p>

          <div className="mt-auto flex justify-center pt-16">
            <button
              type="button"
              onClick={onContinue}
              className="h-14 w-full rounded-[13px] bg-[#147b86] px-8 text-[14px] font-bold text-white hover:bg-[#106b73] sm:w-[240px]"
            >
              Continue to Questionnaire
            </button>
          </div>
        </section>
      </div>
    </div>
  )
}

// ── Selfie upload screen ───────────────────────────────────────────────────

function SelfieUploadScreen({
  onSubmit,
  onSkip,
  onSignOut,
}: {
  onSubmit: () => void
  onSkip?: () => void
  onSignOut: () => void
}) {
  const { profilePhoto, setProfilePhoto, firstName } = useProgress()
  const [preview, setPreview] = useState<string | null>(profilePhoto ?? null)
  const [file, setFile] = useState<File | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement | null>(null)

  useEffect(() => {
    setPreview(profilePhoto ?? null)
  }, [profilePhoto])

  const readFileToDataUrl = (f: File) =>
    new Promise<string>((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = () => resolve(String(reader.result))
      reader.onerror = reject
      reader.readAsDataURL(f)
    })

  const handleFile = async (f: File | null) => {
    setError(null)
    if (!f) {
      setPreview(null)
      setFile(null)
      setProfilePhoto(null)
      return
    }
    setFile(f)

    try {
      const dataUrl = await readFileToDataUrl(f)
      setPreview(dataUrl)
      setProfilePhoto(dataUrl)
    } catch {
      setError("Unable to read image. Please try another file.")
    }
  }

  const onInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const picked = e.target.files && e.target.files[0]
    handleFile(picked ?? null)
  }

  const handleRetake = () => {
    setPreview(null)
    setFile(null)
    setProfilePhoto(null)
    inputRef.current?.click()
  }

  const handleSubmit = async () => {
    setError(null)
    if (!file && !preview) {
      setError("Please take or choose a selfie first.")
      return
    }

    setIsSubmitting(true)
    try {
      let uploadUrl = preview

      if (file) {
        const formData = new FormData()
        formData.append("selfie", file, file.name)

        const response = await fetch("/api/upload-selfie", {
          method: "POST",
          body: formData,
        })

        if (!response.ok) {
          const text = await response.text()
          throw new Error(text || "Upload failed")
        }

        let data: any = null
        try {
          data = await response.json()
        } catch {
          data = null
        }

        if (data && typeof data.imageUrl === "string") {
          uploadUrl = data.imageUrl
          setProfilePhoto(uploadUrl)
        } else {
          const location = response.headers.get("Location")
          if (location) {
            uploadUrl = location
            setProfilePhoto(location)
          } else if (preview) {
            setProfilePhoto(preview)
            uploadUrl = preview
          } else {
            setProfilePhoto(null)
          }
        }
      } else if (preview) {
        const formData = new FormData()
        formData.append("selfieDataUrl", preview)

        const response = await fetch("/api/upload-selfie", {
          method: "POST",
          body: formData,
        })

        if (!response.ok) {
          setProfilePhoto(preview)
          uploadUrl = preview
        } else {
          let data: any = null
          try {
            data = await response.json()
          } catch {
            data = null
          }
          if (data && typeof data.imageUrl === "string") {
            uploadUrl = data.imageUrl
            setProfilePhoto(uploadUrl)
          } else {
            setProfilePhoto(preview)
            uploadUrl = preview
          }
        }
      }

      setError(null)

      await new Promise((resolve) => setTimeout(resolve, 400))
      onSubmit()
    } catch (err) {
      console.error(err)
      setError("We couldn't upload your selfie. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="relative min-h-screen">
      <DashboardScreen onSignOut={onSignOut} />

      <div className="fixed inset-0 z-40 flex items-center justify-center bg-[#49626b]/55 px-3 py-4">
        <section
          className="w-full max-w-[540px] rounded-[18px] bg-white px-6 py-8 shadow-[0_18px_50px_rgba(25,47,54,0.2)]"
          role="dialog"
          aria-modal="true"
          aria-labelledby="selfie-title"
        >
          <div className="text-center">
            <h2 id="selfie-title" className="text-[20px] font-bold text-[#183d4d]">
              Upload a selfie to complete your profile
            </h2>
            <p className="mt-2 text-sm text-[#708a99]">
              This helps us verify profiles in the community. Please use a clear front-facing photo.
            </p>
          </div>

          <div className="mt-6 flex flex-col items-center gap-4">
            <div
              className="h-[200px] w-[200px] rounded-md overflow-hidden border border-[#dbecec] bg-[#f8fbfb] flex items-center justify-center"
              aria-hidden
            >
              {preview ? (
                <img src={preview} alt="Selfie preview" className="h-full w-full object-cover" />
              ) : (
                <div className="px-4 text-sm text-[#7892a0]">No selfie yet</div>
              )}
            </div>

            <div className="flex gap-2">
              <input
                ref={inputRef}
                type="file"
                accept="image/*"
                capture="user"
                onChange={onInputChange}
                className="hidden"
              />
              <button
                type="button"
                onClick={() => inputRef.current?.click()}
                className="rounded-md bg-[#147b86] px-4 py-2 text-sm font-bold text-white hover:bg-[#106b73]"
              >
                {preview ? "Upload / Re-Upload" : "Upload Selfie"}
              </button>

              <button
                type="button"
                onClick={handleRetake}
                className="rounded-md border border-[#147b86] px-4 py-2 text-sm font-bold text-[#147b86] hover:bg-[#eefafa]"
                disabled={!preview}
              >
                Re-take
              </button>
            </div>

            <div className="w-full mt-2">
              <button
                type="button"
                onClick={handleSubmit}
                className="w-full rounded-md bg-[#147b86] px-4 py-3 text-sm font-bold text-white hover:bg-[#106b73]"
                disabled={isSubmitting || !preview}
              >
                {isSubmitting ? "Uploading…" : "Submit"}
              </button>

              <button
                type="button"
                onClick={() => onSkip?.()}
                className="mt-3 w-full rounded-md border border-[#d0dfe4] px-4 py-3 text-sm text-[#21495a] bg-white"
              >
                Skip for now
              </button>
            </div>

            {error && <p className="mt-2 text-sm text-[#DC2626]">{error}</p>}
            <p className="mt-3 text-xs text-[#8aa0aa] text-center">
              By submitting, you confirm this photo is of you and may be used for verification.
            </p>
          </div>
        </section>
      </div>
    </div>
  )
}

// ── App router ────────────────────────────────────────────────────────────

type Screen =
  | "splash"
  | "checkfit"
  | "questions"
  | "signup"
  | "signin"
  | "overlay"
  | "payment"
  | "payment-female"
  | "payment-27-37"
  | "main-payment"
  | "payment-success"
  | "continue-dashboard"
  | "questionnaire"
  | "selfie"
  | "dashboard"

function AppRouter() {
  const [screen, setScreen] = useState<Screen>("splash")

  const {
    questionnaireCurrentQuestion,
    setQuestionnaireCurrentQuestion,
    questionnaireShowSummary,
    setQuestionnaireShowSummary,
    questionnaireShowLockedModal,
    setQuestionnaireShowLockedModal,
  } = useProgress()

  const readResume = () => {
    try {
      const raw = sessionStorage.getItem(RESUME_STORAGE_KEY)
      if (!raw) return null
      return JSON.parse(raw)
    } catch {
      return null
    }
  }

  useEffect(() => {
    try {
      const creds = sessionStorage.getItem(CREDENTIALS_STORAGE_KEY)
      if (!creds) return

      const resume = readResume()
      if (resume && typeof resume.screen === "string") {
        if (resume.questionnaire) {
          const q = resume.questionnaire
          if (typeof q.currentQuestion === "number") {
            setQuestionnaireCurrentQuestion(q.currentQuestion)
          }
          if (typeof q.showSummary === "boolean") {
            setQuestionnaireShowSummary(q.showSummary)
          }
          if (typeof q.showLockedModal === "boolean") {
            setQuestionnaireShowLockedModal(q.showLockedModal)
          }
        }

        setScreen(resume.screen)
      } else {
        setScreen("dashboard")
      }
    } catch {
      // ignore and remain on splash
    }
  }, [])

  const handleSignOut = () => {
    try {
      const resume = {
        screen,
        questionnaire: {
          currentQuestion: questionnaireCurrentQuestion ?? null,
          showSummary: questionnaireShowSummary ?? false,
          showLockedModal: questionnaireShowLockedModal ?? false,
        },
        savedAt: new Date().toISOString(),
      }
      sessionStorage.setItem(RESUME_STORAGE_KEY, JSON.stringify(resume))
    } catch {
      // ignore storage errors
    }

    setScreen("splash")
  }

  if (screen === "checkfit") {
    return (
      <CheckFitScreen
        onBack={() => setScreen("splash")}
        onProceed={() => setScreen("questions")}
      />
    )
  }

  if (screen === "questions") {
    return (
      <CommunityQuestionsScreen
        onBack={() => setScreen("checkfit")}
        onFit={() => setScreen("signup")}
        onIneligible={() => setScreen("splash")}
      />
    )
  }

  if (screen === "overlay") {
    return (
      <OverLayThingsScreen
        onBack={() => setScreen("splash")}
        onProceedToMain={() => setScreen("main-payment")}
        onSignOut={handleSignOut}
      />
    )
  }

  if (screen === "payment") {
    return (
      <PaymentOverlayScreen
        onBack={() => setScreen("overlay")}
        onProceedToMain={() => setScreen("main-payment")}
        onSignOut={handleSignOut}
      />
    )
  }

  if (screen === "payment-female") {
    return (
      <PaymentOverlayFemaleScreen
        onBack={() => setScreen("payment")}
        onProceedToMain={() => setScreen("main-payment")}
        onSignOut={handleSignOut}
      />
    )
  }

  if (screen === "payment-27-37") {
    return (
      <Overlay27_37Screen
        onBack={() => setScreen("payment")}
        onProceedToMain={() => setScreen("main-payment")}
        onSignOut={handleSignOut}
      />
    )
  }

  if (screen === "main-payment") {
    return (
      <MainPaymentScreen
        onBack={() => setScreen("payment-female")}
        onPayNow={() => setScreen("payment-success")}
        onSignOut={handleSignOut}
      />
    )
  }

  if (screen === "payment-success") {
    return (
      <PaymentSuccessfulScreen
        onContinue={() => setScreen("continue-dashboard")}
        onSignOut={handleSignOut}
      />
    )
  }

  if (screen === "continue-dashboard") {
    return (
      <ContinueToDashboardScreen
        onContinue={() => setScreen("questionnaire")}
        onSignOut={handleSignOut}
      />
    )
  }

  if (screen === "questionnaire") {
    return (
      <QuestionnaireScreen
        onLater={() => setScreen("dashboard")}
        onComplete={() => setScreen("selfie")}
        onSignOut={handleSignOut}
      />
    )
  }

  if (screen === "selfie") {
    return (
      <SelfieUploadScreen
        onSubmit={() => setScreen("dashboard")}
        onSkip={() => setScreen("dashboard")}
        onSignOut={handleSignOut}
      />
    )
  }

  if (screen === "dashboard") {
    return (
      <DashboardScreen
        onOpenQuestionnaire={() => setScreen("questionnaire")}
        onSignOut={handleSignOut}
      />
    )
  }

  if (screen === "signup") {
    return (
      <SignUpScreen
        onShowOverlay={(destination) => setScreen(destination)}
        onSignIn={() => setScreen("signin")}
      />
    )
  }

  if (screen === "signin") {
    return (
      <LoginScreen
        onBack={() => setScreen("splash")}
        onProceedToOverlay={(destination) => setScreen(destination as Screen)}
      />
    )
  }

  return (
    <SplashScreen
      onGetStarted={() => setScreen("checkfit")}
      onSignIn={() => setScreen("signin")}
    />
  )
}

export default function App() {
  return (
    <ProgressProvider>
      <AppRouter />
    </ProgressProvider>
  )
}