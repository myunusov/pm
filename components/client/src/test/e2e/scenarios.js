'use strict';

describe('Performance Model Calculator', function () {

    beforeEach(function () {
        return browser.ignoreSynchronization = true;
    });

    it('should redirect invalid path to #/project/{UUID}', function () {
        browser.get('#invalid');
        var url = browser.driver.getCurrentUrl();
        expect(url).toMatch(/\.*#\/project\/.*/);
    });

    it('should presents new project details page on click "new" button', function () {
        browser.get('/');
        var url1 = browser.driver.getCurrentUrl();
        var button = element(by.css('[aria-label="New Project"]'));
        button.click();
        var url2 = browser.driver.getCurrentUrl();
        expect(url2).toMatch(/\.*#\/project\/.*/);
        expect(url2).not.toEqual(url1);
    });

    it('should redirect invalid id to #/project/{UUID}', function () {
        browser.get('#/project/invalid');
        var url = browser.driver.getCurrentUrl();
        expect(url).toMatch(/\.*#\/project\/.*/);
    });

    it('should presents projects page on #/projects', function () {
        browser.get('#/projects');
        var url = browser.driver.getCurrentUrl();
        expect(url).toMatch(/\.*#\/projects/);
    });

    it('should presents projects page on Projects menu item click', function () {
        var button = element(by.css('[aria-label="Repository"]'));
        button.click();
        var url = browser.driver.getCurrentUrl();
        expect(browser.driver.getCurrentUrl()).toMatch(/\.*#\/projects/);
    });

/*    it('should presents current project after return by history', function () {
        var button = element(by.css('[aria-label="Repository"]'));
        button.click();
        var url = browser.driver.getCurrentUrl();
        expect(browser.driver.getCurrentUrl()).toMatch(/\.*#\/projects/);
    });*/


});
