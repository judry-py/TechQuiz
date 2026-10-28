'use client';

/**
 * Contexte React qui transmet la préférence reduce_motion depuis le profil
 * utilisateur (stocké en DB) à toute l'arborescence de composants.
 */
import React, { createContext, useContext } from 'react';

const ReduceMotionContext = createContext<boolean>(false);

export function ReduceMotionProvider({
  value,
  children,
}: {
  value: boolean;
  children: React.ReactNode;
}) {
  return <ReduceMotionContext.Provider value={value}>{children}</ReduceMotionContext.Provider>;
}

export function useReduceMotionPreference(): boolean {
  return useContext(ReduceMotionContext);
}
