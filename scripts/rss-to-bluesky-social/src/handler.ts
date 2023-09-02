import BlueskyClient from './bluesky';
import FeedClient from './feed';

export function main() {
  const propertiesService = PropertiesService.getScriptProperties();
  const lock = LockService.getScriptLock();

  if (lock.tryLock(1)) {
    const lastExecutionTime = Number(
      propertiesService.getProperty('LAST_EXECUTION_TIME')
    );
    if (lastExecutionTime === 0) {
      propertiesService.setProperty(
        'LAST_EXECUTION_TIME',
        `${new Date().getTime()}`
      );
      console.log("Post at next time");
      return;
    }
    const feedUrl = propertiesService.getProperty('FEED_URL') || "";
    const feedClient = new FeedClient({
      url: feedUrl,
    });

    const latestFeedItems = feedClient.fetchRssV1().filter(item => {
      if (!item.date) {
        return false;
      }
      return item.date.getTime() > lastExecutionTime;
    });
    propertiesService.setProperty(
      'LAST_EXECUTION_TIME',
      `${new Date().getTime()}`
    );

    if (latestFeedItems.length === 0) {
      console.log("New feed items are not found");
      return;
    }
    const identifier = propertiesService.getProperty('BLUESKY_IDENTIFER') || '';
    const password =
      propertiesService.getProperty('BLUESKY_APP_PASSWORD') || '';
    const blueskyClient = new BlueskyClient({ identifier, password });
    blueskyClient.login();

    latestFeedItems.forEach(item => {
      const text = `${item.description} / ${item.title} ${item.link}`;
      console.log(text);
      blueskyClient.post({ text });
    });
  }
}
