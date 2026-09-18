import { showWindow } from "./window";
import HireStaff from "./HireStaff";

const main = (): void => {
  ui.registerMenuItem("Hire staff", () => {
    showWindow();
  });

  // Register daily tick event for month transition detection
  context.subscribe("interval.day", HireStaff.handleDayTick);
};

export default main;
