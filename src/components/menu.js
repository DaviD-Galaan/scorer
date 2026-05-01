import React, { useState }  from "react";
import Modal                from "../tools/modal";
import Timeout              from "../components/timeout";

export default function Scorer({http, game, updateGame, onClose}) {

    const [paramsState, setParamsState] = useState(false);
    const [timeoutState, setTimeoutState] = useState({
        opened: false,
        time: 0,
        game: null
      });

    const changeDirection = () => {
        game.direction = (game.direction == "rtl") ? "ltr" : "rtl";
        updateGame(Date.now());
    }
    const reset = () => {
        if(!window.confirm("Are you sure you want to reset the game ?"))
            return;
        setParamsState(false);
        http.get(http.API + "game/" + game.id + '/reset').then( data => {
            game.get(data.resp);
            updateGame(Date.now());
        });
    }
    const refresh = () => {
        http.get(http.API + "game/" + game.id + '/manage').then( data => {
            game.get(data.resp);
            setParamsState(false);
            updateGame(Date.now());
        });
    }
    const close = () => {
        game.get({});
        updateGame(Date.now());
    }
    const openTimeout = () => {
        setTimeoutState({
            opened: true,
            time: 0,
            game: game
        });

        console.log("✅ setTimeoutState called successfully");
    }

    return(
        <>
        <nav className="menu">
            <ul className="menu-list">
                <li className="menu-item" onClick={changeDirection}>
                    <img src="https://dev.tttm.co.il/img/reverse.png" alt="Change Side" />
                    <span className="menu-item-text">{http.dico["CHANGE_SIDE"]}</span>
                </li>
                <li className="menu-item" onClick={openTimeout}>
                    <img src="https://dev.tttm.co.il/img/timeout.png" alt="Timeout" />
                    <span className="menu-item-text">{http.dico["TIMES"]}</span>
                </li>
                <li className="menu-item">
                    <img src="https://dev.tttm.co.il/img/cards.png" alt="Cards" />
                    <span className="menu-item-text">{http.dico["CARDS"]}</span>
                </li>
                <li className="menu-item" onClick={() => {setParamsState(true)}}>
                    <img src="https://dev.tttm.co.il/img/parameters.png" alt="Parameters" />
                    <span className="menu-item-text">{http.dico["PARAMS"]}</span>
                </li>
                <li className="menu-item" onClick={onClose ?? close}>
                    <img src="https://dev.tttm.co.il/img/close.jpg" alt="Close" />
                    <span className="menu-item-text">{http.dico["CLOSE"]}</span>
                </li>
            </ul>
        </nav>

        {paramsState &&
            <Modal
                id="paramsBox"
                title={http.dico["PARAMS"]}
                className="timeout"
                opened={paramsState}
            >
                <div className="game-controls">
                    <button className="btn btn-danger btn-large" onClick={reset}>
                        {http.dico["RESET"]}
                    </button>

                    <button className="btn btn-primary btn-large" onClick={refresh}>
                        {http.dico["SYNCHRONIZE"]}
                    </button>

                    <button className="btn btn-primary btn-large" onClick={() => {setParamsState(false)}}>
                        {http.dico["CLOSE"]}
                    </button>
                </div>
            </Modal>
        }
        <Timeout
            http={http}
            timeoutState={timeoutState}
            setTimeoutState={setTimeoutState}
        />
        </>
        
    )
}