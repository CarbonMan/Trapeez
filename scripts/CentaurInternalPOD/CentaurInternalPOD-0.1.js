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
  this.options = function(div, name){
    let plugin = $T.pluginManagement.getPluginByName('Centaur_I_POD', name);
  };
};

$T.plugins['Centaur_I_POD'] = new InternalPOD();
