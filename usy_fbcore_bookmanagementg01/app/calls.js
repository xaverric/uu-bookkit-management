const fetch = require("node-fetch");

async function post(uri, data, token) {
  return await callCommand(uri, token, "POST", data);
}

async function get(uri, data, token) {
  return await callCommand(uri, token, "GET", data);
}

const callCommand = async (uri, token, method, data) => {
  const dtoIn = prepareDtoIn(method, data, token);
  const response = await fetch(uri, dtoIn);
  return await response.json();
}

const prepareDtoIn = (method, data = null, token = null) => {
  let dtoIn =  {
    method: method,
    headers: {
      "Content-Type": "application/json",
      "Accept": "application/json"
    },
    body: method === "POST" ? JSON.stringify(data) : null
  };
  if(token) {
    dtoIn.headers.Authorization = `Bearer ${token}`;
  }
  return dtoIn;
}

module.exports = {
  get,
  post
}