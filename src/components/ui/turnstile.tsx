"use client";

import { Turnstile } from "@marsidev/react-turnstile";
import { forwardRef, useImperativeHandle, useRef } from "react";

interface TurnstileComponentProps {
  siteKey: string;
  onVerify: (token: string) => void;
  onError?: () => void;
  onExpire?: () => void;
  theme?: "light" | "dark" | "auto";
  size?: "normal" | "compact";
}

export interface TurnstileRef {
  reset: () => void;
  remove: () => void;
  render: () => void;
}

export const TurnstileComponent = forwardRef<
  TurnstileRef,
  TurnstileComponentProps
>(
  (
    { siteKey, onVerify, onError, onExpire, theme = "auto", size = "normal" },
    ref
  ) => {
    const turnstileRef = useRef<any>(null);

    useImperativeHandle(ref, () => ({
      reset: () => turnstileRef.current?.reset(),
      remove: () => turnstileRef.current?.remove(),
      render: () => turnstileRef.current?.render(),
    }));

    return (
      <Turnstile
        ref={turnstileRef}
        siteKey={siteKey}
        onSuccess={onVerify}
        onError={onError}
        onExpire={onExpire}
        options={{
          theme,
          size,
        }}
      />
    );
  }
);

TurnstileComponent.displayName = "TurnstileComponent";
