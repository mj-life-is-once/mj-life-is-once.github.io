//var sceneEl = document.querySelector('a-scene');
var vid_screen;

window.addEventListener('camera-init', (data) => {
        console.log('camera-init', data);
        vid_screen = document.querySelector('#vid_source');
    })
window.addEventListener('camera-error', (error) => {
        console.log('camera-error', error);
    })

AFRAME.registerComponent('registerevents', {
    init: function () {
      var marker = this.el;
      //console.log('register events');
      marker.addEventListener('markerFound', function() {
        var markerId = marker.id;
        console.log('markerFound', markerId);

        if(marker.id=="marker_vid"){
        	vid_screen.play();
        	console.log('play video');
        }
        // TODO: Add your own code here to react to the marker being found.
      });
      marker.addEventListener('markerLost', function() {
        var markerId = marker.id;
        console.log('markerLost', markerId);
        // TODO: Add your own code here to react to the marker being lost.
        if(marker.id=="marker_vid"){
        	vid_screen.pause();
        	console.log('stop video');
        }
      });
    }
  });

AFRAME.registerComponent('clickevents', {
    init: function () {
      var marker = this.el;
      //console.log('register events');
      marker.addEventListener('markerFound', function() {
        var markerId = marker.id;
        console.log('markerFound', markerId);

        if(marker.id=="marker_vid"){
          vid_screen.play();
          console.log('play video');
        }
        // TODO: Add your own code here to react to the marker being found.
      });
      marker.addEventListener('markerLost', function() {
        var markerId = marker.id;
        console.log('markerLost', markerId);
        // TODO: Add your own code here to react to the marker being lost.
        if(marker.id=="marker_vid"){
          vid_screen.pause();
          console.log('stop video');
        }
      });
    }
  });
/*
AFRAME.registerComponent('track-cursor-intersection', {
        init: function () {
          this.point = new THREE.Vector3();
        },
        
        tick: function (t, dt) {
          // NOTE: not throttled to raycaster checkIntersections interval!
          var cursor = this.el.components.cursor;
          var raycaster = this.el.components.raycaster;
          var newIntersection;
          // NOTE: A-Frame 0.7.1 (which doesn't need this) does not have raycaster.intersections
          if (cursor && raycaster && raycaster.intersections) {
            newIntersection = raycaster.intersections.length ? raycaster.intersections[0] : undefined;
            // NOTE: the intersections are always different (!) so check object
            if ((cursor.intersection && cursor.intersection.object) !== (newIntersection && newIntersection.object)) {
              // new cursor intersection object
              cursor.intersection = newIntersection;              
              this.el.emit('cursor-intersection-changed', cursor.intersection, false);
            } else
            if (newIntersection && !newIntersection.point.equals(cursor.intersection.point)) {
              // new cursor intersection point
              cursor.intersection.point.copy(newIntersection.point);
              this.el.emit('cursor-intersection-changed', newIntersection, false);
            } else {
              // same or no cursor intersection point
            }
          }
        }
      });  
*/
