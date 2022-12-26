import TextField from "@mui/material/TextField";
import Autocomplete from "@mui/material/Autocomplete";
import { ingredientContainer } from "./ingredients.style";

interface IngredientsProps {
  ingredients: string[],
  selectedIngredients: (props: string[]) => void
}

export default function Ingredients({ ingredients, selectedIngredients }: IngredientsProps) {

  return (
    <div css={ingredientContainer}>
      <Autocomplete
        multiple
        filterSelectedOptions={true}
        disableClearable={true}
        id="size-small-outlined-multi"
        size="small"
        options={ingredients}
        noOptionsText={<a>Add new Ingredient</a>}
        onChange={(e, value)=> selectedIngredients(value)}
        // getOptionLabel={(option) => option.title}
        renderInput={(params) => {
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
