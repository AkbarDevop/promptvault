'use client'

import { useActionState, useTransition, useEffect, useState } from 'react'
import { useFormStatus } from 'react-dom'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { updateProfile, uploadAvatar } from '@/lib/actions/profile'
import { AvatarCropModal } from '@/components/profile/avatar-crop-modal'
import { toast } from 'sonner'
import type { Profile, FormState } from '@/types/database'

const MAX_SIZE_MB = 5
const MAX_SIZE_BYTES = MAX_SIZE_MB * 1024 * 1024

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
  const [avatarUrl, setAvatarUrl] = useState(profile.avatar_url ?? undefined)

  // Crop modal state
  const [cropSrc, setCropSrc] = useState<string | null>(null)

  useEffect(() => {
    if (state?.success) toast.success(state.success)
  }, [state?.success])

  // Step 1: user picks a file → open crop modal
  function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    if (file.size > MAX_SIZE_BYTES) {
      toast.error(`Image must be under ${MAX_SIZE_MB}MB (yours is ${(file.size / 1024 / 1024).toFixed(1)}MB)`)
      e.target.value = ''
      return
    }

    const objectUrl = URL.createObjectURL(file)
    setCropSrc(objectUrl)
    e.target.value = '' // reset so same file can be re-selected
  }

  // Step 2: user confirms crop → upload the cropped blob
  function handleCropConfirm(blob: Blob) {
    setCropSrc(null)

    // Show preview immediately using local blob URL
    const preview = URL.createObjectURL(blob)
    setAvatarUrl(preview)

    const formData = new FormData()
    formData.append('avatar', blob, 'avatar.jpg')

    startUpload(async () => {
      const result = await uploadAvatar(formData)
      if (result?.error) {
        toast.error(result.error)
        setAvatarUrl(profile.avatar_url ?? undefined)
      } else {
        if (result?.url) setAvatarUrl(result.url)
        toast.success('Avatar updated!')
      }
    })
  }

  return (
    <div className="space-y-6">
      {/* Crop modal — only mounts when a file is selected */}
      {cropSrc && (
        <AvatarCropModal
          src={cropSrc}
          open={true}
          onClose={() => setCropSrc(null)}
          onConfirm={handleCropConfirm}
        />
      )}

      <div className="flex items-center gap-4">
        <Avatar className="h-16 w-16">
          <AvatarImage src={avatarUrl} />
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
            onChange={handleFileSelect}
          />
          <p className="mt-1 text-xs text-muted-foreground">JPG, PNG, GIF up to {MAX_SIZE_MB}MB</p>
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
            type="text"
            placeholder="example.com"
            defaultValue={profile.website_url ?? ''}
          />
          <p className="text-xs text-muted-foreground">e.g. example.com or https://example.com</p>
        </div>

        <SubmitButton />
      </form>
    </div>
  )
}
