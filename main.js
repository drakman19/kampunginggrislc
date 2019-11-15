// ###################################################################################################################
// Hash Manager
// ###################################################################################################################
/*
* Hash Manager Class
*/
(function(name, deps, definition) {
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = definition();
  } else {

    if (typeof define === 'function' && define.amd) {
      define(deps, definition);
    }

    window.funneling = window.funneling || {};
    window.funneling[name] = definition(jQuery, funneling.HashManager, funneling.CategoryCards, funneling.PubSub);

  }
}('HashManager', ['jquery'], function($) {

  return {

    getHash : function() {
      return location.hash.substring(1);
    },

    getHashFrag : function(pos) {
      return this.getStrFrag(this.getHash(), pos);
    },

    setHashFrag : function(pos, val) {
      window.location.hash = '#' + this.setStrFrag(this.getHash(), pos, val);
    },

    getLocationArray : function() {
      return this.getHash().split('/');
    },

    setStrFrag : function(str, pos, val) {
      var fragments = str.split('/');
      fragments[pos] = val;
      return fragments.join('/');
    },

    getStrFrag : function(str, pos) {
      return str.split('/')[pos];
    }
  };
}));
;// #################################################################################################################
// Grid
// #################################################################################################################
/*
* Grid Class
*/
(function(name, deps, definition) {
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = definition();
  } else {

    if (typeof define === 'function' && define.amd) {
      define(deps, definition);
    }

    window.funneling = window.funneling || {};
    window.funneling[name] = definition(jQuery, funneling.HashManager, funneling.CategoryCards, funneling.PubSub);

  }
}('Grid', ['jquery'], function($) {

  return {

    // --------------------------------------------------
    // Variables
    // --------------------------------------------------
    name : 'Grid',
    programtileXC : $('.programtile-xc'),
    programtileACA : $('.programtile-aca'),

    // --------------------------------------------------
    // Constructor
    // --------------------------------------------------
    /*
    * Initialization
    */
    init : function() {

      $(window).resize(this.throttle(60, $.proxy(this.window_resizeHandler, this)));

      this.window_resizeHandler();
    },

    // --------------------------------------------------
    // Event Handlers
    // --------------------------------------------------
    /*
    * Dispatches when the user clicks on the button
    *
    * @event Event
    */
    window_resizeHandler : function() {

      if (this.matchesMedia('(min-width: 768px) and (max-width: 991px)')) {
        // If it's not mobile, and programtile-xc div IS BEFORE programtile-aca
        if (this.programtileXC.nextAll('.programtile-aca').length !== 0) {
          // Swap it
          this.programtileXC.insertAfter(this.programtileACA);
        }

        // If it is mobile and programtile-aca div IS BEFORE programtile-xc
      } else if (this.programtileACA.nextAll('.programtile-xc').length !== 0) {
        // Swap it
        this.programtileACA.insertAfter(this.programtileXC);
      }

    },

    // --------------------------------------------------
    // Functions
    // --------------------------------------------------
    /*
    * Call a function preventing it to be executed more than once in the
    * provided period of time.
    *
    * @param ms Milliseconds to wait until the next call is allowed
    * @param trailing if true (default), the function is executed again after the
    *        time runs out
    * @param callback Function to be called
    */
    throttle : function(delay, trailing, callback, debounce_mode) {

      var timeout_id,
      last_exec = 0;

      if (typeof trailing !== 'boolean') {
        debounce_mode = callback;
        callback = trailing;
        trailing = true;
      }

      function wrapper() {

        var self = this,
        elapsed = +new Date() - last_exec,
        args = arguments;
        function exec() {

          last_exec = +new Date();
          callback.apply(self, args);

        }
        function clear() {

          timeout_id = undefined;

        }

        // TODO : to be refactored
        /* jshint ignore:start */
        if (debounce_mode && !timeout_id) {
          exec();
        }

        timeout_id && clearTimeout(timeout_id);

        // When debounce_mode is set, clear the timeout. Otherwise set the time out with the correct delay options.
        /* jshint ignore:end */

        if (debounce_mode === undefined && elapsed > delay) {
          exec();
        } else if (trailing === true) {
          timeout_id = setTimeout(debounce_mode ? clear : exec, debounce_mode === undefined ? delay - elapsed : delay);
        }

      }

      if ($.guid) {
        wrapper.guid = callback.guid = callback.guid || $.guid++;
      }
      return wrapper;

    },

    /**
    * Checks if media query matches with the current environment
    *
    * @param media String with media query
    */
    matchesMedia : function(media) {
      return window.matchMedia && window.matchMedia(media).matches;
    }
  };
}));

