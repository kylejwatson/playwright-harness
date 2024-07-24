import { HarnessEnvironment } from '@angular/cdk/testing';

import { PlaywrightTestElement } from './PlaywrightTestElement.js';

import colors from '@colors/colors/safe.js';
import { Locator } from 'playwright';
const { magenta, green } = colors;

/**
 * A `HarnessEnvironment` implementation for Playwright.
 */
export class PlaywrightHarnessEnvironment extends HarnessEnvironment<Locator> {
  /**
   * Keep a reference to the `document` element because `rawRootElement`
   * will be the root element of the harness's environment.
   */
  private documentRoot: Locator;

  protected constructor(
    rawRootElement: Locator,
    options: { documentRoot: Locator }
  ) {
    super(rawRootElement);
    this.documentRoot = options.documentRoot;
  }

  /** Creates a `HarnessLoader` rooted at the document root. */
  static async loader(
    documentRoot: Locator
  ): Promise<PlaywrightHarnessEnvironment> {
    return new PlaywrightHarnessEnvironment(documentRoot, {
      documentRoot: documentRoot,
    });
  }

  /**
   * Flushes change detection and async tasks captured in the Angular zone.
   * In most cases it should not be necessary to call this manually. However, there may be some edge
   * cases where it is needed to fully flush animation events.
   */
  async forceStabilize(): Promise<void> {
    /* await browser.executeAsyncScript(`
            const done = arguments[0];
            window.requestAnimationFrame(done);
        `, []);*/
  }

  async waitForTasksOutsideAngular(): Promise<void> {
    throw new Error('Method not implemented.');
  }

  /** Gets a list of all elements matching the given selector under this environment's root element. */
  protected async getAllRawElements(selector: string): Promise<Array<Locator>> {
    console.info(`${magenta('GET_ALL_RAW_ELEMENTS')} ${green(selector)}`);

    const elements = await Promise.all(
      selector
        .split(',')
        .map((s) => this.rawRootElement.locator(s.trim()).all())
    );
    return elements.flat();
  }

  /** Gets the root element for the document. */
  protected getDocumentRoot(): Locator {
    return this.documentRoot;
  }

  /** Creates a `TestElement` from a raw element. */
  protected createTestElement(element: Locator): PlaywrightTestElement {
    return new PlaywrightTestElement(element);
  }

  /** Creates a `HarnessLoader` rooted at the given raw element. */
  protected createEnvironment(element: Locator): HarnessEnvironment<Locator> {
    return new PlaywrightHarnessEnvironment(element, {
      documentRoot: this.documentRoot,
    });
  }
}
