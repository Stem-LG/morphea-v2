# structure.md

This document outlines the structure and guidelines for the Morphfront project.

## Project Info

-   **Project Name**: Morphfront
-   **technology Stack**: Next.js, Supabase, React, TypeScript, Shadcn UI, Tailwind CSS, Lucide Icons

## File Structure

Routes are organized in the `app` directory, following the Next.js conventions. Each route can have its own components, hooks, constants.

Example structure:

```app/
├── _components/ (global components)
├── _hooks/ (global hooks)
├── admin/
│   ├── events/
│   │   ├── _components/
│   │   ├── _hooks/
│   │   │   ├── use-events.ts
│   │   │   ├── use-create-event.ts
│   │   │   ├── use-update-event.ts
│   │   │   └── use-delete-event.ts
│   │   └── page.tsx
│   ├── users/
│   │   ├── _components/
│   │   ├── _hooks/
│   │   └── page.tsx
│   ├── page.tsx
│   └── layout.tsx
│
├── public/
│   └── images/
└── lib/
    ├── translations/
    │   ├── fr.json
    │   └── en.json
    ├── supabase.ts
    └── utils.ts
```

## Guidelines

-   Use kebab-case for file names (e.g., `use-create-event.ts`).
-   Group related hooks and components together in their respective directories.
-   Always check for existing hooks or components before creating new ones to avoid duplication.
-   Keep the directory structure organized and intuitive.
-   Don't create unnecessary types, for Supabase queries, let the Supabase client infer types automatically, otherwise define them on top of the file.
-   Use shadcn UI components for consistent styling.
-   To install shadcn UI components, use the command `bunx shadcn@latest install` don't create them from scratch.
-   For tables, use the `@tanstack/react-table` library for advanced features like sorting, filtering, and pagination. Combined with the `@/components/data-table` component for consistent styling.
-   For select inputs, use the `@/components/super-select` component for consistent styling and functionality.
-   Use `sonner` for notifications and toasts, and create a `Toaster` component in the `_components` directory.
-   Use the context7 tools for getting information about the different libraries that are used or to be used in the project before making decisions, to get an idea about up to date features and usage examples.
-   Use `nuqs` library for using url parameters as state in components, it provides a simple way to manage URL parameters and synchronize them with component state, especially in combination with the data-table component. (use context7 to get more information about it)
