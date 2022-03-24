import { HarnessEnvironment, HarnessLoader, TestElement } from '@angular/cdk/testing';
import logger from '@wdio/logger';

import { magenta, green } from '@colors/colors/safe';

import { WebdriverIOTestElement } from './WebdriverIOTestElement';

/** Registers the environment logger. */
const log = logger('wdio-harness');

/**
 * A `HarnessEnvironment` implementation for WebdriverIO.
 */
export class WebdriverIOHarnessEnvironment extends HarnessEnvironment<WebdriverIO.Element> {
    /**
     * Keep a reference to the `document` element because `rawRootElement`
     * will be the root element of the harness's environment.
     */
    private documentRoot: WebdriverIO.Element;

    protected constructor(
        rawRootElement: WebdriverIO.Element,
        options: { documentRoot: WebdriverIO.Element; }
    ) {
        super(rawRootElement);
        this.documentRoot = options.documentRoot;
    }

    /** Creates a `HarnessLoader` rooted at the document root. */
    static async loader(documentRoot: WebdriverIO.Element): Promise<HarnessLoader> {
        return new WebdriverIOHarnessEnvironment(documentRoot, { documentRoot });
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

    waitForTasksOutsideAngular(): Promise<void> {
        throw new Error('Method not implemented.');
    }

    /** Gets the root element for the document. */
    protected getDocumentRoot(): WebdriverIO.Element {
        return this.documentRoot;
    }

    /** Creates a `TestElement` from a raw element. */
    protected createTestElement(element: WebdriverIO.Element): TestElement {
        return new WebdriverIOTestElement(element);
    }

    /** Creates a `HarnessLoader` rooted at the given raw element. */
    protected createEnvironment(element: WebdriverIO.Element): HarnessEnvironment<WebdriverIO.Element> {
        return new WebdriverIOHarnessEnvironment(element, {
            documentRoot: this.documentRoot
        });
    }

    /** Gets a list of all elements matching the given selector under this environment's root element. */
    protected async getAllRawElements(selector: string): Promise<WebdriverIO.ElementArray> {
        log.info(`${magenta('GET_ALL_RAW_ELEMENTS')} ${green(selector.toString())}`);
        return await this.rawRootElement.$$(selector);
    }
}
