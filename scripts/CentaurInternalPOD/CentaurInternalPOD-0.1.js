/**
* Downloaded by the Trapeez app
* Creates a plugin for communicating PODs to the Centaur
* server
*/
console.log("Centaur internal POD loaded");
function InternalPOD(){
  if (location.href.indexOf("config.html") > -1){
    // Runnign in the Configuration page within the app
    this.config = new InternalPOD.prototype.Config();
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
  this.options = function(div, name){
    let currentPlugin = $T.pluginManagement.getPluginByName('Centaur_I_POD', name);
    $("#pluginLocalName").val(currentPlugin.name);
    let settings = `<div class="field">
        <label>Server URL</label>
        <input type="text" id="centaurURL" placeholder="Centaur url" value="${currentPlugin.centaurURL || ''}">
      </div>`;
    $("#pluginSettings").html(settings);
  };

  /**
  * Called by the app when the user clicks save
  */
  this.saveOptions = function(instance){
      instance.name = $("#pluginLocalName").val();
      instance.centaurURL = $("#centaurURL").val();
      $T.pluginManagement.config.savePlugins();
  };
};

$T.register('Centaur_I_POD', new InternalPOD());
