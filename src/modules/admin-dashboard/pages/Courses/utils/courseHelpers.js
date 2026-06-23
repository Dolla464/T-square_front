// ─── Leaf constructors ──────────────────────────────────────────────────────

export const createLesson = () => ({
  id: `lesson-${Date.now()}-${Math.random()}`,
  title: "",
  description: "",
  duration: "",
  video: "",
  sort_order: "",
  provider: "",
});

export const createSection = () => ({
  id: `section-${Date.now()}-${Math.random()}`,
  title: "",
  lessons: [createLesson()],
});

// ─── Date helpers ────────────────────────────────────────────────────────────

export const formatDateForMySQL = (date) => {
  if (!date) return null;
  const d = new Date(date);
  if (isNaN(d.getTime())) return null;
  return d.toISOString().slice(0, 19).replace("T", " ");
};

// ─── FormData builder ────────────────────────────────────────────────────────

/**
 * Dynamically builds a FormData from a plain payload object.
 * – Ignores null / undefined / empty-string values (but allows 0 and false).
 * – Handles: nested previews, File/Blob, plain arrays, booleans, scalars.
 */
export const buildFormData = (payload) => {
  const fd = new FormData();

  Object.entries(payload).forEach(([key, value]) => {
    if (value === null || value === undefined || value === "") return;

    // 1. Previews – nested objects array
    if (key === "previews" && Array.isArray(value)) {
      value.forEach((preview, index) => {
        // Only append a real numeric id (skip temp ids that contain "lesson-")
        if (preview.id && !String(preview.id).includes("lesson-")) {
          fd.append(`previews[${index}][id]`, preview.id);
        }

        fd.append(`previews[${index}][title]`, preview.title ?? "");
        fd.append(`previews[${index}][description]`, preview.description ?? "");
        fd.append(
          `previews[${index}][video_provider]`,
          (preview.video_provider || "upload").trim().toLowerCase(),
        );
        fd.append(`previews[${index}][sort_order]`, preview.sort_order ?? 0);

        // Only append duration when it has an actual value
        if (
          preview.duration_seconds !== "" &&
          preview.duration_seconds != null
        ) {
          fd.append(
            `previews[${index}][duration_seconds]`,
            preview.duration_seconds,
          );
        }

        // Binary file → send as multipart file field
        if (
          preview.video_url instanceof File ||
          preview.video_url instanceof Blob
        ) {
          fd.append(`previews[${index}][video]`, preview.video_url);
        } else if (
          typeof preview.video_url === "string" &&
          preview.video_url.trim() !== ""
        ) {
          // Non-empty URL string only – never send an empty string to avoid the NOT NULL error
          fd.append(`previews[${index}][video_url]`, preview.video_url.trim());
        }
      });
      return;
    }

    // 2. Direct file uploads (thumbnail / cover_image)
    if (value instanceof File || value instanceof Blob) {
      fd.append(key, value);
      return;
    }

    // 3. Simple arrays (e.g. tag_ids)
    if (Array.isArray(value)) {
      value.forEach((item, index) => fd.append(`${key}[${index}]`, item));
      return;
    }

    // 4. Booleans
    if (typeof value === "boolean") {
      fd.append(key, value ? "1" : "0");
      return;
    }

    // 5. Strings / Numbers
    fd.append(key, value);
  });

  return fd;
};

// ─── Display helpers ─────────────────────────────────────────────────────────

