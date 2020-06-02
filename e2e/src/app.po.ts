import { browser, by, element } from 'protractor';

export class AppPage {
    public navigateTo() {
        // tslint:disable-next-line: no-any
        return browser.get(browser.baseUrl) as Promise<any>;
    }

    public getTitleText() {
        return element(by.css('ocap-root h1')).getText() as Promise<string>;
    }
}
