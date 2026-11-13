/** Where a signed-in user lands: the chat home for AI-enabled plans, the dashboard otherwise. */
export function landingPath(user: { user_metadata?: any } | null | undefined): string {
  const meta = user?.user_metadata || {}
  if (meta.is_demo || meta.plan === 'Complete') return '/ai'
  return '/dashboard'
}
