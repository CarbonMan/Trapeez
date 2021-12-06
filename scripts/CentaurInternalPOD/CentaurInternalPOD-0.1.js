console.log("Centaur internal POD loaded");
function InternalPOD(){
  //let configStr = localStorage.getItem('Plugin_Centaur_I_POD');
  //if (!configStr) configStr = '[]';
  //this.config = JSON.parse(configStr);
  if ($T.configuration){
    // In the Config.html page
    this.config = new InternalPOD.prototype.Config();
  }
}

InternalPOD.prototype.Config = function(){
  let currentPlugin;
  this.options = function(div, name){
    currentPlugin = $T.pluginManagement.getPluginByName('Centaur_I_POD', name);
    $("#pluginLocalName").val(currentPlugin.name);
    let settings = `<div class="field">
        <label>Server URL</label>
        <input type="text" id="centaurURL" placeholder="Centaur url" value="${currentPlugin.centaurURL || ''}">
      </div>`;
    $("#pluginSettings").html(settings);
  };
  this.saveOptions = function(div){
    if (currentPlugin){
      currentPlugin.name = $("#pluginLocalName").val();
      currentPlugin.centaurURL = $("#centaurURL").val();
      $T.pluginManagement.savePlugins();
    }
  };
};

$T.plugins['Centaur_I_POD'] = new InternalPOD();
