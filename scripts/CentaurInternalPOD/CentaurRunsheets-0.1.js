InternalPOD.prototype.Runsheets = function(opts){
  const action = sessionStorage.getItem('action');
  scanner.on('scan', (ev)=>{
      console.log('InternalPOD - Scan event trapped');
      if (action && action != 'CENTAUR_RUNSHEETS'){
        return;
      }
    ev.data.target = 'frame.html';
  });
}
