"use client";

import Lottie from "lottie-react";
import { useEffect, useState } from "react";

/** Public asset — LottieFiles package lf20_jbrw3hcz (success / check). */
const ORDER_SUCCESS_SRC = "/lottie/order-success.json";

type OrderSuccessLottieProps = {
  className?: string;
  /** Max width of the player (tailwind-friendly). */
  maxWidthClassName?: string;
};

export function OrderSuccessLottie({
  className = "",
  maxWidthClassName = "max-w-[200px]",
}: OrderSuccessLottieProps) {
  const [data, setData] = useState<Record<string, unknown> | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetch(ORDER_SUCCESS_SRC)
      .then((res) => {
        if (!res.ok) throw new Error(String(res.status));
        return res.json();
      })
      .then((json) => {
        if (!cancelled) setData(json);
      })
      .catch(() => {
        if (!cancelled) setData(null);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  if (!data) {
    return (
      <div
        className={`mx-auto size-24 animate-pulse rounded-full bg-emerald-100/80 dark:bg-emerald-950/40 ${className}`}
        aria-hidden
      />
    );
  }

  return (
    <div
      className={`mx-auto w-full ${maxWidthClassName} ${className}`}
      role="img"
      aria-label="Order confirmed animation"
    >
      <Lottie
        animationData={data}
        loop={false}
        className="h-36 w-full sm:h-44"
      />
    </div>
  );
}
