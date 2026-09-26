"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { prefersReducedMotion, runTypewriter } from "../lib/typewriter";

const LETTERHEAD = "DEPARTMENT OF PHYSICS · CALTECH";
const DATE_LINE = "14 March 1963";

const LETTER_BODY = `Dear Professor Bohr,

Daniel Reeves finished every mathematics
course our high school could offer. He
derives before he memorizes and will not
let an ugly proof stand.

I have written three of these letters
in twenty years. This is the fourth.

If he disappoints your college, that is
on me.`;

const SIGNATURE = "R. Feynman";

const COURIER =
  "var(--font-courier), 'Courier Prime', Courier, monospace";

export default function CosignLetter() {
  const startedRef = useRef(false);
  const finishedRef = useRef(false);
  const typingRef = useRef(false);
  const cancelRef = useRef({ cancelled: false });
  const clearRef = useRef<(() => void) | null>(null);
  const signTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [visible, setVisible] = useState("");
  const [signVisible, setSignVisible] = useState("");
  const [showCursor, setShowCursor] = useState(true);
  const [done, setDone] = useState(false);

  const clearSignTimers = () => {
    if (signTimerRef.current) {
      clearTimeout(signTimerRef.current);
      signTimerRef.current = null;
    }
  };

  const finishSignature = useCallback(() => {
    let si = 0;
    const tickSign = () => {
      if (cancelRef.current.cancelled) {
        setSignVisible(SIGNATURE);
        setShowCursor(false);
        setDone(true);
        finishedRef.current = true;
        typingRef.current = false;
        return;
      }
      if (si >= SIGNATURE.length) {
        setShowCursor(false);
        setDone(true);
        finishedRef.current = true;
        typingRef.current = false;
        return;
      }
      si += 1;
      setSignVisible(SIGNATURE.slice(0, si));
      signTimerRef.current = setTimeout(tickSign, 48 + Math.random() * 36);
    };
    // Short pause after body before signature drops
    signTimerRef.current = setTimeout(tickSign, 420);
  }, []);

  const startTyping = useCallback(
    (force = false) => {
      if (!force && (startedRef.current || finishedRef.current)) return;

      // Cancel any prior run
      clearRef.current?.();
      clearSignTimers();
      cancelRef.current = { cancelled: false };

      startedRef.current = true;
      finishedRef.current = false;
      typingRef.current = true;
      setVisible("");
      setSignVisible("");
      setShowCursor(true);
      setDone(false);

      clearRef.current = runTypewriter({
        text: LETTER_BODY,
        shouldPlaySound: () => false,
        signal: cancelRef.current,
        onChar: (v) => setVisible(v),
        onDone: finishSignature,
      });
    },
    [finishSignature]
  );

  useEffect(() => {
    if (prefersReducedMotion()) {
      setVisible(LETTER_BODY);
      setSignVisible(SIGNATURE);
      setShowCursor(false);
      setDone(true);
      finishedRef.current = true;
      startedRef.current = true;
      typingRef.current = false;
      return;
    }

    // Hero: letter already on screen — blink ~1s then type once
    const startId = window.setTimeout(() => startTyping(false), 1000);

    return () => {
      window.clearTimeout(startId);
      clearRef.current?.();
      clearSignTimers();
      cancelRef.current.cancelled = true;
    };
  }, [startTyping]);

  return (
    <div className="w-full">
      <style>{`
        @keyframes cosign-cursor-blink {
          0%, 49% { opacity: 1; }
          50%, 100% { opacity: 0; }
        }
        @media (prefers-reduced-motion: reduce) {
          .cosign-cursor { animation: none !important; opacity: 1 !important; }
        }
      `}</style>

      <div
        className="relative px-7 py-8 sm:px-9 sm:py-10"
        style={{
          background: "#ece6d6",
          color: "#1a1814",
          border: "1px solid rgb(40 35 28 / 14%)",
          borderRadius: "1px",
          minHeight: "16.5rem",
        }}
      >
        {/* Letterhead */}
        <div
          className="pb-2 text-center font-courier text-[10px] tracking-[0.14em] sm:text-[11px]"
          style={{ fontFamily: COURIER }}
        >
          {LETTERHEAD}
        </div>
        <div aria-hidden className="h-px w-full bg-[#1a1814]" />

        {/* Date — right-aligned below the rule */}
        <p
          className="mt-3 text-right font-courier text-[13px] sm:text-[14px]"
          style={{ fontFamily: COURIER }}
        >
          {DATE_LINE}
        </p>

        {/* Body */}
        <pre
          className="relative mt-6 whitespace-pre-wrap font-courier text-[14px] leading-[1.7] sm:text-[15px]"
          style={{ fontFamily: COURIER }}
          aria-live="polite"
        >
          {visible}
          {showCursor && !done && !signVisible ? (
            <span
              className="cosign-cursor ml-px inline-block w-[0.55ch] translate-y-px bg-[#1a1814]"
              style={{
                height: "1.05em",
                animation: "cosign-cursor-blink 1s step-end infinite",
              }}
              aria-hidden
            />
          ) : null}
        </pre>

        {/* Signature — right-aligned after body */}
        {(signVisible || done) && (
          <p
            className="relative mt-8 text-right font-courier text-[14px] sm:text-[15px]"
            style={{ fontFamily: COURIER }}
          >
            {signVisible}
            {showCursor && signVisible && !done ? (
              <span
                className="ml-px inline-block w-[0.55ch] translate-y-px bg-[#1a1814]"
                style={{
                  height: "1.05em",
                  animation: "cosign-cursor-blink 1s step-end infinite",
                }}
                aria-hidden
              />
            ) : null}
          </p>
        )}
      </div>
    </div>
  );
}
