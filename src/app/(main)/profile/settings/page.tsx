import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getProfileById } from '@/lib/queries/profiles'
import { ProfileSettingsForm } from '@/components/profile/profile-settings-form'

export const metadata = { title: 'Profile Settings — PromptVault' }

export default async function ProfileSettingsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login?next=/profile/settings')

  const profile = await getProfileById(user.id)
  if (!profile) redirect('/login')

  return (
    <div className="mx-auto max-w-lg space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Profile Settings</h1>
        <p className="mt-1 text-sm text-muted-foreground">Update your public profile.</p>
      </div>
      <ProfileSettingsForm profile={profile} />
    </div>
  )
}
