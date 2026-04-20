# NERO ProjectBoard — Claude Code Instructions

## Commit & Push Policy
**NEVER commit or push automatically under any circumstances.**
Always stage changes with git add and then STOP.
Wait for explicit instruction from the developer before running git commit or git push.
The developer will review diffs and commit manually from terminal.

## Deploy Process
Do not rely on GitHub Actions.
After the developer commits and pushes, deployment is done manually on Hetzner:

cd /root/nero-projectboard
git pull origin main
cd client && npm install && npm run build
cd ..
pm2 restart nero-projectboard --update-env

Never assume GitHub Actions will deploy. The developer runs these commands manually.

## Branch
Always work on main branch directly.

## File Structure
- client/src/App.jsx — state and API logic only
- client/src/theme.js — CSS variables and useTheme hook
- client/src/components/Nav.jsx
- client/src/components/Column.jsx
- client/src/components/ProjectCard.jsx
- client/src/components/Panel.jsx
