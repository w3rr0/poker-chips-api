import React from "react";
import { CRangeSlider } from "@coreui/react-pro"

const SliderInput = ({ value, handleChange }) => {
    return (
        <div>
            <div className="gap15" />
            <CRangeSlider
                className="styled-slider"
                value={value}
                labels={["0","2500", "", "", "10000"]}
                clickableLabels={true}
                min={0}
                max={10000}
                step={10}
                tooltips={true}
                tooltipsFormat={(val) => `Starting value: $${val}`}
                track="fill"
                onChange={(val) => {
                    handleChange(val[0])
                }}
            />
        </div>)
}

export default SliderInput;