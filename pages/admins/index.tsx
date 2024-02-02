import {
  Autocomplete,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  FormControl,
  IconButton,
  ListItem,
  ListItemAvatar,
  ListItemText,
  TextField,
  createFilterOptions,
} from "@mui/material";
import { useState } from "react";
import useSWR from "swr";
import { fetcher } from "../../components/fetcher";
import { Ingredient } from "../../models";
import { container } from "../../styles/admins/index.style";
import DeleteIcon from "@mui/icons-material/Delete";

interface IngredientInfo extends Ingredient {
  inputValue?: string;
}

export default function RecipesManagment() {
  const [stepsArr, setStepsArr] = useState<string[]>([""]);
  // const [IngredientsArr, setIngredientsArr] = useState<string[]>([]);
  const [title, setTitle] = useState<string>("");
  const { data, error, isLoading } = useSWR<IngredientInfo[]>(
    "/api/ingredients",
    fetcher,
  );

  const [selectedIngredions, setSelectedIngredions] = useState<string[]>([]);
  const filter = createFilterOptions<IngredientInfo>();
  const [openDialog, setOpenDialog] = useState(false);
  const [value, setValue] = useState<IngredientInfo | null>();
  const [ingredientsList, setIngredientsList] = useState<IngredientInfo[]>([]);

  const handleClose = () => {
    setDialogValue({
      amount: 0,
      name: "",
      inputValue: "",
    });
    setOpenDialog(false);
  };

  const [dialogValue, setDialogValue] = useState<IngredientInfo>({
    name: "",
    amount: 0,
    inputValue: "",
  });

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    // setValue({
    //   title: dialogValue.title,
    //   year: parseInt(dialogValue.year, 10),
    // });
    handleClose();
  };

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

      <br />
      <br />

      {isLoading && <p>loading...</p>}
      {error && <div>failed to load ingredions </div>}
      {data && (
        <>
          <Autocomplete
            value={value}
            onChange={(event, newValue) => {
              if (typeof newValue === "string") {
                // timeout to avoid instant validation of the dialog's form.
                setTimeout(() => {
                  setOpenDialog(true);
                  setDialogValue({
                    name: newValue,
                    amount: 0,
                  });
                });
              } else if (newValue && newValue.inputValue) {
                setOpenDialog(true);
                setDialogValue({
                  name: newValue.inputValue,
                  amount: 0,
                });
              } else {
                setValue(newValue);

                if (newValue && !ingredientsList.includes(newValue)) {
                  setIngredientsList([...ingredientsList, newValue]);
                }
              }
            }}
            filterOptions={(options, params) => {
              const filtered = filter(options, params);

              if (params.inputValue !== "") {
                filtered.push({
                  name: "add" + " " + params.inputValue,
                  amount: 1,
                  inputValue: params.inputValue,
                });
              }

              return filtered;
            }}
            id="free-solo-dialog-demo"
            options={data}
            getOptionLabel={(option) => {
              // e.g. value selected with enter, right from the input
              if (typeof option === "string") {
                return option;
              }

              if (option.inputValue) {
                return option.inputValue;
              }
              return option.name;
            }}
            selectOnFocus
            getOptionDisabled={(option) => ingredientsList.includes(option)}
            clearOnBlur
            handleHomeEndKeys
            renderOption={(props, option) => <li {...props}>{option.name}</li>}
            sx={{ width: 300 }}
            freeSolo
            renderInput={(params) => (
              <TextField {...params} label="Ingredients" />
            )}
          />
          <Dialog open={openDialog} onClose={handleClose}>
            <form onSubmit={handleSubmit}>
              <DialogTitle>Add new Ingredient</DialogTitle>
              <DialogContent>
                <DialogContentText>
                  Did you miss any film in our list? Please, add it!
                </DialogContentText>
                <TextField
                  autoFocus
                  margin="dense"
                  id="name"
                  value={dialogValue.name}
                  onChange={(event) =>
                    setDialogValue({
                      ...dialogValue,
                      name: event.target.value,
                    })
                  }
                  label="Ingredient"
                  type="text"
                  variant="standard"
                />
                <TextField
                  margin="dense"
                  id="name"
                  value={dialogValue.amount}
                  onChange={(event) =>
                    setDialogValue({
                      ...dialogValue,
                      amount: Number(event.target.value) || 0,
                    })
                  }
                  label="Amount"
                  type="number"
                  variant="standard"
                />
              </DialogContent>
              <DialogActions>
                <Button onClick={handleClose}>Cancel</Button>
                <Button type="submit">Add</Button>
              </DialogActions>
            </form>
          </Dialog>
        </>
      )}
      {ingredientsList.map((ingredient, index) => (
        <ListItem
          key={ingredient.name + ingredient._id}
          secondaryAction={
            <IconButton
              onClick={() =>
                setIngredientsList([
                  ...ingredientsList.filter(
                    (value) => value._id !== ingredient._id,
                  ),
                ])
              }
              edge="end"
              aria-label="delete"
            >
              <DeleteIcon />
            </IconButton>
          }
        >
          <ListItemText
            primary={ingredient.inputValue || ingredient.name}
            // secondary={ 'Secondary text' }
          />
        </ListItem>
      ))}
    </div>
  );
}