// Runs when the page loads
$(document).ready(function() {
  funneling.Grid.init();
});
;// #####################################################################################################################
// Category Page Cards
// #####################################################################################################################
/*
 * Category Cards Class
 */
(function (name, deps, definition) {
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = definition();
  } else {

    if (typeof define === 'function' && define.amd) {
      define(deps, definition);
    }

    // Create the global object even if it has been loaded with AMD.
    window.funneling = window.funneling || {};
    window.funneling[name] = definition(jQuery, funneling.HashManager, funneling.PubSub);

  }

}('CategoryCards', ['jquery', 'HashManager', 'PubSub'], function ($, HashManager, PubSub) {

  return {
    // --------------------------------------------------
    // Variables
    // --------------------------------------------------
    name : 'CategoryCards',

    // --------------------------------------------------
    // Constructor
    // --------------------------------------------------
    /*
     * Initialization
     */
    init : function () {

      var gridSelector = '.js-filtering-popup .categories-cards .container .row';
      var filterOptionsSelector = '.js-filtering-popup .filtering-buttons';
      var buttonsSelector = '.js-filtering-popup .filtering-buttons a';

      /*
       * Variables
       */
      var me = this;
      me.grid = $(gridSelector);  //jscs:ignore
      me.filterOptions = $(filterOptionsSelector);  //jscs:ignore
      me.buttons = $(buttonsSelector);  //jscs:ignore
      me.initialized = false;
      me.fragNumber = 1;
      me.cards = me.grid.find('.js-card-container');
      me.showAges = false;

    },

    // --------------------------------------------------
    // Event Handlers
    // --------------------------------------------------
    /*
     * Dispatched when the user clicks on a filtering button
     */
    button_clickHandler : function (event) {

      var btn = event.currentTarget;
      event.preventDefault();

      if (this.filterOptions.length) {

         var scrollPosition = this.filterOptions.offset().top - 20;

        setTimeout(function () {
          // Animates the body to scroll to correct position of the screen BUT just when there are more then 3 elements
          if (scrollPosition > $(window).scrollTop() && $('.shuffle-item.filtered').length > 3) {
            $('html, body').animate({ scrollTop : scrollPosition }, 300);
          }
        }, 50);

      }

      var selectedGroup = $(btn).data('group');

      HashManager.setHashFrag(this.fragNumber, selectedGroup);

    },

    // --------------------------------------------------
    // Functions
    // --------------------------------------------------
    /*
    * Pre initializes the grid (before animation starts)
    */
    preInit : function() {
      // When popup is loading, change displat type of data-age-group to none
      $('[data-age-group]').css({ display : 'none', opacity : 0 });
    },

    /*
     * Initializes the Cards Grid
     */
    initGrid : function () {

      var me = this;

      if (!this.initialized) {

        this.initialized = true;

        if (this.filterOptions.length) {
          this.buttons.click($.proxy(this.button_clickHandler, this));
        }

        PubSub.subscribe('HashChanged/Fragment/' + this.fragNumber + '/Changed', function (data) {
          me.openGroup(data.fragValue);
        });

        PubSub.subscribe('HashChanged/Fragment/' + this.fragNumber + '/Removed', function () {
          // By default, when the page loads, the grid is hidden, so fadeElement class should show it
          me.grid.removeClass('fadeElement');
        });

      }

      // Gets the group  (as the second fragment)
      group = HashManager.getHashFrag(this.fragNumber);

      // If the group is found
      if (group) {

        this.showAges = $('[data-link="' + HashManager.getHash() + '"]').hasClass('js-show-age');

        // Container with titles for the selected group
        var $ageGroupContainer = $('[data-age-group="' + group + '"]');

        // Filter button (at the time of writting used only on ef.edu)
        // $filterButton and $ageGroupContainer are elements that should never be in the same
        // page, $filterButton is for popups using filter buttons, and $ageGroupContainer is
        // for automatica filtering with no buttons
        var $filterButton = $('[data-group="' + group + '"]');

        // if ageGroupContainer is in the page
        if ($ageGroupContainer.length) {
          // Changes display type of selected group to block
          $ageGroupContainer.css('display', 'block');

        // Otherwise, if filter buttons are on the page
        } else if ($filterButton.length) {
          // Trigger a hashchange event
          $(window).triggerHandler('hashchange');
        }
      } else {
        // Gets the active button on the page
        var activeButton = this.buttons.filter('.active');

        // If there is no active button, it selects the first one
        var detaultButton = activeButton.length ? activeButton : this.buttons.first();

        // Changes the hash on the relevant fragment number, to the winner button's
        // 'data-group' attribute
        HashManager.setHashFrag(this.fragNumber, detaultButton.attr('data-group'));
      }

    },

    /*
     * Filters the cards based on provided group name
     *
     * @param group String with group name
     */
    filterCards : function (group) {

      // Filter elements
      // this.grid.removeClass('fadeElement');
      // this.grid.shuffle( 'shuffle', group );

      var $cards = this.cards;
      var self = this;

      
      

      $.when(

          // $(cards).animate({
          //    opacity : 0
          // },250)
          $('.js-filtering-popup .categories-cards .row').animate({ opacity : 0 }, 250),
          $('[data-age-group]').animate({ opacity : 0 }, 250)

      ).then(

            function () {

              $cards.addClass('hidden');

              $cards.find('[data-differentiator="age"]').removeAttr('style');

              document.cookie = 'ZEUS_SESSION_AGEGROUPCODE=' + group.toUpperCase() + ';path=/;';

              var cardsToShow = [];

              for (var i = 0, len = $cards.length; i < len; i++) {

                var cardGroups = $($cards[i]).data('groups');

                for (var j = 0, groupLen = cardGroups.length; j < groupLen; j++) {

                  if (cardGroups[j] === group) {

                    cardsToShow.push($cards[i]);

                  }

                }

              }

              if (group === 'all') {

                $($cards).removeClass('hidden');

                // $(cards).removeClass('hidden').animate({opacity:1},250);
                // $('.card').not('.hidden').find('[data-differentiator="age"]').removeAttr('style');

                if (!self.showAges) {
                  $cards.not('.hidden').find('[data-differentiator="age"]').css('display', 'none');
                }

              } else {

                $(cardsToShow).removeClass('hidden');

                // $(cardsToShow).removeClass('hidden').animate({opacity:1},250);

                if (!self.showAges) {
                  $cards.not('.hidden').find('[data-differentiator="age"]').css('display', 'none');
                }

              }

              $('[data-groups="[]"]').removeClass('hidden');

              var $allTitles = $('[data-age-group]');
              var $newTitle = $('[data-age-group="' + group + '"]');

              $allTitles.css('display', 'none');
              $newTitle.css('display', 'block');

              $('.js-filtering-popup .categories-cards .row').animate({ opacity : 1 }, 250);
              $newTitle.animate({ opacity : 1 }, 250);

            });

    },

    /*
     * Changes the state of a button to 'active' and remove this state
     * from the previously active one.
     *
     * @param group String with the selector for the button to be selected or
     *           a jQuery Object with the element
     */
    activateButton : function (btn) {

      var $currentActive = $('.filtering-buttons .active');

      $(btn).addClass('active');

      $currentActive.removeClass('active');

    },

    /*
     * Opens a group by selecting the correct button and filtering the cards
     *
     * @param group String with group name
     */
    openGroup : function (group) {

      var $btn = $('a[data-group="' + group + '"]');

      if ($btn.length && !$btn.hasClass('active')) {
        this.activateButton($btn);
      }

      // 
      // 
      // 

      this.filterCards(group, $btn.hasClass('js-show-age'));

      // this.grid.addClass('fadeElement');

    }
  };
}));

