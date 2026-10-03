'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { usePathname } from 'next/navigation';

interface AdminSidebarContextType {
  isCollapsed: boolean;
  setIsCollapsed: React.Dispatch<React.SetStateAction<boolean>>;
  toggleSidebar: () => void;
  isEditorPage: boolean;
}

const AdminSidebarContext = createContext<AdminSidebarContextType | undefined>(undefined);

export function AdminSidebarProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isEditorPage = Boolean(
    pathname?.includes('/admin/articles/') &&
      (pathname.endsWith('/edit') || pathname.endsWith('/new'))
  );

  const [isCollapsed, setIsCollapsed] = useState<boolean>(false);

  // Auto-collapse sidebar when on article editor pages for maximum screen real estate
  useEffect(() => {
    if (isEditorPage) {
      setIsCollapsed(true);
    } else {
      setIsCollapsed(false);
    }
  }, [isEditorPage, pathname]);

  const toggleSidebar = useCallback(() => {
    setIsCollapsed((prev) => !prev);
  }, []);

  // Global keyboard shortcut: Ctrl+B or Cmd+B to toggle admin sidebar
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'b') {
        const target = e.target as HTMLElement;
        // Don't intercept if user is typing in an input/textarea/editor unless intended
        if (target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable)) {
          // If in editor, Ctrl+B is often bold, so only trigger if Alt is also pressed or outside text field
          if (!e.altKey) return;
        }
        e.preventDefault();
        toggleSidebar();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [toggleSidebar]);

  return (
    <AdminSidebarContext.Provider
      value={{
        isCollapsed,
        setIsCollapsed,
        toggleSidebar,
        isEditorPage,
      }}
    >
      {children}
    </AdminSidebarContext.Provider>
  );
}

export function useAdminSidebar() {
  const context = useContext(AdminSidebarContext);
  if (!context) {
    return {
      isCollapsed: false,
      setIsCollapsed: () => {},
      toggleSidebar: () => {},
      isEditorPage: false,
    };
  }
  return context;
}
