import React from "react";
import styled from "styled-components";

const EnemyGroup = ({ players }) => {
    return (
        <StyledWrapper>
                {players.length > 0 ? (
                    players.map(player => (
                        <div key={player.id}>
                            <span>{player.username}: ${player.amount}</span>
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
`;

export default EnemyGroup