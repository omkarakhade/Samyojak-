const [loadingPlan, setLoadingPlan] = useState('')

const handleSelect = async (planName: string, productId: string) => {
  setLoadingPlan(planName)
  try {
    const { data: { user } } = await (await import('@/lib/supabase')).supabase.auth.getUser()
    const res = await fetch('/api/checkout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        productId,
        email: user?.email || '',
        name: user?.user_metadata?.full_name || 'Customer',
      }),
    })
    const data = await res.json()
    if (data.url) window.location.href = data.url
    else alert('Payment setup coming soon! Contact hello@samyojak.app')
  } catch (e) {
    console.error(e)
    alert('Payment setup coming soon! Contact hello@samyojak.app')
  }
  setLoadingPlan('')
}
