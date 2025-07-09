F3.prototype.login = function () {
  return new Promise((resolve, reject) => {
    const me = this;

    if (me.uuid) {
      return resolve(me.uuid);           // already authenticated
    }
    if (!this.username || !this.password) {
      return reject('No credentials');
    }

    // --- Build JSON payload ------------------------------------------------
    const payload = {
      username: this.username,
      password: this.password
    };

    // --- Configure the advanced-http plugin --------------------------------
    cordova.plugin.http.setDataSerializer('json');       // use JSON serializer
    const headers = { 
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    };

    // --- Fire the POST -----------------------------------------------------
    cordova.plugin.http.post(
      `${me.url}/device/login`,  // changed endpoint to match FastAPI
      payload,                   // request body as JSON
      headers,
      (resp) => {               // success callback
        try {
          const data = JSON.parse(resp.data);
          
          // Check for error in response
          if (data.error) {
            return reject(data.error);
          }

          // Get session ID from response headers or body
          const sessionId = resp.headers['Authorization'] || resp.headers['authorization'] || data.session_id;
          
          if (sessionId) {
            me.uuid = sessionId;
            me.$div && $('#sessionStatus').text('Connected');
            return resolve(sessionId);
          }

          me.$div && $('#sessionStatus').text('Login failed');
          reject('Invalid login');
        } catch (err) {
          reject(`Parser error: ${err.message}`);
        }
      },
      (err) => {               // error callback
        console.log('Error during login', err);
        reject(err.error || err);
      }
    );
  });
};
