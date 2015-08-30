/*global define, $, console, window, history, document, tau*/

/**
 * Init page module
 */

define({
    name: 'views/page/init',
    requires: [
        'core/event',
        'core/template',
        'core/systeminfo',
        'core/application',
        'core/storage/idb',
        'models/routes',
        'helpers/route',
        'views/page/store'
        //'core/tizen'
        //'views/page/main',
        //'views/page/details',
        //'views/page/units',
        //'views/page/delete',
        //'views/page/name'
    ],
    def: function viewsPageInit(req) {
        'use strict';

        var e = req.core.event,
            idb = req.core.storage.idb,
            app = req.core.application,
            t = req.core.template,
            tizennnnnn = req.core.tizen,
            elHours = null,
            elMinutes = null,
            elSeconds = null,
            sysInfo = req.core.systeminfo;
        var startButton = null;
        var saveButton = null;
        var stopButton = null;
        var storeButton = null;
        var page = null;
        var page2 = null;
        var ax,ay,az,rotx,roty,rotz,temp;
        var routes = req.models.routes;
        var r = req.helpers.route;
        var acceleor = null;
        var watchID = null;
        var stop = true;
        var storePool = '';
        var dataID = 0;
 
        

        /**
         * Exits the application, waiting first for pending storage requests
         * to complete.
         */
        function exit() {
            e.fire('application.exit');
            if (!idb.hasPendingRequests()) {
                app.exit();
            } else {
                e.listen('core.storage.idb.completed', app.exit);
            }
        }

        /**
         * Handles tizenhwkey event.
         * @param {event} ev
         */
        function onHardwareKeysTap(ev) {
            var keyName = ev.keyName,
                page = document.getElementsByClassName('ui-page-active')[0],
                pageid = page ? page.id : '';
            
            console.log('onHardwareKeysTap');

            if (keyName === 'back') {
            	console.log('back '+ pageid);
                if (pageid === 'main' || pageid === 'ajax-loader') {
                	console.log('end');
                	console.clear();
                	//tizen.power.release("CPU");  //release CPU
                	tizen.power.release("SCREEN"); //release SCREEN
                    exit();
                } else if (pageid === 'register') {
                	console.log('register');
                    e.fire('register.menuBack');
                    history.back();
                } else {
                    history.back();
                }
            }         
        }

        /**
         * Handles resize event.
         */
        function onWindowResize() {
            e.fire('window.resize', { height: window.innerHeight });
        }

        /**
         * Handler onLowBattery state
         */
        function onLowBattery() {
            if (document.getElementsByClassName('ui-page-active')[0].id ===
                'register') {
                e.fire('register.menuBack');
            }
            exit();
        }
        
        
        function onStart(ev){
        	if(stop){
        		alert('Accelerometer Start!');
        		stop = false;
        		saveMark();

            	acceleor = function(e) {
            		      		
    				ax = e.accelerationIncludingGravity.x;
    				ay = e.accelerationIncludingGravity.y;
    				az = e.accelerationIncludingGravity.z;
    				
    				
    				//document.getElementById("xaccel").innerHTML = 'AccX : ' + ax;
    				//document.getElementById("yaccel").innerHTML = 'AccY : ' + ay;
    				//document.getElementById("zaccel").innerHTML = 'AccZ : ' + az;
    				

    				temp = dataID + "," + getDate() + "," + ax + "," + ay + "," + az;
    				storePool += temp + '\r\n';
    				
                    if( (dataID % 1000) === 0 ){
                    	console.log('Datas: ' + (dataID+1));  
                    	savedata();
                    	storePool ='';
            		}
                    dataID++; 				
    			};
            	      	
    			window.addEventListener('devicemotion', acceleor);   
    			tau.changePage('#starting');
            	console.log('init 4');      		
        	}      	   	
        }
                
        function getDate(){
        	var currentDate = new Date();
        	var years = currentDate.getFullYear(),
    	        months = currentDate.getMonth(),
    	        dates = currentDate.getDate(),
    	        hours = currentDate.getHours(),
    	        minutes = currentDate.getMinutes(),
    	        seconds = currentDate.getSeconds(),
    	        milliseconds = currentDate.getMilliseconds(),
    	        FullDate = years + '/' + months + '/' + dates + '-' + hours + ':' + minutes + ':' + seconds + ':' + milliseconds;
        	return FullDate;
        }
        
        //**********\/\/\/\/\/\/
        function tick() {
            refreshTimer(timer.getTimeElapsed());
        }
        
        /**
         * Refreshes UI hours.
         */
        function refreshHours() {
            var content = digits[0].toString() + digits[1];
            elHours.innerHTML = content;
        }
        /**
         * Refreshes UI minutes.
         */
        function refreshMinutes() {
            var content = digits[2].toString() + digits[3];
            elMinutes.innerHTML = content;
        }

        /**
         * Refreshes UI seconds.
         */
        function refreshSeconds() {
            var content = digits[4].toString() + digits[5];
            elSeconds.innerHTML = content;
        }

        
        function refreshTimer(timeMilliseconds) {
            var time = [], i = 0;
            time = new Time(timeMilliseconds);

            i = 6;
            while (i--) {
                digits[i] = time[i];
            }

            refreshHours();
            refreshMinutes();
            refreshSeconds();
        }
        //******/\/\/\/\/\/\/\/\
        
             
        function savedata(){
        	console.log('save');
        	
        	var route = {
                    ax: storePool,
                };       	
        	routes.add(route);
        }
        
        function saveMark(){
        	console.log('save');      	
        	var route = {
                    ax: 'xxxx',
                };       	
        	routes.add(route);
        }
        
        function onStore(){
        	if(!stop){
        		onStop();
        	}      	
        	tau.changePage('#store');
        }
        
        
        function onStop(){
        	if(!stop){
        		routes.addDataSize(dataID);
        		console.log('Stop');
        		//console.log(storePool);
            	window.removeEventListener('devicemotion', acceleor);
            	savedata();
            	//saveMark();
            	dataID=0;
            	stop = true;
            	storePool ='';
            	alert('Accelerometer Stop!');
            	tau.changePage('#main');
        	}else{
        		alert('Accelerometer not start!');
        	}        	
        }
        
        /**
         * Registers event listeners
         */
        function bindEvents() {
            window.addEventListener('tizenhwkey', onHardwareKeysTap);
            window.addEventListener('resize', onWindowResize);
            sysInfo.listenBatteryLowState();
            
            startButton.addEventListener('click', onStart);
            saveButton.addEventListener('click', onStore);
            stopButton.addEventListener('click', onStop);
            //storeButton.addEventListener('click', onStore);
            
            /*
            startButton.addEventListener('click', onStart);
            saveButton.addEventListener('click', onStop);
            storeButton.addEventListener('click', onStore);
            */
            //storeButton.addEventListener('click', getData);
            
            console.log('init 2');   
            
            //tizen.power.request("CPU", "CPU_AWAKE"); //running in background
            tizen.power.request("SCREEN", "SCREEN_NORMAL");//keep screen open
         }
        
        /**
         * Initializes module.
         */
        function init() {
            // bind events to page elements
          	
        	page = document.getElementById('main');
        	page2 = document.getElementById('starting');
        	
        	//elHours = page.querySelector('.time .hours');
            //lMinutes = page.querySelector('.time .minutes');
            //elSeconds = page.querySelector('.time .seconds');
        	
        	startButton = document.getElementById('start-btn');
        	saveButton = document.getElementById('save-btn');
        	
        	stopButton = document.getElementById('stop-btn');
        	
        	/*
        	startButton = page.querySelector('.start');
        	saveButton = page.querySelector('.stop');
        	storeButton = page.querySelector('.store');
        	*/
        	
            bindEvents();
            sysInfo.checkBatteryLowState();
            console.log('init 1');
        }

        e.on({
            'core.systeminfo.battery.low': onLowBattery
        });

        return {
            init: init
        };
    }
});
