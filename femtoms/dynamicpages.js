class DynamicPages {
  constructor() {
    this.options = {
      pageContainerId: 'page_container',
      pages: []
    }
  }

  loadFunctionalPageIdsAsync(page) {
    return page.onGetPageAsync();
  }

  loadFunctionalPageAsync(page, pageId) {
    return page.onGetPageAsync(pageId).then(sectionContent => {
      var html = '<section id="'+pageId+'" class="main-content hidden">'+sectionContent+'</section>';
      $(this.pageContainer).append(html);
      this.debug('Fetching dynamic page: ' + pageId);
    });
  }

  loadFirebasePageIdsAsync(page) {
    if (!firebase) {
      throw('Firebase not loaded');  
    }

    throw('Page type firebase not implemented');
  }

  loadFirebasePageAsync(page, pageId) {
    throw('Page type firebase not implemented');
  }

  loadPageIdsAsync(pages) {
    var allPageIds = [];
    var asyncRequests = [];
    pages.forEach((page) => {
      if (page.type == 'functional') {
        asyncRequests.push(
          this.loadFunctionalPageIdsAsync(page).then(pageIds => {
            this.femtoCMS.addDynamicPages(pageIds, this.loadFunctionalPageAsync.bind(this, page));
          })
        );
      }
      else if (page.type == 'firebase') {
        asyncRequests.push(
          this.loadFirebasePageIdsAsync(page).then(pageIds => {
            this.femtoCMS.addDynamicPages(pageIds, this.loadFirebasePageAsync.bind(this, page));
          })
        );
      }
      else {
        throw('Page type unknown: ' + page.type);
      }
    });

    return Promise.all(asyncRequests);
  }

  // loadPages(pages) {
  //   var container = $('#' + this.options.pageContainerId);

  //   if (container.length == 0) {
  //     throw('Container not found');
  //   };

  //   pages.forEach((page) => {
  //     if (page.type == 'functional') {
  //       this.loadFunctionalPageIds(container, page);
  //     }
  //     else if (page.type == 'firebase') {
  //       this.loadFirebasePageIds(container, page);
  //     }
  //     else {
  //       throw('Page type unknown: ' + page.type);
  //     }
  //   });
  // }

  bootAsync(femtoCMS, options = null) {
    this.femtoCMS = femtoCMS;

    // Options
    if (options) {
      this.options = Object.assign(this.options, options);
    }

    this.pageContainer = $('#' + this.options.pageContainerId);

    if (this.pageContainer.length == 0) {
      throw('Container not found');
    };

    return this.loadPageIdsAsync(this.options.pages);
  } 
}

// Register plugin
if (!FemtoCMS) throw ('FemtoCMS not loaded');
FemtoCMS.addPlugin('dynamicPages', new DynamicPages());