type FeedItem = {
  title: string;
  link: string;
  description: string;
  date: Date;
};

export default class FeedClient {
  private url: string;
  private feedItems: FeedItem[] = [];
  constructor({ url }: { url: string }) {
    this.url = url;
  }

  private fetch() {
    try {
      if (!this.url) {
        throw new Error('Required to a feed url');
      }
      const resp = UrlFetchApp.fetch(this.url);
      const statusCode = resp.getResponseCode();
      if (statusCode !== 200) {
        console.error(`StatusCode: ${statusCode}`);
        throw new Error(`Fail to fetch feed (statusCode: ${statusCode}`);
      }
      return resp.getContentText();
    } catch (err) {
      if (err instanceof Error) {
        console.error(err.message);
      }
    }
  }

  private parseRSSV1(content: string) {
    try {
      const xmlDocs = XmlService.parse(content);
      const xmlRoot = xmlDocs.getRootElement();
      const rss = XmlService.getNamespace('http://purl.org/rss/1.0/');
      const dc = XmlService.getNamespace(
        'dc',
        'http://purl.org/dc/elements/1.1/'
      );
      const items = xmlRoot.getChildren('item', rss);
      if (items.length === 0) {
        return;
      }
      this.feedItems = items.map(item => {
        const date = new Date(item.getChild('date', dc)?.getText());
        return {
          title: item.getChild('title', rss)?.getText() || '',
          link: item.getChild('link', rss)?.getText() || '',
          date,
          description: item.getChild('description', rss)?.getText() || '',
        };
      });
    } catch (err) {
      if (err instanceof Error) {
        console.error(err.message);
      }
    }
  }

  fetchRssV1() {
    const content = this.fetch();
    if (content) {
      this.parseRSSV1(content);
    }
    return this.feedItems;
  }
}
