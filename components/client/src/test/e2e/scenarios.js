'use strict';

describe('Performance Model Calculator', function() {

  it('should redirect index.html to index.html#/project/new', function() {
    browser.get('index.html');
    browser.getLocationAbsUrl().then(function(url) {
        expect(url).toEqual('/project/new');
      });
  });


});
