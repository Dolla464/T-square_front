# 🧠 T-Square Frontend Agent Rules

## 📌 Project Overview

This is a production-level React application built with:
- React (Vite)
- React Router
- Bootstrap 5
- Axios
- React Helmet

The system is already functional and contains real pages, layouts, and API integrations.

### ⚠️ Core Principle
Do NOT break existing features.
Do NOT introduce unnecessary rewrites.
Every change must be minimal, safe, and intentional.

---

## 🧱 Golden Rules (Non-Negotiable)

### 1. Stability First
- Never break existing UI behavior.
- Never refactor large sections without explicit request.
- Avoid “cleanup refactors” unless required.

### 2. Minimal Diff Policy
- Only change what is strictly needed.
- Prefer patch-level edits over full rewrites.
- Keep component structure intact.

### 3. No Side Effects
- Any change must be checked against:
  - other pages
  - shared components
  - global state
  - routing behavior

---

## 🌐 UI & Design Rules

### Bootstrap Consistency
- Always use Bootstrap 5 classes first.
- Avoid custom CSS unless necessary.
- Do not override layout system unless required.

### Responsive Design (Critical)
- Must support:
  - Mobile (xs/sm)
  - Tablet (md)
  - Desktop (lg/xl)

Rules:
- Never break grid system.
- Always test layout flow (stacking, spacing, overflow).
- Avoid fixed widths unless justified.

---

## 🌍 Translation & Localization

- UI must support multi-language structure if present.
- Never hardcode Arabic/English text if system already uses translation layer.
- Respect existing i18n pattern (if present).
- Avoid mixing languages in same component.

---

## 🔌 Data & API Rules

- Always respect current API structure.
- Do not rename response keys in frontend.
- Handle:
  - loading states
  - error states
  - empty states

- Never assume API shape—verify before usage.

---

## 🧩 Component Rules

- Prefer reusability over duplication.
- Do not create duplicate components with slight differences.
- Keep props clean and minimal.
- Avoid deeply nested props drilling when Context exists.

---

## 🧠 Debugging Mindset

Before changing anything:
1. Identify root cause (not symptom).
2. Trace data flow:
   API → state → props → UI
3. Check impact scope (local vs global).

---

## 🚫 Forbidden Actions

- Full page rewrites without request.
- Changing routing structure casually.
- Removing Bootstrap layout system.
- Introducing new libraries without approval.
- Breaking backward compatibility.

---

## ✅ Expected Behavior

Agent should behave like a:
- Senior Frontend Engineer
- Production-aware
- Stability-first developer
- Minimal-change optimizer

---

## 🎯 Final Rule

If you're unsure:
> Do the smallest possible safe change or ask for clarification internally before proceeding.