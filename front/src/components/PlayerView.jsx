import styled from "styled-components";
import Chips from "./Chips.jsx";
import { useMediaQuery } from 'react-responsive';

const PlayerView = ({ amount, handlePutToken }) => {
    const isMobile = useMediaQuery({ maxWidth: 500 });

    return (
        <StyledWrapper>
            <div className="player-view">
                <div className="current-player">
                    <img className="player-icon" src="/gambler.png" alt="Your icon" height="80px" width="80px" style={{ paddingRight: "5px" }} />
                    <div className="player-info">
                        {!isMobile ? <label>You</label> : null}
                        <label>${amount}</label>
                    </div>
                </div>
                <Chips amount={amount} handlePutToken={handlePutToken} />
            </div>
        </StyledWrapper>
    );
}

const StyledWrapper = styled.div`
    display: flex;
    flex-direction: row-reverse;
    justify-content: flex-end;
    position: relative;
    z-index: 1;
    margin-top: auto;
    padding: 30px;
    width: calc(100% - 60px);
    @media (max-width: 500px) {
        padding: 20px;
        width: calc(100% - 40px);
    }
    
    .player-view {
        display: flex;
        flex-direction: row;
        width: 100%;
        align-items: flex-end;
    }
    
    .player-info {
        display: flex;
        flex-direction: column;
        gap: 15px;
        padding-top: 15px;
        font-weight: bold;
        @media (max-width: 500px) {
            gap: 5px;
            font-size: 14px;
            padding-top: 5px;
        }
    }
`;

export default PlayerView;