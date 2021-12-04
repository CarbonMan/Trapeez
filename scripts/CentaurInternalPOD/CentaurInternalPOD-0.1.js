console.log("Centaur internal POD loaded");
function InternalPOD(){
  let configStr = localStorage.getItem('Plugin_Centaur_I_POD');
  this.config = JSON.parse(configStr);
  if (typeof configuration != "undefined"){
    // In the Config.html page
    this.setup = new InternalPOD.prototype.Setup();
  }
}

InternalPOD.prototype.Setup = function(){
  this.draw = function(div){
    pluginLocalName
  };
};

$T.plugins['Centaur_I_POD'] = new InternalPOD();
