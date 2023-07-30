# rss-to-bluesky-social

## Setup

1. Install dependencies.

   ```bash
   $ npm install
   ```

1. Login to your Google account.

   ```bash
   $ npm run login -w rss-to-bluesky-social
   ```

1. (If need) Create a new google apps project.

   ```bash
   $ npm run create -w rss-to-bluesky-social
   ```

1. Deploy to google apps project.

   ```bash
   $ npm run deploy-w rss-to-bluesky-social
   ```

1. Setup script propeties for required paramters.

   1. Access to the project page.

   1. Open [Project Settings].
   1. Add the below propeties.

      - `BLUESKY_IDENTIFER`: Bluesky identifier. ex. `example.bsky.social`
      - `BLUESKY_APP_PASSWORD`: Bluesky app password.
      - `FEED_URL`: RSS Feed URL (Support only RSS 1.0).
