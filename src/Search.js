import React from "react"
import TextField from '@material-ui/core/TextField';
import Autocomplete from '@material-ui/lab/Autocomplete';

import { createMuiTheme, ThemeProvider } from '@material-ui/core/styles';

const theme = createMuiTheme({
  palette: {
    type: "dark",
    primary: {
      main: "#20635d",
    },
    secondary: {
      main: "#ffab40",
    },
  }
});

export default function Search({ curValue, countriesList, onSelect }) {

  const [value, setValue] = React.useState(null);
  const [inputValue, setInputValue] = React.useState('');

  return(
    <ThemeProvider theme={theme}>
      <div className="search">
        <Autocomplete
          value={value}
          onChange={(event, newValue) => {
            setValue(newValue);
            console.log(newValue)
            onSelect(newValue ? newValue.value : "")
          }}
          inputValue={inputValue}
          onInputChange={(event, newInputValue) => {
            setInputValue(newInputValue);
          }}
          id="search-select"
          size="small"
          style={{ width: 300 }}
          options={countriesList}
          clearOnEscape
          autoSelect
          autoHighlight
          getOptionLabel={(option) => option.label}
          renderOption={(option) => (
            <React.Fragment>
              {/* <span>{countryToFlag(option.code)}</span> */}
              {option.label}
            </React.Fragment>
          )}
          renderInput={(params) => (
            <TextField
              {...params}
              label="Search"
              color="secondary"
              // variant="outlined"
              inputProps={{
                ...params.inputProps,
                autoComplete: 'new-password', // disable autocomplete and autofill
              }}
            />
          )}
        />
      </div>
    </ThemeProvider>
  )

}