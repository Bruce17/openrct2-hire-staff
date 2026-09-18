import { showWindow } from "./window";

const main = (): void => {
  ui.registerMenuItem("Hire staff", () => {
    showWindow();
  });
};

export default main;