export const formatSecondsToTime = (seconds) => {
  if (!seconds || isNaN(seconds)) return "0:00";
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${String(secs).padStart(2, "0")}`;
};

// ─── Normalizers ─────────────────────────────────────────────────────────────

export const normalizeLearnings = (rawLearnings) => {
  if (!rawLearnings) return [""];
  let learnings = [];
  try {
    if (Array.isArray(rawLearnings)) {
      learnings = rawLearnings;
    } else if (
      typeof rawLearnings === "string" &&
      rawLearnings.trim().startsWith("[")
    ) {
      learnings = JSON.parse(rawLearnings);
    } else if (typeof rawLearnings === "string") {
      if (rawLearnings.includes("\n"))
        return rawLearnings
          .split("\n")
          .map((s) => s.trim())
          .filter(Boolean);
      return [rawLearnings];
    }
  } catch (e) {
    console.error("Failed to parse learnings:", e);
    return [""];
  }

  if (!Array.isArray(learnings)) return [""];

  const result = learnings
    .map((l) => {
      if (typeof l === "string") return l;
      if (typeof l === "object" && l !== null)
        return l.content || l.title || l.learning || l.name || "";
      return String(l);
    })
    .filter((l) => l.trim() !== "");

  return result.length > 0 ? result : [""];
};

export const normalizeCurriculum = (rawCurriculum) => {
  if (!Array.isArray(rawCurriculum) || rawCurriculum.length === 0)
    return [createSection()];

  // Flat array of lesson objects (no nested sections)
  if (rawCurriculum[0] && !Array.isArray(rawCurriculum[0].lessons)) {
    return [
      {
        id: "default-section",
        title: "",
        lessons: rawCurriculum.map((lesson) => ({
          id: lesson.id || `lesson-${Date.now()}-${Math.random()}`,
          title: lesson.title || "",
          description: lesson.description || "",
          duration: formatSecondsToTime(
            lesson.duration_seconds || lesson.duration,
          ),
          video: lesson.video_url || lesson.video || "",
          sort_order: lesson.sort_order || "",
          provider: lesson.video_provider || "HTML5",
        })),
      },
    ];
  }

  // Sectioned curriculum
  return rawCurriculum.map((section) => ({
    id: section.id || `section-${Date.now()}-${Math.random()}`,
    title: section.title || "",
    lessons:
      Array.isArray(section.lessons) && section.lessons.length > 0
        ? section.lessons.map((lesson) => ({
            id: lesson.id || `lesson-${Date.now()}-${Math.random()}`,
            title: lesson.title || "",
            description: lesson.description || "",
            duration: formatSecondsToTime(
              lesson.duration_seconds || lesson.duration,
            ),
            video: lesson.video_url || lesson.video || "",
            sort_order: lesson.sort_order || "",
            provider: lesson.video_provider || "HTML5",
          }))
        : [createLesson()],
  }));
};

// ─── Map API response → form shape ───────────────────────────────────────────

export const mapItemToFormData = (item) => ({
  title: item.title || "",
  slug: item.slug || "",
  short_description: item.short_description || "",
  description: item.description || "",
  category_id: item.category_id || item.category?.id || "",
  instructor_id: item.instructor_id || item.instructor?.id || "",
  level: item.level || "beginner",
  language: item.language || "Arabic",
  attendance_type: item.attendance_type || "online",
  price: item.price || "",
  price_before: item.price_before || "",
  discount_price: item.discount_price || "",
  duration_weeks: item.duration_weeks || "",
  duration_hours: item.duration_hours || "",
  status: item.status || "draft",
  is_featured: item.is_featured || false,
  is_free: item.is_free || false,
  preview_video: item.preview_video || "",
  google_drive_link: item.google_drive_link || "",
  published_at: item.published_at
    ? new Date(item.published_at).toISOString().split("T")[0]
    : "",
  tags: item.tags?.map((tObj) => tObj.tag_id || tObj.id || tObj) || [],
  learnings: normalizeLearnings(item.learnings || item.what_will_learn || []),
  curriculum: normalizeCurriculum(
    item.previews || item.curriculum || item.sections || [],
  ),
  thumbnail: item.thumbnail || null,
  cover_image: item.cover_image || null,
});

// ─── Default form shape ───────────────────────────────────────────────────────

export const defaultFormData = {
  title: "",
  slug: "",
  short_description: "",
  description: "",
  category_id: "",
  instructor_id: "",
  level: "beginner",
  language: "Arabic",
  attendance_type: "online",
  price: "",
  price_before: "",
  discount_price: "",
  duration_weeks: "",
  duration_hours: "",
  status: "draft",
  is_featured: false,
  is_free: false,
  preview_video: "",
  google_drive_link: "",
  published_at: "",
  tags: [],
  learnings: [""],
  curriculum: [createSection()],
};
