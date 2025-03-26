import styled from "styled-components";
import Token from "./Token.jsx";

const Chips = () => {
    return (
        <StyleWrapper>
            <Token amount={1} />
            <Token amount={5} />
            <Token amount={25} />
            <Token amount={50} />
            <Token amount={100} />
            <Token amount={500} />
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