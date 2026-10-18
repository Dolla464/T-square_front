import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Form, Spinner } from "react-bootstrap";
import { useTranslation } from "react-i18next";
import { useSearchParams } from "react-router-dom";
import { isArabicLocale } from "../../../../utils/isArabicLocale";
import { selectClass } from "../../components/shared/adminUiStyles";
import { getLearningGroupsSelection } from "../../services/learningGroupServices";
import { getStudentById, getStudents } from "../../services/studentsServices";
import GroupAttendanceCardsPreviewPanel from "../Groups/components/GroupAttendanceCardsPreviewPanel";
import StudentAttendanceCardPanel from "../Students/components/StudentAttendanceCardPanel";
import "../../components/shared/AdminContentPage/AdminContentPage.css";

const SCOPE_GROUP = "group";
const SCOPE_STUDENT = "student";

const parseListResponse = (res) => {
  const list = res?.data;
  return Array.isArray(list) ? list : [];
};

function AdminAttendanceQrCards() {
  const { t, i18n } = useTranslation("adminDashboard");
  const isArabic = isArabicLocale(i18n.language);
  const ns = "attendanceQrCardsPage";
  const [searchParams, setSearchParams] = useSearchParams();
  const urlHydrated = useRef(false);

  const [scope, setScope] = useState(SCOPE_GROUP);
  const [selectedGroupId, setSelectedGroupId] = useState("");
  const [selectionGroups, setSelectionGroups] = useState([]);
  const [loadingGroups, setLoadingGroups] = useState(false);

  const [studentSearch, setStudentSearch] = useState("");
  const [debouncedStudentSearch, setDebouncedStudentSearch] = useState("");
  const [students, setStudents] = useState([]);
  const [studentsPagination, setStudentsPagination] = useState(null);
  const [loadingStudents, setLoadingStudents] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedStudentSearch(studentSearch), 500);
    return () => clearTimeout(timer);
  }, [studentSearch]);

  useEffect(() => {
    let cancelled = false;
    setLoadingGroups(true);
    getLearningGroupsSelection()
      .then((res) => {
        if (!cancelled) {
          setSelectionGroups(res?.data || []);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setSelectionGroups([]);
        }
      })
      .finally(() => {
        if (!cancelled) {
          setLoadingGroups(false);
        }
      });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (scope !== SCOPE_STUDENT) {
      return;
    }
    let cancelled = false;
    setLoadingStudents(true);
    const params = {
      per_page: 50,
      status: "active",
      for_select: 1,
    };
    const trimmed = debouncedStudentSearch.trim();
    if (trimmed) {
      params.search = trimmed;
    }
    getStudents(params)
      .then((res) => {
        if (!cancelled) {
          setStudents(parseListResponse(res));
          setStudentsPagination(res?.pagination || null);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setStudents([]);
          setStudentsPagination(null);
        }
      })
      .finally(() => {
        if (!cancelled) {
          setLoadingStudents(false);
        }
      });
    return () => {
      cancelled = true;
    };
  }, [debouncedStudentSearch, scope]);

  useEffect(() => {
    if (urlHydrated.current) {
      return;
    }
    const urlScope = searchParams.get("scope");
    const groupId = searchParams.get("groupId");
    const studentId = searchParams.get("studentId");
    if (urlScope === SCOPE_STUDENT) {
      setScope(SCOPE_STUDENT);
      if (studentId) {
        setSelectedStudent({ id: Number(studentId) });
      }
    } else if (groupId) {
      setScope(SCOPE_GROUP);
      setSelectedGroupId(String(groupId));
    }
    urlHydrated.current = true;
  }, [searchParams]);

  useEffect(() => {
    if (!urlHydrated.current) {
      return;
    }
    const next = new URLSearchParams();
    next.set("scope", scope);
    if (scope === SCOPE_GROUP && selectedGroupId) {
      next.set("groupId", selectedGroupId);
    }
    if (scope === SCOPE_STUDENT && selectedStudent?.id) {
      next.set("studentId", String(selectedStudent.id));
    }
    setSearchParams(next, { replace: true });
  }, [scope, selectedGroupId, selectedStudent, setSearchParams]);

  useEffect(() => {
    if (scope !== SCOPE_STUDENT || !selectedStudent?.id) {
      return;
    }
    if (selectedStudent.full_name) {
      return;
    }
    let cancelled = false;
    getStudentById(selectedStudent.id)
      .then((res) => {
        if (cancelled) {
          return;
        }
        const row = res?.data ?? res;
        if (row?.id) {
          setSelectedStudent(row);
        }
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [scope, selectedStudent]);

  const displayStudents = useMemo(() => {
    if (!selectedStudent) {
      return students;
    }
    if (students.some((s) => s.id === selectedStudent.id)) {
      return students;
    }
    return [selectedStudent, ...students];
  }, [students, selectedStudent]);

  const handleScopeChange = useCallback((nextScope) => {
    setScope(nextScope);
    if (nextScope === SCOPE_GROUP) {
      setSelectedStudent(null);
      setStudentSearch("");
    } else {
      setSelectedGroupId("");
    }
  }, []);

  const handleGroupChange = (e) => {
    setSelectedGroupId(e.target.value);
  };

  const handleStudentSelect = (e) => {
    const id = e.target.value;
    if (!id) {
      setSelectedStudent(null);
      return;
    }
    const student =
      displayStudents.find((s) => String(s.id) === id) || null;
    setSelectedStudent(student);
  };

  const groupIdNumber = selectedGroupId ? Number(selectedGroupId) : null;

  return (
    <div className="admin-content-page">
      <div className="ac-header d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="ac-title">{t(`${ns}.title`)}</h2>
          <p className="ac-subtitle text-muted mb-0">{t(`${ns}.subtitle`)}</p>
        </div>
      </div>

      <div className="ac-table-card mb-4">
        <div className="ac-rounded-table p-3 p-md-4" dir={isArabic ? "rtl" : "ltr"}>
          <div className="ac-filters-bar d-flex flex-column gap-3">
            <Form className="d-flex flex-column flex-md-row gap-3">
              <Form.Check
                type="radio"
                id="attendance-qr-scope-group"
                name="attendanceQrScope"
                checked={scope === SCOPE_GROUP}
                onChange={() => handleScopeChange(SCOPE_GROUP)}
                label={t(`${ns}.scope_group`)}
              />
              <Form.Check
                type="radio"
                id="attendance-qr-scope-student"
                name="attendanceQrScope"
                checked={scope === SCOPE_STUDENT}
                onChange={() => handleScopeChange(SCOPE_STUDENT)}
                label={t(`${ns}.scope_student`)}
              />
            </Form>

            {scope === SCOPE_GROUP ? (
              <div>
                <label className="fw-semibold small text-muted mb-1 d-block">
                  <i className="bi bi-people me-1" />
                  {t(`${ns}.selectGroup`)}
                </label>
                <select
                  className={selectClass(!!selectedGroupId)}
                  value={selectedGroupId}
                  onChange={handleGroupChange}
                  disabled={loadingGroups}
                >
                  <option value="">{t(`${ns}.chooseGroup`)}</option>
                  {selectionGroups.map((group) => (
                    <option key={group.id} value={group.id}>
                      {group.name}
                    </option>
                  ))}
                </select>
              </div>
            ) : (
              <div className="d-flex flex-column flex-md-row gap-3 flex-wrap align-items-end">
                <div className="flex-grow-1" style={{ minWidth: "200px" }}>
                  <label className="fw-semibold small text-muted mb-1 d-block">
                    <i className="bi bi-search me-1" />
                    {t(`${ns}.searchStudent`)}
                  </label>
                  <input
                    type="search"
                    className="form-control ac-form-input p-2 bg-light border-0 rounded-3"
                    value={studentSearch}
                    onChange={(e) => setStudentSearch(e.target.value)}
                    placeholder={t(`${ns}.searchStudentPlaceholder`)}
                  />
                </div>
                <div style={{ minWidth: "240px" }}>
                  <label className="fw-semibold small text-muted mb-1 d-block">
                    <i className="bi bi-person me-1" />
                    {t(`${ns}.selectStudent`)}
                  </label>
                  <select
                    className={selectClass(!!selectedStudent?.id)}
                    value={selectedStudent?.id ? String(selectedStudent.id) : ""}
                    onChange={handleStudentSelect}
                    disabled={loadingStudents}
                  >
                    <option value="">{t(`${ns}.chooseStudent`)}</option>
                    {displayStudents.map((student) => (
                      <option key={student.id} value={student.id}>
                        {student.full_name}
                        {student.enrollment_number
                          ? ` (${student.enrollment_number})`
                          : ""}
                      </option>
                    ))}
                  </select>
                  {loadingStudents ? (
                    <Spinner animation="border" size="sm" className="mt-2" />
                  ) : null}
                  {studentsPagination?.total != null ? (
                    <p className="text-muted small mt-1 mb-0">
                      {t(`${ns}.searchStudentsHint`, {
                        count: studentsPagination.total,
                      })}
                    </p>
                  ) : null}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {scope === SCOPE_GROUP && groupIdNumber ? (
        <GroupAttendanceCardsPreviewPanel
          key={groupIdNumber}
          groupId={groupIdNumber}
          isArabic={isArabic}
        />
      ) : null}

      {scope === SCOPE_STUDENT && selectedStudent?.id ? (
        <StudentAttendanceCardPanel
          key={selectedStudent.id}
          studentId={selectedStudent.id}
          studentName={selectedStudent.full_name || `#${selectedStudent.id}`}
          enrollmentNumber={selectedStudent.enrollment_number || ""}
        />
      ) : null}
    </div>
  );
}

export default AdminAttendanceQrCards;
