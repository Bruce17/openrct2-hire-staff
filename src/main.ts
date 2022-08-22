// eslint-disable-next-line @typescript-eslint/triple-slash-reference
/// <reference path="/lib/openrct2.d.ts" />

const STAFF_TYPE = ['handyman', 'mechanic', 'security', 'entertainer'];

// eslint-disable-next-line @typescript-eslint/no-empty-function
const noop = (): void => {};

function getStaffTypeValue(staffType: StaffType | string): number {
  const staffTypeInternalValue = STAFF_TYPE.indexOf(staffType);

  if (staffTypeInternalValue > STAFF_TYPE.length) {
    ui.showError('Error adding staff', `Invalid staff type "${staffType}"!`);
  }

  return staffTypeInternalValue;
}

function prepareStaffOrders(staffType: StaffType | string): number {
  let staffOrders = 0;

  if (staffType === 'handyman') {
    staffOrders = 7; // STAFF_ORDERS_SWEEPING | STAFF_ORDERS_WATER_FLOWERS | STAFF_ORDERS_EMPTY_BINS
  } else if (staffType === 'mechanic') {
    staffOrders = 3; // STAFF_ORDERS_INSPECT_RIDES | STAFF_ORDERS_FIX_RIDES
  }

  return staffOrders;
}

function addStaff(staffType: StaffType | string, amount: number): void {
  if (amount > 0) {
    const options = {
      autoPosition: true,
      staffType: getStaffTypeValue(staffType),
      entertainerType: 0,
      staffOrders: prepareStaffOrders(staffType),
    };

    for (let i = 0; i < amount; i += 1) {
      context.executeAction('staffhire', options, noop);
    }
  } else {
    ui.showError('Error adding staff', `Invalid staff amount "${amount}"!`);
  }
}

function showWindow(): void {
  if (typeof ui === 'undefined') {
    console.log('OpenRCT2 is running in headless mode!');
  }

  const window = ui.getWindow('hire_staff_window');
  if (window) {
    window.bringToFront();
    return;
  }

  let staffType: StaffType | string = STAFF_TYPE[0];
  let amount = 10;

  const windowDesc: WindowDesc = {
    classification: 'hire_staff_window',
    width: 180,
    height: 100,
    title: 'Hire Staff',
    widgets: [
      // row: amount
      {
        type: 'label',
        x: 5,
        y: 22,
        width: 50,
        height: 15,
        text: 'Amount',
        tooltip: 'Define how many staff members you want to hire',
      },
      {
        type: 'textbox',
        x: 70,
        y: 20,
        width: 100,
        height: 15,
        text: '10',
        maxLength: 3,
        onChange(targetAmount: string): void {
          amount = parseInt(targetAmount, 10) || 0;
        },
      },

      // row: staff type
      {
        type: 'label',
        x: 5,
        y: 40,
        width: 50,
        height: 15,
        text: 'Type',
        tooltip: 'Define which staff type you want to hire',
      },
      {
        type: 'dropdown',
        x: 70,
        y: 40,
        width: 100,
        height: 15,
        items: STAFF_TYPE,
        onChange(index: number): void {
          staffType = STAFF_TYPE[index];
        },
      },

      // row: hire button
      {
        type: 'button',
        x: 40,
        y: 70,
        width: 100,
        height: 15,
        text: 'Hire',
        onClick(): void {
          addStaff(staffType, amount);
        },
      },
    ],
  };

  ui.openWindow(windowDesc);
}

const main = (): void => {
  ui.registerMenuItem('Hire staff', () => {
    showWindow();
  });
};

export default main;
