function RouteOptixProject(){
  document.addEventListener('LOAD_PLUGIN_ACTIONS', function (ev) {
    // Attach a POD action onto the actions combobox in the configuration page
    // ev.detail.actions.push({
    //   name: "POD",
    //   value: "DROP"
    // });
  });
}

/**
* Config is used only in the configuration page
* for editing settings.
*/
RouteOptixPOD.prototype.Config = function(){
  /**
  * Create the interface in the app for modifying 
  * the Centaur POD options
  */
  this.options = function($div, instance){
    let settings = `<div class="field">
        <label>Username</label>
        <input type="text" class="instanceForm" id="routeOptixUsername" placeholder="user name" value="${instance.routeOptixUsername || ''}">
      </div><div class="field">
        <label>Password</label>
        <input type="text" class="instanceForm" id="routeOptixPassword" placeholder="password" value="${instance.routeOptixPassword || ''}">
      </div><div class="field">
        <label>Server host</label>
        <input type="text" class="instanceForm" id="routeOptixHost" placeholder="host" value="${instance.routeOptixHost || ''}">
      </div>`;
    $div.html(settings);
  };

  /**
  * Called by the app when the user clicks save
  */
  this.saveOptions = function(instance){
      instance.routeOptixHost = $("#routeOptixHost").val();
      instance.routeOptixUsername = $("#routeOptixUsername").val();
      instance.routeOptixPassword = $("#routeOptixPassword").val();
  };
  
};


document.addEventListener('ROUTE_OPTIX_READY', function (e) {
  console.log('Centaur project added');
  e.detail.project = new RouteOptixProject();
}, false);
