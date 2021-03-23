import React from "react"
// import Select, { createFilter } from 'react-select'
import Select from 'react-windowed-select'

export default function Search({ countriesList }) {

  const backgroundColor = '#222222'
  const defaultStyle = {color: 'white', backgroundColor: backgroundColor}

  const colorStyles = {
    control: styles => ({ ...styles, ...defaultStyle }),
    singleValue: styles => ({ ...styles, ...defaultStyle }),
    input: styles => ({ ...styles, ...defaultStyle }),
    menuList: styles => ({ ...styles, ...defaultStyle }),
    option: (styles, { isFocused, isSelected }) => ({ ...styles, color: 'white', backgroundColor: isFocused ? '#444' : isSelected ? '#206352' : null }),
    dropdownIndicator: (styles, f) => {
      console.log(f)
      return({ ...styles, color: 'white', backgroundColor: backgroundColor })
    },
  };

  return(
    <div className="search">
      <Select
        options={countriesList}
        // filterOption={createFilter({ignoreAccents: false})}
        styles={colorStyles}
        theme={theme => ({
          ...theme,
          colors: {
            ...theme.colors,
            primary: '#20635d',
            primary50: "#339e8b",
          },
        })}
      />
    </div>
  )

}