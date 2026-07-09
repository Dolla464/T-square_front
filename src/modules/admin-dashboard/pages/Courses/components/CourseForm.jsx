import { Container, Row, Col } from "react-bootstrap";
import BasicInfoTab from "./tabs/BasicInfoTab";
import CurriculumTab from "./tabs/CurriculumTab";
import PricingTab from "./tabs/PricingTab";
import SettingsTab from "./tabs/SettingsTab";
import React, { useEffect } from "react";

// 1. استيراد الـ Hook الخاص بالأقسام (تأكد من صحة مسار الملف في مشروعك)
import { useCategories } from "../../../hooks/useCategories";

function CourseForm({
  // View state
  isReadOnly,
  editingItem,
  viewingItem,
  handleBack,
  handleSubmitWrapper,
  // Form state & handlers (from useCourseFormLogic)
  formData,
  setFormData,
  thumbnailFile,
  setThumbnailFile,
  coverFile,
  setCoverFile,
  handleChange,
  handleLearningChange,
  addLearning,
  removeLearning,
  handleFileChange,
  handleSectionTitleChange,
  handleLessonChange,
  handleVideoFileReady,
  handleVideoUploadComplete,
  handleVideoUploadError,
  handleVideoUploadStateChange,
  handleCancelUpload,
  removeLesson,
  addSection,
  removeSection,
  chunkUploads,
  ensureCourseDraft,
  getAbortController,
  // Tab navigation
  activeTab,
  setActiveTab,
  tabOrder,
  currentTabIndex,
  goToNextTab,
  goToPrevTab,
  // Data deps
  treeCategories: propsTreeCategories, // 2. أعدنا تسميته هنا لنفحصه
  instructors,
  availableTags,
  // Video modal
  handlePlayVideo,
  // i18n
  isArabic,
  t,
  onDraftCreated,
}) {
  // 3. استدعاء الـ Hook محلياً للطوارئ في حال لم يرسل الأب البيانات
  const { treeCategories: hookTreeCategories, getCategoriesTree } =
    useCategories();

  // 4. إذا كانت القادمة من الـ Props غير موجودة، نأخذ القادمة من الـ Hook
  const finalTreeCategories = propsTreeCategories || hookTreeCategories || [];

  // 5. جلب البيانات إذا كانت قادمة كـ undefined
  useEffect(() => {
    if (!propsTreeCategories && typeof getCategoriesTree === "function") {
      getCategoriesTree();
    }
  }, [propsTreeCategories, getCategoriesTree]);

  return (
    <div className="ac-form-container">
      {/* Header: back button + save/publish actions */}
      <div className="ac-form-header d-flex justify-content-between align-items-center flex-nowrap gap-3 mb-4">
        <button className="ac-back-btn flex-shrink-0" onClick={handleBack}>
          <i
            className={`bi text-secondary flex-shrink-0 ${isArabic ? "bi-arrow-right" : "bi-arrow-left"}`}
          ></i>
          <span className="ms-2 me-2 fs-5 fw-bold text-dark text-nowrap">
            {isReadOnly
              ? t("content.view_course")
              : editingItem
                ? t("content.edit_course")
                : t("content.add_new_course")}
          </span>
        </button>

        {!viewingItem && (
          <div className="ac-form-actions d-flex gap-2 flex-shrink-0 ms-right-3">
            {editingItem ? (
              <button
                className="btn btn-danger px-4 ac-publish-btn"
                onClick={(e) => handleSubmitWrapper(e, formData.status)}
              >
                {isArabic ? "تعديل الكورس" : "Update Course"}
              </button>
            ) : (
              <>
                <button
                  className="btn btn-danger px-2 px-sm-4 py-2 ac-publish-btn text-nowrap"
                  onClick={(e) => handleSubmitWrapper(e, "published")}
                >
                  <span className="d-none d-sm-inline">
                    {isArabic ? "نشر الكورس" : "Publish Course"}
                  </span>
                  <span className="d-sm-none">
                    {isArabic ? "نشر" : "Publish"}
                  </span>
                </button>
                <button
                  className="btn ac-draft-btn border px-2 px-sm-4 py-2 text-nowrap"
                  onClick={(e) => handleSubmitWrapper(e, "draft")}
                >
                  <span className="d-none d-sm-inline">
                    {isArabic ? "حفظ كمسودة" : "Save as Draft"}
                  </span>
                  <span className="d-sm-none">
                    {isArabic ? "مسودة" : "Draft"}
                  </span>
                </button>
              </>
            )}
          </div>
        )}
      </div>

      {/* Form body */}
      <div className="ac-form-body p-4 bg-white border rounded-4 shadow-sm">
        {/* Tab navigation menu */}
        <Container>
          <Row>
            <Col className="mb-3 m-0 p-0">
              <div className="ac-tabs-menu">
                <button
                  className={`ac-tab-btn ${activeTab === "basic" ? "active" : ""}`}
                  onClick={() => setActiveTab("basic")}
                >
                  {t("content.form.tabs.basic")}
                </button>
                <button
                  className={`ac-tab-btn ${activeTab === "curriculum" ? "active" : ""}`}
                  onClick={() => setActiveTab("curriculum")}
                >
                  {t("content.form.tabs.curriculum")}
                </button>
                <button
                  className={`ac-tab-btn ${activeTab === "pricing" ? "active" : ""}`}
                  onClick={() => setActiveTab("pricing")}
                >
                  {isArabic ? "التسعير" : "Pricing"}
                </button>
                <button
                  className={`ac-tab-btn ${activeTab === "settings" ? "active" : ""}`}
                  onClick={() => setActiveTab("settings")}
                >
                  {t("content.form.tabs.settings")}
                </button>
              </div>
            </Col>
          </Row>
        </Container>

        {/* Active tab content */}
        {activeTab === "basic" && (
          <BasicInfoTab
            formData={formData}
            setFormData={setFormData}
            handleChange={handleChange}
            handleLearningChange={handleLearningChange}
            addLearning={addLearning}
            removeLearning={removeLearning}
            handleFileChange={handleFileChange}
            thumbnailFile={thumbnailFile}
            setThumbnailFile={setThumbnailFile}
            coverFile={coverFile}
            setCoverFile={setCoverFile}
            treeCategories={finalTreeCategories} // 6. مررنا المتغير النهائي المضمون هنا للـ Tab
            instructors={instructors}
            availableTags={availableTags}
            viewingItem={viewingItem}
            isReadOnly={isReadOnly}
            isArabic={isArabic}
            t={t}
          />
        )}

        {activeTab === "curriculum" && (
          <CurriculumTab
            curriculum={formData.curriculum}
            handleSectionTitleChange={handleSectionTitleChange}
            handleLessonChange={handleLessonChange}
            handleVideoFileReady={handleVideoFileReady}
            handleVideoUploadComplete={handleVideoUploadComplete}
            handleVideoUploadError={handleVideoUploadError}
            handleVideoUploadStateChange={handleVideoUploadStateChange}
            handleCancelUpload={handleCancelUpload}
            removeLesson={removeLesson}
            addSection={addSection}
            removeSection={removeSection}
            handlePlayVideo={handlePlayVideo}
            chunkUploads={chunkUploads}
            courseId={editingItem?.id ?? null}
            formData={formData}
            ensureCourseDraft={ensureCourseDraft}
            getAbortController={getAbortController}
            onDraftCreated={onDraftCreated}
            isReadOnly={isReadOnly}
            isArabic={isArabic}
            t={t}
          />
        )}

        {activeTab === "pricing" && (
          <PricingTab
            formData={formData}
            handleChange={handleChange}
            isReadOnly={isReadOnly}
            isArabic={isArabic}
            t={t}
          />
        )}

        {activeTab === "settings" && (
          <SettingsTab
            formData={formData}
            handleChange={handleChange}
            isReadOnly={isReadOnly}
            isArabic={isArabic}
            t={t}
          />
        )}

        {/* Tab footer navigation */}
        <div className="ac-form-footer d-flex justify-content-between align-items-center mt-5 pt-4 border-top">
          <button
            type="button"
            className={`btn ac-draft-btn border rounded-3 px-2 px-sm-4 py-2 d-flex align-items-center gap-2 ${currentTabIndex === 0 ? "invisible" : ""}`}
            onClick={goToPrevTab}
          >
            <i
              className={`bi ${isArabic ? "bi-arrow-right" : "bi-arrow-left"}`}
            ></i>
            <span className="d-none d-sm-inline">
              {isArabic ? "السابق" : "Previous"}
            </span>
          </button>

          <div className="ac-tab-indicator d-flex gap-2">
            {tabOrder.map((tab, idx) => (
              <div
                key={tab}
                className={`rounded-circle ${idx === currentTabIndex ? "bg-danger" : "bg-light border"}`}
                style={{ width: "10px", height: "10px", cursor: "pointer" }}
                onClick={() => setActiveTab(tab)}
              ></div>
            ))}
          </div>

          <button
            type="button"
            className={`btn ac-publish-btn text-white rounded-3 px-2 px-sm-4 py-2 d-flex align-items-center gap-2 ${currentTabIndex === tabOrder.length - 1 ? "invisible" : ""}`}
            onClick={goToNextTab}
          >
            <span className="d-none d-sm-inline">
              {isArabic ? "التالي" : "Next"}
            </span>
            <i
              className={`bi ${isArabic ? "bi-arrow-left" : "bi-arrow-right"}`}
            ></i>
          </button>
        </div>
      </div>
    </div>
  );
}

export default CourseForm;
