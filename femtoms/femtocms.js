class FemtoCMS {
  constructor(options = null) {
    // Variables
    this.fetchPageCallbacks = {};

    // Options
    this.options = {
      debug: false,
      pageIdPrefix: 'page_',
      pageIdIndex: 'index',
      pageId404: 'page_404',
      onNavigate: null
    };

    if (options) {
      this.options = Object.assign(this.options, options);
    }
      
    // Navigation by clicking
    $('a').on('click', (el) => {
      var hash = $(el.target).attr('href').replace(/^#/, '');
      this.navigateTo(hash);
    });
        
    // Load dynamic plugins
    this.loaded = this.loadPlugins(this.options.plugins || []).then(() => this.debug('FemtoCMS is ready!'));

    // Intercept hash change
    window.addEventListener("hashchange", this.navigateToHash.bind(this), false);

    // First time navigation (on reload)
    this.navigateToHash();
  }

  navigateTo(hash) {
    this.loaded.then(() => {
      hash = (hash == '' ? this.options.pageIdIndex : hash);
      var id = this.options.pageIdPrefix + hash;

      // Show 404 if page not registered
      // if (this.pageIds.indexOf(id) == -1) {
      //   hash = this.options.pageId404;
      //   id = this.options.pageIdPrefix + hash;
      // }

      // Find page
      var newSection = $('#' + id);
      
      // Load dynamic page if page not found in DOM
      var pageLoaded = Promise.resolve();
      if (newSection.length == 0) {
        var onFetchPage = this.fetchPageCallbacks[id];

        if (onFetchPage) {
          pageLoaded = onFetchPage(id);
        }
        else {
          hash = this.options.pageId404;
          id = this.options.pageIdPrefix + hash;
        }
      }

      pageLoaded.then(() => {
        newSection = $('#' + id);
        if (!newSection.is(":visible")) {
          newSection.show();
          $('section').each((i, section) => {
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
  
          if (this.options.onNavigate) {
            this.options.onNavigate(hash);
          }
        }
      });
    });
  }

  navigateToHash() {
    setTimeout(() => {
      var hash = location.hash.replace(/^#/, '');
      hash = (hash == '' ? this.options.pageIdIndex : hash);
      var id = this.options.pageIdPrefix + hash;
      var currentId = null;        
      $('section').each((i, section) => {
        if (!$(section).hasClass('hidden')) {
          currentId = $(section).attr('id');
        }
      });
            
      if (currentId == null || id != currentId) {
        this.navigateTo(hash);
      }
    }, 10);
  }

  debug(message) {
    if (this.options.debug) {
      console.log(message);
    }
  }

  loadPlugins(pluginConfigs) {
    var bootRequests = [];
    pluginConfigs.forEach((pluginConfig) => {
      if (pluginConfig.name) {
        var plugin = FemtoCMS.plugins[pluginConfig.name];
        if (plugin) {
          // The plugin can write debug messages
          var pluginDebug = (msg) => { this.debug('[' + pluginConfig.name + '] ' + msg) };
          plugin.debug = pluginDebug;

          // Boot the plugin
          try {
            bootRequests.push(plugin.bootAsync(this, pluginConfig).then(() => pluginDebug('Loaded')));
          }
          catch (msg) {
            pluginDebug('Failed loading plugin: ' + msg);
          }
        }
        else {
          throw('Plugin not registered: ' + pluginConfig.name);
        }
      }
      else {
        throw('Plugin with no name requested');
      }
    });

    return Promise.all(bootRequests);
  }

  addDynamicPages(pageIds, onFetchPage = null) {
    if (onFetchPage) {
      pageIds.forEach(id => {
        this.fetchPageCallbacks[id] = onFetchPage;
      });
    }
  }
  
  static boot(options = null) {
    // CMS instance
    var femtoCMS = new FemtoCMS(options);
  }

  static addPlugin(name, plugin) {
    FemtoCMS.plugins = FemtoCMS.plugins || [];
    FemtoCMS.plugins[name] = plugin;
  }
}
