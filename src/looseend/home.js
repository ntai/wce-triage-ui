import {number} from "prop-types";

export const sweetHome = (function() {
  const href = document.location.href;
  const urlObj = new URL(href);
  const is_dev =  Number(urlObj.port) < 4000;

  return {
    href,
    urlObj,
    getQueryStringValue: (key) => {
      return ((urlObj && urlObj.search) && urlObj.searchParams.get(key)) || null;
    },
    baseUrl: urlObj.protocol + '//' + urlObj.hostname + ':' + urlObj.port,
    // For deployment, backendUrl is same as baseUrl. Just a hack for now

    backendUrl: is_dev ?
      'http://localhost:10600' : urlObj.protocol + '//' + urlObj.hostname + ':' + urlObj.port,

    websocketUrl: is_dev ?
      'ws://localhost:10600' : urlObj.protocol + '//' + urlObj.hostname + ':' + urlObj.port,
  };
})();

// then, to grab the base URL anytime you need it: sweetHome.baseUrl
// and grab the value of an arbitrary query parameter: sweetHome.getQueryStringValue('partner_key');
