import HireStaff from "./HireStaff";
import config from "./config";

export function showWindow(): void {
  if (typeof ui === "undefined") {
    console.log("OpenRCT2 is running in headless mode!");
    return;
  }

  const existingWindow = ui.getWindow("hire_staff_window");
  if (existingWindow) {
    existingWindow.bringToFront();
    return;
  }

  const staffTypeLabels = HireStaff.getStaffTypeLabels();
  let staffType: StaffType = HireStaff.getStaff();

  const noMoneyPark = park.getFlag("noMoney");

  const windowDesc: WindowDesc = {
    classification: "hire_staff_window",
    width: 180,
    height: 130,
    title: "Hire Staff",
    widgets: [
      {
        type: "label",
        x: 5,
        y: 22,
        width: 50,
        height: 15,
        text: "Amount",
        tooltip: "Define how many staff members you want to hire",
      },
      {
        type: "textbox",
        x: 70,
        y: 20,
        width: 100,
        height: 15,
        text: config.getStaffAmount().toString(),
        maxLength: 3,
        onChange(targetAmount: string): void {
          const amount = Number.parseInt(targetAmount, 10) || 0;
          config.setStaffAmount(amount);
        },
      },
      {
        type: "label",
        x: 5,
        y: 40,
        width: 50,
        height: 15,
        text: "Type",
        tooltip: "Define which staff type you want to hire",
      },
      {
        type: "dropdown",
        x: 70,
        y: 40,
        width: 100,
        height: 15,
        items: staffTypeLabels,
        onChange(index: number): void {
          staffType = HireStaff.getStaff(index);
        },
      },
      {
        type: "button",
        x: 40,
        y: 70,
        width: 100,
        height: 15,
        text: "Hire",
        onClick(): void {
          HireStaff.addStaff(staffType, config.getStaffAmount());
        },
      },
      {
        type: "checkbox",
        x: 5,
        y: 95,
        width: 15,
        height: 15,
        isChecked: config.getAutoFireStaffEnabled(),
        onChange(checked: boolean): void {
          config.setAutoFireStaffEnabled(checked);
        },
        tooltip: "Enable automatic staff firing at month end and rehiring at month start",
        isDisabled: noMoneyPark,
        isVisible: !noMoneyPark,
      },
      {
        type: "label",
        x: 25,
        y: 95,
        width: 150,
        height: 15,
        text: noMoneyPark ? "Auto fire/rehire: Disabled (no-money park)" : "Auto fire/rehire monthly",
        tooltip: noMoneyPark 
          ? "This feature is disabled in no-money parks where wages don't apply."
          : "When enabled, all staff will be fired at month end and rehired at month start. Saves wages for the last day.",
      },
    ],
  };

  ui.openWindow(windowDesc);
}
