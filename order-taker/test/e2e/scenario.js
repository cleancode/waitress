'use strict';

describe('Waitress app', function() {

    describe('Dishes', function() {
        it('should display the correct route', function() {
        	browser().navigateTo('/#/dishes');
            expect(browser().location().path()).toBe('/dishes'); 
        });

        it('should have the send order when selecting at least one order', function(){
        	browser().navigateTo('/#/dishes');
            element('*[jqm-li-link]').click();
            select('jqmmodel').option('1');
            element('a[href="#/dishes"]').click();
        	expect(element('span.ng-scope:contains("Rivedi la comanda")').count()).toBe(1);
        });
    });

});