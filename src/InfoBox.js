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

  function getTotalGDPFromCountriesList(list) {
    return list.map(code => countries[code]).map(country => country.gdp).reduce((a, b) => a + b, 0) / worldGDP * 100
  }

  function renderOption(option) {
    return(
      <React.Fragment>
        {option.id.length === 2 && <span className="flag">{getFlagFromAlpha2(option.id)}</span>}
        {option.name}
      </React.Fragment>
    )
  }

  function renderInput(params) {
    return(
      <div className="search">
        <TextField
          {...params}
          label="Country or RTA"
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

  const processedRTAs = rtas.map((rta, i) => ({
    group: 'RTAs',
    id: `RTA-${i}`,
    name: rta.rta,
    rtatype: rta.type,
    index: i
  }))

  const processedCountries = Object.values(countries).map(node => ({
    group: 'Countries',
    id: node.id,
    name: node.name,
    alpha3: node.alpha3,
    region: node.region,
    subregion: node.subregion
  }))

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
          // options={processedCountries}
          options={processedCountries.concat(processedRTAs)}
          groupBy={(option) => option.group}
          clearOnEscape
          autoSelect
          autoHighlight
          getOptionLabel={(option) => {
            if (typeof option === "object")
              option = option.id
            if (option.length === 2)
              return countries[option] ? countries[option].name : ""
            else {
              const rtaID = parseInt(option.slice(4))
              return rtas[rtaID] ? rtas[rtaID].rta : ""
            }
          }}
          getOptionSelected={(option, value) => {
            return option.id === value
          }}
          renderOption={renderOption}
          renderInput={renderInput}
          filterOptions={(options, { inputValue }) => {
            const rankCountries = matchSorter(options.filter(item => item.group === "Countries"), inputValue, {keys: ['name', 'id', 'alpha3']})
            const rankRTAs = matchSorter(options.filter(item => item.group === "RTAs"), inputValue, {keys: ['name']})
            return rankCountries.concat(rankRTAs)
          }}
        />
        {selection &&
          <div className="details">
            {selection.length === 2 &&
              <React.Fragment>
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
              </React.Fragment>
            }
            {selection.length > 2 &&
              <React.Fragment>
                <div>Countries: {rtas[parseInt(selection.slice(4))].countries.length} ({getTotalGDPFromCountriesList(rtas[parseInt(selection.slice(4))].countries).toFixed(2)}% of World GDP)</div>
                <div>Type: {rtas[parseInt(selection.slice(4))].type}</div>
              </React.Fragment> 
            }
          </div>
        }
      </ThemeProvider>
    </div>
  )

}