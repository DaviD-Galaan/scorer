//import { resp } from '../constants/global';


export default class myhttp {
    
    async get(url, waiter = true) {
        this.url = url;
        this.method = 'GET';
        this.body = null;
        this.waiter = waiter;

        return this.myFetch();
    }

    async post(url,body) {
        this.url = url;
        // Don't stringify FormData - keep it as is
        this.body = (body instanceof FormData) ? body : JSON.stringify(body);
        this.isFormData = (body instanceof FormData);
        this.method = 'POST';
        this.waiter = true;

        return this.myFetch();
    }

    async delete(url) {
        this.url = url;
        this.method = 'DELETE';
        this.body = null;
        this.waiter = true;

        return this.myFetch();
    }

    async put(url,body) {
        this.url = url;
        this.body = JSON.stringify(body);
        this.method = 'PUT';
        this.waiter = true;

        return this.myFetch();
    }
    async download(url,fileName) {
        this.setWaiter(true);
        
        this.status = 0;
        this.message = '';
        this.httpError = null;
        //this.setErrorDetails(0,'');

        fetch(  url, {
            headers: this.headers(),
            credentials: 'include',
            mode: 'cors'
        })
        .then(resp => resp.blob())
        .then(blob => {
          const url = window.URL.createObjectURL(blob);
          const a = document.createElement("a");
          a.style.display = "none";
          a.href = url;
          a.download = fileName;
          document.body.appendChild(a);
          a.click();
          window.URL.revokeObjectURL(url);
          this.setWaiter(false);
        })
        .catch(() => {
            this.setWaiter(false);
            console.log("Download Fail !");
            //this.setErrorDetails("Download Error","Download Fail !");
        }); 
    }

    myFetch() {
        this.status = 0;
        this.message = '';
        this.httpError = null;
        //this.setErrorDetails(0,'');
        //this.setError(false);

        const data = this.getObject();
        if(data.object == "Networks" || /*data.object == "Scenarios" ||*/ data.object == "Clients" )
            return Promise.resolve( this.offlineFetch() );

        //if(this.waiter)
        //    this.setWaiter(true);

        return fetch(this.url, {
            method: this.method,
            headers: this.headers(),
            body: this.body,
            // credentials: 'include',
            mode: 'cors'
          })
          .then(r => {
            this.status = r.status;
            if(r.status==200 || r.status==202) {
                return r.json();
            }
            r.json().then(data => {
                console.log(data);
                //this.setErrorDetails(r.status,data.message);
            });
            throw new Error(r.status);
          })
          .then(res => {
            //this.setWaiter(false);
            this.isFormData = false; // Reset flag after request
            return res;
          })
          .catch(err => {
            //this.setWaiter(false);
            this.isFormData = false; // Reset flag after request
            if(!this.status)
                return;
            if(this.status == 200)
                return;
            //this.setErrorDetails(this.status,err.message);
            if(err.message == "401") {
                if(this.setUser)
                    this.setUser({});
                localStorage.removeItem('user');
            } else {
                if(this.setError)
                    this.setError(true);
            }
            return this.httpError;
          });
    }
    offlineFetch() {
        /*
        const data = this.getObject();
        if(data.object === "Login") {
            return resp.login;
        }
        if(this.method === "GET") {
            if(data.id)
                return resp[data.object][data.id];
            return resp[data.object];
        }
        if(this.method === "POST") {
            resp[data.object].push(JSON.parse(this.body));
            return null;
        }
        if(this.method === "PUT") {
            resp[data.object][data.id] = JSON.parse(this.body);
            return null;
        }
          */  
    }
    headers() {
        const header = {};
        // Don't set Content-Type for FormData - browser will set it with boundary
        if (!this.isFormData) {
            header["Content-Type"] = 'application/json';
        }
        header["Accept"] = '*';
        header["Access-Control-Allow-Origin"] = '*';
        if(this.user && this.user.authenticationResult)
            //header["Authorization"] = "Bearer " + this.user.token;
            header["Authorization"] = "Bearer " + this.user.authenticationResult.accessToken;

        header["Authorization"] = "Bearer " + "test";

        return header;
    }
    getObject() {
        const data = this.url.replace(this.API,"").split('/');
        return {
            object: data[0],
            id: data[1]
        }
    }
}