import type { Album } from './types/spotify';

const SLACK_WEBHOOK_URL =
  PropertiesService.getScriptProperties().getProperty('SLACK_WEBHOOK_URL') ||
  '';

export function postSlack_(albums: Album[]): boolean {
  const attachments = albums.map(album => {
    return {
      color: '#1db954',
      text: `${album.name} (${album.artist})\n${album.url}`,
    };
  });

  const body = {
    username: 'New Release',
    icon_emoji: ':headphones:',
    attachments: attachments,
  };
  const options: GoogleAppsScript.URL_Fetch.URLFetchRequestOptions = {
    method: 'post',
    contentType: 'application/json',
    payload: JSON.stringify(body),
  };
  const response = UrlFetchApp.fetch(SLACK_WEBHOOK_URL, options);
  return response.getResponseCode() == 200;
}
