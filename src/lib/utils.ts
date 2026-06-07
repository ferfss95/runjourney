import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatPace(paceMinPerKm: number): string {
  const minutes = Math.floor(paceMinPerKm);
  const seconds = Math.round((paceMinPerKm - minutes) * 60);
  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
}

export function formatDuration(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  if (h > 0) return `${h}h ${m.toString().padStart(2, "0")}m`;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export function formatDistance(km: number): string {
  if (km >= 1) return `${km.toFixed(1)} km`;
  return `${(km * 1000).toFixed(0)} m`;
}

export function calculatePace(distanceKm: number, timeSeconds: number): number {
  if (distanceKm <= 0) return 0;
  return timeSeconds / 60 / distanceKm;
}

export function xpForLevel(level: number): number {
  return level * 100;
}

export function levelFromXp(totalXp: number): number {
  let level = 1;
  let xpNeeded = 0;
  while (xpNeeded + level * 100 <= totalXp) {
    xpNeeded += level * 100;
    level++;
  }
  return level;
}

export function xpProgressInLevel(totalXp: number): {
  current: number;
  needed: number;
  percent: number;
} {
  const level = levelFromXp(totalXp);
  let xpBeforeLevel = 0;
  for (let i = 1; i < level; i++) {
    xpBeforeLevel += i * 100;
  }
  const current = totalXp - xpBeforeLevel;
  const needed = level * 100;
  return {
    current,
    needed,
    percent: Math.min(100, Math.round((current / needed) * 100)),
  };
}
