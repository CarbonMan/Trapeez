InternalPOD.prototype.Runsheets = class{
  constructor(){
    const action = sessionStorage.getItem('action');
    if (location.href == 'index.html'){
      scanner.on('scan', (ev)=>{
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
    runsheets = ev.detail.instance.Runsheets();
    console.log('internalPOD.Runsheets plugin instantiated');
  }
});
