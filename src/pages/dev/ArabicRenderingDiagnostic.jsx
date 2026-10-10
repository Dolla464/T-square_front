import { useLayoutEffect, useMemo, useRef, useState } from "react";
import "./ArabicRenderingDiagnostic.css";
import {
  TEST_STRINGS,
  STRING_E_LINES,
  MIXED_CHOICE_LINES,
  NUMBER_TEST_1,
  NUMBER_TEST_2,
  LONG_ARABIC_PARAGRAPH,
  VARIANTS,
  MIXED_DIR_VARIANTS,
  PASTE_VARIANTS,
  formatCodePoints,
  readComputedSnapshot,
} from "./arabicDiagnosticConfig.js";

function detectPlatformLabel(ua) {
  if (/Android/i.test(ua)) return "Android (UA hint)";
  if (/iPhone|iPad|iPod/i.test(ua)) return "iOS (UA hint)";
  if (/Windows/i.test(ua)) return "Windows (UA hint)";
  if (/Mac OS X/i.test(ua)) return "macOS (UA hint)";
  return "Unknown (UA hint)";
}

function VariantSample({ variant, text, multiline, sampleRef }) {
  const innerRef = useRef(null);
  const ref = sampleRef || innerRef;
  const [computed, setComputed] = useState(null);

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    setComputed(readComputedSnapshot(el));
  }, [ref, text, variant.key, variant.dir]);

  const dirProps = variant.dir ? { dir: variant.dir } : {};

  return (
    <div className="ar-diag-variant">
      <div className="ar-diag-variant-label">
        {variant.index != null ? `${variant.index}. ` : ""}
        {variant.title}
      </div>
      <p
        ref={ref}
        className={
          multiline
            ? "ar-diag-sample ar-diag-sample--multiline"
            : "ar-diag-sample"
        }
        style={variant.style}
        {...dirProps}
      >
        {text}
      </p>
      {computed && (
        <div className="ar-diag-computed" aria-label="Computed styles">
          <div>fontFamily: {computed.fontFamily}</div>
          <div>direction: {computed.direction}</div>
          <div>unicodeBidi: {computed.unicodeBidi}</div>
          <div>letterSpacing: {computed.letterSpacing}</div>
          <div>wordSpacing: {computed.wordSpacing}</div>
          <div>fontVariationSettings: {computed.fontVariationSettings}</div>
          <div>fontSynthesis: {computed.fontSynthesis}</div>
          <div>textRendering: {computed.textRendering}</div>
        </div>
      )}
    </div>
  );
}

function StringMatrixSection({ title, text, multiline, firstVariantRef }) {
  return (
    <section className="ar-diag-section">
      <h2>{title}</h2>
      {VARIANTS.map((variant, i) => (
        <VariantSample
          key={variant.key}
          variant={variant}
          text={text}
          multiline={multiline}
          sampleRef={i === 0 ? firstVariantRef : undefined}
        />
      ))}
    </section>
  );
}

