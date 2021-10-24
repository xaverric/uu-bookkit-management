const {UriBuilder} = require("uu_appg01_core-uri");
const OidcToken = require("./oidc-interactive-login");
const {get, post} = require("./calls.js");

async function setState(bookUri, state, pages = [], username, password) {
  _logStart(pages, state, bookUri);
  let token = await OidcToken.login(username, password);
  let menu = await _loadMenu(bookUri, token);
  for (const rootPageCode of _resolveRootPages(pages, menu)) {
    let selectedPages = _loadPagesUnderRoot(menu, rootPageCode);
    let pagesToSetState = _filterOutByState(selectedPages, state);
    for (const page of pagesToSetState) {
      console.info(`Setting "${state}" state to page ${page.code}`);
      await _setPageState(bookUri, page.code, state, token);
    }
  }
  console.info("Triggering fulltext index update.");
  await updateFulltextIndex(bookUri, token);
  console.info(`Operation finished.`);
}

function _resolveRootPages(pages, menu) {
  return pages.length === 0 ? Object.keys(menu.itemMap) : pages;
}

function _logStart(pages, state, bookUri) {
  pages.length === 0 ?
      console.info(`Setting "${state}" state to all pages in book "${bookUri}".`) :
      console.info(`Setting "${state}" state to all pages under the root pages "${JSON.stringify(pages)}" in book "${bookUri}".`)
}

async function _loadMenu(bookUri, token) {
  let commandUri = UriBuilder.parse(bookUri).setUseCase("getBookStructure").toUri();
  return await get(commandUri, null, token);
}

function _loadPagesUnderRoot(bookMenu, rootPage) {
  let currentPage = bookMenu.itemMap[rootPage];
  let rootIndent = currentPage.indent;
  //always add the root page since it won't be added due to its indent
  let result = [{code: rootPage, state: currentPage.state}];
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
  result.push({code: page, state: currentPage.state});
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

async function _setPageState(bookUri, pageCode, state, token) {
  let commandUri = UriBuilder.parse(bookUri).setUseCase("updatePage").toUri();
  let dtoIn = {
    code: pageCode,
    state: state
  };
  await post(commandUri, dtoIn, token);
}

async function updateFulltextIndex(bookUri, token) {
  let commandUri = UriBuilder.parse(bookUri).setUseCase("updateBookIndex").toUri();
  await post(commandUri, {}, token);
}

module.exports = setState;


