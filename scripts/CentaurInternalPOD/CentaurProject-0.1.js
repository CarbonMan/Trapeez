function CentaurProject(){
  document.addEventListener('LOAD_PLUGIN_ACTIONS', function (ev) {
    // Attach a POD action onto the actions combobox in the configuration page
    ev.detail.actions.push({
      name: "POD",
      value: "DROP"
    });
  });
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
        <label>Username</label>
        <input type="text" class="instanceForm" id="centaurUsername" placeholder="user name" value="${instance.centaurUsername || ''}">
      </div><div class="field">
        <label>Password</label>
        <input type="text" class="instanceForm" id="centaurPassword" placeholder="password" value="${instance.centaurPassword || ''}">
      </div><div class="field">
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
      instance.centaurUsername = $("#centaurUsername").val();
      instance.centaurPassword = $("#centaurPassword").val();
  };
  
};


document.addEventListener('CENTAUR_POD_READY', function (e) {
  console.log('Centaur project added');
  e.detail.project = new CentaurProject();
}, false);
