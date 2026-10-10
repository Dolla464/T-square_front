import { useEffect, useRef } from "react";

let qrCleanupPromise = Promise.resolve();

function stopScanner(scanner) {
  return new Promise((resolve) => {
    try {
      scanner.stop().catch(() => {}).finally(resolve);
    } catch {
      resolve();
    }
  });
}

export default function QrScannerWidget({ onScan, onError, isArabic }) {
  const containerRef = useRef(null);
  const onScanRef = useRef(onScan);
  const onErrorRef = useRef(onError);

  useEffect(() => {
    onScanRef.current = onScan;
  }, [onScan]);

  useEffect(() => {
    onErrorRef.current = onError;
  }, [onError]);

  useEffect(() => {
    const containerId = "student-qr-scan-box";
    let active = true;
    let scanner = null;
    let startPromise = null;
    const previousCleanup = qrCleanupPromise;

    const run = async () => {
      await previousCleanup;
      if (!active || !containerRef.current) return;

      const { Html5Qrcode } = await import("html5-qrcode");
      if (!active || !containerRef.current) return;

      scanner = new Html5Qrcode(containerId);

      startPromise = scanner.start(
        { facingMode: "environment" },
        { fps: 10, qrbox: { width: 220, height: 220 } },
        (decodedText) => {
          if (decodedText.startsWith("sess_")) {
            stopScanner(scanner);
            onScanRef.current(decodedText);
          }
        },
        () => {},
      );

      try {
        await startPromise;
      } catch (err) {
        if (active) {
          onErrorRef.current(err instanceof Error ? err : new Error(String(err)));
        }
      }
    };

    run();

    return () => {
      active = false;
      const s = scanner;
      scanner = null;
      qrCleanupPromise = Promise.resolve(startPromise)
        .catch(() => {})
        .then(() => (s ? stopScanner(s) : undefined));
    };
  }, []);

  return (
    <div className="text-center">
      <div
        id="student-qr-scan-box"
        ref={containerRef}
        style={{
          width: "100%",
          maxWidth: 300,
          margin: "0 auto",
          borderRadius: "12px",
          overflow: "hidden",
        }}
      />
      <p className="small text-muted mt-3 mb-0">
        {isArabic
          ? "وجّه الكاميرا نحو رمز QR الذي يعرضه المدرب."
          : "Point your camera at the QR code displayed by the instructor."}
      </p>
    </div>
  );
}
