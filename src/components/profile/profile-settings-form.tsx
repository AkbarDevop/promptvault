'use client'

import { useActionState, useTransition } from 'react'
import { useFormStatus } from 'react-dom'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { updateProfile, uploadAvatar } from '@/lib/actions/profile'
import { toast } from 'sonner'
import type { Profile, FormState } from '@/types/database'

function SubmitButton() {
  const { pending } = useFormStatus()
  return (
    <Button type="submit" disabled={pending}>
      {pending ? 'Saving…' : 'Save changes'}
    </Button>
  )
}

export function ProfileSettingsForm({ profile }: { profile: Profile }) {
  const [state, action] = useActionState<FormState, FormData>(updateProfile, undefined)
  const [isUploading, startUpload] = useTransition()

  if (state?.success) {
    toast.success(state.success)
  }

  async function handleAvatarChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    const formData = new FormData()
    formData.append('avatar', file)

    startUpload(async () => {
      const result = await uploadAvatar(formData)
      if (result?.error) toast.error(result.error)
      else toast.success('Avatar updated!')
    })
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Avatar className="h-16 w-16">
          <AvatarImage src={profile.avatar_url ?? undefined} />
          <AvatarFallback className="text-xl">
            {(profile.display_name ?? profile.username)[0].toUpperCase()}
          </AvatarFallback>
        </Avatar>
        <div>
          <Label htmlFor="avatar-upload" className="cursor-pointer">
            <Button variant="outline" size="sm" asChild disabled={isUploading}>
              <span>{isUploading ? 'Uploading…' : 'Change avatar'}</span>
            </Button>
          </Label>
          <input
            id="avatar-upload"
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleAvatarChange}
          />
          <p className="mt-1 text-xs text-muted-foreground">JPG, PNG, GIF up to 2MB</p>
        </div>
      </div>

      <form action={action} className="space-y-4">
        {state?.error?.['_form'] && (
          <p className="text-sm text-destructive">{state.error['_form']![0]}</p>
        )}

        <div className="space-y-2">
          <Label>Username</Label>
          <Input value={profile.username} disabled />
          <p className="text-xs text-muted-foreground">Username cannot be changed.</p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="display_name">Display name</Label>
          <Input
            id="display_name"
            name="display_name"
            defaultValue={profile.display_name ?? ''}
            required
          />
          {state?.error?.['display_name'] && (
            <p className="text-xs text-destructive">{state.error['display_name']![0]}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="bio">Bio</Label>
          <Textarea
            id="bio"
            name="bio"
            rows={3}
            placeholder="Tell the community about yourself"
            defaultValue={profile.bio ?? ''}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="website_url">Website</Label>
          <Input
            id="website_url"
            name="website_url"
            type="url"
            placeholder="https://yourwebsite.com"
            defaultValue={profile.website_url ?? ''}
          />
        </div>

        <SubmitButton />
      </form>
    </div>
  )
}
