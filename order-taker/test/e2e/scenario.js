'use strict';

describe('Waitress app', function() {

    describe('Dishes', function() {
        it('should display the correct route', function() {
        	browser().navigateTo('/#/dishes');
            expect(browser().location().path()).toBe('/dishes'); 
        });

        it('should have the send order and cancel order button', function(){
        	browser().navigateTo('/#/dishes');
        	expect(element('span.ng-scope:contains("Invia la comanda")').count()).toBe(1);
        });
    });

});