# NERO ProjectBoard — Claude Code Instructions

## Commit & Push Policy
Always commit and push to main when changes are complete.
Use clear descriptive commit messages.

## Deploy Process (developer runs manually on Hetzner after push)
cd /root/nero-projectboard
git pull origin main
cd client && npm install && npm run build
cd ..
pm2 restart nero-projectboard --update-env

## Branch
Always work on main directly.

## File Structure
- client/src/App.jsx — state and API logic only
- client/src/theme.js — CSS variables and useTheme hook
- client/src/components/Nav.jsx
- client/src/components/Column.jsx
- client/src/components/ProjectCard.jsx
- client/src/components/Panel.jsx
- client/src/components/NewProjectModal.jsx
