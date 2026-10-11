/** Visible wording. Stored values can stay `TOEFL`. */
export function toeflPreparationLabel(value: string): string {
  return value.replace(/TOEFL(?!\s+Preparation)/g, 'TOEFL Preparation')
}
