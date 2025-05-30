import React  from 'react';
import styled from 'styled-components';
import EnemyGroup from "./EnemyGroup.jsx";
import PlayerView from "./PlayerView.jsx";
import OnBoard from "./OnBoard.jsx";

const Board = ({ players, playerId, handlePutToken, puttedAmount, yourPutted, handleCenterChange }) => {

    const { filteredPlayers, currentPlayer } = players.reduce(
        (acc, player) => {
            if (player.id === playerId) {
                acc.currentPlayer = player;
            } else {
                acc.filteredPlayers.push(player);
            }
            return acc;
        },
        { filteredPlayers: [], currentPlayer: null }
    );

    const amount = currentPlayer?.amount || 0;

    return (
        <StyledWrapper>
            <div className="container">
                <EnemyGroup players={filteredPlayers} />
                <OnBoard puttedAmount={puttedAmount} yourPutted={yourPutted} onCenterChange={handleCenterChange} />
                <PlayerView amount={amount} handlePutToken={handlePutToken} />
            </div>
        </StyledWrapper>
    );
}

const StyledWrapper = styled.div`
    height: calc(var(--vh, 1vh) * 100);
    display: flex;
    justify-content: center;
    align-items: center;
    width: 100%;
    overflow: hidden;

    .container {
        width: 100%;
        height: calc(100% - 20px);
        background-color: #8B4513;
        border-radius: 20px;
        position: relative;
        overflow: hidden;
        display: flex;
        flex-direction: column;
    }
    
    @media (max-width: 500px) {
        .container {
            height: 100%
        }
    }

    .container::before {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background-image: url('/wood-pattern.png');
        background-size: cover;
        border-radius: 20px;
        box-shadow: inset 0 0 20px rgba(0, 0, 0, 0.3);
    }

    .container::after {
        content: '';
        position: absolute;
        top: 10px;
        left: 10px;
        right: 10px;
        bottom: 10px;
        background-color: #006400;
        border-radius: 15px;
        box-shadow: inset 0 0 10px rgba(0, 0, 0, 0.4);
    }
`;

export default Board;
