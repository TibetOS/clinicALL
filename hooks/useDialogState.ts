/**
 * useDialogState Hook
 *
 * A reusable hook for managing dialog/modal open state.
 * Reduces boilerplate for common dialog patterns in admin pages.
 *
 * @example
 * ```tsx
 * // Simple boolean state
 * const addDialog = useDialogState();
 * <Button onClick={addDialog.open}>Add</Button>
 * <Dialog open={addDialog.isOpen} onClose={addDialog.close}>...</Dialog>
 *
 * // With associated data (e.g., editing an item)
 * const editDialog = useDialogState<Patient>();
 * <Button onClick={() => editDialog.openWith(patient)}>Edit</Button>
 * <Dialog open={editDialog.isOpen} onClose={editDialog.close}>
 *   {editDialog.data && <EditForm patient={editDialog.data} />}
 * </Dialog>
 * ```
 */

import { useState, useCallback } from 'react';

type DialogState<T = undefined> = T extends undefined
  ? {
      /** Whether the dialog is currently open */
      isOpen: boolean;
      /** Open the dialog */
      open: () => void;
      /** Close the dialog */
      close: () => void;
      /** Toggle the dialog open/closed */
      toggle: () => void;
    }
  : {
      /** Whether the dialog is currently open */
      isOpen: boolean;
      /** The data associated with the dialog (e.g., item being edited) */
      data: T | null;
      /** Open the dialog without data */
      open: () => void;
      /** Open the dialog with associated data */
      openWith: (data: T) => void;
      /** Close the dialog and clear data */
      close: () => void;
      /** Toggle the dialog open/closed */
      toggle: () => void;
    };

/**
 * Hook for managing dialog open state
 *
 * @param initialOpen - Initial open state (default: false)
 * @returns Dialog state and control functions
 */
export function useDialogState<T = undefined>(initialOpen = false): DialogState<T> {
  const [isOpen, setIsOpen] = useState(initialOpen);
  const [data, setData] = useState<T | null>(null);

  const open = useCallback(() => {
    setIsOpen(true);
  }, []);

  const openWith = useCallback((newData: T) => {
    setData(newData);
    setIsOpen(true);
  }, []);

  const close = useCallback(() => {
    setIsOpen(false);
    setData(null);
  }, []);

  const toggle = useCallback(() => {
    setIsOpen(prev => !prev);
  }, []);

  // Return type depends on whether T is undefined
  // TypeScript will infer the correct type based on usage
  return {
    isOpen,
    data,
    open,
    openWith,
    close,
    toggle,
  } as DialogState<T>;
}

/**
 * Hook for managing multiple related dialogs
 *
 * Useful when a component has several dialogs that share
 * the same data type (e.g., add, edit, delete for same entity)
 *
 * @example
 * ```tsx
 * const dialogs = useMultiDialogState<Service>(['add', 'edit', 'delete']);
 *
 * // Open specific dialog
 * dialogs.add.open();
 * dialogs.edit.openWith(service);
 * dialogs.delete.openWith(service);
 *
 * // In JSX
 * <Dialog open={dialogs.add.isOpen} onClose={dialogs.add.close}>...</Dialog>
 * <Dialog open={dialogs.edit.isOpen} onClose={dialogs.edit.close}>
 *   {dialogs.edit.data && <EditForm service={dialogs.edit.data} />}
 * </Dialog>
 * ```
 */
export function useMultiDialogState<T, K extends string>(
  keys: readonly K[]
): Record<K, DialogState<T>> {
  // Create individual dialog states for each key
  const states = keys.reduce((acc, key) => {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    acc[key] = useDialogState<T>();
    return acc;
  }, {} as Record<K, DialogState<T>>);

  return states;
}
