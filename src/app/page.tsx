import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { getFeedPrompts } from '@/lib/queries/prompts'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Sparkles, ArrowRight, Heart, Star, Archive, Clock, GitFork } from 'lucide-react'
import { CATEGORY_META } from '@/lib/category-icons'
import type { PromptCategory } from '@/types/database'

const MODEL_LABELS: Record<string, string> = {
  chatgpt: 'ChatGPT',
  claude: 'Claude',
  gemini: 'Gemini',
  grok: 'Grok',
  llama: 'Llama',
  mistral: 'Mistral',
  other: 'Other',
}

const CATEGORIES = Object.entries(CATEGORY_META) as [
  PromptCategory,
  (typeof CATEGORY_META)[PromptCategory],
][]

export default async function HomePage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (user) redirect('/feed')

  const trending = await getFeedPrompts({ tab: 'trending', limit: 6 })

  return (
    <div className="flex flex-col gap-20 pb-20">
      {/* ── Hero ── */}
      <section className="relative mx-auto max-w-3xl px-4 pt-20 pb-8 text-center">
        <div className="pointer-events-none absolute inset-0 -top-10 flex justify-center">
          <div className="h-72 w-72 rounded-full bg-primary/20 blur-3xl" />
        </div>

        <div className="relative">
          <Badge variant="secondary" className="mb-4 gap-1.5">
            <Archive className="h-3 w-3 text-primary" />
            The permanent archive for AI prompts
          </Badge>

          <h1 className="text-4xl font-extrabold tracking-tight sm:text-6xl">
            Your prompts deserve
            <br />
            <span className="text-primary">to live forever.</span>
          </h1>

          <p className="mx-auto mt-5 max-w-xl text-lg text-muted-foreground">
            The right prompt can change everything. PromptVault is where the best prompts for
            Claude, ChatGPT, Gemini, and more are preserved, shared, and remembered — forever.
          </p>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Button asChild size="lg">
              <Link href="/feed">
                Explore the archive
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link href="/signup">Start preserving</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* ── Philosophy ── */}
      <section className="mx-auto w-full max-w-5xl px-4">
        <div className="grid gap-6 sm:grid-cols-3">
          <div className="rounded-xl border bg-card p-6 text-center space-y-2">
            <Archive className="mx-auto h-8 w-8 text-primary" />
            <h3 className="font-bold">Permanent archive</h3>
            <p className="text-sm text-muted-foreground">
              Like archive.org but for prompts. Every prompt you save here is preserved and
              timestamped forever.
            </p>
          </div>
          <div className="rounded-xl border bg-card p-6 text-center space-y-2">
            <Sparkles className="mx-auto h-8 w-8 text-primary" />
            <h3 className="font-bold">Digital art of AI</h3>
            <p className="text-sm text-muted-foreground">
              Prompts are creative artifacts. The best ones are crafted, refined, and deserve
              to be recognized as works of art.
            </p>
          </div>
          <div className="rounded-xl border bg-card p-6 text-center space-y-2">
            <GitFork className="mx-auto h-8 w-8 text-primary" />
            <h3 className="font-bold">Remix and evolve</h3>
            <p className="text-sm text-muted-foreground">
              Fork any prompt, build on it, trace its lineage. Great prompts evolve through
              community collaboration.
            </p>
          </div>
        </div>
      </section>

      {/* ── Trending Prompts ── */}
      {trending.length > 0 && (
        <section className="mx-auto w-full max-w-5xl px-4">
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-xl font-bold">
              <Star className="mr-2 inline h-5 w-5 text-primary" />
              Most loved this week
            </h2>
            <Button asChild variant="ghost" size="sm">
              <Link href="/feed?tab=trending">
                View all <ArrowRight className="ml-1 h-4 w-4" />
              </Link>
            </Button>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {trending.slice(0, 6).map((prompt) => {
              const catMeta = CATEGORY_META[prompt.category as PromptCategory]
              const profile = prompt.profiles
              return (
                <Link
                  key={prompt.id}
                  href={`/prompts/${prompt.id}`}
                  className="group flex flex-col gap-3 rounded-xl border bg-card p-4 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <Avatar className="h-7 w-7">
                        <AvatarImage src={profile.avatar_url ?? undefined} />
                        <AvatarFallback className="text-xs">
                          {(profile.display_name ?? profile.username ?? 'U')[0].toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-xs font-medium text-muted-foreground">
                        {profile.display_name ?? profile.username}
                      </span>
                    </div>
                    <Clock className="h-3 w-3 text-muted-foreground/50" />
                  </div>

                  <h3 className="font-semibold leading-snug line-clamp-2 group-hover:text-primary transition-colors">
                    {prompt.title}
                  </h3>

                  <p className="text-xs text-muted-foreground font-mono line-clamp-3 bg-muted/40 rounded-md p-2">
                    {prompt.content}
                  </p>

                  <div className="flex items-center justify-between">
                    <div className="flex gap-1">
                      {catMeta && (
                        <Badge variant="secondary" className={`text-xs gap-1 ${catMeta.color}`}>
                          <catMeta.Icon className="h-3 w-3" />
                          {catMeta.label}
                        </Badge>
                      )}
                      <Badge variant="outline" className="text-xs">
                        {MODEL_LABELS[prompt.model] ?? prompt.model}
                      </Badge>
                    </div>
                    <span className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Heart className="h-3 w-3" />
                      {prompt.like_count}
                    </span>
                  </div>
                </Link>
              )
            })}
          </div>
        </section>
      )}

      {/* ── Categories ── */}
      <section className="mx-auto w-full max-w-5xl px-4">
        <h2 className="mb-6 text-xl font-bold">Browse the archive</h2>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-5">
          {CATEGORIES.map(([key, meta]) => (
            <Link
              key={key}
              href={`/explore?category=${key}`}
              className="flex flex-col items-center gap-2 rounded-xl border bg-card p-4 text-center hover:shadow-md hover:border-primary/30 hover:-translate-y-0.5 transition-all duration-200 group"
            >
              <meta.Icon className={`h-6 w-6 ${meta.color} group-hover:scale-110 transition-transform`} />
              <span className="text-xs font-medium">{meta.label}</span>
            </Link>
          ))}
        </div>
      </section>

      {/* ── Join CTA ── */}
      <section className="mx-auto w-full max-w-3xl px-4">
        <div className="relative overflow-hidden rounded-2xl border bg-gradient-to-br from-primary/15 via-primary/5 to-transparent p-10 text-center">
          <div className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-primary/20 blur-3xl" />
          <Archive className="mx-auto mb-4 h-8 w-8 text-primary" />
          <h2 className="text-2xl font-bold">One prompt away from a brighter future.</h2>
          <p className="mt-2 text-muted-foreground max-w-md mx-auto">
            Don&apos;t let your best prompts disappear into chat history. Preserve them. Share them. Let them inspire the next breakthrough.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Button asChild size="lg">
              <Link href="/signup">
                Start your archive
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link href="/explore">Explore prompts</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  )
}
