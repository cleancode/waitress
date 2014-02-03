describe('Order Taker and Kitchen', function() {
  it('should display an order', function() {
    browser.get('http://localhost:9000');
    ptor = protractor.getInstance();

    element(by.css(".item:nth-child(2)")).click();
    element(by.repeater("(id,name) in items").row(3)).click();
    element(by.css(".ion-arrow-left-c")).click();
    element(by.css(".ion-ios7-upload-outline")).click();
    var table = Math.random();
    element(by.model("order.table")).sendKeys(table);
    element(by.css(".ion-archive")).click();
    browser.driver.switchTo().alert().accept();

    browser.get('http://localhost:9000/kitchen.html');
    
    expect(ptor.isElementPresent(by.xpath('//h4[text()="Tavolo: ' + table + '"]'))).toBeTruthy();

  });
});