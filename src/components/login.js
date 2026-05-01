import React, { useState } from "react";

export default function Login({http, initGame, matchId}) {
    
    /*const [credentials, setCredentials] = useState( {
        gameNo: http.dico["NO"], 
        password: '', 
    } );*/
    
    const [credentials, setCredentials] = useState( {
        gameNo: matchId ?? '',
        password: ''
    } );
    const [loginError, setLoginError] = useState( '' );

    const handleSubmit = async e => {
        e.preventDefault();
        const data = await http .post(http.API + 'game/login', credentials);
        console.log(data);
        if(!data) {
            setLoginError("Connection failed");
            return;
        }
        setLoginError('');
        initGame(data.resp);
    }
    
    return(
        <div className="login">
            <div className="login-container fade-in">
                <img src="/img/logo.png" alt="TTTM Logo" className="login-logo" />

                <div className="login-form">
                    <div className="form-group">
                        <label className="form-label">{http.dico["MATCH"]}</label>
                        <input
                            type="text"
                            className="form-input"
                            value={credentials.gameNo}
                            placeholder="Enter match number"
                            onFocus={(e) => e.target.select()}
                            onChange={(e) => {
                                credentials.gameNo = e.target.value;
                                setCredentials({...credentials});
                            }}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                    handleSubmit(e);
                                }
                            }}
                        />
                    </div>

                    <div className="form-group">
                        <label className="form-label">{http.dico["PASSWORD"]}</label>
                        <input
                            type="password"
                            className="form-input"
                            value={credentials.password}
                            placeholder="Enter password"
                            onChange={(e) => {
                                credentials.password = e.target.value;
                                setCredentials({...credentials});
                            }}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                    handleSubmit(e);
                                }
                            }}
                        />
                    </div>

                    <button
                        type="button"
                        className="login-button"
                        onClick={handleSubmit}
                    >
                        {http.dico["CONNEXION"]}
                    </button>
                </div>

                {loginError &&
                    <div className="error-message">
                        {loginError}
                    </div>
                }
            </div>
        </div>
    )
}