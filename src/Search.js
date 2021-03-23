import React from "react"
// import Select, { createFilter } from 'react-select'
// import Select from 'react-windowed-select'
import Autosuggest from 'react-autosuggest';

export default function Search({ curValue, countriesList, onSelect }) {

  const [suggestions, setSuggestions] = React.useState([])
  const [value, setValue] = React.useState("")

  function getSuggestions(v) {
    console.log(countriesList)
    if (v.value.length === 0) {
      return []
    }
    else {
      return countriesList.filter(c => c.label.toLowerCase().includes(v.value.toLowerCase()))
    }
  }

  function renderSuggestion(v) {
    return(
      <div>
        {v.label}
      </div>
    )
  }

  function handleSelect(event, { suggestion, suggestionValue }) {
    console.log(suggestion, suggestionValue)
    onSelect(suggestion)
  }

  const inputProps = {
    placeholder: 'Search...',
    value,
    onChange: (event, { newValue }) => setValue(newValue)
  };

  return(
    <div className="search">
      <Autosuggest
        suggestions={suggestions}
        onSuggestionsFetchRequested={v => setSuggestions(getSuggestions(v))}
        onSuggestionsClearRequested={() => setSuggestions([])}
        getSuggestionValue={suggestion => suggestion.label}
        renderSuggestion={renderSuggestion}
        inputProps={inputProps}
        onSuggestionSelected={handleSelect}
      />
    </div>
  )

}