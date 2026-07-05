import { t } from 'i18next'
import React from 'react'
import { Container } from 'react-bootstrap'
import { Link } from 'react-router-dom'

function CtaEnroll() {
    return (
        <div className="cta-journey-section text-center text-white py-5 mt-5">
            <Container className="py-5 position-relative z-1">
                <h2 className="cta-title fw-bold mb-3">{t("cta:title")}</h2>
                <p className="cta-desc mb-4 mx-auto">{t("cta:desc")}</p>
                <Link to="/signup" className="btn-cta-enroll text-decoration-none">{t("cta:enroll")}</Link>
            </Container>
        </div>
    )
}

export default CtaEnroll