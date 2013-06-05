(function(TGM, $) {

  ////////////////////////////////
  // PRIVATE PROPERTIES
  ////////////////////////////////

  var slideCount = null;
  var levelCount = null;
  var levelIndex = 0;
  var slideIndex = 0;
  var infoIsVisible = false;
  var currentLevel = '';
  var parallaxCount = 3;
  var lastNav = 0;
  var widthBreakpoint = 650;
  var hasProfileClass = 'has-profile-bar';
  var arrows = [];
  var navArrowOpacity = 0.5;
  var showArrows = false;
  var delayedIntro = null;
  var maxBodyHeight = null;

  TGM.init = function() {

    // Cache some DOM elements common to both
    // layouts.

    this.$html = $("html");
    this.$body = $("body");
    this.$wrapper = $("#wrapper");
    this.$window = $(window);
    this.$preloader = $('.preload');
    
    // If the browser supports both css transforms
    // and transitions, we'll init the full featured
    // layout and start up the JS for it.

    if (Modernizr.csstransforms && Modernizr.csstransitions && this.$body.width() > widthBreakpoint) {
      initEnhanced.call(this);
    }

    // Otherwise, just boot up the simple layout.

    else {
      initSimple.call(this);
    }

  };

  ////////////////////////////////
  // PRIVATE METHODS
  ////////////////////////////////

  function initEnhanced() {

    TGM.$html.addClass('is-enhanced');

    ////////////////////////////////
    // SETUP
    ////////////////////////////////

    // Cache DOM elements
    this.$profile = $("#profile");
    this.$indicator = $("#indicator");
    this.$navigation = $("#navigation");
    this.$levels = $(".level");
    this.$slides = $('.slide');
    this.$arrows = $("#nav-arrows i");
    this.$bg = $("#bg");
    this.$info = $("#info");
    this.$logomark = $("body::after");
    this.maxBodyHeight = parseInt(this.$body.css('max-height'), 10);

    this.$bgs = {
      fore: $('.bg__fore'),
      mid: $('.bg__mid'),
      back: $('.bg__back')
    };

    // A hacky transform matrix for positioning the
    // background elements. This is done in JS rather
    // than CSS so that we can set X and Y
    // independently... darn limitations of CSS.

    this.parallaxConfig = {
      fore: {
        x: [0, 0],
        y: [100, 25]
      },
      mid: {
        x: [0, -14],
        y: [50, 40]
      },
      back: {
        x: [0, -5],
        y: [25, 21]
      }
    };

    arrows[0] = $(".nav-arrow__up");
    arrows[1] = $(".nav-arrow__right");
    arrows[2] = $(".nav-arrow__down");
    arrows[3] = $(".nav-arrow__left");

    // Count the elements in the DOM. Allows us
    // to easily add/remove pieces.
    slideCount = this.$navigation.find('.slide').length;
    levelCount = this.$levels.length;

    // Catch arrow keys for navigation
    $(document).on('keydown', keyPressed);

    // Keep things in line on window resize events
    $(window).on('resize', windowResized);

    // Show the info box when requested
    $('.js-show-info').on('click', showInfo);
    $(document).on('hideInfo', hideInfo);

    // Cancel clicks on the nav links
    this.$navigation.find('.slide').on('click', function(e) {
      e.preventDefault();
    });

    // Trigger navigation when you click
    // on nav arrows
    this.$arrows.on('click', arrowClicked);

    // Sets the initial layout
    windowResized();

    // Go to the default slide
    slideTo( 0, 0 );

    // Show the nav arrows after a delay
    delayedIntro = setTimeout(function() {
      showArrows = true;
      slideTo(0, 0);
    }, 6000);

    
    TGM.$preloader.animate({ opacity: 0, visibility: 'hidden' }, 1000);

    TGM.$wrapper.animate({ opacity: 1, visibility: 'visible' }, 1000);
    setTimeout(function() {
      TGM.$preloader.remove();
      TGM.$body.removeClass('is-loading');
    }, 1000);
  }

  function initSimple() {

    TGM.$html.addClass('is-simple');

    // Remove the size attributes on the logo images
    $('.details__heading img').attr({ width: '', height: ''});

    TGM.$preloader.animate({ opacity: 0, visibility: 'hidden' }, 1000);

    TGM.$wrapper.animate({ opacity: 1, visibility: 'visible' }, 1000);
    setTimeout(function() {
      TGM.$preloader.remove();
      TGM.$body.removeClass('is-loading');
      window.scrollTo(0, 0);
    }, 1000);

    TGM.$html.height( window.innerHeight + 60 );

  }

  function slideTo( level, slide ) {

    if ( delayedIntro ) {
      showArrows = true;
      clearTimeout( delayedIntro );
    }

    if (infoIsVisible) {
      $(document).trigger('hideInfo');
    }

    var up = level > 0;
    var right = (slide < slideCount - 1 && level === 1);
    var down = level < levelCount - 1;
    var left = (slide > 0 && level === 1);

    // Set directions for navigation arrows
    if (showArrows) setArrows( [up, right, down, left] );

    // Adjust parallax
    setParallax( slide, level );

    levelIndex = setSelectorClass('.level', level);
    slideIndex = setSelectorClass('.level.present .slide', slide);
    currentLevel = $('.level.present').first();

  }

  function setSelectorClass( selector, index ) {

    var $elements = $(selector);
    index = Math.max(Math.min(index, $elements.length - 1), 0);

    if ($elements.length) {

      $elements.each(function(i, el) {

        // Remove all classes
        $(this).removeClass('past present future');

        if (i < index) {
          $(this).addClass('past');
        }
        else if (i > index) {
          $(this).addClass('future');
        }

      });

      $elements.eq(index).addClass('present');

    }
    else {
      index = 0;
    }

    return index;

  }

  function navigateLeft() {

    switch ( getCurrentLevelName() ) {

      case "navigation":

        if (slideIndex > 0) {
          lastNav = slideIndex - 1;
        }
        setProgress( lastNav );
        slideTo( levelIndex, lastNav );

        // In addition to visually navigating, we also
        // change the selectors on the details slides
        // to keep the 'present' slide in sync with the
        // nav.
        setSelectorClass( '#details .slide', lastNav );

        break;

      case "details":
        slideTo( levelIndex, slideIndex );
        break;

    }

  }

  function navigateUp() {

    switch ( getCurrentLevelName() ) {

      case "navigation":
        showProgress( false );
        slideTo( levelIndex - 1, slideIndex );
        showLogomark( false );
        break;

      case "details":
        slideTo( levelIndex - 1, lastNav );
        showLogomark( true );
        break;

    }

  }

  function navigateRight() {

    switch ( getCurrentLevelName() ) {

      case "navigation":

        if (slideIndex < slideCount - 1) {
          lastNav = slideIndex + 1;
        }

        setProgress( lastNav );
        slideTo( levelIndex, lastNav );

        // In addition to visually navigating, we also
        // change the selectors on the details slides
        // to keep the 'present' slide in sync with the
        // nav.
        setSelectorClass( '#details .slide', lastNav );

        break;

      case "details":
        slideTo( levelIndex, slideIndex );
        break;

    }

  }

  function navigateDown() {

    switch ( getCurrentLevelName() ) {

      case "header":
        slideTo( 1, lastNav, 1 );
        showProgress( true );
        showLogomark( true );
        break;

      case "navigation":
        slideTo( levelIndex + 1, slideIndex );
        showLogomark( false );
        break;

      case "details":
        slideTo( levelIndex, slideIndex );
        break;

    }

  }

  function setParallax( xIndex, yIndex ) {

    ['fore', 'mid', 'back'].forEach(function(id) {

      var $el = TGM.$bgs[id];
      
      // A slide's transforms along the X and Y axes are
      // calculated as a percentage of a range, defined
      // in our config.
      //
      // First, we figure out the "progress" through the slides
      // or levels (horizontal VS vertical).
      //
      // After taking the difference of the start and end of the
      // defined ranges, we subtract a portion of the total from
      // the top of the range, effectively "stepping" through
      // our ranges.

      var xProgress = xIndex / (slideCount - 1);
      var xDiff = Math.abs(TGM.parallaxConfig[id].x[1] - TGM.parallaxConfig[id].x[0]);
      var x = TGM.parallaxConfig[id].x[0] - (xDiff * xProgress);

      var yProgress = yIndex / (levelCount - 1);
      var yDiff = Math.abs(TGM.parallaxConfig[id].y[1] - TGM.parallaxConfig[id].y[0]);
      var y = TGM.parallaxConfig[id].y[0] - (yDiff * yProgress);

      // Build a translate string that we can reuse when setting CSS
      var transform = "translateX(" + x + "%) translateY(" + y + "%)";
      
      // And finally set the transform in CSS, using all those
      // goddamn browser prefixes.
      $el.css({
        '-webkit-transform': transform,
        '-moz-transform': transform,
        '-ms-transform': transform,
        '-o-transform': transform,
        'transform': transform
      });

    });

  }

  function setArrows( arrowsState ) {

    // Reset the opacity and visibility of each arrow
    arrows.forEach(function(arrow) {
      arrow.css({
        'opacity': 0,
        'visibility': 'hidden'
      });
    });

    // Now set the opacity and visibility back for
    // the arrows that should be showing.
    arrowsState.forEach(function(state, i) {
      if (state === true) {
        arrows[i].css({
          'opacity': navArrowOpacity,
          'visibility': 'visible'
        });
      }
    });

  }

  function showProgress( show ) {

    if (show === true) {
      TGM.$html.addClass(hasProfileClass);
    } else {
      TGM.$html.removeClass(hasProfileClass);
    }

  }

  function setProgress( index ) {

    var increment = TGM.$profile.width() / slideCount;
    TGM.$indicator.css( 'left', increment * index + "px" );

  }

  function setupProgressBar() {

    if (!TGM.$profileBG) {
      TGM.$profileBG = $('<img class="profile__bg" src="/images/profile.svg#svgView(preserveAspectRatio(none))" alt="" />');
      TGM.$profileBG.appendTo(TGM.$profile);
    }

    TGM.$profileBG.css({
      width: TGM.$profile.width(),
      height: TGM.$profile.height()
    });
    TGM.$indicator.width( TGM.$profile.width() / slideCount );

  }

  // Shows or hides the logomark on the navigation slides
  function showLogomark( state ) {

    if ( state ) {

      setTimeout(function() {
        TGM.$logomark.animate({
          opacity: 0.6
        }, 1000, 'ease');
      }, 1000);

    } else {

      TGM.$logomark.animate({
        opacity: 0
      }, 200);

    }

  }

  // Handle key presses
  function keyPressed( e ) {

    switch (e.which) {

      // When you press the left arrow key...
      case 37:
        e.preventDefault();
        navigateLeft();
        break;
      // When you press the up arrow key...
      case 38:
        e.preventDefault();
        navigateUp();
        break;
      // When you press the right arrow key...
      case 39:
        e.preventDefault();
        navigateRight();
        break;
      // When you press the down arrow key...
      case 40:
        e.preventDefault();
        navigateDown();
        break;
    }

  }

  // Handle navigation arrow clicks
  function arrowClicked( e ) {

    e.preventDefault();

    switch ($(this).data('direction')) {

      // When you click the left arrow...
      case 'left':
        navigateLeft();
        break;
      // When you click the up arrow...
      case 'up':
        navigateUp();
        break;
      // When you click the right arrow...
      case 'right':
        navigateRight();
        break;
      // When you click the down arrow...
      case 'down':
        navigateDown();
        break;
    }

  }

  // Handle window resizing
  function windowResized( e ) {

    if (TGM.$window.width() > 1920 && TGM.$window.height() > 1080) {
      TGM.$body.addClass('is-letterboxed');
    } else {
      TGM.$body.removeClass('is-letterboxed');
    }

    setupProgressBar();
    setProgress( slideIndex );
  }

  // Show information panel
  function showInfo( e ) {

    // Prevent the default click event
    if (e) {
      e.preventDefault();
    }

    infoIsVisible = true;

    // Create the overlay if it doesn't already exist
    if (!TGM.$blackout) {
      TGM.$blackout = $('<div class="overlay" />');
    }

    // When you click on the overlay itself, trigger
    // the hideInfo event. 
    TGM.$blackout.on('click', function(e) {
      $(document).trigger('hideInfo');
    }).css('opacity', 0).appendTo('body').animate({
      opacity: 1
    }, 500, 'ease');

    // When you click on the hide link inside
    // the info content box, trigger the hideInfo
    // event.
    TGM.$info.find('.js-hide-info').on('click', function(e) {
      $(document).trigger('hideInfo');
    });

    // Show the info box
    TGM.$info.animate({
      opacity: 1,
      visibility: 'visible'
    }, 500, 'ease');

  }

  // Hide the information panel
  function hideInfo(e) {

    // Prevent the default click event
    if (e) {
      e.preventDefault();
    }

    infoIsVisible = false;

    // Remove the click event for the whiteout and
    // detach it from the DOM
    TGM.$blackout.off('click').animate({
      opacity: 0
    }, 500, 'ease', function() {
      $(this).detach();
    });

    // Hide the info box itself and remove the click
    // event from its hide link
    TGM.$info.animate({
      opacity: 0,
      visibility: 'hidden'
    }, 500, 'ease').find('.js-hide-info').off('click');

  }

  function getCurrentLevelName() {
    return currentLevel.attr('id');
  }

})(window.TGM = window.TGM || {}, Zepto);

$(function() {

  // The array of images to preload
  var images = [
    'arrow-down.svg',
    'noise.png',
    'logo.svg',
    'profile.svg',
    'badge/mansfield.svg',
    'bg/back.png',
    'bg/fore.png',
    'bg/mid.png'
  ];

  // Keep track of which resources are loaded.
  var imagesToLoad = images.length;
  
  // Preload the stylesheet
  var href = null;
  
  // Preload images
  $.each( images, function(i, img) {

    var image = $('<img />').attr('src', '/images/' + img);

    image.on( 'load', function() {
      imagesToLoad--;
      preloadCheck();
    });

  });

  var preloadCheck = function() {
    if (imagesToLoad === 0) {
      TGM.init();
    }
  };

});