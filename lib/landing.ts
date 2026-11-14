/** Everyone lands in the chat home. The plan decides which modules are unlocked inside it. */
export function landingPath(_user?: { user_metadata?: any } | null): string {
  return '/ai'
}
