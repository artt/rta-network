import './App.css';
import React from 'react'
import Graph from './Graph'
import InfoBox from './InfoBox'
import GithubCorner from 'react-github-corner';
import orgData from "./data.json"
import orgRTAs from "./rtas.json"

import { createMuiTheme, ThemeProvider } from '@material-ui/core/styles';

function App() {

  const data = React.useMemo(() => {
    for (const [, link] of Object.entries(orgData.links)) {
      const a = orgData.nodes[link.source] || orgData.nodes[link.source.id]
      const b = orgData.nodes[link.target] || orgData.nodes[link.target.id]
      // if (a == undefined || b == undefined)
      // 	return {nodes: [], links: []}
      !a.neighbors && (a.neighbors = new Set());
      !b.neighbors && (b.neighbors = new Set());
      a.neighbors.add(b);
      b.neighbors.add(a);

      !a.links && (a.links = []);
      !b.links && (b.links = []);
      a.links.push(link);
      b.links.push(link);
    }
    // const friendSize = Object.entries(orgData.nodes).map(x => x[1]).map(y => (y.neighbors ? getTotalGDP(y.neighbors) + y.gdp : y.gdp) / orgData.total_gdp * 100 )
    // console.log(friendSize.indexOf(Math.max(...friendSize)), Math.max(...friendSize))
    return orgData
  }, [])

  const [selection, setSelection] = React.useState("")
  const [highlightNodes, setHighlightNodes] = React.useState(new Set());
	const [highlightLinks, setHighlightLinks] = React.useState(new Set());
	const fgRef = React.useRef();

  const average = (arr) => arr.reduce( ( p, c ) => p + c, 0 ) / arr.length;

  function focusNode() {
    const hn = [...highlightNodes]
    const centroidX = average(hn.map(node => node.x))
    const centroidY = average(hn.map(node => node.y))
    const centroidZ = average(hn.map(node => node.z))
    const distance = 800
		const distRatio = 1 + distance / Math.hypot(centroidX, centroidY, centroidZ)
		fgRef.current.cameraPosition(
			{ x: centroidX * distRatio, y: centroidY * distRatio, z: centroidZ * distRatio },
			{ x: 0, y: 0, z: 0 },
			3000
		)
  }

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
  })

  return (
    <div className="App">
      <ThemeProvider theme={theme}>
        <Graph
          data={data}
          rtas={orgRTAs}
          selection={selection}
          setSelection={setSelection}
          highlightNodes={highlightNodes}
          setHighlightNodes={setHighlightNodes}
          highlightLinks={highlightLinks}
          setHighlightLinks={setHighlightLinks}
          fgRef={fgRef}
        />
        <GithubCorner
          href="https://github.com/artt/rta-network"
          target="_blank"
          rel="noopener noreferrer"
          bannerColor="#20635d"
        />
        <InfoBox
          countries={data.nodes}
          rtas={orgRTAs}
          worldGDP={orgData.total_gdp}
          selection={selection}
          setSelection={setSelection}
          focusNode={focusNode}
        />
      </ThemeProvider>
    </div>
  );
}

export default App;
