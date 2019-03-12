const {Config} = require("uu_appg01_core-utils");
const DefaultConfig = require("../config/default");
Config.activeProfiles = "development";
Config.registerImplicitSource(DefaultConfig);
const {UriBuilder} = require("uu_appg01_core-uri");
const OidcToken = require("./oidc-interactive-login");
const {AuthenticationService, AppClient} = require("uu_appg01_server-client");
const {LoggerFactory} = require("uu_appg01_core-logging");

const logger = LoggerFactory.get("BookKitManagement");

async function appClientPost(uri, dtoIn, options) {
  let status;
  do {
    status = 200;
    try {
      return await AppClient.post(uri, dtoIn, options);
    } catch (e) {
      logger.debug(`Error during command call: ${JSON.stringify(e, null, 2)}`);
      status = e.status;
      throw e;
    }
  } while (status === 502 || status === 404);
}

async function appClientGet(uri, dtoIn, options) {
  return await AppClient.get(uri, dtoIn, options);
}

async function _setPageState(bookUri, pageCode, state, session) {
  let command = "updatePage";
  let commandUri = UriBuilder.parse(bookUri).setUseCase(
    command).toUri();
  let options = {session};
  let dtoIn = {
    code: pageCode,
    state: state
  };
  let response = await appClientPost(commandUri, dtoIn, options);
}

async function setPageState(bookUri, rootPageCode, state) {
  console.info(`Setting state to all pages under page with code "${rootPageCode}" to ${state}.`);
  let session = await _getUserSessions();
  let menu = await _loadMenu(bookUri, session);
  let selectedPages = _loadPagesUnderRoot(menu, rootPageCode);
  console.info(`Selected pages: ${selectedPages}`);
  let pagesToSetState = _filterOutByState(selectedPages, state);
  console.info(`Pages to set state: ${pagesToSetState}`);
  for(const page of pagesToSetState) {
    await _setPageState(bookUri, page.code, state, session);
  }
  console.info(`Operation finished.`);
}

async function _getUserSessions() {
  const token = await OidcToken.login();
  return await AuthenticationService.authenticate(token);
}

async function _loadMenu(bookUri, session) {
  let command = "getBookStructure";
  let commandUri = UriBuilder.parse(bookUri).setUseCase(
    command).toUri();
  let options = {session};

  let response = await appClientGet(commandUri, null, options);
  return response.data.itemMap;
}

function _loadPagesUnderRoot(bookMenu, rootPage) {
  let currentPage = bookMenu[rootPage];
  let rootIndent = currentPage.indent;
  // filter by page.state (!= newState)
  console.info(`Current page: ${currentPage}`);
  //always add the root page since it won't be added due to its indent
  let result = [new BookPage(rootPage, currentPage)];
  if(currentPage.next) {
    result.push(..._loadSubPages(bookMenu, currentPage.next, rootIndent + 1));
  }
  return result;
}

function _loadSubPages(bookMenu, page, minIndent) {
  let result = [];
  let currentPage = bookMenu[page];
  if(currentPage.indent < minIndent) {
    return [];
  }
  result.push(new BookPage(page, currentPage));
  let next = currentPage.next;
  if(next) {
    let nextPages = _loadSubPages(bookMenu, next, minIndent);
    result.push(...nextPages);
  }
  return result;
}

function _filterOutByState(pages, state) {
  let result = [];
  for (const page of pages) {
    if(page.state !== state) {
      result.push(page);
    }
  }
  return result;
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


