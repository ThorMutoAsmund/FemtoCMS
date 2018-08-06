(function(window) {
  function navigateTo(hash) {
    hash = (hash == '' ? FemtoCMS.options.pageIdIndex : hash);
    var id = FemtoCMS.options.pageIdPrefix + hash;
    var newSection = $('#' + id);

    // Page not found?
    if (newSection.length == 0) {
      hash = FemtoCMS.options.pageId404;
      id = FemtoCMS.options.pageIdPrefix + hash;
      newSection = $('#' + id);
    }

    if (!newSection.is(":visible")) {
      newSection.show();
      $('section').each(function(i, section) {
        if ($(section).attr('id') != id) {
          $(section).hide();
        }
       });
      
       window.scrollTo(0, 0);

      // var scrollTimer = window.setInterval(function() {
      //   if (newSection.is(":visible")) {
      //     window.scrollTo(0, 0);
      //     window.clearInterval(scrollTimer);
      //   }
      // }, 1);

      if (FemtoCMS.options.onNavigate) {
        FemtoCMS.options.onNavigate(hash);
      }
    }
  }

  function navigateToHash() {
    setTimeout(function() {
      var hash = location.hash.replace(/^#/, '');
      hash = (hash == '' ? FemtoCMS.options.pageIdIndex : hash);
      var id = FemtoCMS.options.pageIdPrefix + hash;
      var currentId = null;        
      $('section').each(function(i, section) {
        if (!$(section).hasClass('hidden')) {
          currentId = $(section).attr('id');
        }
      });
            
      if (currentId == null || id != currentId) {
        navigateTo(hash);
      }
    }, 10)
  }

  function debug(message) {
    if (FemtoCMS.options.debug) {
      console.log(message);
    }
  }

  function boot(options = null) {
    // Options
    if (options) {
      FemtoCMS.options = Object.assign(FemtoCMS.options, options);
    }

    // Navigation by clicking
    $('a').on('click',function() {
      var hash = $(this).attr('href').replace(/^#/, '');
      navigateTo(hash);
    });

    // Intercept hash change
    window.addEventListener("hashchange", navigateToHash, false);

    // First time navigation (on reload)
    navigateToHash();

    // Ready!
    debug("FemtoCMS is ready!")
  } 

  // FemtoCMS global variable
  window.FemtoCMS = {
    options: {
      debug: false,
      pageIdPrefix: 'page_',
      pageIdIndex: 'index',
      pageId404: 'page_404',
      onNavigate: null
    },   
    boot: boot
  }

  // // Boot CMS if JQuery loaded
  // window.onload = function() {
  //   if (window.jQuery) {  
  //     $(document).ready(function() {
  //       FemtoCMS.boot({
  //         debug: true
  //       });
  //     });
  //   } else {
  //     console.log("ERROR: jQuery must be loaded!");
  //   }
  // }
  
})(window);
