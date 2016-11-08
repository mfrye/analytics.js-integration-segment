
/**
 * Module dependencies.
 */

var integration = require('@segment/analytics.js-integration');


/**
 * Expose `Segment` integration.
 */

var Segment = exports = module.exports = integration('Segment.io')
  .global('analytics')
  .option('apiKey', '')
  .tag('<script src="//cdn.segment.com/analytics.js/v1/{{ apiKey }}/analytics.min.js">');

/**
 * Initialize.
 *
 * https://github.com/segmentio/segmentio/blob/master/modules/segmentjs/segment.js/v1/segment.js
 *
 * @api public
 */

Segment.prototype.initialize = function() {

  /* eslint-disable */
  (function(){

    // Create a queue, but don't obliterate an existing one!
    var analytics = window.analytics = window.analytics || [];

    // If the real analytics.js is already on the page return.
    if (analytics.initialize) return;

    // If the snippet was invoked already show an error.
    if (analytics.invoked) {
      if (window.console && console.error) {
        console.error('Segment snippet included twice.');
      }
      return;
    }

    // Invoked flag, to make sure the snippet
    // is never invoked twice.
    analytics.invoked = true;

    // A list of the methods in Analytics.js to stub.
    analytics.methods = [
      'trackSubmit',
      'trackClick',
      'trackLink',
      'trackForm',
      'pageview',
      'identify',
      'reset',
      'group',
      'track',
      'ready',
      'alias',
      'page',
      'once',
      'off',
      'on'
    ];

    // Define a factory to create stubs. These are placeholders
    // for methods in Analytics.js so that you never have to wait
    // for it to load to actually record data. The `method` is
    // stored as the first argument, so we can replay the data.
    analytics.factory = function(method){
      return function(){
        var args = Array.prototype.slice.call(arguments);
        args.unshift(method);
        analytics.push(args);
        return analytics;
      };
    };

    // For each of our methods, generate a queueing stub.
    for (var i = 0; i < analytics.methods.length; i++) {
      var key = analytics.methods[i];
      analytics[key] = analytics.factory(key);
    }
  })();
  /* eslint-enable */

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
 * @api public
 * @param {Track} track
 */

Segment.prototype.track = function(track) {
  var payload, dataConfig;
  var contextOpts = track.options(this.name);
  var props = track.properties();

  // Override properties from mappings
  dataConfig = contextOpts.dataConfig;
  payload = buildPayload(track.event(), props, dataConfig);

  window.analytics.track(payload.event, payload.props, track.integrations());
};

/**
 * identify.
 *
 * @api public
 * @param {identify} identify
 */

Segment.prototype.identify = function(identify) {
  var opts = identify.options(this.name);
  var id = identify.userId();
  var traits = identify.traits();

  window.analytics.identify(id, traits, opts);
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

  // Default to using the action name (event)
  payload.event = event;

  // Map fields to props if dataConfig exists
  // Only look for the event right now, since that's all that is supported
  if (dataConfig)  {

    if (dataConfig['event'] && properties[dataConfig['event']]) {
      payload.event = properties[dataConfig['event']];
      properties.name = event;
    }
  }

  payload.props = properties;

  return payload;
}
