import HireStaff from "./HireStaff";
import Log from "./Log";
import config from "./config";

interface StaffData {
  id: number | null;
  staffType: number;
  costume: number | string; // Store costume as-is (number index or string identifier)
  orders: number;
  x: number;
  y: number;
  z: number;
  patrolArea?: CoordsXY[];
}

export default class StaffPersistence {
  private static getAllStaff(): BaseStaff[] {
    return map
      .getAllEntities("staff")
      .filter((staff) => staff.id !== null) as BaseStaff[];
  }

  private static getStaffPosition(staff: BaseStaff): {
    x: number;
    y: number;
    z: number;
  } {
    return {
      x: staff.x ?? 0,
      y: staff.y ?? 0,
      z: staff.z ?? 0,
    };
  }

  private static getStaffPatrolArea(staff: BaseStaff): CoordsXY[] | undefined {
    if (
      staff.patrolArea !== undefined &&
      staff.patrolArea.tiles !== undefined
    ) {
      return staff.patrolArea.tiles;
    }
    return undefined;
  }

  static saveStaffToStorage(): void {
    const staffList = this.getAllStaff();
    const staffData: StaffData[] = [];

    for (const staff of staffList) {
      // Store costume as-is (could be number or string)
      const costume = staff.costume ?? 0;

      // Convert staffType to number
      const staffTypeNum =
        typeof staff.staffType === "number"
          ? staff.staffType
          : HireStaff.getStaffTypeValue(staff.staffType);

      staffData.push({
        id: staff.id,
        staffType: staffTypeNum,
        costume: costume,
        orders: staff.orders ?? 0,
        ...this.getStaffPosition(staff),
        patrolArea: this.getStaffPatrolArea(staff),
      });
    }

    config.setStoredStaff(JSON.stringify(staffData));
    Log.debug(`Saved ${staffData.length} staff members to storage`);
  }

  static loadStaffFromStorage(): StaffData[] {
    const data = config.getStoredStaff();

    if (!data) {
      Log.debug("No stored staff data found");
      return [];
    }

    try {
      const staffData: StaffData[] = JSON.parse(data);
      Log.debug(`Loaded ${staffData.length} staff members from storage`);
      return staffData;
    } catch (e) {
      Log.error(`Failed to parse stored staff data: ${e}`);
      return [];
    }
  }

  static clearStorage(): void {
    config.setStoredStaff("");
    Log.debug("Cleared staff storage");
  }
}
