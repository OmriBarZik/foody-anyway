import { Box, FormControl, InputLabel, MenuItem, Select } from "@mui/material";
import { useState } from "react";
import useSWR from "swr";
import { shareInfoType } from "../../components/context";
import { fetcher } from "../../components/fetcher";
import { Ingredient } from "../../models";
import { container } from "../../styles/admins/index.style";

export default function Testy() {
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

  const { data, error, isLoading } = useSWR<Ingredient[]>(
    "/api/ingredients",
    fetcher
  );

  return (
    <div css={container}>
      {isLoading && <p>loading...</p>}

      {error && <div>failed to load</div>}

      {data && (
        <Box sx={{ minWidth: 120 }}>
          <FormControl fullWidth>
            <InputLabel id="demo-simple-select-label">Ingredient</InputLabel>
            <Select
              labelId="demo-simple-select-label"
              id="demo-simple-select"
              // value={age}
              label="Ingredient"
              // onChange={handleChange}
            >
              {data.map((ingredient, i: number) => (
                <MenuItem
                  key={ingredient.name + i}
                  value={ingredient._id?.toString()}
                >
                  {ingredient.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>
      )}
    </div>
  );
}
