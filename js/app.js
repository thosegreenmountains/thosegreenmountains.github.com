(function(TGM, $) {

  ////////////////////////////////
  // PRIVATE PROPERTIES
  ////////////////////////////////

  var slideCount = null;
  var levelCount = null;
  var levelIndex = 0;
  var slideIndex = 0;
  var currentLevel = '';
  var parallaxCount = 3;
  var lastNav = 0;
  var widthBreakpoint = 650;
  var isPreloadingClass = 'is-loading';
  var hasProfileClass = 'has-profile-bar';

  TGM.init = function() {

    // Cache some DOM elements common to both
    // layouts.

    this.$body = $("body");

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

  }

  ////////////////////////////////
  // PRIVATE METHODS
  ////////////////////////////////

  function initEnhanced() {

    ////////////////////////////////
    // SETUP
    ////////////////////////////////

    // Cache DOM elements
    this.$profile = $("#profile");
    this.$indicator = $("#indicator");
    this.$navigation = $("#navigation");
    this.$levels = $(".level");
    this.$slides = $('.slide');
    this.$arrows = $("#arrows");
    this.$bg = $("#bg");
    this.$info = $("#info");
    this.$logomark = $("body::after");

    // Remove preload class from body
    this.$body.removeClass(isPreloadingClass);

    // Set the layout type on the body element
    this.$body.data('layout', 'enhanced');

    // Let the mountains fade in, and then
    // enable animations for them.
    setTimeout( function() {
      TGM.$body.addClass('is-animated');
    }, 100 );

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

    // Sets the initial layout
    windowResized();

    // Go to the default slide
    slideTo( 0, 0 );

  }

  function initSimple() {

    // Set the layout type on the body element
    this.$body.data('layout', 'simple');

  }

  function slideTo( level, slide ) {

    var up = level > 0;
    var right = (slide < slideCount - 1 && level === 1);
    var down = level < levelCount - 1;
    var left = (slide > 0 && level === 1);

    // Set directions for navigation arrows
    setArrows( up, right, down, left );

    // Adjust parallax
    setParallax( 'vertical', level );
 
    if ( level !== 0 ) {
      setParallax( 'horizontal', slide );
    }
    else {
      setParallax( 'horizontal', 0 );
    }

    levelIndex = setSelectorClass('.level', level);
    slideIndex = setSelectorClass('.level.present .slide', slide);
    currentLevel = $('.level.present').first();

    // console.log('Level Index: ', levelIndex);
    // console.log('Slide Index: ', slideIndex);
    // console.log('Current Level: ', currentLevel);

  }

  function setSelectorClass( selector, index ) {

    var $elements = $(selector)
    var index = Math.max(Math.min(index, $elements.length - 1), 0);

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
        setParallax( 'horizontal', 1 );
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

  function setParallax( direction, level ) {

    switch (direction) {

      case 'vertical':
        level = Math.max(Math.min(level, parallaxCount - 1), 0);
          TGM.$bg.data('level-v', level + 1);
        break;

      case 'horizontal':
        level = Math.max(Math.min(level, slideCount), 0);
        TGM.$bg.data('level-h', level + 1)
        break;

    }

  }

  function setArrows( up, right, down, left ) {

    TGM.$arrows.removeClass('up right down left');

    if (up) TGM.$arrows.addClass('up');
    if (right) TGM.$arrows.addClass('right');
    if (down) TGM.$arrows.addClass('down');
    if (left) TGM.$arrows.addClass('left');

  }

  function showProgress( show ) {

    if (show === true) {
      TGM.$body.addClass(hasProfileClass);
    } else {
      TGM.$body.removeClass(hasProfileClass);
    }

  }

  function setProgress( index ) {

    var increment = TGM.$profile.width() / slideCount;
    TGM.$indicator.css( 'left', increment * index + "px" );

  }

  function setupProgressBar() {

    if (!TGM.$profileBG) {
      TGM.$profileBG = $('<img class="profile__bg" src="/images/profile.svg#preserveAspectRatio=none" alt="" />');
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

  // Handle window resizing
  function windowResized( e ) {
    setupProgressBar();
    setProgress( slideIndex );
  }

  // Show information panel
  function showInfo( e ) {

    // Prevent the default click event
    e.preventDefault();

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
    TGM.$info.css({'opacity': 0, 'top': '-10px'}).show().animate({
      opacity: 1,
      top: '0px'
    }, 500, 'ease');

  }

  // Hide the information panel
  function hideInfo(e) {
    
    e.preventDefault();

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
      top: '-10px'
    }, 500, 'ease', function() {
      $(this).hide();
    }).find('.js-hide-info').off('click');

  }

  function getCurrentLevelName() {
    return currentLevel.attr('id');
  }

})(window.TGM = window.TGM || {}, Zepto);

$(function() {

  var images = [
    'arrows.png',
    'noise.png',
    'logo.svg',
    'profile.svg',
    'badge/mansfield.svg',
    'bg/back.png',
    'bg/fore.png',
    'bg/mid.png'
  ];

  var preloaded = images.length;

  $.each( images, function(i, img) {

    var image = $('<img />').attr('src', '/images/' + img);
    
    image.on( 'load', function() {
      preloaded--;
      if (preloaded === 0) {
        TGM.init();
      }
    });

  });

});