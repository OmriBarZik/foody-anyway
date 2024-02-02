import {
  Box,
  Chip,
  FormControl,
  InputLabel,
  MenuItem,
  MenuProps,
  OutlinedInput,
  Select,
  TextField,
} from "@mui/material";
import { useState } from "react";
import useSWR from "swr";
import { fetcher } from "../../components/fetcher";
import { Ingredient } from "../../models";
import { container } from "../../styles/admins/index.style";

export default function RecipesManagment() {
  const [stepsArr, setStepsArr] = useState<string[]>([""]);
  // const [IngredientsArr, setIngredientsArr] = useState<string[]>([]);
  const [title, setTitle] = useState<string>("");
  const { data, error, isLoading } = useSWR<Ingredient[]>(
    "/api/ingredients",
    fetcher,
  );

  const [selectedIngredions, setSelectedIngredions] = useState<string[]>([]);

  return (
    <div css={container}>
      <FormControl>
        <Box
          sx={{
            width: 500,
            maxWidth: "100%",
          }}
        >
          <TextField
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            fullWidth
            label="Title"
            id="fullWidth"
          />
        </Box>
      </FormControl>

      {isLoading && <p>loading...</p>}
      {error && <div>failed to load ingredions </div>}
      {data && (
        <FormControl>
          <InputLabel id="demo-multiple-chip-label">Ingredient</InputLabel>
          <Select
            sx={{ minWidth: 300 }}
            labelId="demo-multiple-chip-label"
            id="demo-multiple-chip"
            multiple
            value={selectedIngredions}
            input={<OutlinedInput label="Ingrediants" />}
            onChange={(e) => setSelectedIngredions(e.target.value as string[])}
            renderValue={(selected) => (
              <Box
                sx={{
                  display: "flex",
                  flexWrap: "wrap",
                  gap: 0.5,
                  width: 300,
                  minWidth: 300,
                }}
              >
                {selected.map((value, i) => (
                  <Chip key={value + i} label={value} />
                ))}
              </Box>
            )}
            MenuProps={
              data.map((e) => ({} as Partial<MenuProps>)) as Partial<MenuProps>
            }
          >
            {data.map((value) => (
              <MenuItem key={value._id?.toString()} value={value.name}>
                {value.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      )}
    </div>
  );
}
