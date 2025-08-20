InternalPOD_Runsheets = class{
  constructor(pluginInstance) {
    console.log('InternalPOD_Runsheets instantiated');
    // Store reference to the plugin instance so we can access it later. Can't store a reference
    // See pluginContainer.instances
	this.x2 = null;
	const me = this;
    this.pluginId = pluginInstance.parent;
    this.pluginInstanceName = pluginInstance.name;
    if (location.href.endsWith('index.html')){
      barcode.on('scan', (ev)=>{
		  return new Promise((resolve, reject) => {
	          const action = sessionStorage.getItem('action');
	          console.log('InternalPOD - Scan event trapped');
	          if (!action || action != 'CENTAUR_RUNSHEETS'){
				  resolve();
	            return;
	          }
	          // Change the destination to frame.html
			  ev.target = 'frame.html';
	          instance = $T.plugins[this.pluginId].instances[this.pluginInstanceName];
			  if (!me.x2){
		          me.x2 = new X2({
					  username: instance.centaurUsername,
					  password: instance.centaurPassword,
					  host: instance.centaurHost,
					  script: instance.centaurScript,
				  });
			  }
	          me.x2.login()
	          .then((uuid) => {
	            const url  = `${instance.centaurHost}/${instance.centaurScript}`;
	            // --- Build XML payload --------------------------------------------------
	            const xml = `<x class="tiRnHeader.getRunsheet"></x>`;
				const encodedXml = encodeURIComponent(xml);
				const urlWithParams = `${url}?xml=${encodedXml}`;
	            // --- Configure the advanced-http plugin ---------------------------------
	            cordova.plugin.http.setDataSerializer('utf8');       // raw UTF-8 string
	            const headers = { 'Content-Type': 'application/xml' };
	        
	            // --- Fire the POST ------------------------------------------------------
	            cordova.plugin.http.get(
	              urlWithParams,
					{},            
	              headers,
	              (resp) => {     // success callback
	                console.dir(resp);
	              },
				  (err) => {
	                console.error(err);
	              }
	            );
	          })
	          .catch((e) => {
	            console.error(e);
				  reject();
	          });
	      });
	  });
    }else if (location.href.endsWith('frame.html')){
    }
  }
};
let runsheets = null;
document.addEventListener('PLUGIN_LOADED', function (ev) {
  // From src\www\js\scriptManagement.js
  if (ev.detail.instance.parent == 'Centaur_I_POD'){
    //const internalPOD = $T.getInstanceByName({name: 'InternalPOD'});
    runsheets = new InternalPOD_Runsheets(ev.detail.instance);
    ev.detail.instance.runsheets = runsheets;
    console.log('internalPOD.Runsheets plugin instantiated');
  }
});
