// React types are unavailable in this project; suppress TypeScript declaration and JSX errors.
// @ts-nocheck
// @ts-ignore
import { createContext, useContext, useEffect, useState } from "react"
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

type ProgressState = {
  firstName: string
  gender: string
  age: number | null
  selectedPlan: {
    name: string
    amount: number
    discountPercent: number
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
  questionnaireComplete: boolean
}

type ProgressContextValue = ProgressState & {
  setFirstName: (firstName: string) => void
  setGender: (gender: string) => void
  setAge: (age: number | null) => void
  setSelectedPlan: (plan: ProgressState["selectedPlan"]) => void
  setQuestionnaireLocation: (
    location: ProgressState["questionnaireLocation"],
  ) => void
  setQuestionnaireOrigin: (
    location: ProgressState["questionnaireOrigin"],
  ) => void
  setQuestionnaireReligion: (religion: string) => void
  setPartnerReligionPreference: (preference: string) => void
  setPreferredPartnerReligion: (religion: string) => void
  setPreferredPartnerAgeRange: (ageRange: string) => void
  setQuestionnaireComplete: (complete: boolean) => void
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
  questionnaireComplete: false,
}
const PROGRESS_STORAGE_KEY = "courtium-progress"
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
        typeof parsed.selectedPlan.amount === "number" &&
        typeof parsed.selectedPlan.discountPercent === "number"
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
      questionnaireComplete: parsed.questionnaireComplete === true,
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
    setQuestionnaireComplete: (questionnaireComplete) =>
      setProgress((current) => ({ ...current, questionnaireComplete })),
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

function AppShell({
  onCancel,
  children,
}: {
  onCancel: () => void
  children: React.ReactNode
}) {
  return (
    <div
      className="relative isolate flex min-h-screen flex-col overflow-hidden"
      style={{
        background: APP_BACKGROUND,
      }}
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-32 -top-40 -z-10 h-[35rem] w-[35rem] rounded-full bg-white/40 blur-3xl"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-32 -left-28 -z-10 h-[32rem] w-[32rem] rounded-full bg-[#2D7D7A]/8 blur-3xl"
      />
      <header className="flex items-center justify-between px-6 py-4">
        <div className="flex items-center gap-3" style={{ color: "white" }}>
          <LogoIcon className="w-9 h-9" />
          <LogoLabel className="h-auto w-32" />
        </div>
        <button
          onClick={onCancel}
          className="px-6 py-2 rounded-xl text-sm font-semibold cursor-pointer transition-colors hover:bg-gray-50"
          style={{ backgroundColor: "white", color: T.teal }}
        >
          Cancel
        </button>
      </header>
      <div className="flex-1 flex items-center justify-center px-4 py-8">
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
      className="relative isolate flex min-h-screen flex-col items-center justify-center overflow-hidden px-6"
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
        <p
          className="text-xl font-semibold text-center"
          style={{ color: T.teal }}
        >
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
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-8 flex flex-col items-center gap-6">
        {/* Icon */}
        <div
          className="w-16 h-16 rounded-full flex items-center justify-center"
          style={{ backgroundColor: "#FFF3CD" }}
        >
          <svg
            viewBox="0 0 24 24"
            className="w-8 h-8"
            fill="none"
            stroke="#B8860B"
            strokeWidth="1.6"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M12 2L4 5.5v6c0 5 3.6 9.7 8 10.5 4.4-.8 8-5.5 8-10.5v-6L12 2z" />
            <line x1="12" y1="9" x2="12" y2="13" />
            <circle cx="12" cy="16" r="0.6" fill="#B8860B" stroke="none" />
          </svg>
        </div>

        {/* Message */}
        <p
          className="text-center text-base font-semibold leading-relaxed"
          style={{ color: T.headingDark }}
        >
          {message}
        </p>

        {/* Exit button */}
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
  const [validationStatus, setValidationStatus] = useState<
    "loading" | "success" | null
  >(null)
  const [showNinConfirmation, setShowNinConfirmation] = useState(false)
  const [touched, setTouched] =
    useState<Partial<Record<keyof typeof form, boolean>>>({})
  const [submitAttempted, setSubmitAttempted] = useState(false)

  useEffect(() => {
    if (validationStatus !== "loading") return

    const timer = window.setTimeout(() => {
      setValidationStatus("success")
    }, 5000)

    return () => window.clearTimeout(timer)
  }, [validationStatus])

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

    // Re-validate age on submit — catches cases where blur never fired
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
    <AppShell onCancel={onBack}>
      <AgeModal type={ageError} onExit={() => setAgeError(null)} />

      {showNinConfirmation && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 px-4 py-6">
          <section
            className="flex w-full max-w-[420px] flex-col items-center rounded-[24px] bg-white px-8 py-11 text-center shadow-2xl sm:px-12"
            role="dialog"
            aria-modal="true"
            aria-labelledby="nin-confirmation-title"
          >
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-[#f9e9e7]">
              <span
                className="text-[32px] font-bold leading-none text-[#b64e45]"
                aria-hidden="true"
              >
                !
              </span>
            </div>
            <h3
              id="nin-confirmation-title"
              className="mt-11 max-w-[300px] text-[18px] font-bold leading-[1.25] text-[#183d4d]"
            >
              Are you sure all your details are the same as those on your NIN?
            </h3>
            <div className="mt-11 flex w-full max-w-[274px] gap-8">
              <button
                type="button"
                onClick={() => setShowNinConfirmation(false)}
                className="h-[30px] flex-1 rounded-[8px] border border-[#147b86] text-[13px] font-bold text-[#147b86] hover:bg-[#eefafa]"
              >
                NO
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowNinConfirmation(false)
                  setValidationStatus("loading")
                }}
                className="h-[30px] flex-1 rounded-[8px] bg-[#20777b] text-[13px] font-bold text-white hover:bg-[#1a666a]"
              >
                YES
              </button>
            </div>
          </section>
        </div>
      )}

      {validationStatus && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 px-4"
          role="presentation"
        >
          <div
            className="flex w-full max-w-sm flex-col items-center rounded-2xl bg-white p-8 text-center shadow-2xl"
            role="dialog"
            aria-modal="true"
            aria-labelledby="identity-validation-title"
            aria-busy={validationStatus === "loading"}
          >
            {validationStatus === "loading" ? (
              <>
                <div
                  className="mb-6 h-14 w-14 animate-spin rounded-full border-[5px] border-[#d9e9e7] border-t-[#2D7D7A]"
                  role="status"
                  aria-label="Validating identity details"
                />
                <h3
                  id="identity-validation-title"
                  className="text-lg font-bold text-[#1A3C40]"
                >
                  Validating your details
                </h3>
                <p className="text-sm font-medium text-[#4A6B6F]">
                  Validating your identity details…
                </p>
              </>
            ) : (
              <>
                <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-[#ECFDF5]">
                  <svg
                    viewBox="0 0 24 24"
                    className="h-9 w-9 text-[#16A34A]"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                  >
                    <path d="m5 12 4 4L19 6" />
                  </svg>
                </div>
                <h3
                  id="identity-validation-title"
                  className="text-lg font-bold text-[#1A3C40]"
                >
                  Validation Successful
                </h3>
                <p className="mt-2 text-sm text-[#4A6B6F]">
                  Your identity details have been validated.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setValidationStatus(null)
                    onProceed()
                  }}
                  className="mt-7 w-full rounded-xl py-3.5 text-sm font-semibold text-white transition-colors hover:bg-[#1F5F5C]"
                  style={{ backgroundColor: T.teal }}
                >
                  Continue
                </button>
              </>
            )}
          </div>
        </div>
      )}

      <div
        className="w-full max-w-lg rounded-2xl border-2 border-[#2D7D7A] bg-white p-8"
        style={{
          boxShadow:
            "0 0 0 3px rgba(45,125,122,0.28), 0 0 24px 8px rgba(45,125,122,0.58), 0 16px 36px rgba(45,125,122,0.32)",
        }}
      >
        <div className="flex justify-center mb-5">
          <div
            className="w-16 h-16 rounded-full flex items-center justify-center"
            style={{ backgroundColor: T.teal }}
          >
            <ShieldCheckIcon color="white" />
          </div>
        </div>

        <h2
          className="mb-6 text-center text-lg font-bold leading-snug sm:text-xl"
          style={{ color: T.headingDark }}
        >
          Please input your details exactly the way it appears on your National
          Identification Number (NIN)
        </h2>

        <div className="flex flex-col gap-4">
          {/* First Name */}
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

          {/* Surname */}
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

          {/* Gender */}
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
                <option value="non-binary">Non-binary</option>
                <option value="prefer-not">Prefer not to say</option>
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

          {/* Date of Birth */}
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

        {/* Buttons */}
        <div className="flex gap-4 mt-8">
          <button
            onClick={onBack}
            className="flex-1 py-4 rounded-xl text-sm font-semibold cursor-pointer transition-colors hover:bg-teal-50"
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
            className="flex-1 py-4 rounded-xl text-sm font-semibold cursor-pointer transition-colors"
            style={{ backgroundColor: T.teal, color: "white" }}
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
      {/* Custom radio circle */}
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

  // Option C is the third option (index 2) in each question
  const isOptionC = (qId: string) =>
    answers[qId] === COMMUNITY_QUESTIONS.find((q) => q.id === qId)?.options[2]

  const handleContinue = () => {
    setSubmitAttempted(true)
    if (!allAnswered) return
    const anyC = COMMUNITY_QUESTIONS.some((q) => isOptionC(q.id))
    setResultModal(anyC ? "ineligible" : "fit")
  }

  return (
    <AppShell onCancel={onBack}>
      {/* "We are a fit" modal */}
      {resultModal === "fit" && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center px-4"
          style={{ backgroundColor: "rgba(0,0,0,0.45)" }}
        >
          <div
            className="flex max-h-[calc(100vh-2rem)] w-full max-w-[600px] flex-col items-center overflow-y-auto rounded-[24px] bg-white px-6 py-7 shadow-2xl sm:px-10 sm:py-8"
            role="dialog"
            aria-modal="true"
            aria-labelledby="fit-modal-title"
          >
            <div className="flex h-[96px] w-[108px] shrink-0 items-center justify-center rounded-full bg-[#2D7D7A]">
              <svg
                viewBox="0 0 64 72"
                className="h-[62px] w-[56px] text-white"
                fill="none"
                aria-hidden="true"
              >
                <path
                  d="M32 3 5 13v19c0 18 11 29 27 37 16-8 27-19 27-37V13L32 3Z"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinejoin="round"
                />
                <path
                  d="m20 35 8 8 17-18"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
            <h3
              id="fit-modal-title"
              className="mt-5 text-center text-[25px] font-bold leading-[1.2] tracking-[-0.025em] text-[#183d4d] sm:mt-5 sm:text-[32px]"
            >
              Welcome to Courtium
              <br />
              let’s create your account
            </h3>
            <p className="mt-8 text-center text-[16px] leading-[1.35] text-[#31566a] sm:mt-9 sm:text-[19px]">
              Great news!
              <br />
              Based on your answers,
              <br className="hidden sm:block" />
              <span className="sm:hidden"> </span>
              you can continue to create your Courtium account.
            </p>
            <div className="mt-10 flex items-center gap-3 text-center text-[13px] text-[#849aa8] sm:mt-11 sm:text-[15px]">
              <svg
                viewBox="0 0 24 24"
                className="h-6 w-6 shrink-0"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                aria-hidden="true"
              >
                <circle cx="12" cy="12" r="10" />
                <path d="M12 11v5m0-8h.01" strokeLinecap="round" />
              </svg>
              <span>Your next step is Sign-Up.</span>
            </div>
            <div className="mt-10 flex w-full flex-col gap-3 sm:flex-row sm:justify-center sm:gap-4">
              <button
                type="button"
                onClick={() => setResultModal(null)}
                className="h-11 w-full rounded-[10px] border-2 border-[#147b86] px-5 text-sm font-bold text-[#147b86] transition-colors hover:bg-[#eefafa] sm:w-[160px]"
              >
                Back
              </button>
              <button
                type="button"
                onClick={() => {
                  setResultModal(null)
                  onFit()
                }}
                className="h-11 w-full rounded-[10px] bg-[#20777b] px-5 text-sm font-bold text-white transition-colors hover:bg-[#1a666a] sm:w-[195px]"
              >
                Continue to Sign-Up
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Ineligible modal */}
      {resultModal === "ineligible" && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center px-4"
          style={{ backgroundColor: "rgba(0,0,0,0.45)" }}
        >
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-8 flex flex-col items-center gap-6">
            <div
              className="w-16 h-16 rounded-full flex items-center justify-center"
              style={{ backgroundColor: "#FEF3C7" }}
            >
              <svg
                viewBox="0 0 24 24"
                className="w-8 h-8"
                fill="none"
                stroke="#D97706"
                strokeWidth="1.6"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M12 2L4 5.5v6c0 5 3.6 9.7 8 10.5 4.4-.8 8-5.5 8-10.5v-6L12 2z" />
                <line x1="12" y1="9" x2="12" y2="13" />
                <circle
                  cx="12"
                  cy="16.5"
                  r="0.6"
                  fill="#D97706"
                  stroke="none"
                />
              </svg>
            </div>
            <div className="text-center">
              <h3
                className="text-lg font-bold mb-2"
                style={{ color: T.headingDark }}
              >
                Not eligible at this time
              </h3>
              <p
                className="text-sm leading-relaxed"
                style={{ color: T.bodyMuted }}
              >
                Based on some of your answers, you are ineligible to join
                Courtium at the moment, please try again in 6 months' time.
              </p>
            </div>
            <button
              onClick={() => {
                setResultModal(null)
                onIneligible()
              }}
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

      <div className="w-full max-w-2xl bg-white rounded-2xl shadow-xl overflow-hidden">
        {/* Top section */}
        <div className="flex flex-col items-center pt-8 pb-4 px-8">
          <div
            className="w-16 h-16 rounded-full flex items-center justify-center mb-4"
            style={{ backgroundColor: T.teal }}
          >
            <ShieldCheckIcon color="white" />
          </div>
          <h2
            className="mb-1 text-center text-2xl font-bold"
            style={{ color: T.headingDark }}
          >
            Let's know your intentions
          </h2>
          <div className="flex items-center gap-1.5">
            <svg
              viewBox="0 0 24 24"
              className="w-4 h-4 flex-shrink-0"
              fill="none"
              stroke={T.bodyMuted}
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="16" x2="12" y2="12" />
              <line x1="12" y1="8" x2="12.01" y2="8" />
            </svg>
            <p className="text-xs" style={{ color: T.bodyMuted }}>
              Your answers help us create a more meaningful community for you.
            </p>
          </div>
        </div>

        {/* Questions */}
        <div className="px-8 pb-2 flex flex-col gap-7">
          {COMMUNITY_QUESTIONS.map((q) => (
            <div key={q.id}>
              <h3
                className="text-lg font-medium mb-3"
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

        {/* Buttons */}
        <div className="flex gap-4 px-8 py-6">
          <button
            onClick={onBack}
            className="flex-1 py-4 rounded-xl text-sm font-semibold cursor-pointer transition-colors hover:bg-teal-50"
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
            className="flex-1 py-4 rounded-xl text-sm font-semibold cursor-pointer transition-colors"
            style={{ backgroundColor: T.teal, color: "white" }}
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
    </AppShell>
  )
}

// ── Screen 5: Sign Up ─────────────────────────────────────────────────────

function SignUpScreen({
  onCancel,
  onShowOverlay,
}: {
  onCancel: () => void
  onShowOverlay?: (
    destination: "payment" | "payment-female" | "payment-27-37",
  ) => void
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

  const handleSubmit = () => {
    setSubmitAttempted(true)
    if (emailError || passwordError) return
    setShowVerificationModal(true)
  }

  return (
    <AppShell onCancel={onCancel}>
      <div className="w-full max-w-lg bg-white rounded-2xl p-10 shadow-xl">
        {/* Email icon */}
        <div className="flex justify-center mb-6">
          <img src={stateIcon} alt="" aria-hidden="true" className="h-16 w-16" />
        </div>

        <h2
          className="text-center text-2xl font-bold mb-1"
          style={{ color: T.headingDark }}
        >
          Create your account
        </h2>
        <p className="text-center text-sm mb-8" style={{ color: T.bodyMuted }}>
          Use your email address and create a password to continue.
        </p>

        <div className="flex flex-col gap-5">
          {/* Email */}
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

          {/* Password */}
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
          className="w-full mt-8 py-4 rounded-xl text-sm font-semibold cursor-pointer transition-colors"
          style={{ backgroundColor: T.teal, color: "white" }}
          onMouseEnter={(e) =>
            (e.currentTarget.style.backgroundColor = T.tealDark)
          }
          onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = T.teal)}
        >
          Create account
        </button>
      </div>

      {showVerificationModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4 animate-modal-backdrop"
          role="presentation"
        >
          <div
            className="w-full max-w-sm rounded-2xl bg-white p-8 text-center shadow-2xl animate-modal-pop"
            role="dialog"
            aria-modal="true"
            aria-labelledby="verification-title"
          >
            <div
              className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full"
              style={{ backgroundColor: T.shieldBg }}
            >
              <ShieldCheckIcon />
            </div>
            <h3
              id="verification-title"
              className="text-xl font-bold"
              style={{ color: T.headingDark }}
            >
              Check your mail for verification
            </h3>
            <p className="mt-2 text-sm" style={{ color: T.bodyMuted }}>
              We sent a verification link to your email address.
            </p>
            <button
              type="button"
              onClick={() => {
                setShowVerificationModal(false)
                const destination =
                  gender === "female"
                    ? "payment-female"
                    : age !== null && age >= 27 && age <= 37
                      ? "payment-27-37"
                    : "payment"
                onShowOverlay?.(destination)
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
    "Convein (coming soon)": (
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
  const { firstName, selectedPlan, questionnaireComplete } = useProgress()
  const [isNavOpen, setIsNavOpen] = useState(
    () => typeof window !== "undefined" && window.innerWidth >= 768,
  )
  const navItems = [
    'Home',
    'Profile',
    'My Questionnaire',
    'Recommendations',
    'Dates',
    'Contact Us',
    'Location',
    'Report User',
    'Refer a friend',
    'Book a 1-2-1 session',
    'Convein (coming soon)',
    'Sign Out',
  ]

  return (
    <div
      className="min-h-screen sm:p-3 md:p-[11px]"
      style={{ background: APP_BACKGROUND }}
    >
      <div className="relative mx-auto flex min-h-screen max-w-[1420px] overflow-hidden shadow-[0_12px_26px_rgba(40,61,66,0.1)] sm:min-h-[calc(100vh-24px)] sm:rounded-[18px] sm:border sm:border-[#d4dfe2] md:min-h-[calc(100vh-22px)]">
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
            "absolute inset-y-0 left-0 z-40 w-[min(82vw,280px)] shrink-0 border-r border-[#d7e1e4] bg-[#f7fafa] px-3 py-4 shadow-xl transition-all duration-200 md:relative md:z-auto md:translate-x-0 md:shadow-none",
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
            {isNavOpen && <LogoLabel className="h-auto w-[116px]" />}
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
                    {isLocked && !isNavOpen && (
                      <span className="absolute -right-1.5 -top-1.5 rounded-full bg-[#f7fafa] text-[#8c9da2]">
                        <svg viewBox="0 0 24 24" className="h-3 w-3" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                          <rect x="5" y="10" width="14" height="11" rx="2" />
                          <path d="M8 10V7a4 4 0 118 0v3" />
                        </svg>
                      </span>
                    )}
                  </span>
                  {isNavOpen && <span className="min-w-0 flex-1 whitespace-nowrap">{item}</span>}
                  {isLocked && isNavOpen && (
                    <span className="ml-1 shrink-0 text-[#8c9da2]" aria-hidden="true">
                      <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="1.7" aria-hidden="true">
                        <rect x="5" y="10" width="14" height="11" rx="2" />
                        <path d="M8 10V7a4 4 0 118 0v3" />
                      </svg>
                    </span>
                  )}
                </button>
              )
            })}
          </nav>
        </aside>

        <div className="flex min-w-0 flex-1 flex-col bg-[#f1f6f7]">
          <header className="flex min-h-[56px] items-center justify-between border-b border-[#d7e1e4] bg-white px-4 sm:px-6 md:px-7">
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
            <nav className="flex items-center gap-3 text-[10px] font-bold text-[#183d4d] sm:gap-5 sm:text-[11px] md:gap-7">
              <a href="#home">Home</a>
              <a className="hidden sm:inline" href="#contact">Contact us</a>
              <a className="hidden sm:inline" href="#report">Report user</a>
              <button
                type="button"
                onClick={onSignOut}
                className="text-inherit"
              >
                Sign Out
              </button>
            </nav>
          </header>

          <main className="flex-1 overflow-auto px-4 py-6 pb-24 sm:px-6 sm:py-8 sm:pb-24 md:px-9 md:pb-8">
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
                  <p className="mt-3 text-[12px] leading-5 text-[#7892a0]">
                    After payment, continue to your questionnaire.
                  </p>
                </section>
              </div>

              <section className="mx-auto mt-4 max-w-[560px] rounded-[15px] border border-[#e5ecee] bg-white p-5 sm:px-6 sm:py-6">
                <h2 className="max-w-[440px] text-[19px] font-bold leading-[1.2] tracking-[-0.04em] text-[#183d4d] sm:text-[21px]">
                  Let’s get to know more about you and your desired partner
                </h2>
                <p className="mt-2 text-[12px] text-[#7892a0]">
                  This will take about 10 minutes to complete.
                </p>
                <button
                  type="button"
                  onClick={onOpenQuestionnaire}
                  disabled={!onOpenQuestionnaire}
                  className="mt-4 h-11 w-full rounded-[9px] bg-[#147b86] text-[13px] font-bold text-white transition-colors hover:bg-[#106b73] sm:w-[177px]"
                >
                  Continue
                </button>
              </section>
            </div>
          </main>
        </div>
        <nav
          aria-label="Dashboard navigation"
          className="fixed inset-x-0 bottom-0 z-20 border-t border-[#d7e1e4] bg-white/95 px-2 pt-2 pb-[env(safe-area-inset-bottom)] shadow-[0_-4px_16px_rgba(40,61,66,0.08)] backdrop-blur md:hidden"
        >
          <div className="flex overflow-x-auto overscroll-x-contain">
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
                  title={`${isLocked ? "Locked " : ""}${item}`}
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
                    "relative flex h-12 w-12 shrink-0 items-center justify-center rounded-lg transition-colors",
                    isLocked
                      ? "cursor-not-allowed text-[#9aa9ad] opacity-60"
                      : "text-[#21495a] hover:bg-[#edf5f6]",
                    !isLocked && item === "Home"
                      ? "bg-[#e8f3f5] text-[#147b86]"
                      : "",
                  ].join(" ")}
                >
                  <DashboardNavIcon item={item} />
                  {isLocked && (
                    <span className="absolute right-1 top-1 rounded-full bg-white text-[#8c9da2]">
                      <svg
                        viewBox="0 0 24 24"
                        className="h-3 w-3"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        aria-hidden="true"
                      >
                        <rect x="5" y="10" width="14" height="11" rx="2" />
                        <path d="M8 10V7a4 4 0 118 0v3" />
                      </svg>
                    </span>
                  )}
                </button>
              )
            })}
          </div>
        </nav>
      </div>
    </div>
  )
}

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
    setQuestionnaireComplete,
  } = useProgress()
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
    preferredPartnerAgeRange === "38" ||
    preferredPartnerAgeRange === "I am indifferent"
  const needsPreferredReligion =
    partnerReligionPreference === "Yes"
  const ageRangeQuestion = needsPreferredReligion ? 6 : 5
  const totalQuestions = ageRangeQuestion
  const [currentQuestion, setCurrentQuestion] = useState(
    () =>
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
                  : 1,
  )
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

  const saveAndContinue = () => {
    if (!isLocationComplete) return
    setCurrentQuestion(2)
  }

  const continueToReligion = () => {
    if (!isOriginComplete) return
    setCurrentQuestion(3)
  }

  const continueToPartnerPreference = () => {
    if (!isReligionComplete) return
    setCurrentQuestion(4)
  }

  const continueToPreferredReligionOrAgeRange = () => {
    if (!isPartnerReligionPreferenceComplete) return
    setCurrentQuestion(needsPreferredReligion ? 5 : ageRangeQuestion)
  }

  const continueToAgeRange = () => {
    if (!isPreferredPartnerReligionComplete) return
    setCurrentQuestion(ageRangeQuestion)
  }

  const finishQuestionnaire = () => {
    if (
      !isPartnerReligionPreferenceComplete ||
      (needsPreferredReligion && !isPreferredPartnerReligionComplete) ||
      !isPreferredPartnerAgeRangeComplete
    ) {
      return
    }
    setQuestionnaireComplete(true)
    onComplete()
  }

  const handleDoItLater = () => {
    setQuestionnaireComplete(false)
    onLater()
  }

  return (
    <>
      <DashboardScreen onSignOut={onSignOut} />
      <div className="fixed inset-0 z-40 flex items-center justify-center overflow-y-auto bg-[#49626b]/60 px-3 py-4 sm:px-6">
        <section
          className="flex max-h-[calc(100vh-2rem)] min-h-[min(650px,calc(100vh-2rem))] w-full max-w-[906px] flex-col overflow-y-auto rounded-[20px] bg-white px-4 py-6 text-[#183d4d] shadow-[0_18px_50px_rgba(25,47,54,0.2)] sm:px-8 sm:py-9"
          role="dialog"
          aria-modal="true"
          aria-labelledby="questionnaire-title"
        >
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
            Q0{currentQuestion}
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
              style={{ width: `${(currentQuestion / totalQuestions) * 100}%` }}
            />
          </div>
          <span className="col-span-2 sm:col-span-1 sm:text-right">
            Question {currentQuestion} of {totalQuestions} · Your progress can be saved and resumed later.
          </span>
        </div>

        <main className="mx-auto mt-12 w-full max-w-[742px] sm:mt-20">
          <h2 className="text-[20px] font-bold tracking-[-0.02em] sm:text-[22px]">
            {currentQuestion === 1
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
                    {location.state === "Federal Capital Territory"
                      ? "FCT (Federal Capital Territory)"
                      : location.state}
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
                  {(currentQuestion === 1
                    ? selectedLocationState
                    : selectedOriginState)
                    ? "Select local government"
                    : "Select state first"}
                </option>
                {(currentQuestion === 1
                  ? selectedLocationState
                  : selectedOriginState
                )?.lgas.map((localGovernment) => (
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
                          setCurrentQuestion(4)
                        } else if (
                          partnerReligionPreference !== "Yes" &&
                          currentQuestion > 4
                        ) {
                          setCurrentQuestion(4)
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
          ) : (
            <fieldset className="mt-8">
              <legend className="sr-only">
                Preferred age range for a partner
              </legend>
              <div className="grid gap-3 sm:grid-cols-2">
                {["27-32", "33-38", "38", "I am indifferent"].map(
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
          )}
        </main>

        <footer className="mt-auto flex flex-col justify-center gap-3 pt-16 sm:flex-row sm:gap-3">
          <button
            type="button"
            onClick={handleDoItLater}
            className="h-12 w-full rounded-[12px] border-2 border-[#147b86] px-8 text-[14px] font-bold text-[#147b86] transition-colors hover:bg-[#eefafa] sm:w-[156px]"
          >
            Do It Later
          </button>
          {currentQuestion > 1 && (
            <button
              type="button"
              onClick={() => setCurrentQuestion((question) => question - 1)}
              className="h-12 w-full rounded-[12px] border-2 border-[#147b86] px-8 text-[14px] font-bold text-[#147b86] transition-colors hover:bg-[#eefafa] sm:w-[156px]"
            >
              Back
            </button>
          )}
          <button
            type="button"
            onClick={
              currentQuestion === 1
                ? saveAndContinue
                : currentQuestion === 2
                  ? continueToReligion
                  : currentQuestion === 3
                    ? continueToPartnerPreference
                    : currentQuestion === 4
                      ? continueToPreferredReligionOrAgeRange
                      : needsPreferredReligion && currentQuestion === 5
                        ? continueToAgeRange
                        : finishQuestionnaire
            }
            disabled={
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
                        : !isPreferredPartnerAgeRangeComplete
            }
            className="h-12 w-full rounded-[12px] bg-[#147b86] px-8 text-[14px] font-bold text-white transition-colors hover:bg-[#106b73] disabled:cursor-not-allowed disabled:opacity-50 sm:w-[194px]"
          >
            {currentQuestion < totalQuestions
              ? "Save and Continue"
              : "Save and Finish"}
          </button>
        </footer>
        </section>
      </div>
    </>
  )
}

const PREMIUM_PLAN_FEATURES = [
  'Get connected to community members who are a value- fit.',
  'Free Soft Date Venue Recommendations',
]

const EXCLUSIVE_PLAN_FEATURES = [
  'Get connected to community members who are a value- fit.',
  'One Optional 1-2-1 monthly sessions booking with a community guide to get support on relationship and life issues.',
  'Free Soft Date Venue Recommendations',
  'Automatic membership to our professional Networking community- Convein for online and physical events.',
  'Access to invite-only dinner and red carpet events on Convein.',
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
  footer,
}: {
  plan: PaymentPlan
  selected: boolean
  onSelect: () => void
  footer?: string
}) {
  return (
    <button
      type="button"
      aria-pressed={selected}
      onClick={onSelect}
      className={[
        'group relative flex h-full min-h-[340px] flex-col overflow-hidden rounded-[18px] border p-5 text-left transition-all duration-200 hover:-translate-y-1 hover:shadow-[0_16px_32px_rgba(20,80,90,0.13)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#147b86]',
        selected
          ? 'border-[#147b86] bg-gradient-to-br from-[#f0fbfa] via-white to-[#e8f5f4] shadow-[0_0_0_2px_#147b86,0_12px_28px_rgba(20,123,134,0.14)]'
          : 'border-[#d5e3e6] bg-white hover:border-[#78b5b8]',
      ].join(' ')}
    >
      <span className="mb-4 flex items-start justify-between gap-2">
        <span className="text-[20px] font-bold tracking-[-0.03em] text-[#1c4050] sm:text-[21px]">
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
      <span className="mt-1 text-[28px] font-bold tracking-[-0.04em] text-[#087d83]">
        {plan.price}
      </span>
      <ul className="mt-5 space-y-3 text-[13px] leading-[1.55] text-[#315b68] sm:text-[14px]">
        {plan.features.map((feature) => (
          <li key={feature} className="flex items-start gap-2">
            <span
              className="mt-[0.55rem] h-1.5 w-1.5 shrink-0 rounded-full bg-[#16818a]"
              aria-hidden="true"
            />
            <span
              className={
                feature.startsWith('Get connected')
                  ? 'font-bold text-[#1c4050]'
                  : ''
              }
            >
              {feature}
            </span>
          </li>
        ))}
      </ul>
      {footer && (
        <span className="mt-auto pt-4 text-[11px] font-bold text-[#087d83]">
          {footer}
        </span>
      )}
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
        discountPercent: 0,
      })
    }
  }, [selectedPlan])

  return (
    <div className="relative min-h-screen">
      <DashboardScreen onSignOut={onSignOut} />

      <div className="fixed inset-0 z-40 flex items-center justify-center bg-[#49626b]/55 px-4 py-6">
        <section
          className="max-h-[calc(100vh-3rem)] w-full max-w-[670px] overflow-y-auto rounded-[20px] bg-white px-7 py-6 shadow-[0_18px_50px_rgba(25,47,54,0.2)] sm:px-8 md:px-9"
          role="dialog"
          aria-modal="true"
          aria-labelledby="payment-plan-title"
        >
          <div className="flex items-start justify-between gap-4">
            <div>
              {firstName && (
                <p className="mb-1 text-[14px] font-semibold text-[#147b86]">
                  Hello {firstName}
                </p>
              )}
              <h1
                id="payment-plan-title"
                className="text-[24px] font-bold leading-tight tracking-[-0.04em] text-[#183d4d] sm:text-[26px]"
              >
                Choose your quarterly plan
              </h1>
              <p className="mt-2 max-w-[560px] text-[12px] leading-5 text-[#708a99] sm:text-[13px]">
                Payment is required before you continue to the rest of your Courtium onboarding journey.
              </p>
            </div>
            <button
              type="button"
              onClick={onSignOut}
              className="shrink-0 pt-1 text-[12px] font-bold text-[#147b86] hover:text-[#0e5e67]"
            >
              Sign Out
            </button>
          </div>

          <p className="mt-10 text-[12px] text-[#708a99]">
            Select your preferred membership tier. Prices shown are the quarterly fees for this age group.
          </p>

          <div className="mt-6 grid gap-4 sm:grid-cols-2">
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

          <div className="mt-16 max-w-[315px]">
            <label className="block text-[11px] font-bold text-[#21495a]" htmlFor="discount-code">
              Discount code
            </label>
            <div className="mt-2 flex gap-2">
              <input
                id="discount-code"
                type="text"
                placeholder="Enter code here"
                className="h-10 min-w-0 flex-1 rounded-[9px] border border-[#d0dfe4] px-3 text-[11px] text-[#21495a] outline-none placeholder:text-[#8da4af] focus:border-[#147b86]"
              />
              <button
                type="button"
                className="h-10 w-[91px] rounded-[9px] border-2 border-[#147b86] text-[11px] font-bold text-[#147b86] hover:bg-[#eefafa]"
              >
                Apply
              </button>
            </div>
          </div>

          <div className="mt-5 flex justify-center">
            <button
              type="button"
              onClick={onProceedToMain}
              className="h-10 min-w-[190px] rounded-[10px] bg-[#147b86] px-6 text-[13px] font-bold text-white hover:bg-[#106b73]"
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
  const discountEligible = selectedPlan === 'premium' || selectedPlan === 'exclusive'

  useEffect(() => {
    const plan = femalePlans.find((item) => item.id === selectedPlan)
    if (plan) {
      saveSelectedPlan({
        name: plan.name,
        amount: getPlanAmount(plan.price),
        discountPercent: discountEligible ? 5 : 0,
      })
    }
  }, [selectedPlan, discountEligible])

  return (
    <div className="relative min-h-screen">
      <DashboardScreen onSignOut={onSignOut} />

      <div className="fixed inset-0 z-40 flex items-center justify-center bg-[#49626b]/55 px-4 py-6">
        <section
          className="max-h-[calc(100vh-3rem)] w-full max-w-[670px] overflow-y-auto rounded-[20px] bg-white px-7 py-6 shadow-[0_18px_50px_rgba(25,47,54,0.2)] sm:px-8 md:px-9"
          role="dialog"
          aria-modal="true"
          aria-labelledby="female-payment-plan-title"
        >
          <div className="flex items-start justify-between gap-4">
            <div>
              {firstName && (
                <p className="mb-1 text-[14px] font-semibold text-[#147b86]">
                  Hello {firstName}
                </p>
              )}
              <h1
                id="female-payment-plan-title"
                className="text-[24px] font-bold leading-tight tracking-[-0.04em] text-[#183d4d] sm:text-[26px]"
              >
                Choose your quarterly plan
              </h1>
              <p className="mt-2 max-w-[560px] text-[12px] leading-5 text-[#708a99] sm:text-[13px]">
                Payment is required before you continue to the rest of your Courtium onboarding journey.
              </p>
            </div>
            <button
              type="button"
              onClick={onSignOut}
              className="shrink-0 pt-1 text-[12px] font-bold text-[#147b86] hover:text-[#0e5e67]"
            >
              Sign Out
            </button>
          </div>

          <div className="mt-6 text-[12px] leading-5 text-[#708a99]">
            <p className="font-bold">Age group: 27 to 37 · Gender: Female</p>
            {discountEligible && (
              <p>
                Code FEMALE gives 5% off your selected Premium or Exclusive plan.
              </p>
            )}
          </div>

          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            {femalePlans.map((plan) => {
              const selected = selectedPlan === plan.id

              return (
                <PaymentPlanCard
                  key={plan.id}
                  plan={plan}
                  selected={selected}
                  onSelect={() => setSelectedPlan(plan.id)}
                  footer={
                    selected
                      ? 'FEMALE discount applied'
                      : 'FEMALE discount available'
                  }
                />
              )
            })}
          </div>

          {discountEligible && (
            <div className="mt-16 max-w-[346px]">
              <label className="block text-[11px] font-bold text-[#21495a]" htmlFor="female-discount-code">
                Discount code
              </label>
              <div className="mt-2 flex gap-2">
                <input
                  id="female-discount-code"
                  type="text"
                  value="FEMALE"
                  readOnly
                  className="h-10 min-w-0 flex-1 rounded-[9px] border border-[#147b86] bg-[#f7fbfb] px-3 text-[11px] font-bold text-[#147b86] outline-none"
                />
                <button
                  type="button"
                  disabled
                  className="h-10 w-[125px] rounded-[9px] bg-[#e8f3f5] text-[11px] font-bold text-[#147b86]"
                >
                  Code Applied
                </button>
              </div>
            </div>
          )}

          <div className="mt-5 flex justify-center">
            <button
              type="button"
              onClick={onProceedToMain}
              className="h-10 min-w-[190px] rounded-[10px] bg-[#147b86] px-6 text-[13px] font-bold text-white hover:bg-[#106b73]"
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
        discountPercent: 0,
      })
    }
  }, [selectedPlan])

  return (
    <div className="relative min-h-screen">
      <DashboardScreen onSignOut={onSignOut} />

      <div className="fixed inset-0 z-40 flex items-center justify-center bg-[#49626b]/55 px-4 py-6">
        <section
          className="max-h-[calc(100vh-3rem)] w-full max-w-[670px] overflow-y-auto rounded-[20px] bg-white px-7 py-6 shadow-[0_18px_50px_rgba(25,47,54,0.2)] sm:px-8 md:px-9"
          role="dialog"
          aria-modal="true"
          aria-labelledby="age-27-37-payment-title"
        >
          <div className="flex items-start justify-between gap-4">
            <div>
              {firstName && (
                <p className="mb-1 text-[14px] font-semibold text-[#147b86]">
                  Hello {firstName}
                </p>
              )}
              <h1
                id="age-27-37-payment-title"
                className="text-[24px] font-bold leading-tight tracking-[-0.04em] text-[#183d4d] sm:text-[26px]"
              >
                Choose your quarterly plan
              </h1>
              <p className="mt-2 text-[12px] leading-5 text-[#708a99] sm:text-[13px]">
                Payment is required before you continue to the rest of your Courtium onboarding journey.
              </p>
            </div>
            <button
              type="button"
              onClick={onSignOut}
              className="shrink-0 pt-1 text-[12px] font-bold text-[#147b86] hover:text-[#0e5e67]"
            >
              Sign Out
            </button>
          </div>

          <p className="mt-10 text-[12px] text-[#708a99]">
            Select your preferred membership tier. Prices shown are the quarterly fees for this age group.
          </p>

          <div className="mt-6 grid gap-4 sm:grid-cols-2">
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

          <div className="mt-16 max-w-[315px]">
            <label className="block text-[11px] font-bold text-[#21495a]" htmlFor="age-27-37-discount-code">
              Discount code
            </label>
            <div className="mt-2 flex gap-2">
              <input
                id="age-27-37-discount-code"
                type="text"
                placeholder="Enter code here"
                className="h-10 min-w-0 flex-1 rounded-[9px] border border-[#d0dfe4] px-3 text-[11px] text-[#21495a] outline-none placeholder:text-[#8da4af] focus:border-[#147b86]"
              />
              <button
                type="button"
                className="h-10 w-[91px] rounded-[9px] border-2 border-[#147b86] text-[11px] font-bold text-[#147b86] hover:bg-[#eefafa]"
              >
                Apply
              </button>
            </div>
          </div>

          <div className="mt-5 flex justify-center">
            <button
              type="button"
              onClick={onProceedToMain}
              className="h-10 min-w-[190px] rounded-[10px] bg-[#147b86] px-6 text-[13px] font-bold text-white hover:bg-[#106b73]"
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
    discountPercent: 0,
  }
  const discountAmount = Math.round(plan.amount * (plan.discountPercent / 100))
  const amountPayable = plan.amount - discountAmount

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

      <div className="fixed inset-0 z-40 flex items-center justify-center bg-[#49626b]/55 px-4 py-6">
        <section
          className="flex max-h-[calc(100vh-3rem)] w-full max-w-[670px] flex-col overflow-y-auto rounded-[20px] bg-white px-7 py-6 shadow-[0_18px_50px_rgba(25,47,54,0.2)] sm:px-8 md:px-9"
          role="dialog"
          aria-modal="true"
          aria-labelledby="main-payment-title"
        >
          <div className="flex items-start justify-between gap-4">
            <div>
              {firstName && (
                <p className="mb-1 text-[14px] font-semibold text-[#147b86]">
                  Hello {firstName}
                </p>
              )}
              <h1
                id="main-payment-title"
                className="text-[24px] font-bold leading-tight tracking-[-0.04em] text-[#183d4d] sm:text-[26px]"
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
              className="shrink-0 pt-1 text-[12px] font-bold text-[#147b86] hover:text-[#0e5e67]"
            >
              Sign Out
            </button>
          </div>

          <p className="mt-6 text-[12px] font-bold text-[#708a99]">
            Selected plan: {plan.name}
          </p>

          <div className="mt-5 grid gap-5 md:grid-cols-[1fr_1.08fr]">
            <div>
              <div className="rounded-[15px] border border-[#d9e3e7] bg-[#f5f9fa] px-5 py-4">
                <h2 className="text-[18px] font-bold text-[#1c4050]">Order summary</h2>
                <p className="mt-3 text-[11px] font-medium text-[#7892a0]">
                  Quarterly {plan.name} membership
                </p>
                <div className="mt-8 space-y-2">
                  <div className="flex items-center justify-between gap-3 text-[11px] text-[#7892a0]">
                    <span>Plan amount</span>
                    <span>{formatNaira(plan.amount)}</span>
                  </div>
                  {plan.discountPercent > 0 && (
                    <div className="flex items-center justify-between gap-3 text-[11px] font-medium text-[#16805f]">
                      <span>Female discount ({plan.discountPercent}%)</span>
                      <span>−{formatNaira(discountAmount)}</span>
                    </div>
                  )}
                  <div className="border-t border-[#d9e3e7] pt-3">
                    <p className="text-[11px] text-[#7892a0]">Amount payable</p>
                    <p className="mt-1 text-[25px] font-bold tracking-[-0.04em] text-[#087d83]">
                      {formatNaira(amountPayable)}
                    </p>
                  </div>
                </div>
              </div>

              <label
                className="mt-10 block text-[11px] font-bold text-[#21495a]"
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
              <p className="mt-5 text-[11px] leading-5 text-[#8aa0aa]">
                After payment, you will be redirected back to the dashboard.
              </p>
            </div>

            <div className="rounded-[15px] border border-[#d9e3e7] px-5 py-4">
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

          <div className="mt-28 flex justify-center gap-3">
            <button
              type="button"
              onClick={onBack}
              className="h-10 min-w-[125px] rounded-[10px] border-2 border-[#147b86] px-6 text-[13px] font-bold text-[#147b86] hover:bg-[#eefafa]"
            >
              Back
            </button>
            <button
              type="button"
              onClick={() => setIsProcessingPayment(true)}
              disabled={isProcessingPayment}
              className="h-10 min-w-[166px] rounded-[10px] bg-[#147b86] px-6 text-[13px] font-bold text-white hover:bg-[#106b73]"
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

      <div className="fixed inset-0 z-40 flex items-center justify-center bg-[#49626b]/55 px-4 py-6">
        <section
          className="flex min-h-[450px] w-full max-w-[524px] flex-col items-center justify-center rounded-[20px] bg-white px-7 py-10 text-center shadow-[0_18px_50px_rgba(25,47,54,0.2)] sm:px-10"
          role="dialog"
          aria-modal="true"
          aria-labelledby="payment-success-title"
        >
          <div className="flex h-24 w-24 items-center justify-center rounded-full bg-[#e8f5f0]">
            <div className="flex h-12 w-12 items-center justify-center rounded-full border-[3px] border-[#2c8768]">
              <svg
                viewBox="0 0 24 24"
                className="h-8 w-8 text-[#2c8768]"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="m6 12 4 4 8-9" />
              </svg>
            </div>
          </div>

          <h1
            id="payment-success-title"
            className="mt-5 text-[29px] font-bold tracking-[-0.04em] text-[#183d4d]"
          >
            Payment successful
          </h1>
          <p className="mt-3 max-w-[390px] text-[17px] leading-7 text-[#21495a]">
            Your membership payment has been confirmed.
            <br />
            You can now continue to your dashboard.
          </p>

          <button
            type="button"
            onClick={onContinue}
            className="mt-24 h-11 rounded-[10px] bg-[#147b86] px-6 text-[13px] font-bold text-white hover:bg-[#106b73]"
          >
            Continue to Dashboard
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

