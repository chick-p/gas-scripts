const GCAL_ID =
  PropertiesService.getScriptProperties().getProperty("GCAL_ID") || "";

const SLACK_WEBHOOK_URL =
  PropertiesService.getScriptProperties().getProperty("SLACK_WEBHOOK_URL") ||
  "";

const CALENDAR_COLOR =
  PropertiesService.getScriptProperties().getProperty("CALENDAR_COLOR") ||
  "#ff0000";

type GcalEvent = {
  start: string;
  end: string;
  title: string;
};

type GcalEventResponse = {
  resources: GcalEvent[];
};

function getTodayEvents_(): GoogleAppsScript.Calendar.CalendarEvent[] {
  const calendar = CalendarApp.getCalendarById(GCAL_ID);
  const today = new Date();
  return calendar.getEventsForDay(today);
}

function formatEvents_(
  events: GoogleAppsScript.Calendar.CalendarEvent[],
): GcalEvent[] {
  return events.map((event) => {
    return {
      start: Utilities.formatDate(event.getStartTime(), "JST", "HH:mm"),
      end: Utilities.formatDate(event.getEndTime(), "JST", "HH:mm"),
      title: event.getTitle(),
    };
  });
}

const postSlack_ = ({
  events,
  webhookUrl,
}: {
  events: GcalEvent[];
  webhookUrl: string;
}): boolean => {
  const attachments = events.map((event) => {
    let time = `${event.start}-${event.end}`;
    if (event.start === "00:00" && event.end === "00:00") {
      time = "終日";
    }
    return {
      color: CALENDAR_COLOR,
      text: `${time} ${event.title}`,
    };
  });

  const body = {
    pretext: "今日の予定",
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
  if (!GCAL_ID) {
    throw new Error("Required gcal id");
  }
  if (!SLACK_WEBHOOK_URL) {
    throw new Error("Required slack webhook url");
  }

  const todayEvents = getTodayEvents_();
  const formattedEvents = formatEvents_(todayEvents);

  if (formattedEvents.length === 0) {
    return;
  }

  // Slack
  postSlack_({ events: formattedEvents, webhookUrl: SLACK_WEBHOOK_URL })
    ? "Success"
    : "Failed";
}
