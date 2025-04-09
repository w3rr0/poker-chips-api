import React from "react";
import styled from "styled-components";

const TopBar = ({ pin, players_amount, max_players }) => {
    const renderPlayersIcons = () => {
        const icons = []

        for (let i = players_amount; i < max_players; i++) {
            icons.push(<img key={`occupied-${i}`} src="/checkbox-img/absent.png" alt="player present" width="24px" height="24px"/>)
        }

        for (let i = 0; i < players_amount; i++) {
            icons.push(<img key={`occupied-${i}`} src="/checkbox-img/present.png" alt="player present" width="24px" height="24px"/>);
        }

        return icons
    }

    return (
        <StyledWrapper>
            <div className="appName">
                <img src="/pokerchips.png" alt="POKERCHIP$" width="300px" />
            </div>
            <div className="roomInfo">
                <div style={{ paddingBottom: "5px" }}>
                    <label>PIN: </label>
                    <label className="boldText">{pin}</label>
                </div>
                <div>
                    <label>PLAYERS: </label>
                    <label className="boldText">{players_amount}/{max_players}</label>
                </div>
                <div>
                    {renderPlayersIcons()}
                </div>
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
        margin-left: -25px;
    }
    .roomInfo {
        display: flex;
        flex-direction: column;
        justify-content: center;
        text-align: right;
        font-size: 18px;
        gap: 5px;
    }
    .boldText {
        font-weight: bolder;
    }
`

export default TopBar;