import React from "react";
import styled from "styled-components";

const TopBar = ({ pin, players_amount, max_players }) => {
    const renderPlayersIcons = () => {
        const icons = []

        for (let i = players_amount; i < max_players; i++) {
            icons.push(<img className="user-check" key={`occupied-${i}`} src="/checkbox-img/absent.png" alt="player present" />)
        }

        for (let i = 0; i < players_amount; i++) {
            icons.push(<img className="user-check" key={`occupied-${i}`} src="/checkbox-img/present.png" alt="player present" />);
        }

        return icons
    }

    return (
        <StyledWrapper>
            <div className="appName">
                <img className="logo" src="/pokerchips.png" alt="POKERCHIP$" />
            </div>
            <div className="roomInfo">
                <div className="pin-container" >
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
        @media (max-width: 600px) {
            font-size: 17px;
        }
        @media (max-width: 500px) {
            font-size: 15px;
        }
    }
    .boldText {
        font-weight: bolder;
    }
    
    .logo {
        width: 300px;
        @media (max-width: 600px) {
            width: 250px;
        }
        @media (max-width: 500px) {
            width: 200px;
        }
    }
    
    .user-check {
        width: 24px;
        height: 24px;
        @media (max-width: 600px) {
            width: 20px;
            height: 20px;
        }
        @media (max-width: 500px) {
            width: 16px;
            height: 16px;
        }
    }
    
    .pin-container {
        padding-bottom: 5px;
    }
`

export default TopBar;