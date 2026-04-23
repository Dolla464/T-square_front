import React from "react";
import DashboardSharedLayout from "../../shared-dashboard/components/DashboardLayout/DashboardSharedLayout";

const STUDENT_NAV = [
  { key: "dashboard", path: "/student/dashboard", icon: "bi-grid-fill", end: true },
  { key: "quiz", path: "/student/quizzes", icon: "bi-pencil-square" },
  { key: "certificates", path: "/student/certificates", icon: "bi-award-fill" },
  { key: "profile", path: "/student/profile", icon: "bi-person-fill" },
];

function DashboardLayout() {
  return (
    <DashboardSharedLayout
      navItems={STUDENT_NAV}
      translationNs="studentDashboard"
      userRoleName="Student"
    />
  );
}

export default DashboardLayout;
