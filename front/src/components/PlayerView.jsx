import styled from "styled-components";

const PlayerView = ({ amount }) => {
    return (
        <StyledWrapper>
            <div className="player-view">
                <img src="/gambler.png" alt="Your icon" height="80px" width="80px" />
                <div className="player-info">
                    <label>You</label>
                    <label>${amount}</label>
                </div>
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
    
    .player-view {
        display: flex;
        flex-direction: row;
        gap: 10px;
    }
    
    .player-info {
        display: flex;
        flex-direction: column;
        gap: 15px;
        padding-top: 15px;
        font-weight: bold;
    }
`;

export default PlayerView;