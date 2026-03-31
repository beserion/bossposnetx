module.exports = {
  apps: [
    {
      name: "posnetx",
      script: "server.ts",
      interpreter: "node",
      interpreter_args: "--import tsx/esm",
      env: {
        NODE_ENV: "production",
        PORT: 3100
      },
      env_development: {
        NODE_ENV: "development",
        PORT: 3000
      },
      autorestart: true,
      watch: false,
      max_memory_restart: '1G'
    }
  ]
};
