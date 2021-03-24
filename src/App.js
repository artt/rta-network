import './App.css';
import React from 'react'
import Graph from './Graph'
import InfoBox from './InfoBox'
import GithubCorner from 'react-github-corner';
import orgData from "./data.json"

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
	const fgRef = React.useRef();

  function focusNode() {
    const node = data.nodes[selection]
    console.log(node)
    const distance = 800
		const distRatio = 1 + distance / Math.hypot(node.x, node.y, node.z)
		fgRef.current.cameraPosition(
			{ x: node.x * distRatio, y: node.y * distRatio, z: node.z * distRatio },
			{ x: 0, y: 0, z: 0 },
			3000
		)
  }

  return (
    <div className="App">
      <Graph
        data={data}
        selection={selection}
        setSelection={setSelection}
        fgRef={fgRef}
      />
      <InfoBox
        data={data.nodes}
        worldGDP={orgData.total_gdp}
        selection={selection}
        setSelection={setSelection}
        focusNode={focusNode}
      />
      <GithubCorner
      	href="https://github.com/artt/rta-network"
      	target="_blank"
      	rel="noopener noreferrer"
      	bannerColor="#20635d"
      />
    </div>
  );
}

export default App;
