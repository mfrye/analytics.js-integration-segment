
/**
 * Module dependencies.
 */

var integration = require('analytics.js-integration');


/**
 * Expose `Segment` integration.
 */

var Segment = exports = module.exports = integration('Segment.io')
  .global('analytics')
  .option('apiKey', '');

/**
 * Initialize.
 *
 * https://github.com/segmentio/segmentio/blob/master/modules/segmentjs/segment.js/v1/segment.js
 *
 * @api public
 */

Segment.prototype.initialize = function() {

  /* eslint-disable */
  !function(){var analytics=window.analytics=window.analytics||[];if(!analytics.initialize)if(analytics.invoked)window.console&&console.error&&console.error("Segment snippet included twice.");else{analytics.invoked=!0;analytics.methods=["trackSubmit","trackClick","trackLink","trackForm","pageview","identify","reset","group","track","ready","alias","page","once","off","on"];analytics.factory=function(t){return function(){var e=Array.prototype.slice.call(arguments);e.unshift(t);analytics.push(e);return analytics}};for(var t=0;t<analytics.methods.length;t++){var e=analytics.methods[t];analytics[e]=analytics.factory(e)}analytics.load=function(t){var e=document.createElement("script");e.type="text/javascript";e.async=!0;e.src=("https:"===document.location.protocol?"https://":"http://")+"cdn.segment.com/analytics.js/v1/"+t+"/analytics.min.js";var n=document.getElementsByTagName("script")[0];n.parentNode.insertBefore(e,n)};analytics.SNIPPET_VERSION="3.1.0";
  }}();
  /* eslint-enable */

  window.analytics.load(this.options.apiKey);
  this.load(this.ready);
};

/**
 * Loaded.
 *
 * @api private
 * @return {boolean}
 */

Segment.prototype.loaded = function() {
  return !!window.analytics;
};

/**
 * Page.
 *
 * @api public
 * @param {Page} page
 */

Segment.prototype.page = function(page) {
  var category = page.category();

  if (category) {
    window.analytics.page(category, page.name(), page.properties(), page.integrations());
  } else {
    window.analytics.page(page.name(), page.properties(), page.integrations());
  }
};

/**
 * track.
 *
 * @api private
 * @param {Track} track
 */

Segment.prototype.track = function(track) {
  var payload, dataConfig;
  var contextOpts = track.options(this.name);
  var props = track.properties();

  // track the event
  props = dates(props, iso);

  // Override properties from mappings
  dataConfig = contextOpts.dataConfig;
  payload = buildPayload(track.event(), props, dataConfig);

  window.mixpanel.track(payload.event, payload.props, track.integrations());
};

/**
 * Build event data from config
 *
 * @api private
 * @param {Object} payload
 * @param {Object} dataConfig
 * @return {Object}
 */

function buildPayload(event, properties, dataConfig) {
  var payload = {};
  properties.event = event;

  // Map fields to props if dataConfig exists
  if (dataConfig)  {
    for (var key in dataConfig) {
      // Check if the property exists
      if (properties[dataConfig[key]]) {
        properties[key] = properties[dataConfig[key]];
      }
    }
  }

  // Get the new event if it has been changed
  payload.event = properties.event;
  delete properties.event;
  payload.props = properties;

  return payload;
}