// ── App router ────────────────────────────────────────────────────────────

type Screen = "splash" | "checkfit" | "questions" | "signup" | "overlay" | "payment" | "payment-female" | "payment-27-37" | "main-payment" | "payment-success" | "continue-dashboard" | "questionnaire" | "dashboard"

function AppRouter() {
  const [screen, setScreen] = useState<Screen>("splash")

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
        onSignOut={() => setScreen("splash")}
      />
    )
  }

  if (screen === "payment") {
    return (
      <PaymentOverlayScreen
        onBack={() => setScreen("overlay")}
        onProceedToMain={() => setScreen("main-payment")}
        onSignOut={() => setScreen("splash")}
      />
    )
  }

  if (screen === "payment-female") {
    return (
      <PaymentOverlayFemaleScreen
        onBack={() => setScreen("payment")}
        onProceedToMain={() => setScreen("main-payment")}
        onSignOut={() => setScreen("splash")}
      />
    )
  }

  if (screen === "payment-27-37") {
    return (
      <Overlay27_37Screen
        onBack={() => setScreen("payment")}
        onProceedToMain={() => setScreen("main-payment")}
        onSignOut={() => setScreen("splash")}
      />
    )
  }

  if (screen === "main-payment") {
    return (
      <MainPaymentScreen
        onBack={() => setScreen("payment-female")}
        onPayNow={() => setScreen("payment-success")}
        onSignOut={() => setScreen("splash")}
      />
    )
  }

  if (screen === "payment-success") {
    return (
      <PaymentSuccessfulScreen
        onContinue={() => setScreen("continue-dashboard")}
        onSignOut={() => setScreen("splash")}
      />
    )
  }

  if (screen === "continue-dashboard") {
    return (
      <ContinueToDashboardScreen
        onContinue={() => setScreen("questionnaire")}
        onSignOut={() => setScreen("splash")}
      />
    )
  }

  if (screen === "questionnaire") {
    return (
      <QuestionnaireScreen
        onLater={() => setScreen("dashboard")}
        onComplete={() => setScreen("dashboard")}
        onSignOut={() => setScreen("splash")}
      />
    )
  }

  if (screen === "dashboard") {
    return (
      <DashboardScreen
        onOpenQuestionnaire={() => setScreen("questionnaire")}
        onSignOut={() => setScreen("splash")}
      />
    )
  }

  if (screen === "signup") {
    return (
      <SignUpScreen
        onCancel={() => setScreen("splash")}
        onShowOverlay={(destination) => setScreen(destination)}
      />
    )
  }

  return (
    <SplashScreen
      onGetStarted={() => setScreen("checkfit")}
      onSignIn={() => setScreen("checkfit")}
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
