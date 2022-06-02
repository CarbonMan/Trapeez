// var x2;
/**
 * This is the class for interacting with x2 servers
 * It is global so that actions like authentication are shared.
 */
class X2{
    constructor(opts){
        this.x2State = {uuid:''};
        this.username = opts.username.trim();
        this.password = opts.password.trim();
        this.host = opts.host.trim();
        this.script = opts.script.trim();
        this.url = `${this.host}/common/foxisapi.dll/${this.script}.x2`;
    }
}

// setTimeout(()=>{
//     console.log('Initializing x2');1
//     //x2 = new X2();
// },0);