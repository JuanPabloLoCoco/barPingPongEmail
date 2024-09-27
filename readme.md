Paso 0:

1. Crear un archivo .env con la siguiente estructura

```
PORT=<PORT>
TUYA_DEVICE_ID=<TUYA_DEVICE_ID>
TUYA_HOST=<TUYA_HOST>
TUYA_ACCESS_KEY=<TUYA_ACCESS_KEY>
TUYA_SECRET_KEY=<TUYA_SECRET_KEY>
TWILIO_ACCOUNT_SID=<TWILIO_ACCOUNT_SID>
TWILIO_ACCESS_TOKEN=<TWILIO_ACCESS_TOKEN>
FIREBASE_DATABASE_URL=<FIREBASE_DATABASE_URL>
```

2. Colocar en un archivo firebase-config.json con las credenciales de firebase

```typescript
{
  "type": string,
  "project_id": string,
  "private_key_id": string,
  "private_key": string,
  "client_email": string,
  "client_id": string,
  "auth_uri": string,
  "token_uri": string,
  "auth_provider_x509_cert_url": string,
  "client_x509_cert_url": string,
  "universe_domain": string
}
```

3. Configurar las credenciales de la cuenta de gmail. Las mismas se crean desde la consola de google para un proyecto asignado a alguna cuenta.

```typescript
{
  "web": {
    "client_id": string,
    "project_id": string,
    "auth_uri": string,
    "token_uri": string,
    "auth_provider_x509_cert_url": string,
    "client_secret": string,
    "redirect_uris": [
      "http://localhost:8900/oauth2Callback",
      "http://localhost:3000/oauth2Callback"
    ],
    "javascript_origins": ["http://localhost"]
  }
}

```

Para iniciar el proyecto

```bash
nvm use
npm -i -G pnpm
pnpm install
```

Para correr en modo desarrollo

```bash
pnpm dev
```

Una vez corriendo el proyecto configurar el acceso a la cuenta de gmail.
Para esto se debe acceder a localhost:<PORT>/gmail/auth

Para correr tests

```bash
pnpm test
```
