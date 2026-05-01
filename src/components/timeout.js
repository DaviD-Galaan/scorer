import React, { useState } from "react";
import Modal from "../tools/modal";

let timeoutDuration = 0;
let timerId = 0;

export default function Timeout({http, timeoutState, setTimeoutState}) {
    
    const close = () => {
        setTimeoutState({
            opened: false,
            time: 0,
            game: null
          });
        clearTimeout(timerId);
    }

    const startTimeout = (e) => {
        const player = e.target.attributes.getNamedItem('player').value;
        
        if(player == "training") {
            timeoutDuration = 120;
        } else if(player == "interSet") {
            timeoutDuration = 60;
        } else {
            timeoutDuration = 60;
            timeoutState.game.events.push("timeout." + player);
            http.put(http.API + "game/" + timeoutState.game.id + "/details", timeoutState.game.getDetails());    
        }
        
        setTimeoutState({
            opened: true,
            time: timeoutDuration,
            game: timeoutState.game
          });
          timerId = setInterval(() => {
            timeoutState.time = --timeoutDuration;
            if(timeoutDuration == 0) {
                close();
                return;
            }
            setTimeoutState({...timeoutState});
          }, 1000);
    }
    
    return (
        <>
        {timeoutState.game && (
            <Modal
                id="timeoutBox"
                title={http.dico["TIMES"]}
                className="timeout-container"
                opened={timeoutState.opened}
            >
                {timeoutState.time === 0 && (
                    <div className="server-options">
                        <button
                            className={`btn btn-primary btn-large ${timeoutState.game.events.includes("timeout.AB") ? 'btn-disabled' : ''}`}
                            onClick={startTimeout}
                            player="AB"
                            disabled={timeoutState.game.events.includes("timeout.AB")}
                        >
                            {timeoutState.game.playerA}
                            {timeoutState.game.type === "D" && (
                                <>
                                    <br />
                                    {timeoutState.game.playerB}
                                </>
                            )}
                        </button>

                        <button
                            className={`btn btn-primary btn-large ${timeoutState.game.events.includes("timeout.XY") ? 'btn-disabled' : ''}`}
                            onClick={startTimeout}
                            player="XY"
                            disabled={timeoutState.game.events.includes("timeout.XY")}
                        >
                            {timeoutState.game.playerX}
                            {timeoutState.game.type === "D" && (
                                <>
                                    <br />
                                    {timeoutState.game.playerY}
                                </>
                            )}
                        </button>

                        <button
                            className="btn btn-success btn-large"
                            onClick={startTimeout}
                            player="training"
                        >
                            {http.dico["TRAINING"]}
                        </button>

                        <button
                            className="btn btn-success btn-large"
                            onClick={startTimeout}
                            player="interSet"
                        >
                            {http.dico["INTERSET"]}
                        </button>
                    </div>
                )}

                {timeoutState.time > 0 && (
                    <div className="time-display">
                        {timeoutState.time}
                    </div>
                )}

                <div className="game-controls">
                    <button className="btn btn-danger btn-large" onClick={close}>
                        {http.dico["CLOSE"]}
                    </button>
                </div>
            </Modal>
        )}
        </>
    )
}
