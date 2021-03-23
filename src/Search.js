import React from "react"
import Select, { createFilter } from 'react-select'

export default function Search({ countriesList }) {

  const backgroundColor = '#222222'

  const colorStyles = {
    control: styles => ({ ...styles, color: 'white', backgroundColor: backgroundColor }),
    singleValue: styles => ({ ...styles, color: 'white', backgroundColor: backgroundColor }),
    option: (styles, { isFocused, isSelected }) => ({ ...styles, color: 'white', backgroundColor: isFocused ? '#444' : isSelected ? '#206352' : null }),
    input: styles => ({ ...styles, color: 'white', backgroundColor: backgroundColor }),
    dropdownIndicator: styles => ({ ...styles, color: 'white', backgroundColor: backgroundColor }),
    menuList: styles => ({ ...styles, color: 'white', backgroundColor: backgroundColor }),
  };

  const searchOptions = [
    {label: 'Countries', options: countriesList}
  ]

  return(
    <div className="search">
      <Select
        options={searchOptions}
        filterOption={createFilter({ignoreAccents: false})}
        styles={colorStyles}
        theme={theme => ({
          ...theme,
          // borderRadius: 0,
          colors: {
            ...theme.colors,
            primary: '#20635d',
            primary25: "#222222",
            primary50: "#339e8b",
            primary75: "#3dbca5",
          },
        })}
      />
    </div>
  )

}