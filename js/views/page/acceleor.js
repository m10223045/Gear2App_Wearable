

define({
	name: 'views/page/acceleor',
	requires: [
        'core/event',
        'core/template'
    ],
    def: function viewsPageAcceleor(req) {
    	'use strict';
    	
    	var e = req.core.event,
            t = req.core.template;
    	
    	function init() {   		
    		$(window).load(
    				function() {
    	    			// This listens for the back button press
    	    			document.addEventListener('tizenhwkey', function(e) {
    	    				if (e.keyName == "back")
    	    					tizen.application.getCurrentApplication().exit();
    	    			});

    	    			var temp;
    	    			window.addEventListener('devicemotion', function(e) {
    	    				ax = e.accelerationIncludingGravity.x;
    	    				ay = -e.accelerationIncludingGravity.y;
    	    				az = -e.accelerationIncludingGravity.z;
    	    				rotx = e.rotationRate.alpha;
    	    				roty = e.rotationRate.beta;
    	    				rotz = e.rotationRate.gamma;

    	    				document.getElementById("xaccel").innerHTML = 'AccX : ' + ax;
    	    				document.getElementById("yaccel").innerHTML = 'AccY : ' + ay;
    	    				document.getElementById("zaccel").innerHTML = 'AccZ : ' + az;

    	    				document.getElementById("rotx").innerHTML = 'Rot X : ' + rotx;
    	    				document.getElementById("roty").innerHTML = 'Rot Y : ' + roty;
    	    				document.getElementById("rotz").innerHTML = 'Rot Z : ' + rotz;
    	    				
    	    				temp = "RotX:" + rotx + " RotY:" + roty + " RotZ:" + rotz; 										
    	    			});

    	    		}); 		  		
    	} 	  	
    }
});