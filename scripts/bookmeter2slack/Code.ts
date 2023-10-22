const BOOKMETER_USER_ID =
  PropertiesService.getScriptProperties().getProperty("BOOKMETER_USER_ID") ||
  "";
const SLACK_WEBHOOK_URL =
  PropertiesService.getScriptProperties().getProperty("SLACK_WEBHOOK_URL") ||
  "";

type BookmeterResource = {
  id: number;
  created_at: string;
  book: {
    id: number;
    title: string;
    image_url: string;
    author: {
      name: string;
    };
    page: number;
  };
  content: string;
};

type BookmeterResponse = {
  resources: BookmeterResource[];
};

type SlackAttachment = {
  color?: string;
  fields: Record<"title" | "value", string>[];
};

const fetchReadBooks_ = (userguide: string): BookmeterResponse => {
  const url = `https://bookmeter.com/users/${userguide}/books/read.json?sort=read_at&order=desc&offset=0&limit=10`;
  const response = UrlFetchApp.fetch(url);
  const json: BookmeterResponse = JSON.parse(response.getContentText());
  return json;
};

const filterReadBooksYesterday_ = (
  response: BookmeterResponse,
): BookmeterResource[] => {
  const dt = new Date();
  dt.setDate(dt.getDate() - 1);

  const resources = response.resources || [];
  return resources.filter((resource) => {
    return (
      Utilities.formatDate(dt, "JST", "yyyy/MM/dd") === resource.created_at
    );
  });
};

const determineColorCode_ = (): string => {
  return `#${Math.random().toString(16).slice(-6)}`;
};

const postSlack_ = ({
  books,
  webhookUrl,
}: {
  books: BookmeterResource[];
  webhookUrl: string;
}): boolean => {
  const attachments = books.reduce<SlackAttachment[]>((acc, resource) => {
    const data = {
      color: determineColorCode_(),
      fields: [
        {
          title: "タイトル",
          value: resource.book.title,
        },
        {
          title: "著者",
          value: resource.book.author.name,
        },
        {
          title: "感想",
          value: resource.content,
        },
      ],
    };
    return [...acc, data];
  }, []);

  const body = {
    pretext: "読んだ本",
    attachments: attachments,
  };
  const options: GoogleAppsScript.URL_Fetch.URLFetchRequestOptions = {
    method: "post",
    contentType: "application/json",
    payload: JSON.stringify(body),
  };
  const response = UrlFetchApp.fetch(webhookUrl, options);
  return response.getResponseCode() == 200;
};

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function main(): void {
  if (BOOKMETER_USER_ID) {
    throw new Error("Required bookmater account");
  }
  if (SLACK_WEBHOOK_URL) {
    throw new Error("Required slack webhook url");
  }

  const books = fetchReadBooks_(BOOKMETER_USER_ID);
  const yesterdayBooks = filterReadBooksYesterday_(books);
  if (yesterdayBooks.length == 0) {
    return;
  }

  // Slack
  postSlack_({ books: yesterdayBooks, webhookUrl: SLACK_WEBHOOK_URL })
    ? "Success"
    : "Failed";
}
