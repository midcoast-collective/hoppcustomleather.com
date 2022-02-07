/* ========================================================================
 * Bootstrap: button.js v3.0.0
 * http://twbs.github.com/bootstrap/javascript.html#buttons
 * ========================================================================
 * Copyright 2013 Twitter, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * ======================================================================== */


+function ($) { "use strict";

  // BUTTON PUBLIC CLASS DEFINITION
  // ==============================

  var Button = function (element, options) {
    this.$element = $(element)
    this.options  = $.extend({}, Button.DEFAULTS, options)
  }

  Button.DEFAULTS = {
    loadingText: 'loading...'
  }

  Button.prototype.setState = function (state) {
    var d    = 'disabled'
    var $el  = this.$element
    var val  = $el.is('input') ? 'val' : 'html'
    var data = $el.data()

    state = state + 'Text'

    if (!data.resetText) $el.data('resetText', $el[val]())

    $el[val](data[state] || this.options[state])

    // push to event loop to allow forms to submit
    setTimeout(function () {
      state == 'loadingText' ?
        $el.addClass(d).attr(d, d) :
        $el.removeClass(d).removeAttr(d);
    }, 0)
  }

  Button.prototype.toggle = function () {
    var $parent = this.$element.closest('[data-toggle="buttons"]')

    if ($parent.length) {
      var $input = this.$element.find('input')
        .prop('checked', !this.$element.hasClass('active'))
        .trigger('change')
      if ($input.prop('type') === 'radio') $parent.find('.active').removeClass('active')
    }

    this.$element.toggleClass('active')
  }


  // BUTTON PLUGIN DEFINITION
  // ========================

  var old = $.fn.button

  $.fn.button = function (option) {
    return this.each(function () {
      var $this   = $(this)
      var data    = $this.data('bs.button')
      var options = typeof option == 'object' && option

      if (!data) $this.data('bs.button', (data = new Button(this, options)))

      if (option == 'toggle') data.toggle()
      else if (option) data.setState(option)
    })
  }

  $.fn.button.Constructor = Button


  // BUTTON NO CONFLICT
  // ==================

  $.fn.button.noConflict = function () {
    $.fn.button = old
    return this
  }


  // BUTTON DATA-API
  // ===============

  $(document).on('click.bs.button.data-api', '[data-toggle^=button]', function (e) {
    var $btn = $(e.target)
    if (!$btn.hasClass('btn')) $btn = $btn.closest('.btn')
    $btn.button('toggle')
    e.preventDefault()
  })

}(window.jQuery);

/* ========================================================================
 * Bootstrap: carousel.js v3.0.0
 * http://twbs.github.com/bootstrap/javascript.html#carousel
 * ========================================================================
 * Copyright 2012 Twitter, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * ======================================================================== */


