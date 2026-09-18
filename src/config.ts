export const storageNamespace = "HireStaff";
const configPrefix = `${storageNamespace}.`;

const debugEnabled = `${configPrefix}debug`;
const autoFireStaffEnabled = `${configPrefix}autoFireStaffEnabled`;
const staffAmount = `${configPrefix}staffAmount`;
const storedStaff = `${configPrefix}storedStaff`;

const defaults = {
  debug: false,
  autoFireStaffEnabled: false,
  staffAmount: 10,
  storedStaff: "",
};

const config = {
  /**
   * Enable debug messages to be printed to the console.
   * This is useful for debugging issues with the plugin.
   */
  getDebug(): boolean {
    return context.sharedStorage.get(debugEnabled, defaults.debug);
  },

  setDebug(v: boolean) {
    return context.sharedStorage.set(debugEnabled, v);
  },

  /**
   * When enabled, the plugin will automatically fire staff right before the month's end
   * and re-hire them at the start of the next month.
   * This is useful for parks that have a lot of staff and want to save money on wages.
   */
  getAutoFireStaffEnabled(): boolean {
    return context.sharedStorage.get(
      autoFireStaffEnabled,
      defaults.autoFireStaffEnabled,
    );
  },

  setAutoFireStaffEnabled(v: boolean) {
    return context.sharedStorage.set(autoFireStaffEnabled, v);
  },

  /**
   * Get the amount of staff to hire when the plugin is used.
   */
  getStaffAmount(): number {
    return context.sharedStorage.get(staffAmount, defaults.staffAmount);
  },

  setStaffAmount(v: number) {
    return context.sharedStorage.set(staffAmount, v);
  },

  /**
   * Get the stored staff data from shared storage.
   * This is used to re-hire staff at the start of a new month.
   * The data is stored as a JSON string.
   */
  getStoredStaff(): string {
    return context.sharedStorage.get(storedStaff, defaults.storedStaff);
  },

  setStoredStaff(v: string) {
    return context.sharedStorage.set(storedStaff, v);
  },
};

export default config;
