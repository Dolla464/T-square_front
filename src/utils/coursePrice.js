/**
 * Returns display label for course price (handles free courses).
 */
export function formatCoursePrice(course, t) {
  if (!course) return "";

  const isFree =
    course?.is_free === true ||
    course?.price?.final === 0 ||
    course?.price?.final === "0";

  if (isFree) {
    return t("courses:card.free");
  }

  return `${course.price?.final ?? ""} ${t("courses:card.priceUnit")}`;
}

export function isCourseFree(course) {
  return (
    course?.is_free === true ||
    course?.price?.final === 0 ||
    course?.price?.final === "0"
  );
}