+function ($) { "use strict";

  // CAROUSEL CLASS DEFINITION
  // =========================

  var Carousel = function (element, options) {
    this.$element    = $(element)
    this.$indicators = this.$element.find('.carousel-indicators')
    this.options     = options
    this.paused      =
    this.sliding     =
    this.interval    =
    this.$active     =
    this.$items      = null

    this.options.pause == 'hover' && this.$element
      .on('mouseenter', $.proxy(this.pause, this))
      .on('mouseleave', $.proxy(this.cycle, this))
  }

  Carousel.DEFAULTS = {
    interval: 5000
  , pause: 'hover'
  , wrap: true
  }

  Carousel.prototype.cycle =  function (e) {
    e || (this.paused = false)

    this.interval && clearInterval(this.interval)

    this.options.interval
      && !this.paused
      && (this.interval = setInterval($.proxy(this.next, this), this.options.interval))

    return this
  }

  Carousel.prototype.getActiveIndex = function () {
    this.$active = this.$element.find('.item.active')
    this.$items  = this.$active.parent().children()

    return this.$items.index(this.$active)
  }

  Carousel.prototype.to = function (pos) {
    var that        = this
    var activeIndex = this.getActiveIndex()

    if (pos > (this.$items.length - 1) || pos < 0) return

    if (this.sliding)       return this.$element.one('slid', function () { that.to(pos) })
    if (activeIndex == pos) return this.pause().cycle()

    return this.slide(pos > activeIndex ? 'next' : 'prev', $(this.$items[pos]))
  }

  Carousel.prototype.pause = function (e) {
    e || (this.paused = true)

    if (this.$element.find('.next, .prev').length && $.support.transition.end) {
      this.$element.trigger($.support.transition.end)
      this.cycle(true)
    }

    this.interval = clearInterval(this.interval)

    return this
  }

  Carousel.prototype.next = function () {
    if (this.sliding) return
    return this.slide('next')
  }

  Carousel.prototype.prev = function () {
    if (this.sliding) return
    return this.slide('prev')
  }

  Carousel.prototype.slide = function (type, next) {
    var $active   = this.$element.find('.item.active')
    var $next     = next || $active[type]()
    var isCycling = this.interval
    var direction = type == 'next' ? 'left' : 'right'
    var fallback  = type == 'next' ? 'first' : 'last'
    var that      = this

    if (!$next.length) {
      if (!this.options.wrap) return
      $next = this.$element.find('.item')[fallback]()
    }

    this.sliding = true

    isCycling && this.pause()

    var e = $.Event('slide.bs.carousel', { relatedTarget: $next[0], direction: direction })

    if ($next.hasClass('active')) return

    if (this.$indicators.length) {
      this.$indicators.find('.active').removeClass('active')
      this.$element.one('slid', function () {
        var $nextIndicator = $(that.$indicators.children()[that.getActiveIndex()])
        $nextIndicator && $nextIndicator.addClass('active')
      })
    }

    if ($.support.transition && this.$element.hasClass('slide')) {
      this.$element.trigger(e)
      if (e.isDefaultPrevented()) return
      $next.addClass(type)
      $next[0].offsetWidth // force reflow
      $active.addClass(direction)
      $next.addClass(direction)
      $active
        .one($.support.transition.end, function () {
          $next.removeClass([type, direction].join(' ')).addClass('active')
          $active.removeClass(['active', direction].join(' '))
          that.sliding = false
          setTimeout(function () { that.$element.trigger('slid') }, 0)
        })
        .emulateTransitionEnd(600)
    } else {
      this.$element.trigger(e)
      if (e.isDefaultPrevented()) return
      $active.removeClass('active')
      $next.addClass('active')
      this.sliding = false
      this.$element.trigger('slid')
    }

    isCycling && this.cycle()

    return this
  }


  // CAROUSEL PLUGIN DEFINITION
  // ==========================

  var old = $.fn.carousel

  $.fn.carousel = function (option) {
    return this.each(function () {
      var $this   = $(this)
      var data    = $this.data('bs.carousel')
      var options = $.extend({}, Carousel.DEFAULTS, $this.data(), typeof option == 'object' && option)
      var action  = typeof option == 'string' ? option : options.slide

      if (!data) $this.data('bs.carousel', (data = new Carousel(this, options)))
      if (typeof option == 'number') data.to(option)
      else if (action) data[action]()
      else if (options.interval) data.pause().cycle()
    })
  }

  $.fn.carousel.Constructor = Carousel


  // CAROUSEL NO CONFLICT
  // ====================

  $.fn.carousel.noConflict = function () {
    $.fn.carousel = old
    return this
  }


  // CAROUSEL DATA-API
  // =================

  $(document).on('click.bs.carousel.data-api', '[data-slide], [data-slide-to]', function (e) {
    var $this   = $(this), href
    var $target = $($this.attr('data-target') || (href = $this.attr('href')) && href.replace(/.*(?=#[^\s]+$)/, '')) //strip for ie7
    var options = $.extend({}, $target.data(), $this.data())
    var slideIndex = $this.attr('data-slide-to')
    if (slideIndex) options.interval = false

    $target.carousel(options)

    if (slideIndex = $this.attr('data-slide-to')) {
      $target.data('bs.carousel').to(slideIndex)
    }

    e.preventDefault()
  })

  $(window).on('load', function () {
    $('[data-ride="carousel"]').each(function () {
      var $carousel = $(this)
      $carousel.carousel($carousel.data())
    })
  })

}(window.jQuery);

/* ========================================================================
 * Bootstrap: transition.js v3.0.0
 * http://twbs.github.com/bootstrap/javascript.html#transitions
 * ========================================================================
 * Copyright 2013 Twitter, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * ======================================================================== */


+function ($) { "use strict";

  // CSS TRANSITION SUPPORT (Shoutout: http://www.modernizr.com/)
  // ============================================================

  function transitionEnd() {
    var el = document.createElement('bootstrap')

    var transEndEventNames = {
      'WebkitTransition' : 'webkitTransitionEnd'
    , 'MozTransition'    : 'transitionend'
    , 'OTransition'      : 'oTransitionEnd otransitionend'
    , 'transition'       : 'transitionend'
    }

    for (var name in transEndEventNames) {
      if (el.style[name] !== undefined) {
        return { end: transEndEventNames[name] }
      }
    }
  }

  // http://blog.alexmaccaw.com/css-transitions
  $.fn.emulateTransitionEnd = function (duration) {
    var called = false, $el = this
    $(this).one($.support.transition.end, function () { called = true })
    var callback = function () { if (!called) $($el).trigger($.support.transition.end) }
    setTimeout(callback, duration)
    return this
  }

  $(function () {
    $.support.transition = transitionEnd()
  })

}(window.jQuery);

/* 
 * VenoBox - jQuery Plugin
 * version: 1.3.6
 * @requires jQuery
 *
 * Examples at http://lab.veno.it/venobox/
 * License: Creative Commons Attribution 3.0 License
 * License URI: http://creativecommons.org/licenses/by/3.0/
 * Copyright 2013-2014 Nicola Franchini - @nicolafranchini
 *
 */
(function($){

    var ios, ie9, overlayColor, overlay, vwrap, container, content, core, dest, top, sonH, finH, margine, prima, framewidth, frameheight, border, bgcolor, type, thisgall, items, thenext, theprev, title, nextok, prevok, keyNavigationDisabled, blocktitle, blocknum, numeratio, evitanext, evitaprev, evitacontent, figliall, infinigall;

    $.fn.extend({
        //plugin name - venobox
        venobox: function(options) {

          // default options
          var defaults = {
              framewidth: '',
              frameheight: '',
              border: '0',
              bgcolor: '#fff',
              numeratio: false,
              infinigall: false
          }; 
          var options = $.extend(defaults, options);

            return this.each(function() {
                  var obj = $(this);

                  obj.addClass('vbox-item');
                  obj.data('framewidth', options.framewidth);
                  obj.data('frameheight', options.frameheight);
                  obj.data('border', options.border);
                  obj.data('bgcolor', options.bgcolor);
                  obj.data('numeratio', options.numeratio);
                  obj.data('infinigall', options.infinigall);

                  ios = (navigator.userAgent.match(/(iPad|iPhone|iPod)/g) ? true : false);

                  // Idiot Explorer 9 or less
                  ie9 = ((document.all && !window.atob) ? true : false);

                  obj.click(function(e){
                    e.stopPropagation();
                    e.preventDefault();
                    obj = $(this);
                    overlayColor = obj.data('overlay');
                    framewidth = obj.data('framewidth');
                    frameheight = obj.data('frameheight');
                    border = obj.data('border');
                    bgcolor = obj.data('bgcolor');
                    nextok = false;
                    prevok = false;
                    keyNavigationDisabled = false;
                    dest = obj.attr('href');
                    top = $(window).scrollTop();
                    top = -top;

                    $('body').wrapInner('<div class="vwrap"></div>')

                    vwrap = $('.vwrap');
                    core = '<div class="vbox-overlay" style="background:'+ overlayColor +'"><div class="vbox-preloader">Loading...</div><div class="vbox-container"><div class="vbox-content"></div></div><div class="vbox-title"></div><div class="vbox-num">0/0</div><div class="vbox-close">X</div><div class="vbox-next">next</div><div class="vbox-prev">prev</div></div>';

                    $('body').append(core);

                    overlay = $('.vbox-overlay');
                    container = $('.vbox-container');
                    content = $('.vbox-content');
                    blocknum = $('.vbox-num');
                    blocktitle = $('.vbox-title');

                    content.html('');
                    content.css('opacity', '0');

                    checknav();

                    overlay.css('min-height', $(window).outerHeight() + 130);

                    if (ie9) {
                      overlay.animate({opacity:1}, 250, function(){ 
                        overlay.css({
                          'min-height': $(window).outerHeight(),
                          height : 'auto'
                        });
                        if(obj.data('type') == 'iframe'){
                          loadIframe();
                        }else if (obj.data('type') == 'inline'){
                          loadInline();
                        }else if (obj.data('type') == 'ajax'){
                          loadAjax(); 
                        }else if (obj.data('type') == 'vimeo'){
                          loadVimeo();
                        }else if (obj.data('type') == 'youtube'){
                          loadYoutube();
                        } else {
                          content.html('<img src="'+dest+'">');
                          preloadFirst();
                        }
                      });
                    } else {
                      overlay.bind("transitionend webkitTransitionEnd oTransitionEnd MSTransitionEnd", function(){ 
                        overlay.css({
                          'min-height': $(window).outerHeight(),
                          height : 'auto'
                        });
                        if(obj.data('type') == 'iframe'){
                          loadIframe();
                        }else if (obj.data('type') == 'inline'){
                          loadInline();
                        }else if (obj.data('type') == 'ajax'){
                          loadAjax(); 
                        }else if (obj.data('type') == 'vimeo'){
                          loadVimeo();
                        }else if (obj.data('type') == 'youtube'){
                          loadYoutube();
                        } else {
                          content.html('<img src="'+dest+'">');
                          preloadFirst();
                        }
                      });
                      overlay.css('opacity', '1');
                    }

                    if (ios) { 
                      vwrap.css({
                        'position': 'fixed',
                        'top': top,
                        'opacity': '0'
                      }).data('top', top);
                    } else {
                      vwrap.css({
                        'position': 'fixed',
                        'top': top,
                      }).data('top', top);
                      $(window).scrollTop(0);
                    }

                    /* -------- CHECK NEXT / PREV -------- */
                    function checknav(){

                      thisgall = obj.data('gall');
                      numeratio = obj.data('numeratio');
                      infinigall = obj.data('infinigall');

                      items = $('.vbox-item[data-gall="' + thisgall + '"]');

                      if(items.length > 0 && numeratio === true){
                        blocknum.html(items.index(obj)+1 + ' / ' + items.length);
                        blocknum.fadeIn();
                      }else{
                        blocknum.fadeOut();
                      }

                      thenext = items.eq( items.index(obj) + 1 );
                      theprev = items.eq( items.index(obj) - 1 );

                      if(obj.attr('title')){
                        title = obj.attr('title');
                        blocktitle.fadeIn();
                      }else{
                        title = '';
                        blocktitle.fadeOut();
                      }

                      if (infinigall === true) {

                        nextok = true;
                        prevok = true;

                        if(thenext.length < 1 ){
                          thenext = items.eq(0);
                        }
                        if(items.index(obj) < 1 ){
                          theprev = items.eq( items.index(items.length) );
                        }   

                      } else {

                        if(thenext.length > 0 ){
                          $('.vbox-next').css('display', 'block');
                          nextok = true;
                        }else{
                          $('.vbox-next').css('display', 'none');
                          nextok = false;
                        }
                        if(items.index(obj) > 0 ){
                          $('.vbox-prev').css('display', 'block');
                          prevok = true;
                        }else{
                          $('.vbox-prev').css('display', 'none');
                          prevok = false;
                        }
                      }
                    }

                    /* -------- NAVIGATE WITH ARROW KEYS -------- */
                    $('body').keydown(function(e) {
                      if (keyNavigationDisabled) return;
                      
                      if(e.keyCode == 37 && prevok == true) { // left
                        keyNavigationDisabled = true;

                        overlayColor = theprev.data('overlay');

                        framewidth = theprev.data('framewidth');
                        frameheight = theprev.data('frameheight');
                        border = theprev.data('border');
                        bgcolor = theprev.data('bgcolor');

                        dest = theprev.attr('href');
                        
                        if(theprev.attr('title')){
                          title = theprev.attr('title');
                        }else{
                          title = '';
                        }

                        if (overlayColor === undefined ) {
                          overlayColor = "";
                        }  

                        overlay.css('min-height', $(window).outerHeight() + 130);
                      
                        content.animate({ opacity:0}, 500, function(){
                        overlay.css('min-height', $(window).outerHeight()).css('background',overlayColor);

                          if (theprev.data('type') == 'iframe') {
                            loadIframe();
                          } else if (theprev.data('type') == 'inline'){
                            loadInline();
                          } else if (theprev.data('type') == 'ajax'){
                            loadAjax();
                          } else if (theprev.data('type') == 'youtube'){
                            loadYoutube();
                          } else if (theprev.data('type') == 'vimeo'){
                            loadVimeo();
                          }else{
                            content.html('<img src="'+dest+'">');
                            preloadFirst();
                          }
                          obj = theprev;
                          checknav();
                          keyNavigationDisabled = false;
                        });

                      }
                      if(e.keyCode == 39 && nextok == true) { // right
                        keyNavigationDisabled = true;

                        overlayColor = thenext.data('overlay');

                        framewidth = thenext.data('framewidth');
                        frameheight = thenext.data('frameheight');
                        border = thenext.data('border');
                        bgcolor = thenext.data('bgcolor');


                        dest = thenext.attr('href');

                        if(thenext.attr('title')){
                          title = thenext.attr('title');
                        }else{
                          title = '';
                        }

                        if (overlayColor === undefined ) {
                          overlayColor = "";
                        }  

                        overlay.css('min-height', $(window).outerHeight() + 130);

                        content.animate({ opacity:0}, 500, function(){
                        overlay.css('min-height', $(window).outerHeight()).css('background',overlayColor);

                          if (thenext.data('type') == 'iframe') {
                            loadIframe();
                          } else if (thenext.data('type') == 'inline'){
                            loadInline();
                          } else if (thenext.data('type') == 'ajax'){
                            loadAjax();
                          } else if (thenext.data('type') == 'youtube'){
                            loadYoutube();
                          } else if (thenext.data('type') == 'vimeo'){
                            loadVimeo();
                          }else{
                            content.html('<img src="'+dest+'">');
                            preloadFirst();
                          }
                          obj = thenext;
                          checknav();
                          keyNavigationDisabled = false;
                        });

                      }
                    });
                    /* -------- NEXTGALL -------- */
                    $('.vbox-next').click(function(){

                      overlayColor = thenext.data('overlay');

                      framewidth = thenext.data('framewidth');
                      frameheight = thenext.data('frameheight');
                      border = thenext.data('border');
                      bgcolor = thenext.data('bgcolor');

                      dest = thenext.attr('href');

                      if(thenext.attr('title')){
                        title = thenext.attr('title');
                      }else{
                        title = '';
                      }

                      if (overlayColor === undefined ) {
                        overlayColor = "";
                      }  

                      overlay.css('min-height', $(window).outerHeight() + 130);

                      content.animate({ opacity:0}, 500, function(){
                      overlay.css('min-height', $(window).outerHeight()).css('background',overlayColor);

                        if (thenext.data('type') == 'iframe') {
                          loadIframe();
                        } else if (thenext.data('type') == 'inline'){
                          loadInline();
                        } else if (thenext.data('type') == 'ajax'){
                          loadAjax();     
                        } else if (thenext.data('type') == 'youtube'){
                          loadYoutube();
                        } else if (thenext.data('type') == 'vimeo'){
                          loadVimeo();
                        }else{
                            content.html('<img src="'+dest+'">');
                            preloadFirst();
                        }
                        obj = thenext;
                        checknav();
                      });    
                    });

                    /* -------- PREVGALL -------- */
                    $('.vbox-prev').click(function(){

                      overlayColor = theprev.data('overlay');

                      framewidth = theprev.data('framewidth');
                      frameheight = theprev.data('frameheight');
                      border = theprev.data('border');
                      bgcolor = theprev.data('bgcolor');

                      dest = theprev.attr('href');
                      
                      if(theprev.attr('title')){
                        title = theprev.attr('title');
                      }else{
                        title = '';
                      }

                      if (overlayColor === undefined ) {
                        overlayColor = "";
                      }  

                      overlay.css('min-height', $(window).outerHeight() + 130);

                      content.animate({ opacity:0}, 500, function(){
                      overlay.css('min-height', $(window).outerHeight()).css('background',overlayColor);

                        if (theprev.data('type') == 'iframe') {
                          loadIframe();
                        } else if (theprev.data('type') == 'inline'){
                          loadInline();
                        } else if (theprev.data('type') == 'ajax'){
                          loadAjax();
                        } else if (theprev.data('type') == 'youtube'){
                          loadYoutube();
                        } else if (theprev.data('type') == 'vimeo'){
                          loadVimeo();
                        }else{
                          content.html('<img src="'+dest+'">');
                          preloadFirst();
                        }
                          obj = theprev;
                          checknav();
                      });
                    });

                    /* -------- CHIUDI -------- */
                    $('.vbox-close, .vbox-overlay').click(function(e){
                      evitacontent = '.figlio';
                      evitaprev = '.vbox-prev';
                      evitanext = '.vbox-next';
                      figliall = '.figlio *';

                      if( !$(e.target).is(evitacontent) && !$(e.target).is(evitanext) && !$(e.target).is(evitaprev)&& !$(e.target).is(figliall) ){


                        if (ie9) {
                          overlay.animate({opacity:0}, 500, function(){
                            overlay.remove();
                            $('.vwrap').children().unwrap();
                            $(window).scrollTop(-top);
                            keyNavigationDisabled = false;
                          });
                        } else {

                          overlay.unbind("transitionend webkitTransitionEnd oTransitionEnd MSTransitionEnd"); 
                          overlay.bind("transitionend webkitTransitionEnd oTransitionEnd MSTransitionEnd", function(){ 
                            overlay.remove();

                            if (ios) { 
                              $('.vwrap').bind("transitionend webkitTransitionEnd oTransitionEnd MSTransitionEnd", function(){ 
                                $('.vwrap').children().unwrap();
                                $(window).scrollTop(-top);
                              });
                              $('.vwrap').css('opacity', '1');
                            }else{
                              $('.vwrap').children().unwrap();
                              $(window).scrollTop(-top);
                            }
                            keyNavigationDisabled = false;
                          });
                          overlay.css('opacity', '0');
                        }
                      }
                    });
                    return false;
                  });
            });
        }
    });

    /* -------- LOAD AJAX -------- */
    function loadAjax(){
      $.ajax({
      url: dest,
      cache: false
      })
      .done(function( msg ) {
          content.html('<div class="vbox-inline">'+ msg +'</div>');
          updateoverlay(true);

      }) .fail(function() {
          content.html('<div class="vbox-inline"><p>Error retrieving contents, please retry</div>');
          updateoverlay(true);
      })
    }

    /* -------- LOAD IFRAME -------- */
    function loadIframe(){
      content.html('<iframe class="venoframe" src="'+dest+'"></iframe>');
    //  $('.venoframe').load(function(){ // valid only for iFrames in same domain
      updateoverlay();
    //  });
    }

    /* -------- LOAD VIMEO -------- */
    function loadVimeo(){
      var pezzi = dest.split('/');
      var videoid = pezzi[pezzi.length-1];
      content.html('<iframe class="venoframe" src="http://player.vimeo.com/video/'+videoid+'"></iframe>')
      updateoverlay();
    }

    /* -------- LOAD YOUTUBE -------- */
    function loadYoutube(){
      var pezzi = dest.split('/');
      var videoid = pezzi[pezzi.length-1];
      content.html('<iframe class="venoframe" allowfullscreen src="http://www.youtube.com/embed/'+videoid+'"></iframe>')
      updateoverlay();
    }
    
    /* -------- LOAD INLINE -------- */
    function loadInline(){
      content.html('<div class="vbox-inline">'+$(dest).html()+'</div>');
      updateoverlay();
    }

    /* -------- PRELOAD IMAGE -------- */
    function preloadFirst(){
        prima = $('.vbox-content').find('img');
        prima.one('load', function() {
          updateoverlay();

        }).each(function() {
          if(this.complete) $(this).load();
        }); 
    }

    /* -------- CENTER ON LOAD -------- */
    function updateoverlay(notopzero){
      notopzero = notopzero || false;
      if (notopzero != true) {
        $(window).scrollTop(0);
      }
      
      blocktitle.html(title);
      content.find(">:first-child").addClass('figlio');
      $('.figlio').css('width', framewidth).css('height', frameheight).css('padding', border).css('background', bgcolor);

      sonH = content.outerHeight();
      finH = $(window).height();

      if(sonH+80 < finH){
        margine = (finH - sonH)/2;
        content.css('margin-top', margine);
        content.css('margin-bottom', margine);

      }else{
        content.css('margin-top', '40px');
        content.css('margin-bottom', '40px');
      }
      content.animate({
        'opacity': '1'
      },'slow');
    }

    /* -------- CENTER ON RESIZE -------- */
    function updateoverlayresize(){
      if($('.vbox-content').length){
        sonH = content.height();
        finH = $(window).height();

        if(sonH+80 < finH){
          margine = (finH - sonH)/2;
          content.css('margin-top', margine);
          content.css('margin-bottom', margine);
        }else{
          content.css('margin-top', '40px');
          content.css('margin-bottom', '40px');
        }
      }
    }

    $(window).resize(function(){
      updateoverlayresize();
    });

})(jQuery);

$(function(){
    // $('.responsive-video').fitVids();
    $('.carousel').carousel({
      interval: 8000
    });

    $('.gallery-img').venobox({
        numeratio: true,
        infinigall: true
    });
});
