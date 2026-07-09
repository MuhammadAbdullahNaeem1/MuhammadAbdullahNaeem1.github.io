# M. Abdullah Naeem — Portfolio

A fully static, code-only portfolio site. All content lives in the codebase as
data files — there is **no CMS and no runtime API calls**. Built with React +
Vite and deployed as a static site on Vercel.

> This started from a React + Sanity template and was migrated to a
> self-contained static build. Sanity (client, image builder, `backend_sanity/`,
> and all environment variables) has been removed entirely.

## Architecture

```
frontend_react/
├── index.html            # SEO + Open Graph / Twitter meta tags
├── public/
│   ├── favicon-A.svg      # site icon
│   ├── preview.png        # 1200×630 link-preview / OG image
│   ├── manifest.json      # web app manifest
│   └── projects/          # project screenshots, one folder per project
│       └── <project-id>/  # 1.png, 2.png, … (carousel order)
└── src/
    ├── data/
    │   ├── projects.js     # every project: copy, tech stack, case study, images
    │   └── profile.js      # bio, about cards, skills, experience, contact
    ├── containers/         # About, Work, Skills, Contact, Header (read from data/)
    ├── components/         # Navbar, Footer
    └── assets/             # images imported by components
```

### Editing content

All content is edited in code — no external dashboard:

| To change…                                   | Edit                                    |
| -------------------------------------------- | --------------------------------------- |
| Projects (title, description, case study, tech, images) | `src/data/projects.js`     |
| Bio / About cards                            | `src/data/profile.js` → `aboutMe`, `aboutCards` |
| Skills                                       | `src/data/profile.js` → `skills`        |
| Experience timeline                          | `src/data/profile.js` → `experience`    |
| Contact email, Cal.com link, socials, résumé | `src/data/profile.js` → `profile`       |
| SEO title, description, OG/Twitter tags      | `frontend_react/index.html`             |

**Adding a project:** drop its screenshots in
`public/projects/<project-id>/1.png, 2.png, …` and add an entry to the array in
`src/data/projects.js`. The card thumbnail defaults to the first screenshot;
`categories` drives the filter bar and `tags` are shown as chips in the modal.

**Résumé button:** the About section's "Resume" button opens
`profile.resumeUrl` (`/resume.pdf` by default) — drop a `resume.pdf` into
`frontend_react/public/` to wire it up.

### Skills icons

Skill icons come from [`react-icons`](https://react-icons.github.io/react-icons/)
(Simple Icons set) — referenced directly in `src/data/profile.js`, no image
assets required.

## Getting started

```sh
cd frontend_react
npm install
npm run dev      # local dev server
npm run build    # static production build → frontend_react/build/
npm run preview  # preview the production build locally
```

## Built with

- [React](https://react.dev/) + [Vite](https://vitejs.dev/)
- [SCSS](https://sass-lang.com/) for styling
- [Framer Motion](https://www.framer.com/motion/) for animations
- [react-icons](https://react-icons.github.io/react-icons/) for iconography

## Deployment (Vercel)

Static build, no server or environment variables required.

- **Root directory:** `frontend_react`
- **Build command:** `npm run build`
- **Output directory:** `build`

## Contact

M. Abdullah Naeem — Abdullahnaeem175@gmail.com
· [LinkedIn](https://www.linkedin.com/in/abdullahnaeem-)
· [GitHub](https://github.com/MuhammadAbdullahNaeem1)
