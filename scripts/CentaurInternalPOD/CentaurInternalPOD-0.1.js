/**
* Downloaded by the Trapeez app
* Creates a plugin for communicating PODs to a Centaur
* server
*/
console.log("Centaur internal POD loaded");
function InternalPOD(){
  this.instances = {};

  /**
  * Create an instance of this plugin
  */
  this.createInstance = function(opts){
    // If the instance has been saved, then it will exist
    this.instances[opts.name] = instance = Object.assign({
      name: opts.name,
      centaurUsername: '',
      centaurPassword: '',
      centaurHost: '',
      centaurScript: ''
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
    this.configurationUI = new InternalPOD.prototype.Config();
  }
  
  if (typeof signatureCapture != 'undefined'){
    // index.js - Background transfers
    signatureCapture.on('storeSignature', (ev)=>{
      // Tell the app that the signature should be transferred 
      ev.transfer = true;
    });
  }
  let ev = new CustomEvent('CENTAUR_POD_READY', {detail: this});
  document.dispatchEvent(ev);
}

/**
* Background transfers
*/
InternalPOD.prototype.Transfers = function(opts){
  let scanner = opts.hostController;
  let instance = opts.instance;
  //let plugin = opts.plugin;
  // CentaurPODtransfers is in centaurTransfers-0.1.js
  let comms = new CentaurPODtransfers({
    username: instance.centaurUsername,
    password: instance.centaurPassword,
    host: instance.centaurHost,
    script: instance.centaurScript
  });
  
  /**
  * Fired from the app for background transfers
  */
  scanner.on('signatureTransfer', (ev)=>{
    console.log("Centaur POD processing");
    console.dir(ev);
    ev.inProgress = true;
    ev.data.done = ()=>{
      scanner.fire('TRANSFER_COMPLETE', {
        fileEntry: ev.fileEntry
      });
    };
    ev.data.error = (err)=>{
      scanner.fire('TRANSFER_ERROR', {
        message: err
      });
    };
    comms.add(ev.data);
  });
};

/**
* Config is used only in the configuration page
* for editing settings.
*/
InternalPOD.prototype.Config = function(){
  /**
  * Create the interface in the app for modifying 
  * the Centaur POD options
  */
  this.options = function($div, instance){
    let settings = `<div class="field">
        <label>Username</label>
        <input type="text" class="instanceForm" id="centaurUsername" placeholder="user name" value="${instance.centaurUsername || ''}">
      </div><div class="field">
        <label>Password</label>
        <input type="text" class="instanceForm" id="centaurPassword" placeholder="password" value="${instance.centaurPassword || ''}">
      </div><div class="field">
        <label>Server host</label>
        <input type="text" class="instanceForm" id="centaurHost" placeholder="host" value="${instance.centaurHost || ''}">
      </div><div class="field">
        <label>Server script</label>
        <input type="text" class="instanceForm" id="centaurScript" placeholder="script" value="${instance.centaurScript || ''}">
      </div>`;
    $div.html(settings);
  };

  /**
  * Called by the app when the user clicks save
  */
  this.saveOptions = function(instance){
      instance.centaurHost = $("#centaurHost").val();
      instance.centaurScript = $("#centaurScript").val();
      instance.centaurUsername = $("#centaurUsername").val();
      instance.centaurPassword = $("#centaurPassword").val();
  };
  
};

$T.pluginManagement.register('Centaur_I_POD', new InternalPOD());
