import { apiFetch } from "./apiClient";

export function listStudioTrainers() {
  return apiFetch<{ results: any[]; count: number }>("/api/v1/studios/trainers/");
}

export function createStudioTrainer(payload: any) {
  return apiFetch("/api/v1/studios/trainers/", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}
