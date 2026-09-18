import config from "./config";
import Log from "./Log";
import StaffPersistence from "./staffPersistence";

export default class HireStaff {
  private static readonly STAFF_TYPE: StaffType[] = [
    "handyman",
    "mechanic",
    "security",
    "entertainer",
  ];

  private static lastMonth = -1;
  private static hasProcessedMonthEnd = false;

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

  static patrolAreaCallback(result: GameActionResult): void {
    if (result.error === 0) {
      Log.debug(`Set patrol area for staff.`);
    } else {
      Log.error(`Failed to set patrol area. Action error: ${result.error}.`);
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

  static getEntertainerCostumeIndex(staffType: StaffType | string): number {
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

  static fireStaffCallback(result: GameActionResult): void {
    if (result.error === 0) {
      Log.debug(`Fired staff member.`);
    } else {
      Log.error(`Failed to fire staff. Action error: ${result.error}.`);
    }
  }

  static fireAllStaff(): void {
    const staffList = map
      .getAllEntities("staff")
      .filter((staff) => staff.id !== null) as BaseStaff[];

    Log.debug(`Found ${staffList.length} staff members to fire`);

    for (const staff of staffList) {
      context.executeAction(
        "stafffire",
        {
          id: staff.id as number,
        } satisfies StaffFireArgs,
        HireStaff.fireStaffCallback,
      );
    }
  }

  static rehireFromData(staffData: any[]): void {
    if (staffData.length === 0) {
      Log.debug("No staff to rehire from storage");
      return;
    }

    Log.debug(`Rehiring ${staffData.length} staff members`);

    for (const data of staffData) {
      // Handle costume - could be a number (index) or a string (identifier)
      let costumeIndex = 0;
      if (typeof data.costume === "number") {
        costumeIndex = data.costume;
      } else if (typeof data.costume === "string") {
        // For string costumes like "panda", "tiger", etc., we need to find the index
        // This matches the entertainer costumes
        const entertainerCostumes = objectManager
          .getAllObjects("peep_animations")
          .filter((c) => c.identifier.includes("entertainer_"));

        const costumeObj = entertainerCostumes.find(
          (c) => c.identifier === data.costume,
        );
        if (costumeObj) {
          costumeIndex = costumeObj.index;
        }
      }

      const options: StaffHireArgs = {
        autoPosition: true,
        staffType: data.staffType,
        costumeIndex: costumeIndex,
        staffOrders: data.orders,
      };

      // Hire the staff member
      context.executeAction(
        "staffhire",
        options,
        (result: StaffHireNewActionResult) => {
          if (result.error === 0 && result.peep !== undefined) {
            Log.debug(`Hired staff with ID ${result.peep}`);

            // Try to restore position
            const staff = map.getEntity(result.peep) as BaseStaff | null;
            if (staff !== null && staff !== undefined) {
              // Set position
              staff.x = data.x;
              staff.y = data.y;
              staff.z = data.z;
              Log.debug(
                `Set position for staff ${result.peep} to (${data.x}, ${data.y}, ${data.z})`,
              );
            }

            // Set patrol area if it was saved
            if (data.patrolArea && data.patrolArea.length > 0) {
              // Calculate bounds from patrol area tiles
              let minX = Infinity,
                minY = Infinity,
                maxX = -Infinity,
                maxY = -Infinity;
              for (const tile of data.patrolArea) {
                minX = Math.min(minX, tile.x);
                minY = Math.min(minY, tile.y);
                maxX = Math.max(maxX, tile.x);
                maxY = Math.max(maxY, tile.y);
              }

              // Set patrol area using the bounds
              context.executeAction(
                "staffsetpatrolarea",
                {
                  id: result.peep,
                  x1: minX,
                  y1: minY,
                  x2: maxX,
                  y2: maxY,
                  mode: 0, // Set mode to define a new patrol area
                } satisfies StaffSetPatrolAreaArgs,
                HireStaff.patrolAreaCallback,
              );
            }
          } else {
            Log.error(`Failed to hire staff. Action error: ${result.error}.`);
          }
        },
      );
    }
  }

  public static handleDayTick(): void {
    // Skip if no money is enabled (unlimited money parks)
    if (park.getFlag("noMoney")) {
      return;
    }

    if (!config.getAutoFireStaffEnabled()) {
      return;
    }

    const currentDate = date;
    const currentMonth = currentDate.month;
    const currentDay = currentDate.day;

    // Detect month transition (day 1 of a new month)
    if (currentDay === 1) {
      park.postMessage({
        text: `Month transition detected: ${currentMonth}, last month was ${HireStaff.lastMonth}`,
        type: "blank",
      });

      // If we're on day 1 of a month and the last month was different
      if (HireStaff.lastMonth !== currentMonth /*&& HireStaff.lastMonth !== -1*/) {
        // This is a new month - rehire all staff
        Log.debug(`New month detected: ${currentMonth}, rehiring staff`);
        const staffData = StaffPersistence.loadStaffFromStorage();
        HireStaff.rehireFromData(staffData);
        StaffPersistence.clearStorage();
        HireStaff.hasProcessedMonthEnd = false;
      }
      HireStaff.lastMonth = currentMonth;
    }

    // On the last day of the month (day 30, 31, 28, or 29 depending on month)
    // We need to detect the last day and fire staff
    // In OpenRCT2, day goes from 1 to 28/29/30/31
    const daysInMonth = new Date(
      currentDate.year,
      currentDate.month + 1,
      0,
    ).getDate();
    const isLastDay = currentDay === daysInMonth;

    if (isLastDay && !HireStaff.hasProcessedMonthEnd) {
      HireStaff.hasProcessedMonthEnd = true;
      Log.debug(
        `Last day of month detected: ${currentDay}, saving and firing staff`,
      );

      // Save all staff to storage
      StaffPersistence.saveStaffToStorage();

      // Fire all staff
      HireStaff.fireAllStaff();
    }
  }
}
