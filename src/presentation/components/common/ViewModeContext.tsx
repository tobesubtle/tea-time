'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';

export type ViewMode = 'auto' | 'pc' | 'mobile';

interface ViewModeContextType {
  viewMode: ViewMode;
  setViewMode: (mode: ViewMode) => void;
}

const ViewModeContext = createContext<ViewModeContextType>({
  viewMode: 'auto',
  setViewMode: () => {},
});

export const VIEW_MODE_KEY = 'my_prompt_view_mode';

export function ViewModeProvider({ children }: { children: React.ReactNode }) {
  const [viewMode, setViewModeState] = useState<ViewMode>('auto');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem(VIEW_MODE_KEY) as ViewMode;
    if (saved && ['auto', 'pc', 'mobile'].includes(saved)) {
      setViewModeState(saved);
    }
    setMounted(true);
  }, []);

  const setViewMode = (mode: ViewMode) => {
    setViewModeState(mode);
    localStorage.setItem(VIEW_MODE_KEY, mode);
  };

  const getContainerClass = () => {
    if (!mounted || viewMode === 'auto') return '';
    if (viewMode === 'pc') return 'force-pc-mode';
    if (viewMode === 'mobile') return 'force-mobile-mode';
    return '';
  };

  return (
    <ViewModeContext.Provider value={{ viewMode, setViewMode }}>
      <div className={`w-full min-h-screen flex flex-col transition-all ${getContainerClass()}`}>
        {children}
      </div>
    </ViewModeContext.Provider>
  );
}

export function useViewMode() {
  return useContext(ViewModeContext);
}
