import {
  _getTextWithExcludedElements,
  ElementDimensions,
  EventData,
  ModifierKeys,
  TestElement,
  TestKey,
  TextOptions,
} from '@angular/cdk/testing';

import colors from '@colors/colors/safe.js';
import { Locator } from 'playwright';
const { magenta, green } = colors;

enum Button {
  LEFT = 'left',
  MIDDLE = 'middle',
  RIGHT = 'right',
}

type PlaywrightModifierKeys =
  | 'Alt'
  | 'Control'
  | 'ControlOrMeta'
  | 'Meta'
  | 'Shift';

/** Maps the `TestKey` constants to Playwright's `Key` constants. */
const modifierKeyMap: Record<number, PlaywrightModifierKeys> = {
  [TestKey.SHIFT]: 'Shift',
  [TestKey.CONTROL]: 'Control',
  [TestKey.META]: 'Meta',
  [TestKey.ALT]: 'Alt',
};

/** Maps the `TestKey` constants to key constants. */
const keyMap: Record<number, string> = {
  [TestKey.SHIFT]: 'Shift',
  [TestKey.CONTROL]: 'Control',
  [TestKey.META]: 'Meta',
  [TestKey.ALT]: 'Alt',
  [TestKey.ENTER]: 'Enter',
  [TestKey.ESCAPE]: 'Escape',
  [TestKey.TAB]: 'Tab',
  [TestKey.BACKSPACE]: 'Backspace',
  [TestKey.DELETE]: 'Delete',
  [TestKey.END]: 'End',
  [TestKey.HOME]: 'Home',
  [TestKey.INSERT]: 'Insert',
  [TestKey.PAGE_DOWN]: 'PageDown',
  [TestKey.PAGE_UP]: 'PageUp',
  [TestKey.DOWN_ARROW]: 'ArrowDown',
  [TestKey.LEFT_ARROW]: 'ArrowLeft',
  [TestKey.RIGHT_ARROW]: 'ArrowRight',
  [TestKey.UP_ARROW]: 'ArrowUp',
  [TestKey.F1]: 'F1',
  [TestKey.F2]: 'F2',
  [TestKey.F3]: 'F3',
  [TestKey.F4]: 'F4',
  [TestKey.F5]: 'F5',
  [TestKey.F6]: 'F6',
  [TestKey.F7]: 'F7',
  [TestKey.F8]: 'F8',
  [TestKey.F9]: 'F9',
  [TestKey.F10]: 'F10',
  [TestKey.F11]: 'F11',
  [TestKey.F12]: 'F12',
  [TestKey.COMMA]: ',',
};

/** Module augmentation to expose the host element as a public api */
declare module '@angular/cdk/testing' {
  interface ComponentHarness {
    element: Locator;
  }
  interface TestElement {
    element: Locator;
  }
}
// ComponentHarness.prototype.element = function (
//   this: ComponentHarness
// ): Locator {
//   return this.locatorFactory.rootElement.element();
// };

/** Converts a `ModifierKeys` object to a list of Playwright `Key`s. */
const toPlaywrightModifierKeys = (
  modifiers?: ModifierKeys
): undefined | Array<PlaywrightModifierKeys> => {
  if (!modifiers) {
    return undefined;
  }
  const result: PlaywrightModifierKeys[] = [];
  if (modifiers.control) {
    result.push(modifierKeyMap[TestKey.CONTROL]);
  }
  if (modifiers.alt) {
    result.push(modifierKeyMap[TestKey.ALT]);
  }
  if (modifiers.shift) {
    result.push(modifierKeyMap[TestKey.SHIFT]);
  }
  if (modifiers.meta) {
    result.push(modifierKeyMap[TestKey.META]);
  }
  return result;
};

/**
 * A `TestElement` implementation for Playwright.
 */
export class PlaywrightTestElement implements TestElement {
  constructor(readonly element: Locator) {}

  /** Blur the element. */
  async blur(): Promise<void> {
    this.logAction('BLUR');
    return this.element.blur();
  }

