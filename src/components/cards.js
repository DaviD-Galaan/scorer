import React from "react";
import Modal from "../tools/modal";

export default function Cards({http, cardsState, setCardsState, refrechGame}) {
    
    const close = () => {
        setCardsState({
            opened: false,
            game: null
          });
        refrechGame();  
    }
    const setCards = (playerId, card) => {
        console.log(cardsState.game);
        if(!cardsState.game.cards[playerId])
            cardsState.game.cards[playerId] = [];
        cardsState.game.cards[playerId].push(card);
        http.put(http.API + "game/" + cardsState.game.id + "/details", cardsState.game.getDetails()); 
        close();
    }

    const renderPlayerCard = (playerName, playerId) => (
        <div className="player-card-row">
            <div className="player-name-card">{playerName}</div>
            <div className="card-buttons">
                <button
                    className="card-button yellow-card"
                    onClick={() => setCards(playerId, 'Y')}
                    title="Yellow Card"
                >
                    <div className="card-icon yellow"></div>
                </button>
                <button
                    className="card-button red-card"
                    onClick={() => setCards(playerId, 'R')}
                    title="Red Card"
                >
                    <div className="card-icon red"></div>
                </button>
            </div>
        </div>
    );

    return (
        <>
        {cardsState.game && (
            <Modal
                id="cardsBox"
                title={http.dico["CARDS"]}
                className="cards-modal-container"
                opened={cardsState.opened}
            >
                <div className="cards-content">
                    {renderPlayerCard(cardsState.game.playerA, cardsState.game.playerA_ID)}

                    {cardsState.game.type === "D" &&
                        renderPlayerCard(cardsState.game.playerB, cardsState.game.playerB_ID)
                    }

                    <div className="divider"></div>

                    {renderPlayerCard(cardsState.game.playerX, cardsState.game.playerX_ID)}

                    {cardsState.game.type === "D" &&
                        renderPlayerCard(cardsState.game.playerY, cardsState.game.playerY_ID)
                    }
                </div>

                <button className="close-cards-btn" onClick={close}>
                    {http.dico["CLOSE"] || "Close"}
                </button>
            </Modal>
        )}
        </>
    )
}
