import config from "./config";

export default class Log {
  public static debug(message: string): void {
    if (!config.getDebug()) {
      return;
    }

    if (typeof ui !== "undefined") {
      ui.showError("Hire staff debug", message);
      return;
    }

    console.log(message);
  }

  public static error(message: string): void {
    if (typeof ui !== "undefined") {
      ui.showError("Hire staff error", message);
      return;
    }

    console.log(message);
  }
}
