import React from "react";
import styled from "styled-components";

const EnemyGroup = ({ players }) => {
    return (
        <StyledWrapper>
            <div>
                {players}
            </div>
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