export default function ArabicRenderingDiagnostic() {
  if (!import.meta.env.DEV) {
    return null;
  }

  const stringARef = useRef(null);
  const [pasteText, setPasteText] = useState("");
  const [env, setEnv] = useState(null);
  const [domTextA, setDomTextA] = useState("");

  useLayoutEffect(() => {
    const ua = navigator.userAgent;
    setEnv({
      userAgent: ua,
      language: navigator.language,
      languages: [...(navigator.languages || [])].join(", "),
      docLang: document.documentElement.lang,
      docDir: document.documentElement.dir,
      devicePixelRatio: String(window.devicePixelRatio),
      viewportWidth: String(window.innerWidth),
      viewportHeight: String(window.innerHeight),
      platformLabel: detectPlatformLabel(ua),
    });
  }, []);

  useLayoutEffect(() => {
    setDomTextA(stringARef.current?.textContent ?? "");
  }, [env]);

  const stringAText = TEST_STRINGS.A.text;
  const codePoints = useMemo(
    () => formatCodePoints(stringAText),
    [stringAText],
  );
  const stringEText = STRING_E_LINES.join("\n");
  const mixedBlock = MIXED_CHOICE_LINES.join("\n");

  return (
    <div className="ar-diag-page">
      <div className="ar-diag-banner">
        Development-only diagnostic. Not linked from production builds. Does not
        modify exam code, global CSS, or i18n.
      </div>

      <h1 className="ar-diag-title">Arabic Rendering Diagnostic</h1>

      <dl className="ar-diag-env">
        <dt>Environment</dt>
        <dd>{env?.platformLabel ?? "…"}</dd>
        <dt>Browser / UA</dt>
        <dd>{env?.userAgent ?? "…"}</dd>
        <dt>navigator.language</dt>
        <dd>{env?.language ?? "…"}</dd>
        <dt>navigator.languages</dt>
        <dd>{env?.languages ?? "…"}</dd>
        <dt>document.documentElement.lang</dt>
        <dd>{env?.docLang ?? "…"}</dd>
        <dt>document.documentElement.dir</dt>
        <dd>{env?.docDir ?? "…"}</dd>
        <dt>devicePixelRatio</dt>
        <dd>{env?.devicePixelRatio ?? "…"}</dd>
        <dt>viewport (w × h)</dt>
        <dd>
          {env
            ? `${env.viewportWidth} × ${env.viewportHeight}`
            : "…"}
        </dd>
      </dl>

      {Object.values(TEST_STRINGS).map((item) => (
        <StringMatrixSection
          key={item.id}
          title={`TEST STRING: ${item.id} — ${item.label}`}
          text={item.text}
          firstVariantRef={item.id === "A" ? stringARef : undefined}
        />
      ))}

      <section className="ar-diag-section">
        <h2>DOM / Unicode validation (String A, variant 1)</h2>
        <div className="ar-diag-unicode">
          <h3>Original JavaScript string</h3>
          <div>{stringAText}</div>
          <h3>DOM textContent (variant 1 sample)</h3>
          <div>{domTextA || "(pending mount)"}</div>
          <h3>Unicode code points (source string)</h3>
          <div>{codePoints}</div>
        </div>
      </section>

      <StringMatrixSection
        title="TEST STRING: E — Arabic choices (stacked)"
        text={stringEText}
        multiline
      />

      <section className="ar-diag-section">
        <h2>Optional — Mixed direction (A–D + Arabic)</h2>
        {MIXED_DIR_VARIANTS.map((variant) => (
          <VariantSample
            key={variant.key}
            variant={{ ...variant, index: null }}
            text={mixedBlock}
            multiline
          />
        ))}
      </section>

      <StringMatrixSection
        title="Optional — Number test 1"
        text={NUMBER_TEST_1}
      />
      <StringMatrixSection
        title="Optional — Number test 2"
        text={NUMBER_TEST_2}
      />

      <section className="ar-diag-section">
        <h2>Optional — Long Arabic paragraph</h2>
        {VARIANTS.map((variant) => (
          <VariantSample
            key={`long-${variant.key}`}
            variant={variant}
            text={LONG_ARABIC_PARAGRAPH}
            multiline
          />
        ))}
      </section>

      <section className="ar-diag-section ar-diag-paste">
        <h2>Stage 2 — Paste from affected exam (local only)</h2>
        <p style={{ fontSize: 12, margin: "0 0 8px" }}>
          Paste Arabic copied from an affected exam question or choice. Nothing
          is sent to the server.
        </p>
        <textarea
          value={pasteText}
          onChange={(e) => setPasteText(e.target.value)}
          placeholder="Paste Arabic text from affected exam here"
          aria-label="Paste Arabic from exam"
        />
        {pasteText.trim() ? (
          PASTE_VARIANTS.map((variant) => (
            <VariantSample
              key={variant.key}
              variant={{ ...variant, index: null }}
              text={pasteText}
              multiline
            />
          ))
        ) : (
          <p style={{ fontSize: 12, color: "#6b7280" }}>
            Variants appear after you paste text.
          </p>
        )}
      </section>

      <section className="ar-diag-guide">
        <h2>How to interpret (manual — check visually on device)</h2>
        <ul>
          <li>
            <strong>Result A (bidi):</strong> Current-like looks wrong;{" "}
            <code>dir=&quot;auto&quot;</code> or <code>dir=&quot;rtl&quot;</code>{" "}
            looks correct; Cairo may still look wrong → investigate RTL/bidi
            (document dir, mixed Latin labels).
          </li>
          <li>
            <strong>Result B (font):</strong> All direction variants wrong;
            system font OK; Cairo wrong → investigate Cairo / global typography
            (shaping, synthesis, variation settings).
          </li>
          <li>
            <strong>Result C (browser/device):</strong> All variants wrong on
            hardcoded Unicode → environmental rendering (compare Google Forms
            on same device).
          </li>
          <li>
            <strong>Result D (device-specific):</strong> All variants wrong here
            but OK in another browser on same device → browser-specific bug.
          </li>
          <li>
            <strong>Result E (data path):</strong> All hardcoded strings OK →
            diagnostic does not exonerate the exam; use paste section to compare
            API-copied text vs hardcoded; mismatch in code points → encoding/API
            investigation.
          </li>
        </ul>
        <p style={{ marginTop: 12, fontSize: 12 }}>
          Mark each variant ✅ or ❌ on the affected phone. This page does not
          auto-detect visual correctness.
        </p>
      </section>
    </div>
  );
}
