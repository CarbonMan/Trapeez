// var x2;
/**
 * This is the class for interacting with x2 servers
 * It is global so that actions like authentication are shared.
 */
class X2{
    constructor(opts){
        this.x2State = {uuid:''};
        this.username = opts.username;
        this.password = opts.password;
        this.host = opts.host;
        this.script = opts.script;
        this.url = `${opts.host}/common/foxisapi.dll/${script}.x2`;
    }
}

// setTimeout(()=>{
//     console.log('Initializing x2');1
//     //x2 = new X2();
// },0);