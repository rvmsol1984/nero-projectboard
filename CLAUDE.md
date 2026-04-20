## Deploy Process
Do not rely on GitHub Actions for deployment.
After committing and pushing to main, deployment is done manually on Hetzner via:

cd /root/nero-projectboard
git pull origin main
cd client && npm install && npm run build
pm2 restart nero-projectboard --update-env

Never assume GitHub Actions will deploy. The developer runs these commands manually.
