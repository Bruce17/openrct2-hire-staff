const DEBUG = false;
const STAFF_TYPE: StaffType[] = ['handyman', 'mechanic', 'security', 'entertainer'];

function debug(message: string): void {
  if (!DEBUG) {
    return;
  }

  if (typeof ui !== 'undefined') {
    ui.showError('Hire staff debug', message);
    return;
  }

  console.log(message);
}

function error(message: string): void {
  if (typeof ui !== 'undefined') {
    ui.showError('Hire staff error', message);
    return;
  }

  console.log(message);
}

const callback = function (result: StaffHireNewActionResult): void {
  if (result.error === 0) {
    debug(`Hired a new staff member with ID ${result.peep}.`);
  } else {
    error(`Failed to hire new staff. Action error: ${result.error}.`);
  }
};

function getStaffTypeValue(staffType: StaffType | string): number {
  const staffTypeInternalValue = STAFF_TYPE.indexOf(staffType as StaffType);

  if (staffTypeInternalValue < 0 || staffTypeInternalValue >= STAFF_TYPE.length) {
    error(`Invalid staff type "${staffType}"!`);
    return 0;
  }

  return staffTypeInternalValue;
}

function prepareStaffOrders(staffType: StaffType | string): number {
  switch (staffType) {
    case 'handyman':
      return 7; // sweeping | watering flowers | empty bins
    case 'mechanic':
      return 3; // inspect rides | fix rides
    default:
      return 0;
  }
}

const entertainerCostumes = objectManager
  .getAllObjects('peep_animations')
  .filter((costume) => costume.identifier.includes('entertainer_'));

function getEntertainerCostumeIndex(staffType: StaffType | string): number {
  switch (staffType) {
    case 'entertainer':
      return entertainerCostumes[
        Math.random() * entertainerCostumes.length | 0
      ].index;
    default:
      return 0;
  }
}

function addStaff(staffType: StaffType | string, amount: number): void {
  if (amount <= 0) {
    ui.showError('Error adding staff', `Invalid staff amount "${amount}"!`);
    return;
  }

  const typeValue = getStaffTypeValue(staffType);
  if (typeValue < 0 || typeValue >= STAFF_TYPE.length) {
    error(`Invalid staff type "${staffType}"!`);
    return;
  }

  const options = {
    autoPosition: true,
    staffType: typeValue,
    costumeIndex: getEntertainerCostumeIndex(staffType),
    staffOrders: prepareStaffOrders(staffType),
  } satisfies StaffHireArgs;

  for (let i = 0; i < amount; i += 1) {
    // If we are hiring more than one entertainer, we want to randomize the costume for each one.
    if (i > 0 && staffType === 'entertainer') {
      options.costumeIndex = getEntertainerCostumeIndex(staffType);
    }

    context.executeAction('staffhire', options, callback);
  }
}

function showWindow(): void {
  if (typeof ui === 'undefined') {
    console.log('OpenRCT2 is running in headless mode!');
    return;
  }

  const staffTypeLabels = [
    context.formatString('{STRINGID}', 1863),
    context.formatString('{STRINGID}', 1864),
    context.formatString('{STRINGID}', 1865),
    context.formatString('{STRINGID}', 1866),
  ];

  const existingWindow = ui.getWindow('hire_staff_window');
  if (existingWindow) {
    existingWindow.bringToFront();
    return;
  }

  let staffType: StaffType = STAFF_TYPE[0];
  let amount = 10;

  const windowDesc: WindowDesc = {
    classification: 'hire_staff_window',
    width: 180,
    height: 100,
    title: 'Hire Staff',
    widgets: [
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
          amount = Number.parseInt(targetAmount, 10) || 0;
        },
      },
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
        items: staffTypeLabels,
        onChange(index: number): void {
          staffType = STAFF_TYPE[index] ?? STAFF_TYPE[0];
        },
      },
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
