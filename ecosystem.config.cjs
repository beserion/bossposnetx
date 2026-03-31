module.exports = {
  apps: [
    {
      name: "posnetx",
      script: "server.ts",
      // Yerel node_modules içindeki tsx paketini kullanarak TypeScript dosyalarını doğrudan çalıştırır
      interpreter: "node",
      interpreter_args: "--import tsx/esm",
      env: {
        NODE_ENV: "production",
        PORT: 3000
      },
      env_development: {
        NODE_ENV: "development",
        PORT: 3000
      },
      // Hata durumunda otomatik yeniden başlatma
      autorestart: true,
      watch: false,
      max_memory_restart: '1G'
    }
  ]
};
