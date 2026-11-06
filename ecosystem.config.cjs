module.exports = {
  apps: [
    {
      name: 'ca-sports-8081',
      cwd: './',
      script: 'node_modules/expo/bin/cli',
      args: 'start --web --port 8081',
      interpreter: 'C:/nvm4w/nodejs/node.exe',
      env: { NODE_ENV: 'development' },
    },
  ],
};
