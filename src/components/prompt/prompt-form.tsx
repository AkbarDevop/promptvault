'use client'

import { useActionState, useEffect } from 'react'
import { useFormStatus } from 'react-dom'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import type { Prompt, FormState } from '@/types/database'

const AI_MODELS = [
  { value: 'chatgpt', label: 'ChatGPT' },
  { value: 'claude', label: 'Claude' },
  { value: 'gemini', label: 'Gemini' },
  { value: 'grok', label: 'Grok' },
  { value: 'llama', label: 'Llama' },
  { value: 'mistral', label: 'Mistral' },
  { value: 'other', label: 'Other' },
]

const CATEGORIES = [
  { value: 'coding', label: 'Coding' },
  { value: 'writing', label: 'Writing' },
  { value: 'marketing', label: 'Marketing' },
  { value: 'design', label: 'Design' },
  { value: 'business', label: 'Business' },
  { value: 'education', label: 'Education' },
  { value: 'productivity', label: 'Productivity' },
  { value: 'creative', label: 'Creative' },
  { value: 'research', label: 'Research' },
  { value: 'other', label: 'Other' },
]

function SubmitButton({ isEditing }: { isEditing: boolean }) {
  const { pending } = useFormStatus()
  return (
    <Button type="submit" disabled={pending} className="w-full sm:w-auto">
      {pending ? 'Saving…' : isEditing ? 'Update Prompt' : 'Share Prompt'}
    </Button>
  )
}

interface PromptFormProps {
  action: (prevState: FormState, formData: FormData) => Promise<FormState>
  prompt?: Prompt
}

export function PromptForm({ action, prompt }: PromptFormProps) {
  const [state, formAction] = useActionState<FormState, FormData>(action, undefined)

  useEffect(() => {
    if (state?.error?.['_form']?.[0]) {
      toast.error(state.error['_form'][0])
    }
  }, [state])

  return (
    <form action={formAction} className="space-y-6">
      {state?.error?.['_form'] && (
        <p className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {state.error['_form']![0]}
        </p>
      )}

      <div className="space-y-2">
        <Label htmlFor="title">Title *</Label>
        <Input
          id="title"
          name="title"
          placeholder="Give your prompt a descriptive title"
          defaultValue={prompt?.title}
          required
        />
        {state?.error?.['title'] && (
          <p className="text-xs text-destructive">{state.error['title']![0]}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="content">Prompt *</Label>
        <Textarea
          id="content"
          name="content"
          placeholder="Paste your prompt here…"
          defaultValue={prompt?.content}
          rows={8}
          className="font-mono text-sm"
          required
        />
        {state?.error?.['content'] && (
          <p className="text-xs text-destructive">{state.error['content']![0]}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description <span className="text-muted-foreground">(optional)</span></Label>
        <Textarea
          id="description"
          name="description"
          placeholder="Explain what this prompt does and when to use it"
          defaultValue={prompt?.description ?? ''}
          rows={3}
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label>AI Model *</Label>
          <Select name="model" defaultValue={prompt?.model ?? 'chatgpt'}>
            <SelectTrigger>
              <SelectValue placeholder="Select model" />
            </SelectTrigger>
            <SelectContent>
              {AI_MODELS.map((m) => (
                <SelectItem key={m.value} value={m.value}>
                  {m.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>Category *</Label>
          <Select name="category" defaultValue={prompt?.category ?? 'other'}>
            <SelectTrigger>
              <SelectValue placeholder="Select category" />
            </SelectTrigger>
            <SelectContent>
              {CATEGORIES.map((c) => (
                <SelectItem key={c.value} value={c.value}>
                  {c.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="tags">Tags <span className="text-muted-foreground">(optional, comma-separated)</span></Label>
        <Input
          id="tags"
          name="tags"
          placeholder="e.g. productivity, writing, gpt-4"
          defaultValue={prompt?.tags?.join(', ')}
        />
      </div>

      <SubmitButton isEditing={!!prompt} />
    </form>
  )
}