// Runs when the page loads
$(document).ready(function () {

  var cookie = (document.cookie.match('(^|; )mc=([^;]*)') || 0)[2];

  if (cookie && cookie.toLowerCase() === 'cn'
      && /Mobi/.test(navigator.userAgent)
      && window.location.host.toLowerCase() === 'www.ef.com.cn') {

    window.location.href = 'http://m.ef.com.cn/';

  }

  funneling.CategoryCards.init();

});
;
'use strict';

// ###################################################################################################################
// MainApp
// ###################################################################################################################
/*
* MainApp Class, initialize all classes
*/
(function(name, deps, definition) {
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = definition();
  } else {

    if (typeof define === 'function' && define.amd) {
      define(deps, definition);
    }

    window.funneling = window.funneling || {};
    window.funneling[name] = definition(jQuery, funneling.HashManager, funneling.CategoryCards, funneling.PubSub);

  }
}('Main', ['jquery', 'HashManager', 'CategoryCards'], function($, HashManager, CategoryCards, PubSub) {

  var currentLocation;

  return {
    // --------------------------------------------------
    // Variables
    // --------------------------------------------------
    name : 'Main',
    currentSection : '.js-current-page',
    pageContainer : $('.funneling-container'),

    // --------------------------------------------------
    // Constructor
    // --------------------------------------------------
    /*
    * Initialization
    */
    init : function() {

      // FastClick.attach(document.body);
      // this.iterate(funneling);
      var self = this;

      // Initializes the links with a data-link attribute, which are links that trigger
      // a popup to open
      this.initPopUpTriggers();

     

      $(window).on('hashchange', $.proxy(this.window_hashChangeHandler, this));

      if (location.hash && location.hash != '#homepage') {
        $(window).triggerHandler('hashchange');
      }

      if ($(window).width() < 767) {
        $('.tile-mobile-toggle .tile-basic__title').click(function(event) {

          event.preventDefault();
          var $el = $(this);
          var btnContainer = $el.parent().find('.tile-mobile-toggle__container');

          $el.toggleClass('opened');
          btnContainer.slideToggle(300);

        });
      }

      
    },

    /*
    * Initializes the links with a data-link attribute, which are links that trigger a popup to open
    */
    initPopUpTriggers: function () {

      var $allLinks = this.pageContainer.find('a[data-link]');

      var $linksNotInitialised = $allLinks.filter(function() {
        return $(this).data('popup-link-initialized') != true;
      });

      $linksNotInitialised.click(function(event) {

        event.preventDefault();

        CategoryCards.showAges = $(this).hasClass('js-show-age');

        window.location.hash = '#' + $(this).attr('data-link');
        $('.js-filtering-popup .categories-cards .row').animate({ opacity : 0 }, 250);

        // $('[data-age-group]').animate({opacity:0},250);
        $('.filtering-buttons a').removeClass('active');

      });

      $linksNotInitialised.data('popup-link-initialized', true);
    },

    /*
    * Loads a new Page
    */
    loadPage : function(newPage) {

      var $currentPage = $('.js-current-page');
      var $newPageEl = $('.js-section-' + newPage);
      var self = this;

      if (!$newPageEl.length) {
        return;
      }

      $currentPage.removeClass('js-current-page');
      // Fades out the currently opened page
      $currentPage.fadeOut(200, function() {

        var popUpHasCardFiltering = $newPageEl.hasClass('js-filtering-popup');

        if (popUpHasCardFiltering) {
          CategoryCards.preInit();
        }

        // Fades in the new page
        $('.prefooter').toggleClass('hidden');
        $newPageEl.addClass('js-current-page').fadeIn(200, function() {

          // When fadein is completed, check if the new page is 'language'
          if (popUpHasCardFiltering) {
            // and if it is, initializes the category cards grid
            CategoryCards.initGrid();
          }

          PubSub.publish('HashChanged/Fragment/0/Finished');

        });

        if (/Mobi/.test(navigator.userAgent)) {

          $('html, body').animate({

            scrollTop : 0

          }, 100);

        }

      });

    },

    // --------------------------------------------------
    // Event Handlers
    // --------------------------------------------------
    /*
    * Dispatched when hashtag changes on window
    */
    window_hashChangeHandler : function() {

      var fragments = HashManager.getLocationArray();
      var valueChanged;
      var i;

      if (currentLocation) {
        for (i = 0; i < currentLocation.length; i++) {
          if (!fragments[i]) {
            // 
            PubSub.publish('HashChanged/Fragment/' + i + '/Removed');
          }
        }
      }



      currentLocation = fragments;

    },

  };

}));

