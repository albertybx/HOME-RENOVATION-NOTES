import React from 'react';
import { Plus } from 'lucide-react';
import styles from './AddNoteButton.module.css';

/**
 * LOCKED DESIGN: Desktop "新增筆記" button.
 * Adjustments elsewhere must not alter its spacing, dimensions or animation.
 * See AddNoteButton.module.css and scripts/check-add-note-button.mjs.
 */
export default function AddNoteButton({ onClick }) {
  return (
    <div className={styles.anchor}>
      <button type="button" onClick={onClick} aria-label="新增筆記" className={styles.button}>
        <Plus size={24} className={styles.icon} aria-hidden="true" />
        <span className={styles.label}>新增筆記</span>
      </button>
    </div>
  );
}
