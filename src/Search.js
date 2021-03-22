import React from "react"
import Select from 'react-select'

export default function Search({ countriesList }) {

  const backgroundColor = '#222222'

  const colorStyles = {
    control: styles => ({ ...styles, color: 'white', backgroundColor: backgroundColor }),
    singleValue: styles => ({ ...styles, color: 'white', backgroundColor: backgroundColor }),
    option: (styles, { isFocused, isSelected }) => ({ ...styles, color: 'white', backgroundColor: isFocused ? '#444' : isSelected ? '#206352' : null }),
    input: styles => ({ ...styles, color: 'white', backgroundColor: backgroundColor }),
    dropdownIndicator: styles => ({ ...styles, color: 'white', backgroundColor: backgroundColor }),
    menuList: styles => ({ ...styles, color: 'red', backgroundColor: backgroundColor }),
  };

  const searchOptions = [
    {label: 'Countries', options: countriesList}
  ]

  return(
    <div className="search">
      <Select options={searchOptions} styles={colorStyles} />
    </div>
  )

}