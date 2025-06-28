# gcal2slack

This is a google apps script that posts to Slack about the today events

## Usage

1. Login to your Google account.

   ```shell
   $ npm run login
   ```

1. Create a new google apps project.

   ```shell
   $ cd scripts/gcal2slack
   $ npm run create
   $ npm run push
   ```

1. Setup script propeties for required paramters.
   1. Access to the project page.

      ```shell
      $ npm run open
      ```

   1. Open [Project Settings].
   1. Add the below propeties.
      - `GCAL_ID`: Bookmeter ID
      - `SLACK_WEBHOOK_URL`: Slack Webbhook URL
      - `CALENDAR_COLOR`: Calendar color
