import Log from "./Log";

export default class HireStaff {
  private static readonly STAFF_TYPE: StaffType[] = [
    "handyman",
    "mechanic",
    "security",
    "entertainer",
  ];

  static entertainerCostumes = objectManager
    .getAllObjects("peep_animations")
    .filter((costume) => costume.identifier.includes("entertainer_"));

  static callback(result: StaffHireNewActionResult): void {
    if (result.error === 0) {
      Log.debug(`Hired a new staff member with ID ${result.peep}.`);
    } else {
      Log.error(`Failed to hire new staff. Action error: ${result.error}.`);
    }
  }

  static getStaffTypeValue(staffType: StaffType | string): number {
    const staffTypeInternalValue = HireStaff.STAFF_TYPE.indexOf(
      staffType as StaffType,
    );

    if (
      staffTypeInternalValue < 0 ||
      staffTypeInternalValue >= HireStaff.STAFF_TYPE.length
    ) {
      Log.error(`Invalid staff type "${staffType}"!`);
      return 0;
    }

    return staffTypeInternalValue;
  }

  static prepareStaffOrders(staffType: StaffType | string): number {
    switch (staffType) {
      case "handyman":
        return 7; // sweeping | watering flowers | empty bins
      case "mechanic":
        return 3; // inspect rides | fix rides
      default:
        return 0;
    }
  }

  static getEntertainerCostumeIndex(
    staffType: StaffType | string,
  ): number {
    switch (staffType) {
      case "entertainer":
        return HireStaff.entertainerCostumes[
          (Math.random() * HireStaff.entertainerCostumes.length) | 0
        ].index;
      default:
        return 0;
    }
  }

  public static getStaff(index?: number): StaffType {
    return HireStaff.STAFF_TYPE[index ?? 0] ?? HireStaff.STAFF_TYPE[0];
  }

  public static addStaff(staffType: StaffType | string, amount: number): void {
    if (amount <= 0) {
      ui.showError("Error adding staff", `Invalid staff amount "${amount}"!`);
      return;
    }

    const typeValue = HireStaff.getStaffTypeValue(staffType);
    if (typeValue < 0 || typeValue >= HireStaff.STAFF_TYPE.length) {
      Log.error(`Invalid staff type "${staffType}"!`);
      return;
    }

    const options = {
      autoPosition: true,
      staffType: typeValue,
      costumeIndex: HireStaff.getEntertainerCostumeIndex(staffType),
      staffOrders: HireStaff.prepareStaffOrders(staffType),
    } satisfies StaffHireArgs;

    for (let i = 0; i < amount; i += 1) {
      // If we are hiring more than one entertainer, we want to randomize the costume for each one.
      if (i > 0 && staffType === "entertainer") {
        options.costumeIndex = HireStaff.getEntertainerCostumeIndex(staffType);
      }

      context.executeAction("staffhire", options, HireStaff.callback);
    }
  }

  public static getStaffTypeLabels(): string[] {
    return [
    context.formatString("{STRINGID}", 1863),
    context.formatString("{STRINGID}", 1864),
    context.formatString("{STRINGID}", 1865),
    context.formatString("{STRINGID}", 1866),
  ];
}
}
