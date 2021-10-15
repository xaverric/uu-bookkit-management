const {UriBuilder} = require("uu_appg01_core-uri");
const OidcToken = require("./oidc-interactive-login");
const {get, post} = require("./calls.js");

async function _setPageState(bookUri, pageCode, state, token) {
  let commandUri = UriBuilder.parse(bookUri).setUseCase("updatePage").toUri();
  let dtoIn = {
    code: pageCode,
    state: state
  };
  await post(commandUri, dtoIn, token);
}

async function setPageState(bookUri, state, username, password) {
  console.info(`Setting ${state} state to all pages in book "${bookUri}".`);
  let token = await OidcToken.login(username, password);
  let menu = await _loadMenu(bookUri, token);
  for (const rootPageCode of Object.keys(menu.itemMap)) {
    let selectedPages = _loadPagesUnderRoot(menu, rootPageCode);
    console.info(`Selected pages: ${selectedPages}`);
    let pagesToSetState = _filterOutByState(selectedPages, state);
    console.info(`Pages to set state: ${pagesToSetState}`);
    for (const page of pagesToSetState) {
      await _setPageState(bookUri, page.code, state, token);
    }
  }
  console.info("Triggering fulltext index update.");
  await updateFulltextIndex(bookUri, token);
  console.info(`Operation finished.`);
}

async function _loadMenu(bookUri, token) {
  let commandUri = UriBuilder.parse(bookUri).setUseCase("getBookStructure").toUri();
  return await get(commandUri, null, token);
}

function _loadPagesUnderRoot(bookMenu, rootPage) {
  let currentPage = bookMenu.itemMap[rootPage];
  let rootIndent = currentPage.indent;
  console.info(`Current page: ${JSON.stringify(currentPage)}`);
  //always add the root page since it won't be added due to its indent
  let result = [{page: rootPage, state: currentPage.state}];
  if (currentPage.next) {
    result.push(..._loadSubPages(bookMenu, currentPage.next, rootIndent + 1));
  }
  return result;
}

function _loadSubPages(bookMenu, page, minIndent) {
  let result = [];
  let currentPage = bookMenu.itemMap[page];
  if (currentPage.indent < minIndent) {
    return [];
  }
  result.push({page: page, state: currentPage.state});
  if (currentPage.next) {
    let nextPages = _loadSubPages(bookMenu, currentPage.next, minIndent);
    result.push(...nextPages);
  }
  return result;

}

function _filterOutByState(pages, state) {
  let result = [];
  for (const page of pages) {
    if (page.state !== state) {
      result.push(page);
    }
  }
  return result;
}
async function updateFulltextIndex(bookUri, token) {
  let commandUri = UriBuilder.parse(bookUri).setUseCase("updateBookIndex").toUri();
  await post(commandUri, {}, token);
}

class BookPage {

  constructor(pageCode, details) {
    this.code = pageCode;
    this.state = details.state;
  }

  toString() {
    return `Code: ${this.code}, state: ${this.state}`;
  }
}

module.exports = setPageState;


