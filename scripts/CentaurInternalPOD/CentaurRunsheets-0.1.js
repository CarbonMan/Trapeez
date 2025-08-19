InternalPOD_Runsheets = class{
  constructor(pluginInstance) {
    console.log('InternalPOD_Runsheets instantiated');
    // Store reference to the plugin instance so we can access it later. Can't store a reference
    // See pluginContainer.instances
    this.pluginInstanceName = pluginInstance.name;
    if (location.href.endsWith('index.html')){
      barcode.on('scan', (ev)=>{
          const action = sessionStorage.getItem('action');
          console.log('InternalPOD - Scan event trapped');
          if (action && action != 'CENTAUR_RUNSHEETS'){
            return;
          }
          // Change the destination to frame.html
          ev.data.target = 'frame.html';
      });
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
