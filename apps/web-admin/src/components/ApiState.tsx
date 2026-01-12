"use client";

import React from "react";
import { APP_CONFIG } from "../config/app";

export function BackendNotice() {
  if (APP_CONFIG.BACKEND_READY) return null;

  return (
    <div className="mb-4 rounded-lg border border-yellow-200 bg-yellow-50 p-3 text-sm text-yellow-900">
      Backend is still being fixed. You can use the UI, but saving/loading data may not work yet.
    </div>
  );
}

export function ApiErrorBox({ title, message }: { title?: string; message?: string }) {
  return (
    <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-900">
      <div className="font-semibold">{title ?? "Request failed"}</div>
      <div className="mt-1 opacity-90">{message ?? "Please try again later."}</div>
    </div>
  );
}

export function EmptyState({ title, description }: { title: string; description?: string }) {
  return (
    <div className="rounded-lg border border-gray-200 bg-white p-6 text-center">
      <div className="text-base font-semibold">{title}</div>
      {description ? <div className="mt-1 text-sm text-gray-600">{description}</div> : null}
    </div>
  );
}
