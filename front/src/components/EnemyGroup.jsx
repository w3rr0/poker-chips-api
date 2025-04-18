import React from "react";
import styled from "styled-components";
import Player from "./Player.jsx";

const EnemyGroup = ({ players }) => {
    return (
        <StyledWrapper>
                {players.length > 0 ? (
                    players.map(player => (
                        <div key={player.id}>
                            <Player player={player} />
                        </div>
                    ))
                ) : (
                    <p>No players yet.</p>
                )}
        </StyledWrapper>
    )
}

const StyledWrapper = styled.div`
    display: flex;
    flex-direction: row;
    flex-wrap: wrap;
    justify-content: center;
    align-items: center;
    align-content: flex-start;
    position: relative;
    z-index: 1;
    margin-top: 30px;
    padding: 0 20px;
    gap: 20px 50px;
    @media (max-width: 600px) {
        gap: 15px 30px;
    }
    @media (max-width: 500px) {
        gap: 10px 15px;
        margin-top: 20px;
    }
`;

export default EnemyGroup