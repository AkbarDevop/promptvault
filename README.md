# PromptVault

> The social platform for AI prompt art. Share, discover, and learn from the best AI prompts and chatbot interactions.

Think of it as Instagram/Dribbble for prompt engineering — a place where the art of asking the right question is celebrated, curated, and learned from.

## Features

- Share prompts from ChatGPT, Claude, Gemini, Grok, and more
- Feed with Latest and Trending tabs
- Like and bookmark prompts
- User profiles
- Search and filter by category and tags
- Email + Google OAuth authentication
- Optimistic UI for likes/bookmarks

## Tech Stack

- **Framework:** Next.js 15 (App Router)
- **Database:** Supabase (Postgres + Auth + Storage)
- **Styling:** Tailwind CSS + shadcn/ui
- **Language:** TypeScript

## Getting Started

### 1. Clone the repo

```bash
git clone https://github.com/yourusername/promptvault.git
cd promptvault
npm install
```

### 2. Set up Supabase

1. Create a project at [supabase.com](https://supabase.com)
2. Run `supabase-schema.sql` in the Supabase SQL Editor
3. Create a public storage bucket named `avatars`
4. (Optional) Enable Google OAuth in Authentication → Providers

### 3. Configure environment variables

```bash
cp .env.example .env.local
```

Fill in `.env.local`:

```
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

### 4. Run the dev server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Environment Variables

| Variable | Description |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Your Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Your Supabase anon/public key |

## Contributing

Pull requests are welcome. For major changes, please open an issue first.

## License

[MIT](LICENSE)
