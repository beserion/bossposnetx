module.exports = {
  apps: [
    {
      name: "KeyifKafeBoss",
      script: "server.ts",
      interpreter: "node",
      interpreter_args: "--import tsx/esm",
      env: {
        NODE_ENV: "production",
        PORT: 3302
      },
      env_development: {
        NODE_ENV: "development",
        PORT: 3303
      },
      autorestart: true,
      watch: false,
      max_memory_restart: '1G'
    }
  ]
};
