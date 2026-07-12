"use client";

import { useSyncExternalStore } from "react";

const subscribe = () => () => {};
const getSnapshot = () => true;
const getServerSnapshot = () => false;

/**
 * Returns `true` only after the component has hydrated on the client.
 * Implemented with useSyncExternalStore to avoid the
 * "setState in effect" anti-pattern.
 */
export function useMounted() {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
