import TextField from "@mui/material/TextField";
import React, { useContext, useState } from "react";
import { AdminsContext } from "../context";
import { stepsContainer } from "./steps.style";

export default function Steps(): JSX.Element {
  const [stepArr, setStepArr] = useState<string[]>([""])
  const { stepsArr, setStepsArr } = useContext(AdminsContext)
  function testKeyDown(e: React.KeyboardEvent<HTMLInputElement | HTMLDivElement>, ID: number) {
    const eventValue: string = (e.target as HTMLInputElement).value
    if (e.key === "Enter") {
      if (eventValue !== "") {
        stepArr.splice(ID + 1, 0, "")
        setStepArr([...stepArr])
      }
    }

    if (e.key === "Backspace") {
      if (eventValue === "" && stepArr.length > 1) {
        const deletedArr = stepArr.filter((value, index) => index !== ID)
        setStepArr([...deletedArr])
      }
    }
  }

  function updateValue(e: React.FormEvent<HTMLInputElement | HTMLTextAreaElement>, ID: number) {
    const eventValue = (e.target as HTMLInputElement).value
    stepArr[ID] = eventValue
    setStepArr([...stepArr])
  }

  return (
    <div css={stepsContainer}>
      {stepArr.map((value, index) =>
        <TextField
          value={value}
          onChange={(e) => updateValue(e, index)}
          key={index} onKeyDown={(e) => testKeyDown(e, index)}
          placeholder={`step ${index + 1}...`}
          variant="standard"></TextField>
      )}
    </div>
  );
}
