export const getCourseInstructors = (course) => {
  // Student APIs may return a group-filtered instructors[] list when enrolled in a learning group.
  if (course?.instructors?.length) {
    return course.instructors;
  }

  if (course?.instructor) {
    return [course.instructor];
  }

  return [];
};

export const formatInstructorNames = (instructors, separator = ", ", maxVisible = 2) => {
  const names = (instructors || [])
    .map((instructor) => instructor.full_name || instructor.name)
    .filter(Boolean);

  if (names.length <= maxVisible) {
    return names.join(separator);
  }

  const visible = names.slice(0, maxVisible).join(separator);
  const remaining = names.length - maxVisible;

  return `${visible} +${remaining}`;
};
