class DemoPhotos {
  constructor() {
    this.firebaseConfig = {
      apiKey: "AIzaSyAirtyWlGKh97FV4QpHz_2oS2xA31GgiC4",
      authDomain: "demophotos-e207a.firebaseapp.com",
      databaseURL: "https://demophotos-e207a.firebaseio.com",
      projectId: "demophotos-e207a",
      storageBucket: "",
      messagingSenderId: "24969048206"
    };
    
    if (!firebase) {
      throw('Firebase not loaded');  
    }

    firebase.initializeApp(this.firebaseConfig);

    this.galleryIdsPromise = this.loadGalleryIds();
  }

  loadGalleryIds() {
    return new Promise((resolve) => {
      firebase.database().ref('/galleries').once('value').then(snapshot => {
        resolve(snapshot);
      });
    });
  }

  getPageAsync(pageId = null) {
    // Return only page IDs
    if (pageId == null) {
      return Promise.resolve(['page_photos']);
    }

    if (pageId != 'page_photos') {
      return Promise.reject();
    }

    return new Promise((resolve) => {
      this.galleryIdsPromise.then(galleryIds => {
        var result = '';
        galleryIds.forEach(gallery => {
          result += '<div style="padding:40px; border:1px solid black; margin:10px"><span style="font-size:48px">'+gallery.key+'</span></div>';
        });

        result = '<h2>Photo Gallery</h2><div style="display: flex">' + result + '</div>';
        resolve(result);
      });
    });
  }
}
