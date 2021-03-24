import React from "react"
import TextField from '@material-ui/core/TextField';
import Autocomplete, { createFilterOptions } from '@material-ui/lab/Autocomplete';
import LocationSearchingIcon from '@material-ui/icons/LocationSearching';
import IconButton from '@material-ui/core/IconButton';
import { matchSorter } from 'match-sorter';

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

function getNumRTAs(linkArray) {
  let allRTAs = new Set()
  linkArray.forEach(link => {
    allRTAs = new Set([...allRTAs, ...link.rtas])
  })
  return allRTAs.size
}

function getFlagFromAlpha2(alpha2) {
	return alpha2.toUpperCase().replace(/./g, char => String.fromCodePoint(char.charCodeAt(0)+127397))
}

function getTotalGDP(node) {
	const neighborsGDP = Array.from(node.neighbors).map(country => country.gdp).reduce((a, b) => a + b, 0)
  return neighborsGDP + node.gdp
}


export default function InfoBox({ countries, rtas, worldGDP, selection, setSelection, focusNode }) {

  const [value, setValue] = React.useState(null);
  const [inputValue, setInputValue] = React.useState('');

  React.useEffect(() => {
    if (selection)
      setValue(selection)
    else
      setValue(null)
  }, [selection])

  function renderOption(option) {
    return(
      <React.Fragment>
        <span className="flag">{getFlagFromAlpha2(option.id)}</span>
        {option.name}
      </React.Fragment>
    )
  }

  function renderInput(params) {
    return(
      <div className="search">
        <TextField
          {...params}
          label="Country"
          color="secondary"
          inputProps={{
            ...params.inputProps,
            autoComplete: 'new-password', // disable autocomplete and autofill
          }}
        />
        <IconButton
          aria-label="locate"
          disabled={value === null}
          onClick={focusNode}
        >
          <LocationSearchingIcon />
        </IconButton>
      </div>
    )
  }

  const processedCountries = 
    Object.values(countries).map(node => ({id: node.id, name: node.name, alpha3: node.alpha3, region: node.region, subregion: node.subregion}))

  return(
    <div className="infobox">
      <ThemeProvider theme={theme}>
        <Autocomplete
          value={value}
          onChange={(event, newValue) => {
            setValue(newValue);
            setSelection(newValue ? newValue.id : "")
          }}
          inputValue={inputValue}
          onInputChange={(event, newInputValue) => setInputValue(newInputValue)}
          size="small"
          style={{ width: 300 }}
          options={processedCountries}
          clearOnEscape
          autoSelect
          autoHighlight
          getOptionLabel={(optionStr) => {
            return countries[optionStr] ? countries[optionStr].name : ""
          }}
          getOptionSelected={(option, value) => {
            return option.id === value
          }}
          renderOption={renderOption}
          renderInput={renderInput}
          // filterOptions={createFilterOptions({
          //   stringify: option => option.name
          // })}
          filterOptions={(options, { inputValue }) => matchSorter(options, inputValue, {keys: ['name', 'id', 'alpha3', 'region', 'subregion']})}
        />
        {selection && 
          <div className="details">
            <div>RTAs: {countries[selection].neighbors
              ? <React.Fragment>
                  {getNumRTAs(countries[selection].links)}
                </React.Fragment>
              : 0}
            </div>
            <div>Neighbors: {countries[selection].neighbors
              ? <React.Fragment>
                  {countries[selection].neighbors.size} ({(getTotalGDP(countries[selection]) / worldGDP * 100).toFixed(2)}% of World GDP, including itself)
                </React.Fragment>
              : 0}
            </div>
          </div>
        }
      </ThemeProvider>
    </div>
  )

}