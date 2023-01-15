const PICK_NUMBER =
  PropertiesService.getScriptProperties().getProperty("PICK_NUMBER") || "5";
const SLACK_WEBHOOK_URL =
  PropertiesService.getScriptProperties().getProperty("SLACK_WEBHOOK_URL") ||
  "";

type SlackAttachment = {
  color?: string;
  fields: {
    title?: string;
    value: string;
  }[];
};

const determineColorCode_ = (): string => {
  return `#${Math.random().toString(16).slice(-6)}`;
};

const postSlack_ = ({
  recipes,
  webhookUrl,
}: {
  recipes: string[][];
  webhookUrl: string;
}): boolean => {
  const attachments = recipes.reduce<SlackAttachment[]>((acc, recipe) => {
    const data = {
      color: determineColorCode_(),
      fields: [
        {
          value: `${recipe[0]} - ${recipe[1]}, pp.${recipe[2]}`,
        },
      ],
    };
    return [...acc, data];
  }, []);

  const body = {
    pretext: "メニューを確認して材料を西友で注文してね",
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

function main(): void {
  const sheet = SpreadsheetApp.getActiveSheet();
  const rowLength = sheet.getLastRow();
  const pickNumber = Number(PICK_NUMBER);
  if (pickNumber > rowLength) {
    throw new Error("Need row length of spreadsheet bigger than PICK_NUMBER");
  }
  const pickedNumber = [...Array(rowLength)]
    .map((v, i) => i + 1)
    .sort(() => Math.random() - 0.5)
    .slice(0, pickNumber);
  const recipes = pickedNumber
    .map((n) => sheet.getRange(n, 1, 1, 3).getValues())
    .flat();
  postSlack_({ recipes, webhookUrl: SLACK_WEBHOOK_URL }) ? "Success" : "Failed";
}
