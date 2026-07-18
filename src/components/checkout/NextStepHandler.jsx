"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { apiGet, apiPost } from "@/lib/api";

const POLL_INTERVAL = 5000;
const MAX_POLL_TIME = 5 * 60 * 1000;

function NextStepHandler({ nextStep, orderId, onComplete }) {
  const t = useTranslations("checkout");
  const [stepState, setStepState] = useState("idle");
  const [error, setError] = useState(null);
  const [otpFields, setOtpFields] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const pollRef = useRef(null);
  const pollStartRef = useRef(null);

  const cleanup = useCallback(() => {
    if (pollRef.current) {
      clearInterval(pollRef.current);
      pollRef.current = null;
    }
  }, []);

  useEffect(() => cleanup, [cleanup]);

  // Auto-open payment URL on mount
  useEffect(() => {
    if (nextStep?.type === "webview" && nextStep.url) {
      window.open(nextStep.url, "_blank", "noopener,noreferrer");
      startPolling();
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const startPolling = useCallback(() => {
    cleanup();
    setStepState("polling");
    pollStartRef.current = Date.now();

    pollRef.current = setInterval(async () => {
      if (Date.now() - pollStartRef.current > MAX_POLL_TIME) {
        cleanup();
        setStepState("timeout");
        return;
      }

      try {
        const res = await apiGet(`/orders/${orderId}`);
        const order = res?.result || res;
        const status = order?.status || order?.payment_status;

        if (status === "paid" || status === "completed") {
          cleanup();
          onComplete();
        } else if (status === "payment_failed" || status === "failed") {
          cleanup();
          setStepState("error");
          setError(t("retry"));
        }
      } catch {
        // continue polling
      }
    }, POLL_INTERVAL);
  }, [cleanup, orderId, onComplete, t]);

  const handleManualCheck = useCallback(async () => {
    try {
      setStepState("polling");
      const res = await apiGet(`/orders/${orderId}`);
      const order = res?.result || res;
      const status = order?.status || order?.payment_status;
      if (status === "paid" || status === "completed") {
        cleanup();
        onComplete();
      } else {
        setStepState("idle");
      }
    } catch {
      setStepState("idle");
    }
  }, [cleanup, orderId, onComplete]);

  useEffect(() => {
    if (!nextStep) {
      onComplete();
    }
  }, [nextStep, onComplete]);

  if (!nextStep) return null;

  if (nextStep.type === "webview") {
    return (
      <div className="bg-white border rounded-lg p-6 text-center space-y-4">
        <h2 className="text-xl font-bold">{nextStep.title || t("payment_required")}</h2>

        {stepState === "idle" && (
          <div className="space-y-3">
            <div className="flex justify-center">
              <div className="w-8 h-8 border-2 border-black border-t-transparent rounded-full animate-spin" />
            </div>
            <p className="text-sm text-gray-600">{t("redirecting_payment")}</p>
          </div>
        )}

        {stepState === "polling" && (
          <div className="space-y-3">
            <div className="flex justify-center">
              <div className="w-8 h-8 border-2 border-black border-t-transparent rounded-full animate-spin" />
            </div>
            <p className="text-sm text-gray-600">{t("payment_confirming")}</p>
            <button
              className="text-sm underline text-gray-500"
              onClick={handleManualCheck}
            >
              {t("payment_complete_manually")}
            </button>
          </div>
        )}

        {stepState === "error" && (
          <div className="space-y-3">
            <p className="text-sm text-red-600">{t("error_generic")}</p>
            <button
              className="bg-black text-white px-6 py-2 rounded font-bold text-sm"
              onClick={() => {
                setStepState("idle");
              }}
            >
              {t("retry")}
            </button>
          </div>
        )}

        {stepState === "timeout" && (
          <div className="space-y-3">
            <p className="text-sm text-gray-600">{t("payment_timeout")}</p>
            <button
              className="text-sm underline text-gray-500"
              onClick={handleManualCheck}
            >
              {t("payment_complete_manually")}
            </button>
          </div>
        )}
      </div>
    );
  }

  if (nextStep.type === "otp") {
    const otpLength = nextStep.otp_length || 6;
    const endpoint = nextStep.verify_otp_endpoint
      ? `/${nextStep.verify_otp_endpoint}`
      : null;

    const handleOtpSubmit = async () => {
      setSubmitting(true);
      try {
        if (!endpoint) {
          setError(t("error_generic"));
          return;
        }
        const res = await apiPost(endpoint, { code: otpFields.code });
        if (res?.success) {
          onComplete();
        } else {
          setError(res?.message || t("error_generic"));
        }
      } catch {
        setError(t("error_generic"));
      } finally {
        setSubmitting(false);
      }
    };

    return (
      <div className="bg-white border rounded-lg p-6 space-y-4">
        <h2 className="text-xl font-bold">{nextStep.title || t("payment_required")}</h2>
        {nextStep.subtitle && (
          <p className="text-sm text-gray-500">{nextStep.subtitle}</p>
        )}
        <div>
          <label className="text-sm font-semibold text-gray-700 block mb-2">
            {t("complete_payment")}
          </label>
          <input
            type="text"
            inputMode="numeric"
            maxLength={otpLength}
            className="w-full border rounded px-3 py-2 text-sm text-center tracking-widest"
            placeholder={"·".repeat(otpLength)}
            value={otpFields.code || ""}
            onChange={(e) =>
              setOtpFields({ code: e.target.value.replace(/\D/g, "").slice(0, otpLength) })
            }
          />
        </div>
        {error && <p className="text-sm text-red-600">{error}</p>}
        <button
          className="w-full bg-black text-white py-3 rounded font-bold text-lg disabled:opacity-50"
          onClick={handleOtpSubmit}
          disabled={submitting || !otpFields.code || otpFields.code.length < otpLength}
        >
          {submitting ? t("processing") : t("complete_payment")}
        </button>
      </div>
    );
  }

  return null;
}

export default NextStepHandler;
