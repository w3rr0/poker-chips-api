import styled from "styled-components";
import Token from "./Token.jsx";
import {chipsValue} from "../../public/static.js";

const Chips = ({ amount, handlePutToken }) => {
    return (
        <StyleWrapper>
            {chipsValue
                .filter(value => value < amount)
                .map(value => <Token key={value} value={value} putToken={handlePutToken} />)}
        </StyleWrapper>
    )
}

const StyleWrapper = styled.div`
    flex-grow: 1;
    width: 100%;
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: center;
    flex-wrap: wrap;
`;

export default Chips;