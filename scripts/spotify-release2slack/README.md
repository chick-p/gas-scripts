# spotify-release2slack

## Setup

1. Change directory to this project`.

   ```bash
   $ cd scripts/spotify-release2slack/
   ```

1. Install dependencies.

   ```bash
   $ pnpm install
   ```

1. Login to your Google account.

   ```bash
   $ pnpm run login
   ```

1. (If need) Create a new google apps project.

   ```bash
   $ pnpm run create
   ```

1. Deploy to google apps project.

   ```bash
   $ pnpm run deploy
   ```

1. Setup script propeties for required paramters.

   1. Access to the project page.
   1. Open [Project Settings].
   1. Add the below propeties.
      - `SPOTIFY_CLIENT_ID` - Spotify Client ID
      - `SPOTIFY_CLIENT_SECRET` - Spotify Client Secret
      - `SPOTIFY_AUTHORIZED_CODE` - Authorized Code
      - `SLACK_WEBHOOK_URL` - Slack Webhook URL

## How to get Sporify Authorized Code

1. Create Spotify App.

1. Access to [Spotify Developer Dashboard](https://developer.spotify.com/dashboard/applications).
1. Create a new app.
1. Get Client ID and Client Secret.
1. Access following URL with your Client ID and get `code`.

  ```shell
  https://accounts.spotify.com/authorize?response_type=code&scope=user-follow-read&redirect_uri=http://localhost:8888/callback&client_id=YOUR_CLIENT_ID
  ```
