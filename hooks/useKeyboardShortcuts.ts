/**
 * useKeyboardShortcuts Hook
 * Handles keyboard shortcuts for web
 */

import { useEffect } from 'react';
import { Platform } from 'react-native';

interface KeyboardShortcut {
  key: string;
  ctrlKey?: boolean;
  metaKey?: boolean;
  shiftKey?: boolean;
  action: () => void;
  description?: string;
}

export function useKeyboardShortcuts(shortcuts: KeyboardShortcut[]) {
  useEffect(() => {
    if (Platform.OS !== 'web') return;

    const handleKeyDown = (event: KeyboardEvent) => {
      shortcuts.forEach((shortcut) => {
        const isCtrl = shortcut.ctrlKey && (event.ctrlKey || event.metaKey);
        const isMeta = shortcut.metaKey && (event.metaKey || event.ctrlKey);
        const isShift = shortcut.shiftKey === undefined ? false : shortcut.shiftKey === event.shiftKey;
        const isKey = event.key.toLowerCase() === shortcut.key.toLowerCase();

        if ((isCtrl || isMeta || (!shortcut.ctrlKey && !shortcut.metaKey)) && isShift && isKey) {
          event.preventDefault();
          shortcut.action();
        }
      });
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [shortcuts]);
}