if (window.innerWidth <= 767) {
  $('.js-swich-tile-second').each(function () {
    if (!$(this).text().match(/^\s*$/)) {
      $(this).insertBefore($(this).prev('.js-swich-tile-first'));
    }
  });
}

if (window.innerWidth <= 991) {
  $('.js-swich-sm-tile-second').each(function () {
    if (!$(this).text().match(/^\s*$/)) {
      $(this).insertBefore($(this).prev('.js-swich-sm-tile-first'));
    }
  });
}


// Collapsed Age Categories on Mobile only
// if (window.innerWidth <= 767) {
//   var collapsedBtn = $('.js-m-age-group-collapsed-btn'),
//       collapsedContainer = $('.js-m-age-group-collapsed');
//
//   collapsedBtn.click(function () {
//     collapsedContainer.toggle();
//     collapsedBtn.toggleClass('m-clicked');
//   });
// }



// if (window.innerWidth <= 767) {
//   var collapsedBtn = $('.country-list-heading'),
//       collapsedContent = $('.country-list');
//
//       collapsedBtn.click(function() {
//
//         collapsedBtn.removeClass('active');
//         collapsedContent.slideUp();
//
//         if($(this).next().is(':hidden') == true) {
//           $(this).addClass('active');
//           $(this).next().slideDown();
//         }
//
//       });
// };


