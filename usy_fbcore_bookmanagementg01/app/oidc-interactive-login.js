const { post } = require("./calls.js");

const DEFAULT_OIDC_TENANT = "bb977a99f4cc4c37a2afce3fd599d0a7";
const DEFAULT_OIDC_BASE_URI = "https://uuidentity.plus4u.net/uu-oidc-maing02";
const GRANT_TOKEN_URI = `${DEFAULT_OIDC_BASE_URI}/${DEFAULT_OIDC_TENANT}/oidc/grantToken`

class OidcToken {

  static async login(username, password) {
    const credentials = {
      "accessCode1": username,
      "accessCode2": password,
      "grant_type": "password",
      "scope": "openid https:// http://localhost"
    };

    const response = await post(GRANT_TOKEN_URI, credentials);
    return response["id_token"];
  }

}

module.exports = OidcToken;
