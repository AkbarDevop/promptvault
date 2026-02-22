import { z } from 'zod'

export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
})

export const signupSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  username: z
    .string()
    .min(3, 'Username must be at least 3 characters')
    .max(30, 'Username must be at most 30 characters')
    .regex(/^[a-z0-9_]+$/, 'Username can only contain lowercase letters, numbers, and underscores'),
})

export const promptSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters').max(120, 'Title must be at most 120 characters'),
  content: z.string().min(10, 'Content must be at least 10 characters').max(8000, 'Content must be at most 8000 characters'),
  description: z.string().max(500, 'Description must be at most 500 characters').optional(),
  model: z.enum(['chatgpt', 'claude', 'gemini', 'grok', 'llama', 'mistral', 'other']),
  category: z.enum([
    'coding', 'writing', 'marketing', 'design', 'business',
    'education', 'productivity', 'creative', 'research', 'other',
  ]),
  tags: z.array(z.string().max(30)).max(10).default([]),
  is_public: z.boolean().default(true),
})

export const profileSchema = z.object({
  display_name: z.string().min(1, 'Display name is required').max(50, 'Display name must be at most 50 characters'),
  bio: z.string().max(300, 'Bio must be at most 300 characters').optional(),
  website_url: z
    .string()
    .optional()
    .transform((val) => {
      if (!val || val.trim() === '') return ''
      const trimmed = val.trim()
      if (/^https?:\/\//i.test(trimmed)) return trimmed
      return `https://${trimmed}`
    })
    .pipe(z.string().url('Must be a valid URL').or(z.literal(''))),
})

export type LoginFormData = z.infer<typeof loginSchema>
export type SignupFormData = z.infer<typeof signupSchema>
export type PromptFormData = z.infer<typeof promptSchema>
export type ProfileFormData = z.infer<typeof profileSchema>
