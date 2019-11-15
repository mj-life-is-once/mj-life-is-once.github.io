var toggle = true;
var vid_count = 0;
var videoSource = new Array();
        videoSource[0] = 'video/sintel.mp4';
        videoSource[1] = 'video/vion.mp4';
        videoSource[2] = 'video/concept.mp4';
        videoSource[3] = 'video/Krippenwagen.mp4';
var videoCount = videoSource.length;
var aEntity;

AFRAME.registerComponent('clickhandler', {

    init: function() {
        const vidMarker = document.querySelector("#test_plane");
        aEntity = document.querySelector("#video_screen");
        // every click, change the color
        vidMarker.addEventListener('click', function(ev, target){
            
            const intersectedElement = ev && ev.detail && ev.detail.intersectedEl;
            console.log("clicked entity: ", intersectedElement);
            vid_count ++;
            if(vid_count == videoCount-1)
                vid_count = 0;
            //vid_string = vid_string+ vid_count.toString();
            aEntity.pause();
            aEntity.setAttribute('src', videoSource[vid_count]);
            aEntity.load();
            /*
            toggle = !toggle;
            if(toggle)
                    vidMarker.setAttribute('color', "#4CC3D9"); //EF2D5E
            else if(!toggle)
                    vidMarker.setAttribute('color', "#FFFFFF"); 
            */

            /*
            if (aEntity && intersectedElement === aEntity) {
                console.log("entity clicked");
                toggle = !toggle;
                if(toggle)
                    aEntity.setAttribute('color', "#4CC3D9"); //EF2D5E
                else if(!toggle)
                    aEntity.setAttribute('color', "#EF2D5E"); 
            }
            */
        });
}});