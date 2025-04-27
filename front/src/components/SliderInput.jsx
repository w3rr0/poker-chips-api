import React from "react";
import { CRangeSlider } from "@coreui/react-pro"

const SliderInput = ({ value, onChange }) => {
    return <CRangeSlider
        value={value}
        labels={["0","2500" , "10000"]}
        clickableLabels={true}
        min={0}
        max={10000}
        step={10}
        onChange={onChange}
    />
}

export default SliderInput;