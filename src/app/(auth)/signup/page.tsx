import Link from 'next/link'
import { SignupForm } from '@/components/auth/signup-form'

export const metadata = { title: 'Sign up — PromptVault' }

export default function SignupPage() {
  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <div className="w-full max-w-sm space-y-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold">Join PromptVault</h1>
          <p className="mt-1 text-sm text-muted-foreground">Share and discover the art of prompting</p>
        </div>
        <SignupForm />
        <p className="text-center text-sm text-muted-foreground">
          Already have an account?{' '}
          <Link href="/login" className="font-medium underline underline-offset-4 hover:text-primary">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  )
}
