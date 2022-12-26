import React, { useState, useContext } from "react";
import { getIngredients } from "./ingredientInfo";
import TextField from "@mui/material/TextField";
import Autocomplete from "@mui/material/Autocomplete";
import { css } from "@emotion/react";
import { AdminsContext } from "../context";

export default function Ingredients() {
  const { IngredientsArr, setIngredientsArr } = useContext(AdminsContext);
  const ingredients = getIngredients();
  let ingredientList = [];
  ingredientList = ingredients.map((value) => value.name)

  const ingredientContainer = css`
    width: 40%;
    float: left;
  `;

  return (
    <div css={ingredientContainer}>
      <Autocomplete
        multiple
        filterSelectedOptions={true}
        disableClearable={true}
        id="size-small-outlined-multi"
        size="small"
        options={ingredientList}
        noOptionsText={<a>Add new Ingredient</a>}
        // getOptionLabel={(option) => option.title}
        renderInput={(params) => {
          let arr = [];
          const paramsArr = params.InputProps.startAdornment;

          if (Array.isArray(paramsArr)) {
            arr = paramsArr.map((param) => param.props.label);
          }
          return (
            <TextField
              {...params}
              label="Ingredients"
              placeholder="Search..."
            />
          );
        }}
      />
    </div>
  );
}
