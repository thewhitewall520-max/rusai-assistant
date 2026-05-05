module.exports = {
  apps: [{
    name: "rusai",
    script: "node_modules/.bin/next",
    args: "start",
    cwd: "/opt/rusai-assistant/rusai-assistant",
    env: {
      NODE_ENV: "production",
      PORT: 3000,
      DEEPSEEK_API_KEY: process.env.DEEPSEEK_API_KEY,
      NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET || "NGB/HsfCDR7DDNMD16Xy7cYzQ6qT1+6DX0rC+HVVpOVw=",
      NEXTAUTH_URL: "https://rusai.cc",
      DATABASE_URL: process.env.DATABASE_URL,
      GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID,
      GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET
    }
  }]
}
