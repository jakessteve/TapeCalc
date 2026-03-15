import { useState, useCallback, useEffect } from "react";
import {
  Calculator,
  Ruler,
  DollarSign,
  Sparkles,
  ArrowRight,
  ChevronRight,
} from "lucide-react";
import tapcalcLogo from "../assets/tapcalc-logo.png";

const STORAGE_KEY = "hc-tapcalc-onboarded";

interface OnboardingProps {
  onComplete: () => void;
}

interface Slide {
  icon: React.ReactNode;
  title: string;
  description: string;
  features?: { icon: React.ReactNode; label: string }[];
}

const SLIDES: Slide[] = [
  {
    icon: <img src={tapcalcLogo} alt="TapeCalc" />,
    title: "Welcome to TapeCalc",
    description:
      "A modern tape calculator that keeps track of every calculation — like the adding machines professionals love, reimagined for today.",
  },
  {
    icon: <Calculator size={36} />,
    title: "Your Calculations, on Tape",
    description:
      "Every entry is saved on a scrollable tape. Add notes, undo mistakes, and export your work. Manage multiple tapes for different projects.",
    features: [
      { icon: <span>📝</span>, label: "Notes" },
      { icon: <span>↩️</span>, label: "Undo/Redo" },
      { icon: <span>📤</span>, label: "Export" },
    ],
  },
  {
    icon: <Ruler size={36} />,
    title: "Convert Anything",
    description:
      "Built-in unit conversion across 8 categories and live currency rates with auto-refresh. Switch between tabs instantly.",
    features: [
      { icon: <Ruler size={14} />, label: "Units" },
      { icon: <DollarSign size={14} />, label: "Currency" },
    ],
  },
  {
    icon: <Sparkles size={36} />,
    title: "Ready to Go!",
    description:
      "Explore Labs features like equation solving and function graphing in Settings. Customize your theme and make TapeCalc yours.",
  },
];

export function Onboarding({ onComplete }: OnboardingProps) {
  const [current, setCurrent] = useState(0);
  const [exiting, setExiting] = useState(false);

  const isLast = current === SLIDES.length - 1;

  const finish = useCallback(() => {
    setExiting(true);
    try {
      localStorage.setItem(STORAGE_KEY, "true");
    } catch {
      /* ignore */
    }
    // Wait for exit animation
    setTimeout(onComplete, 350);
  }, [onComplete]);

  const next = useCallback(() => {
    if (isLast) {
      finish();
    } else {
      setCurrent((c) => c + 1);
    }
  }, [isLast, current, finish]);

  // Keyboard nav: ArrowRight/Enter = next, Escape = skip
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight" || e.key === "Enter") {
        e.preventDefault();
        next();
      } else if (e.key === "Escape") {
        e.preventDefault();
        finish();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [next, finish]);

  return (
    <div
      className="onboarding-overlay"
      data-exiting={exiting}
      role="dialog"
      aria-modal="true"
      aria-label="Welcome walkthrough"
    >
      <div className="onboarding-card">
        {/* Slide area */}
        <div className="onboarding-slides">
          {SLIDES.map((slide, i) => (
            <div
              key={i}
              className="onboarding-slide"
              data-active={i === current}
              data-direction={i < current ? "prev" : undefined}
              aria-hidden={i !== current}
            >
              <div className="onboarding-icon">{slide.icon}</div>
              <h2 className="onboarding-slide-title">{slide.title}</h2>
              <p className="onboarding-slide-desc">{slide.description}</p>
              {slide.features && (
                <div className="onboarding-features">
                  {slide.features.map((f, j) => (
                    <span key={j} className="onboarding-feature-chip">
                      {f.icon}
                      {f.label}
                    </span>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Controls */}
        <div className="onboarding-controls">
          <button
            className="onboarding-btn-skip"
            onClick={finish}
            aria-label="Skip walkthrough"
          >
            Skip
          </button>

          <div className="onboarding-dots">
            {SLIDES.map((_, i) => (
              <button
                key={i}
                className="onboarding-dot"
                data-active={i === current}
                onClick={() => {
                  setCurrent(i);
                }}
                aria-label={`Go to slide ${i + 1}`}
              />
            ))}
          </div>

          <button
            className="onboarding-btn-next"
            onClick={next}
            aria-label={isLast ? "Get started" : "Next slide"}
          >
            {isLast ? (
              <>
                Let's Go <ArrowRight size={16} />
              </>
            ) : (
              <>
                Next <ChevronRight size={16} />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

/** Check if onboarding should be shown (first-time user) */
export function shouldShowOnboarding(): boolean {
  try {
    return localStorage.getItem(STORAGE_KEY) !== "true";
  } catch {
    return false;
  }
}
