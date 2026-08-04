export function pickAllowed(data, allowedKeys) {
  return Object.fromEntries(
    allowedKeys
      .filter((key) => data[key] != null && data[key] !== "")
      .map((key) => [key, data[key]]),
  );
}

export function toFormData(obj) {
  const fd = new FormData();
  Object.entries(obj).forEach(([key, value]) => {
    if (value instanceof File || value instanceof Blob) {
      fd.append(key, value);
    } else if (value != null && value !== "") {
      fd.append(key, value);
    }
  });
  return fd;
}

export const REGISTER_ALLOWED = [
  "full_name",
  "phone",
  "email",
  "password",
  "password_confirmation",
];

export const STUDENT_CREATE_ALLOWED = [
  "full_name",
  "email",
  "password",
  "phone",
  "gender",
  "group_id",
  "avatar",
  "age",
  "qualification",
  "guardian_phone",
  "national_id",
  "address",
  "notes",
];

export const STUDENT_PROFILE_ALLOWED = [
  "gender",
  "phone",
  "avatar",
  "full_name",
  "age",
  "qualification",
  "guardian_phone",
  "national_id",
  "address",
  "notes",
];

export const INSTRUCTOR_PROFILE_ALLOWED = [
  "full_name",
  "name",
  "gender",
  "phone",
  "field",
  "bio",
  "insta_url",
  "linkedin_url",
  "facebook_url",
  "avatar",
];

export const SOLUTION_ALLOWED = [
  "title",
  "description",
  "content",
  "tag_ids",
  "is_published",
  "tags",
];

export const COURSE_DRAFT_ALLOWED = [
  "title",
  "category_id",
  "instructor_ids",
  "instructor_id",
  "short_description",
  "description",
  "status",
];

export function buildRegisterPayload(data) {
  return pickAllowed(data, REGISTER_ALLOWED);
}

export function buildStudentCreatePayload(data) {
  const payload = pickAllowed(data, STUDENT_CREATE_ALLOWED);
  payload.role = "student";
  return payload;
}

export function buildStudentCreateFormData(data) {
  const payload = buildStudentCreatePayload(data);
  if (payload.avatar instanceof File || payload.avatar instanceof Blob) {
    return toFormData(payload);
  }
  delete payload.avatar;
  return toFormData(payload);
}

export function buildProfilePayload(data, allowedKeys = STUDENT_PROFILE_ALLOWED) {
  if (data instanceof FormData) {
    const obj = {};
    for (const [key, value] of data.entries()) {
      if (allowedKeys.includes(key)) {
        obj[key] = value;
      }
    }
    return toFormData(obj);
  }

  const payload = pickAllowed(data, allowedKeys);
  if (payload.avatar instanceof File || payload.avatar instanceof Blob) {
    return toFormData(payload);
  }
  delete payload.avatar;
  return Object.keys(payload).length ? payload : pickAllowed(data, allowedKeys);
}

export function buildInstructorProfilePayload(data) {
  return buildProfilePayload(
    {
      ...data,
      full_name: data.full_name || data.name,
    },
    INSTRUCTOR_PROFILE_ALLOWED,
  );
}

export function buildSolutionPayload(data, { isDraft = false } = {}) {
  const payload = pickAllowed(data, SOLUTION_ALLOWED);
  payload.is_published = !isDraft;
  if (data.tags && !payload.tag_ids) {
    payload.tag_ids = data.tags;
  }
  return payload;
}

export function buildCourseDraftPayload(data) {
  return {
    ...pickAllowed(data, COURSE_DRAFT_ALLOWED),
    status: "draft",
  };
}
