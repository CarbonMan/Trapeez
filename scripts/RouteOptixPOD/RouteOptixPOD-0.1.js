/**
* Downloaded by the Trapeez app
* Creates a plugin for communicating PODs to a RouteOptix
* server
*/
console.log("RouteOptix POD loaded");
function RouteOptixPOD(){
  this.instances = {};

  /**
  * Create an instance of this plugin
  */
  this.createInstance = function(opts){
    // If the instance has been saved, then it will exist
    this.instances[opts.name] = instance = Object.assign({
      name: opts.name,
      routeOptixUsername: '',
      routeOptixPassword: '',
      routeOptixHost: ''
    }, this.instances[opts.name]);
    if (typeof scanner != 'undefined'){
      // index.js - Background transfers
      instance.transfers = new this.Transfers({
        hostController: scanner,
        instance: instance
      });
    }
    return instance;
  };
  
  if (typeof scanner != 'undefined'){
    // Start processing PODs
    setTimeout(()=>{
      scanner.synchronize();
    },0);
  }
  
  if (location.href.indexOf("config.html") > -1){
    // Running in the Configuration page within the app
    this.configurationUI = new RouteOptixPOD.prototype.Config();
  }
  
  // if (typeof signatureCapture != 'undefined'){
  //   // index.js - Background transfers
  //   signatureCapture.on('storeSignature', (ev)=>{
  //     // Tell the app that the signature should be transferred 
  //     ev.transfer = true;
  //   });
  // }
  let ev = new CustomEvent('ROUTEOPTIX_POD_READY', {detail: this});
  document.dispatchEvent(ev);
}

/**
* Background transfers
*/
RouteOptixPOD.prototype.Transfers = function(opts){
  let scanner = opts.hostController;
  let instance = opts.instance;
  
  let comms = new F3_PODtransfers({
    username: instance.routeOptixUsername,
    password: instance.routeOptixPassword,
    host: instance.routeOptixHost
  });
  
  /**
  * Fired from the app for background transfers
  */
  scanner.on('signatureTransfer', (ev)=>{
    let p = new Promise((resolve, reject)=>{
      const action = sessionStorage.getItem('action');
      if (action && action != 'RO_DROP'){
        resolve();
        return;
      }
      console.log("RouteOptix processing");
      console.dir(ev);
      ev.inProgress = true;
      ev.data.done = ()=>{
        scanner.fire('TRANSFER_COMPLETE', {
          fileEntry: ev.fileEntry
        });
        resolve();
      };
      ev.data.error = (err)=>{
        console.log('Error transferring signature', err);
        scanner.fire('TRANSFER_ERROR', {
          message: err
        });
        reject(err);
      };
      comms.add(ev.data);
    });
    ev.finished.push(p);
  });
};


$T.pluginManagement.register('RouteOptix_POD', new RouteOptixPOD());
