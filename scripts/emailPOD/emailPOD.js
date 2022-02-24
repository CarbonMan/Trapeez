/**
* Downloaded by the Trapeez app
* Creates a plugin for communicating PODs to a Titan
* server
*/
console.log("email POD loaded");
function EmailPOD(){
  this.instances = {};

  /**
  * Create an instance of this plugin
  */
  this.createInstance = function(opts){
    // If the instance has been saved, then it will exist
    this.instances[opts.name] = instance = Object.assign({
      name: opts.name,
      emailAddress: ''
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
    this.configurationUI = new this.Config();
  }
  
  if (typeof signatureCapture != 'undefined'){
    // index.js - Background transfers
    signatureCapture.on('storeSignature', (ev)=>{
      // Tell the app that the signature should be transferred 
      ev.transfer = true;
    });
  }
  let ev = new CustomEvent('EMAILPOD_READY', {detail: this});
  document.dispatchEvent(ev);
}

/**
* Background transfers
*/
EmailPOD.prototype.Transfers = function(opts){
  let scanner = opts.hostController;
  let instance = opts.instance;
  let comms = new EmailTransfers({
    emailAddress: instance.emailAddress
  });
  
  /**
  * Fired from the app for background transfers
  */
  scanner.on('signatureTransfer', (ev)=>{
    console.log("Email POD processing");
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
EmailPOD.prototype.Config = function(){
  /**
  * Create the interface in the app for modifying 
  * the Titan TMS options
  */
  this.options = function($div, instance){
    let settings = `<div class="field">
        <label>Email address</label>
        <input type="text" class="instanceForm" id="emailAddress" placeholder="email address" value="${instance.emailAddress || ''}">
      </div>`;
    $div.html(settings);
  };

  /**
  * Called by the app when the user clicks save
  * @argument {*} instance - Plugin instance
  */
  this.saveOptions = function(instance){
      instance.emailAddress = $("#emailAddress").val();
  };
  
};

$T.pluginManagement.register('EmailPOD', new EmailPOD());
