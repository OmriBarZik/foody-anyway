import TextField from "@mui/material/TextField";
import React, { useContext, useState } from "react";
import { AdminsContext } from "../context";
import { stepsContainer } from "./steps.style";

export default function Steps(): JSX.Element {
  const { stepsArr, setStepsArr } = useContext(AdminsContext);
  function testKeyDown(
    e: React.KeyboardEvent<HTMLInputElement | HTMLDivElement>,
    ID: number
  ) {
    const eventValue: string = (e.target as HTMLInputElement).value;
    if (e.key === "Enter" && e.ctrlKey === true) {
      if (eventValue !== "") {
        stepsArr.splice(ID + 1, 0, "");
        setStepsArr([...stepsArr]);
      }
    }

    if (e.key === "Backspace") {
      if (eventValue === "" && stepsArr.length > 1) {
        const deletedArr = stepsArr.filter((value, index) => index !== ID);
        setStepsArr([...deletedArr]);
      }
    }
  }

  function updateValue(
    e: React.FormEvent<HTMLInputElement | HTMLTextAreaElement>,
    ID: number
  ) {
    const eventValue = (e.target as HTMLInputElement).value;
    stepsArr[ID] = eventValue;
    setStepsArr([...stepsArr]);
  }

  return (
    <div css={stepsContainer}>
      {stepsArr.map((value, index) => (
        <TextField
          multiline
          value={value}
          onChange={(e) => updateValue(e, index)}
          key={index}
          onKeyDown={(e) => testKeyDown(e, index)}
          placeholder={`step ${index + 1}...`}
          variant="outlined"
          size="small"
          autoFocus
        ></TextField>
      ))}
    </div>
  );
}
