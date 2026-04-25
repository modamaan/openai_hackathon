# Replyo - AI Customer Support Chatbot Builder

Replyo is a production-ready SaaS application that allows users to seamlessly build, train, and embed RAG-powered customer support chatbots directly onto their own websites. 

By simply providing a website URL, Replyo crawls the domain, generates OpenAI embeddings, and constructs an intelligent knowledge base. Customers receive dynamic, grounded answers via an embeddable glassmorphism widget.

![Replyo Dashboard Preview](public/dashboard-preview.png)

## Overview & Features

* 🤖 **RAG Knowledge Base:** Instantly train models on live website URLs or manual text via scalable web scraping (powered by ZenRows).
* 🌐 **Embeddable Chat SDK:** Fully-functional, cross-origin Javascript snippet (`/api/sdk.js`) for customers to embed a floating dark-mode widget natively into any HTML website.
* 🧠 **OpenAI Embeddings & Inference:** Uses `text-embedding-3-small` for fast cosine similarity search and `gpt-4o-mini` via Vercel AI SDK streams.
* 🔐 **Enterprise Auth:** Handled via Scalekit B2C OAuth (Google Sign-in).
* 🗄️ **Serverless PostgreSQL Database:** Using NeonDB with Drizzle ORM.
* 🚀 **Post-Login Onboarding:** Magic flow that immediately creates AI profiles for new organizations automatically.

## Tech Stack

* **Framework:** [Next.js 15 App Router](https://nextjs.org/)
* **Database:** [Neon (Serverless Postgres)](https://neon.tech)
* **ORM:** [Drizzle ORM](https://orm.drizzle.team/)
* **Authentication:** [Scalekit SDK](https://scalekit.com)
* **Scraping Engine:** [ZenRows](https://www.zenrows.com/)
* **AI / RAG:** [OpenAI SDK] & [Vercel AI SDK]
* **Styling:** Tailwind CSS, Lucide React Icons, Glassmorphism UI

---

## Getting Started

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment Variables
Copy `.env.local` or create a new one with the following format. *Note: Never commit your secrets!*

```env
# NeonDB Database
DATABASE_URL=postgresql://...

# Scalekit Authentication credentials
SCALEKIT_ENV_URL=https://...
SCALEKIT_CLIENT_ID=...
SCALEKIT_CLIENT_SECRET=...

# ZenRows Web Scraping
ZENROWS_API_KEY=...

# OpenAI Secret Key
OPENAI_API_KEY=...

# Public App URL (For CORS & OAuth Callbacks)
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 3. Push Database Schema
```bash
npx drizzle-kit push
```

### 4. Run the Dev Server
```bash
npm run dev
```

Your local application will be running on [http://localhost:3000](http://localhost:3000).

## Embedding the Chat Widget

For customers adopting the chatbot, embedding requires a single HTML script injected before the closing `</body>` tag on any front-end. The widget supports cross-origin requests securely.

```html
<script src="https://your-domain.com/api/sdk.js" data-bot-id="YOUR_BOT_ID_HERE" defer></script>
```

You can test how the widget natively looks using the built-in Sandbox Playground located inside the `Bot Settings` page on your dashboard.

## Deployment

The application is fully optimized for continuous deployments out of the box using **Vercel** or **Google Cloud Run**. Ensure all environment variables are correctly populated in your target environments before triggering a build.
