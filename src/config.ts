const namespace = "HireStaff";
const configPrefix = `${namespace}.`;

const debugEnabled = `${configPrefix}debug`;
const autoFireStaffEnabled = `${configPrefix}autoFireStaffEnabled`;
const staffAmount = `${configPrefix}staffAmount`;

const defaults = {
  debug: false,
  autoFireStaffEnabled: false,
  staffAmount: 10,
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
  }
};

export default config;
