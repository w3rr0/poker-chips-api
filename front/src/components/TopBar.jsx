import React from "react";
import styled from "styled-components";

const TopBar = ({ pin, players_amount, max_players }) => {
    return (
        <StyledWrapper>
            <div className="appName">
                <img src="/table.png" alt="logo" />
                <label>POKERCHIP$</label>
            </div>
            <div className="roomInfo">
                <label>PIN: {pin}</label>
                <label>PLAYERS: {players_amount}/{max_players}</label>
            </div>
        </StyledWrapper>
    )
}

const StyledWrapper = styled.div`
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    width: 100%;
    
    .appName {
        display: flex;
        align-items: center;
        font-size: 36px;
    }
    .roomInfo {
        display: flex;
        flex-direction: column;
        justify-content: center;
        text-align: right;
        gap: 15px;
        font-weight: bold;
        font-size: 20px;
    }
`

export default TopBar;