  /** Clear the element's input (for input and textarea elements only). */
  async clear(): Promise<void> {
    this.logAction('CLEAR');
    return this.element.clear();
  }

  /**
   * Click the element at the default location for the current environment. If you need to guarantee
   * the element is clicked at a specific location, consider using `click('center')` or
   * `click(x, y)` instead.
   */
  click(modifiers?: ModifierKeys): Promise<void>;
  /** Click the element at the element's center. */
  click(location: 'center', modifiers?: ModifierKeys): Promise<void>;
  /**
   * Click the element at the specified coordinates relative to the top-left of the element.
   * @param relativeX Coordinate within the element, along the X-axis at which to click.
   * @param relativeY Coordinate within the element, along the Y-axis at which to click.
   * @param modifiers Modifier keys held while clicking
   */
  click(
    relativeX: number,
    relativeY: number,
    modifiers?: ModifierKeys
  ): Promise<void>;

  click(
    ...args:
      | [ModifierKeys?]
      | ['center', ModifierKeys?]
      | [number, number, ModifierKeys?]
  ): Promise<void> {
    const modifiers = args.pop() as ModifierKeys;
    const position =
      args.length === 2
        ? { x: args[0] as number, y: args[1] as number }
        : undefined;

    this.logAction('CLICK', `${modifiers} ${position}]`);
    return this.element.click({
      modifiers: toPlaywrightModifierKeys(modifiers),
      position: position,
    });
  }
  /**
   * Right clicks on the element at the specified coordinates relative to the top-left of it.
   * @param relativeX Coordinate within the element, along the X-axis at which to click.
   * @param relativeY Coordinate within the element, along the Y-axis at which to click.
   * @param modifiers Modifier keys held while clicking
   */
  rightClick(
    relativeX: number,
    relativeY: number,
    modifiers?: ModifierKeys
  ): Promise<void> {
    return this.element.click({
      button: Button.RIGHT,
      modifiers: toPlaywrightModifierKeys(modifiers),
      position: { x: relativeX, y: relativeY },
    });
  }

  /** Focus the element. */
  async focus(): Promise<void> {
    this.logAction('FOCUS');
    return this.element.focus();
  }

  /** Get the computed value of the given CSS property for the element. */
  async getCssValue(property: string): Promise<string> {
    this.logAction('GET_CSS_VALUE');
    return this.element.evaluate((node) =>
      window.getComputedStyle(node).getPropertyValue(property)
    );
  }

  /** Hovers the mouse over the element. */
  async hover(): Promise<void> {
    this.logAction('HOVER');
    return this.element.hover();
  }

  /** Moves the mouse away from the element. */
  async mouseAway(): Promise<void> {
    this.logAction('MOUSE_AWAY');
    return this.element.page().mouse.move(-1, -1);
  }

  /**
   * Sends the given string to the input as a series of key presses. Also fires input events
   * and attempts to add the string to the Element's value.
   */
  async sendKeys(...keys: Array<string | TestKey>): Promise<void>;
  /**
   * Sends the given string to the input as a series of key presses. Also fires input events
   * and attempts to add the string to the Element's value.
   */
  async sendKeys(
    modifiers: ModifierKeys,
    ...keys: Array<string | TestKey>
  ): Promise<void>;
  async sendKeys(
    ...modifiersAndKeys:
      | Array<ModifierKeys | string | TestKey>
      | Array<string | TestKey>
  ): Promise<void> {
    const modifiers =
      typeof modifiersAndKeys[0] === 'object'
        ? (modifiersAndKeys.shift() as ModifierKeys)
        : {};
    const rest = modifiersAndKeys as Array<string | TestKey>;

    // const KeyNULL = String.fromCharCode(57344); What was this for?
    // TODO Fix this so that it supports F1-12 keys
    const modifierKeys = toPlaywrightModifierKeys(modifiers) ?? [];

    const keys = rest
      .map((k) => (typeof k === 'string' ? k.split('') : [keyMap[k]]))
      .reduce((arr, k) => arr.concat(k), []);

    const modifierCombination = modifierKeys.length
      ? modifierKeys.join('+') + '+'
      : '';
    this.logAction('SEND_KEYS', `[${keys.join(', ')} ${modifierCombination}]`);
    for (const key of keys) {
      await this.element.press(modifierCombination + key);
    }
  }

