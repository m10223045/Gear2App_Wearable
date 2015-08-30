
define({
	name: 'views/page/store',
	requires: [
        'core/event',
        'core/template',
        'core/storage/idb',
        'helpers/route',
        'models/routes'
    ],
    def: function viewsPageStore(req) {
    	'use strict';
    	
    	var e = req.core.event;
    	var SAAgent = null;
    	var SASocket = null;
    	var CHANNELID = 104;
    	var ProviderAppName = "HelloAccessoryProvider";
    	var connButton = null;
    	var saveButton = null;
    	var deconnButton = null;
    	var page = null;
    	var routes = req.models.routes;
    	var route = {};
    	var t = req.core.template;
    	var r = req.helpers.route;
    	var temp ="";
    	var result="";
    	var idb = req.core.storage.idb;
    	var eaoch =0;
    	var closeConn = true;
    	var lock=false;
    	var show_temp = "";
    	var ok_button = "";
    	    	
    	
    	function createHTML(log_string)
    	{
    		var log = document.getElementById('resultBoard');
    		log.innerHTML = log.innerHTML + "<br> : " + log_string;
    	}

    	function onerror(err) {
    		alert('Can not Connected!');
    		tau.changePage('#main');
    		console.log("err [" + err + "]");
    	}

    	var agentCallback = {
    		onconnect : function(socket) {
    			SASocket = socket;
    			//alert("HelloAccessory Connection established with RemotePeer");
    			createHTML("startConnection");
    			SASocket.setSocketStatusListener(function(reason){
    				console.log("Service connection lost, Reason : [" + reason + "]");
    				disconnect();
    			});
    			onSave();
    		},
    		onerror : onerror
    	};

    	var peerAgentFindCallback = {
    		onpeeragentfound : function(peerAgent) {
    			try {
    				if (peerAgent.appName == ProviderAppName) {
    					SAAgent.setServiceConnectionListener(agentCallback);
    					SAAgent.requestServiceConnection(peerAgent);
    				} else {
    					alert("Not expected app!! : " + peerAgent.appName);
    				}
    			} catch(err) {
    				console.log("exception [" + err.name + "] msg[" + err.message + "]");
    			}
    		},
    		onerror : onerror
    	}

    	function onsuccess(agents) {
    		try {
    			if (agents.length > 0) {
    				SAAgent = agents[0];
    				
    				SAAgent.setPeerAgentFindListener(peerAgentFindCallback);
    				SAAgent.findPeerAgents();
    				closeConn = false;
    				lock=false;
    			} else {
    				alert("Not found SAAgent!!");
    			}
    		} catch(err) {
    			console.log("exception [" + err.name + "] msg[" + err.message + "]");
    		}
    	}
    	
    	function buttonConnect(){
    		if (SASocket) {
    			alert('Already connected!');
    	        return false;
    	    }else{
    	    	Connect();
    	    }
    	}
    	
    	/*
    	function autConnect(){
    		if (SASocket) {   			
    		}else{
    			Connect();
    		}
    	}
    	*/

    	function Connect() {		
    		//alert('onConnected!'); 
    		/*
    		if (SASocket) {
    			alert('Already connected!');
    	        return false;
    	    }
    	    */
    		try {
    			webapis.sa.requestSAAgent(onsuccess, function (err) {
    				lock=false;
    				console.log("err [" + err.name + "] msg[" + err.message + "]");
    			});
    		} catch(err) {
    			alert('Can not Connected!');
    			console.log("exception [" + err.name + "] msg[" + err.message + "]");
    		}
    	}

    	function onDisconnect() {
    		try {
    			if (SASocket != null) {
    				SASocket.close();
    				SASocket = null;
    				closeConn = true;
    				createHTML("closeConnection");
    			}
    		} catch(err) {
    			console.log("exception [" + err.name + "] msg[" + err.message + "]");
    		}
    	}

    	function onreceive(channelId, data) {
    		//createHTML(data);   		
    	}
    	
    	function makeEnd(){
        	console.log('save');
        	var currentDate = new Date();
       	
        	var route = {
                    ax: 'xxx',
                };
        	
        	routes.add(route);
        }
    	
    	
    	function IntervalSave(){
    		var routeList = routes.getAll(true),
    		    element;
    		var count = 0;
    		while(eaoch >= 0 && count < 20 ){
    			console.log('eaoch:' + eaoch);
    			try{                  		
                    element = routeList[eaoch];                         
                    console.log('id:' + element.id);
                    console.log('ax:' + element.ax);
                    
                    result.innerHTML = show_temp + "<br> : 進度" + (Math.ceil(((routeList.length-eaoch)/routeList.length)*100)) + "%";
                     
                    if( element.ax === 'xxxx'){
                        console.log('Send SASocket SAVE!');
                        SASocket.sendData(CHANNELID, 'newSave');
                        SASocket.sendData(CHANNELID,  'id,datetime,x,y,z \r\n');
                    }else{
                    	console.log('data');
                    	SASocket.sendData(CHANNELID, element.ax);
                    }  
            	}catch(err){
            		console.log("exception [" + err.name + "] msg[" + err.message + "]");             		
            	}           	
            	eaoch--;
            	count++;
    		} 
    	}

    	function onSave() {
    		try {  			
    			SASocket.setDataReceiveListener(onreceive);

    			var routeListt = routes.getAll(true),
                    lenn = routeListt.length;	                   			
    			//alert('Data Size: ' + lenn);			
    			
    			
    			show_temp = result.innerHTML;
			    	    
    			if( lenn !== 0){
    				eaoch = lenn-1;
    				var x =  5000;
            	    var hnd = window.setInterval(function () {
            	        //if check() return true, 
            	        //stop timer and execute proc()
            	    	console.log('Interval');
            	    	if(eaoch<0){
            	    		createHTML("Save Finish");
            	    		onDisconnect();
            	    		window.clearInterval(hnd);
            	    		alert('儲存成功!');
            				console.log("save");           				
                            idb.removeAll();                
                            routes.clean();
                                                      
                            //ok_button.style.disply = "block";
                            tau.changePage('#main');
                            //onPageShow();           	    		
            	    	}else if (SASocket != null) { 
            	            IntervalSave();
            	        }
            	    }, x);            	    
    			}else{
    				alert('Not have any Data!');
    				onDisconnect();
    				tau.changePage('#main');
    			}	
    		} catch(err) {
    			console.log("exception [" + err.name + "] msg[" + err.message + "]");
    			alert('Not connected!');
    		}
    	}
    	
    	function onPageShow(){
    		console.log("chack 1"); 
    		Connect();
    		result.innerHTML="";
    		temp = "資料儲存中，請稍等";
    		createHTML(temp);
    		console.log("chack 2");
    		//result.innerHTML = "資料儲存中，請稍等";
    		//onSave();
    		//onDisconnect();
    		
    		
    		/*
    		var sizeList = routes.getDataSize();
    		var len = sizeList.length;
    		temp = '<br>Runs: ' + len + '<br>';	
    		var size;
    		var k;
    		
    		for(k = 0; k < len; k++){
    			size = sizeList[k];
    			temp += '<br>Run ' + k + ': ' + size.size + ' recrods</br>';
    		} 
    		createHTML(temp);
    		*/
    		//result.innerHTML = temp;
    		//tau.changePage('#main');
    		
    	}
    	
    	function bindEvents() {
    		console.log('Store bindEvent');
            
    		page.addEventListener('pageshow', onPageShow);
            //connButton.addEventListener('click', buttonConnect);
            //saveButton.addEventListener('click', onSave);
            //deconnButton.addEventListener('click', onDisconnect);  
         }
    	
    	function init() {
    		    		 
    		console.log('Store init');
    		page = document.getElementById('store');
    		///ok_button =document.getElementById('okbtn');
    		//ok_button.style.disply = "none";
    		
    		//connButton = page.querySelector('.connect');
    		//saveButton = page.querySelector('.save');
    		//deconnButton = page.querySelector('.deconnect');
    		result = document.getElementById('resultBoard');
    		bindEvents()
    	} 
    	
    	return {
            init: init
        };      
    }
});