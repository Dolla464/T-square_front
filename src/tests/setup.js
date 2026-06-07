// jest-axe needs to see the global document to work
const { JSDOM } = require('jsdom');

const dom = new JSDOM('<!DOCTYPE html><body></body></html>');
global.document = dom.window.document;
global.window = dom.window;
global.Element = dom.window.Element;
global.HTMLElement = dom.window.HTMLElement;

require('@testing-library/jest-dom');
