type SessionData = {
  did: string;
  accessJwt: string;
};

type FacetFeature = {
  "$type": "app.bsky.richtext.facet#link",
  uri: string;
};

type Facet = {
  index: {
    byteStart: number,
    byteEnd: number
  },
  features: Array<FacetFeature>
};

export default class BskyClient {
  private identifier: string;
  private password: string;
  private service = 'https://bsky.social';
  private session: SessionData = {
    did: '',
    accessJwt: '',
  };
  constructor({
    identifier,
    password,
  }: {
    identifier: string;
    password: string;
  }) {
    this.identifier = identifier;
    this.password = password;
    if (!identifier || !password) {
      throw new Error('Required to Bluesky account information');
    }
  }

  public login() {
    const options: GoogleAppsScript.URL_Fetch.URLFetchRequestOptions & {
      method: GoogleAppsScript.URL_Fetch.HttpMethod;
    } = {
      method: 'post',
      headers: {
        'Content-Type': 'application/json; charset=UTF-8',
      },
      payload: JSON.stringify({
        identifier: this.identifier,
        password: this.password,
      }),
    };
    const resp = UrlFetchApp.fetch(
      `${this.service}/xrpc/com.atproto.server.createSession`,
      options
    );
    const json = JSON.parse(resp.getContentText());
    this.session = {
      accessJwt: json.accessJwt,
      did: json.did,
    };
  }

  detectFacets(text: string): Facet[] {
    // to count bytes
    const encodedText = encodeURI(text).replace(/%../g, "*");
    const matched = encodedText.match(/https?:\/\/\S*/g);
    if (!matched) {
      return [];
    }
    const facets = matched.map((url) => {
      const byteStart = encodedText.indexOf(url);
      const byteEnd = byteStart + url.length;
      const facet: Facet = {
        index: {
          byteStart,
          byteEnd,
        },
        features: [
          {
            "$type": "app.bsky.richtext.facet#link",
            uri: url,
          },
        ],
      };
      return facet;
    })
    return facets;
  }

  public post({ text }: { text: string }): boolean {
    const body = {
      repo: this.session.did,
      collection: 'app.bsky.feed.post',
      record: {
        text,
        createdAt: new Date().toISOString(),
        facets: this.detectFacets(text)
      },
    };

    const options: GoogleAppsScript.URL_Fetch.URLFetchRequestOptions & {
      method: GoogleAppsScript.URL_Fetch.HttpMethod;
    } = {
      method: 'post',
      headers: {
        'Authorization': `Bearer ${this.session.accessJwt}`,
        'Content-Type': 'application/json; charset=UTF-8',
      },
      payload: JSON.stringify(body),
    };
    const resp = UrlFetchApp.fetch(
      `${this.service}/xrpc/com.atproto.repo.createRecord`,
      options
    );
    return resp.getResponseCode() === 200;
  }
}
