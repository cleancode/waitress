'use strict';

describe('Waitress app', function() {

    describe('Dishes', function() {
        it('should display the correct route', function() {
        	browser().navigateTo('/#/dishes');
            expect(browser().location().path()).toBe('/dishes'); 
        });
    });

});