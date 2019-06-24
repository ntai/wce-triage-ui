import url from 'url';
const process = require('process');
require('dotenv').config()

export const sweetHome = (function() {
  const href = document.location.href;
  const urlObj = url.parse(href, true);

  return {
    href,
    urlObj,
    getQueryStringValue: (key) => {
      let value = ((urlObj && urlObj.query) && urlObj.query[key]) || null;
      return value;
    },
    baseUrl: urlObj.protocol + '//' + urlObj.hostname + ':' + urlObj.port,
    // For deployment, backendUrl is same as baseUrl. Just a hack for now

    backendUrl: (!process.env.NODE_ENV || process.env.NODE_ENV === 'development') ?
    'http://wcetriage:8312' : urlObj.protocol + '//' + urlObj.hostname + ':' + urlObj.port,
  };
})();

// then, to grab the base URL anytime you need it: sweetHome.baseUrl
// and grab the value of an arbitrary query parameter: sweetHome.getQueryStringValue('partner_key');
