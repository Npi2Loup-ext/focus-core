/*global $,window*/

/**
 * @module helpers/backbone_notifications
 * @description Global notifications mecanism around the whole application.
 * @see file helpers/backbone_notifications.js
 * @author  pbesson
 */

(function(NS) {
  "use strict";
  NS = NS || {};

  //Dependencies.
  //Dependency gestion depending on the fact that we are in the browser or in node.
  var isInBrowser = typeof module === 'undefined' && typeof window !== 'undefined';
  var Notifications = isInBrowser ? NS.Models.Notifications : require('../models/notifications');
  var NotificationsView = isInBrowser ? NS.Views.NotificationsView : require('../views/notifications-view');

  /**
   * Container specific to the application in order to manipulate the notification the way we want.
   * @type {Object}
   */
  var backboneNotification = {

    /**
     * An instance of the notifications view in order to deal with the notifications.
     * Which has a Notifications Model. This view is able to manipulate notifications and to render them.
     * @type {NotificationsView}
     */
    notificationsView: new NotificationsView({
      model: new Notifications()
    }),

    /**
     * Add a notification in the stack. Is isRender is define and is true, the notifications are displayed.
     * @param {object}  jsonNotification - A json object representing the notification. Types: warning, error, success.
     * @param {Boolean} isRender         - Is isRender is define and is true, the notifications are displayed immediately.
     * @example `Fmk.helpers.backboneNotifications.addNotification({type: "error", message: "Message"}, true);`
     *
     */
    addNotification: function addNotification(jsonNotification, isRender) {
      isRender = isRender || false;
      this.notificationsView.model.add(jsonNotification);
      if (isRender) {
        this.renderNotifications();
      }
    },

    /**
     * Render all the notifications which are in the notifications collection and then clear this list.
     * Once the notifications have been rendered, the messages stack is cleared
     * @param  {string} selectorToRender - A css selector twhich define where the notifications are redered. Default us "div#summary"
     * @param  {integer} timeout         - If a timeout is define, the notification is hidden after _timeout_ seconds.
     * @param {boolean} isReset - Does the model needs to be reset.
     * @return {undefined}
     */
    renderNotifications: function renderInApplication(selectorToRender, timeout, isReset) {
      var selector = selectorToRender || "div#summary";
      //We render all the messages.
      $(selector).append(this.notificationsView.render().el);
      //We empty the collection which contains all the notification messages.
      if (isReset) {
        this.notificationsView.model.reset();
      }
      $('button').button('reset');
      var that = this;
      //timeout = timeout || 5;
      /*Notifications are displayed only timeout seconds.*/
      if (timeout !== null && timeout !== undefined) {
        setTimeout(function() {
          that.clearNotifications(selector);
        }, timeout * 1000);
      }
    },

    /**
     * Clear all the displayed notifications.
     * @param  {string} selectorToRender The css selector describing where the notifications are rendered. Default is "div#summary".
     * @return @return {undefined}
     */
    clearNotifications: function clearNotifications(selectorToRender) {
      var selector = selectorToRender || "div#summary";
      this.notificationsView.model.reset();
      $(selector).html('');
      $('button').button('reset');
    },

    /**
     * Clear only the errors in the display of the screen.
     * @param  {string} selectorToRender The css selector describing where the notifications are rendered. Default is "div.notifications div.alert-danger".
     * @return {[type]}                  [description]
     */
    clearErrors: function clearErrors(selectorToRender) {
      var selector = selectorToRender || "div.notifications div.alert-danger";
      $(selector).html('');
      $('button').button('reset');
    }
  };
  // Differenciating export for node or browser.
  if (isInBrowser) {
    NS.Helpers = NS.Helpers || {};
    NS.Helpers.backboneNotification = backboneNotification;
  } else {
    module.exports = backboneNotification;
  }
})(typeof module === 'undefined' && typeof window !== 'undefined' ? window.Fmk : module.exports);