import React, { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Container, Card, Button, Spinner } from "react-bootstrap";
import { useAuth } from "../../contexts/AuthContext";
import { useTranslation } from "react-i18next";
import {
  toastInfo,
  toastSuccess,
} from "../../components/shared/Toaster/toaster";
import tsquareLogo from "../../assets/logo-dark.webp";
import "../Login/Login.css";
import "../NotFound/NotFoundPage.css";
import "./MaintenancePage.css";

const MaintenancePage = () => {
  const { checkMaintenanceStatus } = useAuth();
  const { t, i18n } = useTranslation("common");
  const isArabic = i18n.language === "ar";
  const [isRefreshing, setIsRefreshing] = useState(false);

  const redirectToHome = useCallback(() => {
    window.location.assign("/");
  }, []);

  const verifyMaintenanceStatus = useCallback(
    async ({ showFeedback = false } = {}) => {
      if (showFeedback) {
        setIsRefreshing(true);
      }

      try {
        const stillInMaintenance = await checkMaintenanceStatus();

        if (stillInMaintenance === false) {
          if (showFeedback) {
            toastSuccess(
              t("maintenance.backOnline", {
                defaultValue:
                  "Maintenance is over. Redirecting you to the homepage...",
              }),
            );
          }

          redirectToHome();
          return;
        }

        if (showFeedback) {
          toastInfo(
            t("maintenance.stillInMaintenance", {
              defaultValue:
                "The site is still under maintenance. Please try again later.",
            }),
          );
        }
      } catch {
        if (showFeedback) {
          window.location.reload();
        }
      } finally {
        if (showFeedback) {
          setIsRefreshing(false);
        }
      }
    },
    [checkMaintenanceStatus, redirectToHome, t],
  );

  useEffect(() => {
    verifyMaintenanceStatus();
  }, [verifyMaintenanceStatus]);

  return (
    <div
      className="login-wrapper notfound-wrapper maintenance-wrapper"
      dir={isArabic ? "rtl" : "ltr"}
    >
      <Container className="d-flex justify-content-center align-items-center h-100">
        <Card className="login-card notfound-card maintenance-card shadow border-0 p-4">
          <Card.Body className="text-center p-0">
            {/* اللوجو */}
            <Link to="/">
              <img
                src={tsquareLogo}
                alt="T-Square Logo"
                className="login-logo mb-4"
                title={t("maintenance.backToHome", {
                  defaultValue: "Back to Home",
                })}
              />
            </Link>

            <div className="py-4">
              <div className="maintenance-icon-container mb-4">
                <div className="gear-wrapper">
                  <i className="bi bi-gear-fill gear-main"></i>
                  <i className="bi bi-gear-fill gear-sub"></i>
                </div>
              </div>

              <h4 className="fw-bold text-dark mb-3">
                {t("maintenance.title", {
                  defaultValue: "Site Under Maintenance!",
                })}
              </h4>

              <p
                className="text-muted mb-4 px-3"
                style={{ fontSize: "0.95rem", lineHeight: "1.6" }}
              >
                {t("maintenance.description", {
                  defaultValue:
                    "We are currently upgrading and optimizing our platform to bring you the best possible educational experience. We will be back online shortly!",
                })}
              </p>

              <div className="d-flex flex-column gap-2 mt-4">
                {/* زرار دخول الأدمن لوحة التحكم */}
                <Button
                  variant="danger"
                  className="w-100 fw-bold py-2 login-btn"
                  onClick={() => {
                    window.location.assign("/login");
                  }}
                >
                  {t("maintenance.adminAccess", {
                    defaultValue: "Admin Control Panel Access",
                  })}
                </Button>

                {/* زرار تحديث وفحص حالة الصيانة */}
                <Button
                  variant="outline-secondary"
                  className="w-100 fw-bold py-2 btn-back"
                  disabled={isRefreshing}
                  onClick={() => verifyMaintenanceStatus({ showFeedback: true })}
                >
                  {isRefreshing ? (
                    <Spinner
                      animation="border"
                      size="sm"
                      className={isArabic ? "ms-1" : "me-1"}
                    />
                  ) : (
                    <i
                      className={`bi bi-arrow-clockwise ${isArabic ? "ms-1" : "me-1"}`}
                    ></i>
                  )}
                  {t("maintenance.refresh", { defaultValue: "Refresh Page" })}
                </Button>
              </div>
            </div>
          </Card.Body>
        </Card>
      </Container>
    </div>
  );
};

export default MaintenancePage;
