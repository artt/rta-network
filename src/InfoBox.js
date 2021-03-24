import React from "react"
import TextField from '@material-ui/core/TextField';
import Autocomplete, { createFilterOptions } from '@material-ui/lab/Autocomplete';

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


export default function InfoBox({ data, worldGDP, selection, setSelection }) {

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
        {/* <span>{countryToFlag(option.code)}</span> */}
        {option.name}
      </React.Fragment>
    )
  }

  function renderInput(params) {
    return(
      <TextField
        {...params}
        label="Country"
        color="secondary"
        inputProps={{
          ...params.inputProps,
          autoComplete: 'new-password', // disable autocomplete and autofill
        }}
      />
    )
  }

  const processedData = Object.values(data).map(node => ({id: node.id, name: node.name}))

  return(
    <div className="infobox">
      <ThemeProvider theme={theme}>
        <Autocomplete
          value={value}
          onChange={(event, newValue) => {
            setValue(newValue);
            console.log(newValue)
            setSelection(newValue ? newValue.id : "")
          }}
          inputValue={inputValue}
          onInputChange={(event, newInputValue) => setInputValue(newInputValue)}
          size="small"
          style={{ width: 300 }}
          options={processedData}
          clearOnEscape
          autoSelect
          autoHighlight
          getOptionLabel={(optionStr) => {
            return data[optionStr] ? data[optionStr].name : ""
          }}
          getOptionSelected={(option, value) => {
            return option.id === value
          }}
          renderOption={renderOption}
          renderInput={renderInput}
          filterOptions={createFilterOptions({
            stringify: option => option.name
          })}
        />
        {selection && 
          <div className="details">
            {/* <div>{getFlagFromAlpha2(hoverNode.alpha2)} {hoverNode.name}</div> */}
            <div>RTAs: {data[selection].neighbors
              ? <React.Fragment>
                  {getNumRTAs(data[selection].links)}
                </React.Fragment>
              : 0}
            </div>
            <div>Neighbors: {data[selection].neighbors
              ? <React.Fragment>
                  {data[selection].neighbors.size} ({(getTotalGDP(data[selection]) / worldGDP * 100).toFixed(2)}% of World GDP, including itself)
                </React.Fragment>
              : 0}
            </div>
          </div>
        }
      </ThemeProvider>
    </div>
  )

}