// ###################################################################################################################
// Omniture
// ###################################################################################################################
;(function(name, deps, definition) {
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = definition();
  } else {

    if (typeof define === 'function' && define.amd) {
      define(deps, definition);
    }

    window.funneling = window.funneling || {};
    window.funneling[name] = definition(jQuery, funneling.HashManager, funneling.CategoryCards, funneling.PubSub);

  }
}('PanelBox', ['jquery'], function($) {

  // --------------------------------------------------
  // Variables
  // --------------------------------------------------
  // If the screen is being dragged (scrolling) on touch devices
  var dragging = false;

  // --------------------------------------------------
  // Initialization
  // --------------------------------------------------
  /*
  * Init Function
  */
  function init(el) {
    var $el = $(el);

    if ($el.data('initialized')) {
      return;
    } else {
      $el.data('initialized', true);
    }

    // When mouse enters the box (Mouse Desktop)
    $el.on('mouseenter', box_mouseenterHandler);

    // When mouse leaves the box (Mouse Desktop)
    $el.on('mouseleave', box_mouseleaveHandler);

    // When touch starts (Touch Devices)
    $el.on('touchstart', box_touchstartHandler);

    // When touch starts moving (scrolling most likely) (Touch Devices)
    $el.on('touchmove', box_touchmoveHandler);

    // When touch ends (Touch Devices)
    $el.on('touchend', box_touchendHandler);
  }

  // --------------------------------------------------
  // Event Handlers
  // --------------------------------------------------
  /*
  * When mouse enters the box (Mouse Desktop)
  *
  * @param event
  */
  function box_mouseenterHandler(event) {
    // Opens the box only if you are not on a touch screen and the box doesn't
    // have the js-direct-link class
    if (!(Modernizr.touch && $(this).hasClass('js-direct-link'))) {
      openBox(this);
    }
  }

  /*
  * When mouse leaves the box (Mouse Desktop)
  *
  * @param event
  */
  function box_mouseleaveHandler(event) {
    closeBox(this);
  }

  /*
  * When touch starts (Touch Devices)
  *
  * @param event
  */
  function box_touchstartHandler(event) {
    dragging = false;
  }

  /*
  * When touch starts moving (scrolling most likely) (Touch Devices)
  *
  * @param event
  */
  function box_touchmoveHandler(event) {
    dragging = true;
  }

  /*
  * When touch ends (Touch Devices)
  *
  * @param event
  */
  function box_touchendHandler(event) {
    // If the user hasn't been dragging the page and the box (me) is not revealed
    // And it doesn't contain the class "js-direct-link"
    if (!dragging && !$(this).hasClass('-is-revelead') && !$(this).hasClass('js-direct-link')) {

      // Prevents default action (so browser doesn't navigate to the URL)
      event.preventDefault();

      // Close all boxes except the box where the event happened (me)
      closeBox($('.panel').not(this));

      // Opens the clicked one
      openBox(this);
    }
  }

  // --------------------------------------------------
  // Functions
  // --------------------------------------------------
  /*
  * Opens a box based on element or selector provided
  *
  * @param box The element or selector for the box that need to be opened
  */
  function openBox(box) {
    // Adds the class that refers to this box as revealed
    $(box).addClass('-is-revelead');

    // Hides the default content
    $(box).find('.panel__default').addClass('-is-hidden');

    // And shows the hover content
    $(box).find('.panel__hover').removeClass('-is-hidden');
  };

  /*
  * Closes a box based on element or selector provided
  *
  * @param box The element or selector for the box that need to be closed
  */
  function closeBox(box) {
    // Removes the class that refers to this box as revealed
    $(box).removeClass('-is-revelead');

    // Shows the default content
    $(box).find('.panel__default').removeClass('-is-hidden');

    // And hides the hover content
    $(box).find('.panel__hover').addClass('-is-hidden');
  };

  // --------------------------------------------------
  // Exposing functions
  // --------------------------------------------------
  return {
    init : function() {
      $('.js-panel').each(function() {
        init(this);
      });
    }
  };

}));

// Runs when the page loads
$(document).ready(function() {
  funneling.PanelBox.init();
});
;(function(name, deps, definition) {
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = definition();
  } else {

    if (typeof define === 'function' && define.amd) {
      define(deps, definition);
    }

    window.funneling = window.funneling || {};
    window.funneling[name] = definition(jQuery, funneling.HashManager, funneling.CategoryCards, funneling.PubSub);

  }

}('Booknow', ['jquery'], function($) {

  return {

    arrowRight : $('.gh-icon-right'),
    arrowLeft : $('.gh-icon-left'),

    init : function() {

      var self = this;

      self.arrowRight.on('click', function(e) { self.animateTo(this, 'right'); });
      self.arrowLeft.on('click', function(e) { self.animateTo(this, 'left'); });

    },

    animateTo : function(el, direction) {
      var $self = $(el);
      var direction = (direction === 'right') ? '-50%' : '0';
      $self.closest('.table-row').css('transform', 'translate3d(' + direction + ', 0, 0)');
    }

  };

}));

$(document).ready(function() {
  jQuery.noConflict();
  funneling.Booknow.init();
});
