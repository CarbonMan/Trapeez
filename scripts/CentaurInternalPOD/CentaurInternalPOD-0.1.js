/**
* Downloaded by the Trapeez app
* Creates a plugin for communicating PODs to a Centaur
* server
*/
console.log("Centaur internal POD loaded");
function InternalPOD(){
  /**
  * Create an instance of this plugin
  */
  this.createInstance = function(opts){
    return {
      name: opts.name,
      centaurHost: '',
      centaurScript: ''
    };
  };
  if (location.href.indexOf("config.html") > -1){
    // Runnign in the Configuration page within the app
    this.configurationUI = new InternalPOD.prototype.Config();
  }
  if (typeof scanner != 'undefined'){
    // index.js - Background transfers
    scanner.on('signatureTransfer', (ev)=>{
      console.log("Centaur POD processing");
      console.dir(ev);
    });
    // Start processing PODs
    scanner.synchronize();
  }
  if (typeof signatureCapture != 'undefined'){
    // index.js - Background transfers
    signatureCapture.on('storeSignature', (ev)=>{
      // Tell the app that the signature should be transferred 
      ev.transfer = true;
    });
  }
}

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
      $T.pluginManagement.config.savePlugins();
  };
  
};

$T.pluginManagement.register('Centaur_I_POD', new InternalPOD());
