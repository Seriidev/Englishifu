/** First word of a full name — for greetings like "Welcome, Seyran". */
export function firstNameFromFullName(fullName: string): string {
  const first = fullName.trim().split(/\s+/).filter(Boolean)[0]
  return first || 'there'
}
