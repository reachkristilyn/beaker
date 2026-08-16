"use client";

import styles from "./page.module.css";

type Props = {
  /** How many points have been picked so far (0, 1, or 2). */
  pickedCount: number;
  isPicking: boolean;
  distanceInput: string;
  onDistanceChange: (value: string) => void;
  onStartPicking: () => void;
  onApply: () => void;
  onReset: () => void;
  /** Current scale, once calibrated. */
  inchesPerUnit: number | null;
};

export default function CalibrationPanel({
  pickedCount,
  isPicking,
  distanceInput,
  onDistanceChange,
  onStartPicking,
  onApply,
  onReset,
  inchesPerUnit,
}: Props) {
  const canApply = pickedCount === 2 && Number(distanceInput) > 0;

  return (
    <div className={styles.panel}>
      <p className={styles.panelTitle}>Scale calibration</p>

      <p className={styles.panelHint}>
        {isPicking
          ? pickedCount === 0
            ? "Click the first point in the room."
            : pickedCount === 1
              ? "Click the second point."
              : "Two points set. Enter the real distance."
          : "Pick two points a known distance apart to set real-world scale."}
      </p>

      <div className={styles.panelRow}>
        <button
          type="button"
          className={styles.button}
          onClick={onStartPicking}
          disabled={isPicking}
        >
          {isPicking ? "Picking…" : "Pick two points"}
        </button>
        <button type="button" className={styles.buttonQuiet} onClick={onReset}>
          Reset
        </button>
      </div>

      <div className={styles.panelRow}>
        <label className={styles.label} htmlFor="known-distance">
          Real distance (inches)
        </label>
        <input
          id="known-distance"
          className={styles.input}
          type="number"
          min="0"
          step="0.1"
          value={distanceInput}
          onChange={(e) => onDistanceChange(e.target.value)}
          placeholder="e.g. 80"
        />
      </div>

      <button
        type="button"
        className={styles.button}
        onClick={onApply}
        disabled={!canApply}
      >
        Apply scale
      </button>

      {inchesPerUnit !== null && (
        <p className={styles.panelHint}>
          1 splat unit = {inchesPerUnit.toFixed(3)} in
        </p>
      )}
    </div>
  );
}