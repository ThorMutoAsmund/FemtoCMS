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

    this.loadGalleriesPromise = this.loadGalleries();
  }

  loadGalleries() {
    return new Promise((resolve) => {
      firebase.database().ref('/galleries').once('value').then(snapshot => {
        resolve(snapshot);
      });
    });
  }

  getPageAsync(pageId = null, parameters = []) {
    // Return only page IDs
    if (pageId == null) {
      return Promise.resolve(['page_photos']);
    }

    // If unsupported page requested, reject promise
    if (pageId != 'page_photos') {
      return Promise.reject();
    }

    return new Promise((resolve, reject) => {
      this.loadGalleriesPromise.then(galleries => {
        var result = '';
        if (parameters.length > 0) {
          var gallery = galleries.child(parameters[0]).val();          
          if (gallery) {
            var heading ='<h2>' + (gallery.name || 'untitled') + '</h2>';
            if (gallery.images) {
              gallery.images.forEach(image => {
                result += '<div style="padding:8px; border:1px solid black; margin:10px"><a href="#photos/'+gallery.key+'/'+image.key+'">';
                result += '<img src="'+image.path+'" width="200" />';
                if (image.title) {
                  result += '<p>'+image.title+'</p>';
                }
                result += '</a></div>';
              });
              result = heading + '<div style="display: flex">' + result + '</div>';
            }
            else {
              result = '<p>No images</p>';
            }
            resolve(result);
          }
          else {
            reject();
          }
        }
        else {
          galleries.forEach(gallery => {
            var data = gallery.val();
            result += '<div style="padding:40px; border:1px solid black; margin:10px"><a href="#photos/'+gallery.key+'"><span style="font-size:48px">'+data.name+'</span></a></div>';
          });
  
          result = '<h2>Photo Gallery</h2><div style="display: flex">' + result + '</div>';
          resolve(result);
        }
      });
    });
  }
}
