import RelativeTimeFormat from "relative-time-format";
import en from "relative-time-format/locale/en";

RelativeTimeFormat.addLocale(en);

export function autoRelativeTimeFormat(dateToFormat: Date) {
  const now = Date.now();
  const date = dateToFormat instanceof Date ? dateToFormat.getTime() : new Date(dateToFormat).getTime();

  const rtf = new RelativeTimeFormat("en", {
    style: "long",
  });

  const diffInSeconds = (date - now) / 1000;

  let value;
  let unit: "second" | "minute" | "hour" | "day" | "month" | "year" | null = null;

  if (Math.abs(diffInSeconds) < 60) {
    value = Math.round(diffInSeconds);
    unit = "second";
  } else if (Math.abs(diffInSeconds) < 3600) {
    value = Math.round(diffInSeconds / 60);
    unit = "minute";
  } else if (Math.abs(diffInSeconds) < 86400) {
    value = Math.round(diffInSeconds / 3600);
    unit = "hour";
  } else if (Math.abs(diffInSeconds) < 2629800) {
    value = Math.round(diffInSeconds / 86400);
    unit = "day";
  } else if (Math.abs(diffInSeconds) < 31557600) {
    value = Math.round(diffInSeconds / 2629800);
    unit = "month";
  } else {
    value = Math.round(diffInSeconds / 31557600);
    unit = "year";
  }

  return rtf.format(value, unit);
}