  /** Gets the text from the element. */
  async text(options?: TextOptions): Promise<string> {
    this.logAction('TEXT', `{ exclude: ${options?.exclude} }`);

    if (!options?.exclude) {
      return ((await this.element.textContent()) ?? '').trim();
    }

    return this.element.evaluate((node, exclude) => {
      const clone = node.cloneNode(true) as Element;
      const exclusions = clone.querySelectorAll(exclude);
      for (const exclusion of Array.from(exclusions)) {
        exclusion.remove();
      }
      return (clone.textContent ?? '').trim();
    }, options.exclude);
  }

  /** Gets the value for the given attribute from the element. */
  async getAttribute(name: string): Promise<string | null> {
    this.logAction('GET_ATTRIBUTE', name);
    return this.element.getAttribute(name);
  }

  /** Checks whether the element has the given class. */
  async hasClass(name: string): Promise<boolean> {
    this.logAction('HAS_CLASS', name);
    const classes = (await this.getAttribute('class')) || '';
    return new Set(classes.split(/\s+/).filter((c) => c)).has(name);
  }

  /** Gets the dimensions of the element. */
  async getDimensions(): Promise<ElementDimensions> {
    this.logAction('GET_DIMENSIONS');
    const box = await this.element.evaluate((node) => {
      const { x, y, width, height } = node.getBoundingClientRect();
      return { x, y, width, height };
    });
    return { width: box.width, height: box.height, left: box.x, top: box.y };
  }

  /** Gets the value of a property of an element. */
  async getProperty(name: string): Promise<any> {
    this.logAction('GET_PROPERTY', name);
    return this.element.evaluate((node, n) => {
      return node[n as keyof (HTMLElement | SVGElement)];
    }, name);
  }

  /** Checks whether this element matches the given selector. */
  async matchesSelector(selector: string): Promise<boolean> {
    this.logAction('MATCHES_SELECTOR', selector);
    return await this.element.evaluate((node, s) => node.matches(s), selector);
  }

  /** Checks whether the element is focused. */
  async isFocused(): Promise<boolean> {
    this.logAction('IS_FOCUSED');
    return this.element.evaluate((node) => document.activeElement === node);
  }

  /** Sets the value of a property of an input. */
  async setInputValue(value: string): Promise<void> {
    this.logAction('SET_INPUT_VALUE', value);
    return this.element.fill(value);
  }

  /** Selects the options at the specified indexes inside of a native `select` element. */
  async selectOptions(...optionIndexes: number[]): Promise<void> {
    this.logAction('SELECT_OPTIONS', `[${optionIndexes.join(', ')}]`);

    const options = await this.element.locator('option').all();
    const indexes = new Set(optionIndexes); // Convert to a set to remove duplicates.

    if (options.length && indexes.size) {
      // Reset the value so all the selected states are cleared. We can
      // reuse the input-specific method since the logic is the same.
      await this.setInputValue('');

      for (let i = 0; i < options.length; i++) {
        if (indexes.has(i)) {
          // We have to hold the control key while clicking on options so that multiple can be
          // selected in multi-selection mode. The key doesn't do anything for single selection.
          await options[i].click({ modifiers: ['Control'] });
        }
      }
    }
  }

  /** Dispatches an event with a particular name. */
  async dispatchEvent(
    name: string,
    data?: Record<string, EventData>
  ): Promise<void> {
    this.logAction('DISPATCH_EVENT', name);
    return this.element.dispatchEvent(name, data);
  }
  // --- HELPER(s) ---

  /** Writes info to the console outputs. */
  private logAction(action: string, args?: string): void {
    console.info(
      `${magenta(action)} ${green(this.element.toString())} ${args ? args : ''}`
    );
  }
}
