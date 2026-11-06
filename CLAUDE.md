# CA Sports website

Expo (React Native + web) rebuild of thecasports.com, routes in `app/` (expo-router), product data in `src/data/products.json` (regenerate with `npm run scrape`).

## PM2 Services

| Port | Name | Type |
|------|------|------|
| 8081 | ca-sports-8081 | Expo web (Metro) |

**Terminal Commands:**
```bash
pm2 start ecosystem.config.cjs   # First time
pm2 start all                    # After first time
pm2 stop all / pm2 restart all
pm2 start ca-sports-8081 / pm2 stop ca-sports-8081
pm2 logs / pm2 status / pm2 monit
pm2 save                         # Save process list
pm2 resurrect                    # Restore saved list
```
