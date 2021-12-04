console.log("Centaur internal POD loaded");
function InternalPOD(){
  if (typeof configuration != "undefined"){
    // In the Config.html page
    this.setup = new InternalPOD.prototype.Setup();
  }
  configuration.plugins['Centaur_I_POD'] = this;
}

InternalPOD.prototype.Setup = function(){
};

var internalPOD = new InternalPOD();
