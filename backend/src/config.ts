const PORT = Number(process.env.PORT ?? 3000);
const haUrl = process.env.HA_URL;
const haToken = process.env.HA_TOKEN;

if (!haUrl || !haToken) {
  throw new Error(
    "HA_URL and HA_TOKEN must be defined."
  )
}

const HA_URL = haUrl;
const HA_TOKEN = haToken;

export {
  PORT,
  HA_URL,
  HA_TOKEN
};
