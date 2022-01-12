var x2;
/**
 * This is the class for interacting with x2 servers
 * It is global so that actions like authentication are shared.
 */
class X2{
    constructor(){
        this.x2State = {uuid:''};
    }
}

setTimeout(()=>{
    x2 = new X2();
},0);