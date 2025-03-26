import styled from "styled-components";
import Chips from "./Chips.jsx";

const Token = ({ amount }) => {
    const putMoney = () => {
        console.log("puttedMoney", amount);
    }

    return (
        <StyleWrapper>
            <img src={`/tokens-img/${amount}.png`} alt={`$${amount} Token`} width="40px" height="40px" onClick={putMoney} />
        </StyleWrapper>
    )
}

const StyleWrapper = styled.button`
    cursor: pointer;
    border-radius: 50%;
    background: transparent;
`;

export default Token;