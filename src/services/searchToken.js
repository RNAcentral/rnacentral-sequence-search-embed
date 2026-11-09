// Holds the token webcode inlines into the page at render time (via the
// <rnacentral-sequence-search searchToken="..."> attribute, parsed in
// app.jsx). A leaf module so both app.jsx and actions.js can read/write it
// without an import cycle between them.
let token = null;

export function setSearchToken(value) {
  token = value || null;
}

export function getSearchToken() {
  return token;
}
