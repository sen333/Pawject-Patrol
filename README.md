# Next.js Project Setup

This is a foundational Next.js project structure ready for development.

## Project Structure

\`\`\`
├── app/                    # Next.js App Router
│   ├── layout.tsx         # Root layout (already configured)
│   ├── page.tsx           # Home page
│   └── globals.css        # Global styles
├── components/            # React components
│   └── ui/               # shadcn/ui components (pre-installed)
├── lib/                  # Utility functions and configurations
│   └── utils.ts          # Helper functions (cn, etc.)
├── hooks/                # Custom React hooks
├── types/                # TypeScript type definitions
├── public/               # Static assets
└── scripts/              # Executable scripts (Python, Node.js, SQL)
\`\`\`

## Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS v4
- **UI Components**: shadcn/ui (pre-installed)

## Getting Started

1. Start building your pages in the `app/` directory
2. Create reusable components in `components/`
3. Add utility functions in `lib/`
4. Define types in `types/`

## Available Features

- ✅ TypeScript configured
- ✅ Tailwind CSS v4 ready
- ✅ shadcn/ui components installed
- ✅ App Router setup
- ✅ Path aliases configured (@/)

Ready to start building!
