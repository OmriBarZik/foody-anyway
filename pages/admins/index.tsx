import Steps from "../../components/steps/Steps";
import Ingredients from "../../components/ingredients/Ingredients";
import { useState } from "react";
import { AdminsContext, shareInfoType } from "../../components/context";
import { getIngredients } from "../../components/ingredients/ingredientInfo";
import { TextField } from "@mui/material";
import {
  bodyContainer,
  button,
  container,
  titleStyle,
} from "../../styles/admins/index.style";
import Button from "@mui/material/Button";

export default function Testy() {
  const ingredients = getIngredients();

  const [stepsArr, setStepsArr] = useState<string[]>([""]);
  const [IngredientsArr, setIngredientsArr] = useState<string[]>([]);
  const [title, setTitle] = useState<string>("");
  const [url, setURL] = useState<string>("");

  const shareInfo: shareInfoType = {
    stepsArr,
    setStepsArr,
    IngredientsArr,
    setIngredientsArr,
    title,
    setTitle,
    url,
    setURL,
  };

  return (
    <div css={container}>
      <AdminsContext.Provider value={shareInfo}>
        <TextField
          size="small"
          css={titleStyle}
          variant="outlined"
          value={title}
          onChange={(e) => setTitle(e.currentTarget.value)}
          placeholder="title"
        ></TextField>
        <input
          value={url}
          onChange={(e) => setURL(e.currentTarget.value)}
          placeholder="url"
        ></input>
        <div css={bodyContainer}>
          <Ingredients
            selectedIngredients={(e) => setIngredientsArr(e)}
            ingredients={ingredients.map((value) => value.name)}
          />
          <Steps />
        </div>
        <Button
          css={button}
          onClick={() =>
            console.log({
              title: title,
              url: url,
              chosenIngredients: IngredientsArr,
              steps: stepsArr,
            })
          }
        >
          save
        </Button>
      </AdminsContext.Provider>
    </div>
  );
}
