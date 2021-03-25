import React from "react"
import TextField from '@material-ui/core/TextField';
import Autocomplete, { createFilterOptions } from '@material-ui/lab/Autocomplete';
import LocationSearchingIcon from '@material-ui/icons/LocationSearching';
import IconButton from '@material-ui/core/IconButton';
import { matchSorter } from 'match-sorter';

import DialogTitle from '@material-ui/core/DialogTitle';
import Dialog from '@material-ui/core/Dialog';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import Button from '@material-ui/core/Button';

import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableContainer from '@material-ui/core/TableContainer';
import TableHead from '@material-ui/core/TableHead';
import TableFooter from '@material-ui/core/TableFooter';
import TableRow from '@material-ui/core/TableRow';
import TablePagination from '@material-ui/core/TablePagination';

function getRTAs(node) {
  let allRTAs = new Set()
  node.links.forEach(link => {
    allRTAs = new Set([...allRTAs, ...link.rtas])
  })
  return allRTAs
}

function getFlagFromAlpha2(alpha2) {
	return alpha2.toUpperCase().replace(/./g, char => String.fromCodePoint(char.charCodeAt(0)+127397))
}

export default function InfoBox({ countries, rtas, worldGDP, selection, setSelection, focusNode }) {

  const [value, setValue] = React.useState(null);
  const [inputValue, setInputValue] = React.useState('');
  const [dialogueOpen, setDialogueOpen] = React.useState(false);

  React.useEffect(() => {
    if (selection)
      setValue(selection)
    else
      setValue(null)
  }, [selection])

  function getShareGDPFromNeighborsSet(node) {
    const neighborsGDP = Array.from(node.neighbors).map(country => country.gdp).reduce((a, b) => a + b, 0)
    return (neighborsGDP + node.gdp) / worldGDP * 100
  }
  
  function getShareGDPFromCountriesList(list) {
    return list.map(code => countries[code]).map(country => country.gdp).reduce((a, b) => a + b, 0) / worldGDP * 100
  }

  function handleClose() {
    setDialogueOpen(false)
  }

  function handleMoreDetials() {
    setDialogueOpen(true)
  }

  function CountryText({ node }) {
    return(
      <React.Fragment>
        {`${[...getRTAs(node)].length} RTAs covering ${node.neighbors.size} countries`}<br />
        {`Total coverage: ${getShareGDPFromNeighborsSet(countries[selection]).toFixed(2)}% of World GDP, including itself)}`}
      </React.Fragment>
    )
  }

  function CountryDialog({ node }) {
    const curRTAs = [...getRTAs(node)]
    const [page, setPage] = React.useState(0);
    const rowsPerPage = 10
    const emptyRows = rowsPerPage - Math.min(rowsPerPage, curRTAs.length - page * rowsPerPage);
    return(
      <Dialog
        onClose={handleClose}
        aria-labelledby="simple-dialog-title"
        open={dialogueOpen}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle id="simple-dialog-title"><span className="flag">{getFlagFromAlpha2(node.id)}</span>{node.name}</DialogTitle>
        <DialogContent>
          <DialogContentText>
            <CountryText node={node} />
            <TableContainer>
              <Table aria-label="simple table" size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Name</TableCell>
                    <TableCell align="center" style={{ width: 70 }}>Type</TableCell>
                    <TableCell align="center" style={{ width: 30 }}>Countries</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {curRTAs.slice(page * rowsPerPage, (page + 1) * rowsPerPage).map((row, i) => {
                    const curRTA = rtas[row]
                    return(
                      <TableRow key={`row${i}`}>
                        <TableCell component="th" scope="row">
                          {curRTA.rta}
                        </TableCell>
                        <TableCell align="center">{curRTA.type}</TableCell>
                        <TableCell align="center">{curRTA.countries.length}</TableCell>
                      </TableRow>
                    )
                  })}
                  {/* {emptyRows > 0 && (
                    <TableRow style={{ height: 33 * emptyRows }}>
                      <TableCell colSpan={3} />
                    </TableRow>
                  )} */}
                </TableBody>
                <TableFooter>
                  <TableRow>
                    <TablePagination
                      count={curRTAs.length}
                      page={page}
                      rowsPerPage={rowsPerPage}
                      rowsPerPageOptions={[]}
                      onChangePage={(event, newPage) => setPage(newPage)}
                    />
                  </TableRow>
                </TableFooter>
              </Table>
            </TableContainer>
          </DialogContentText>  
        </DialogContent>
      </Dialog>
    )
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
          if (typeof value === "object")
            value = value.id
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
          {selection.length === 2 && // country selected
            <React.Fragment>
              {countries[selection].neighbors
                ? <React.Fragment>
                    <CountryText node={countries[selection]} />
                    <div className="space-top">
                      <Button color="link" size="sm" onClick={handleMoreDetials}>
                        More details
                      </Button>
                    </div>
                    <CountryDialog node={countries[selection]} />
                  </React.Fragment>
                : <React.Fragment>
                    No RTAs
                  </React.Fragment>
              }
            </React.Fragment>
          }
          {selection.length > 2 && // rta selected
            <React.Fragment>
              <div>Countries: {rtas[parseInt(selection.slice(4))].countries.length} ({getShareGDPFromCountriesList(rtas[parseInt(selection.slice(4))].countries).toFixed(2)}% of World GDP)</div>
              <div>Type: {rtas[parseInt(selection.slice(4))].type}</div>
            </React.Fragment> 
          }
        </div>
      }
    </div>
  )

}