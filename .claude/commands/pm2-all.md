Start all services and open PM2 monitor.
```bash
cd "D:/Projects/ca-sports" && pm2 start ecosystem.config.cjs && start wt.exe -d "D:/Projects/ca-sports" pwsh -NoExit -c "pm2 monit"
```
