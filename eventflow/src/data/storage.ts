import { AppState } from '../types';

const STORAGE_KEY = 'eventflow_ai_state_v2';

export function loadState(): AppState | null {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return null;
    return JSON.parse(stored) as AppState;
  } catch {
    return null;
  }
}

export function saveState(state: AppState): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // ignore storage errors silently
  }
}

export function clearState(): void {
  localStorage.removeItem(STORAGE_KEY);
}
