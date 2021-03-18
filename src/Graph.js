import React from "react"
import ForceGraph3D from "react-force-graph-3d"
import orgData from "./data.json"
// import rtas from "./rtas.json"
import { forceX, forceY, forceZ } from 'd3-force-3d'
import * as THREE from 'three'
import { withSize } from 'react-sizeme'

// function numberToColor(number, alpha=1) {
// 	const r = (number & 0xff0000) >> 16;
// 	const g = (number & 0x00ff00) >> 8;
// 	const b = (number & 0x0000ff);
// 	return `rgba(${b},${g},${r},${alpha})`;
// }

function Graph({ size }) {

	const fgRef = React.useRef();

	const data = React.useMemo(() => {
		for (const [key, link] of Object.entries(orgData.links)) {
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
		return orgData
	}, [])

	const [highlightNodes, setHighlightNodes] = React.useState(new Set());
	const [highlightLinks, setHighlightLinks] = React.useState(new Set());
	const [hoverNode, setHoverNode] = React.useState(null);
	const [graphLoaded, setGraphLoaded] = React.useState(false);

	const handleNodeClick = node => {
		highlightNodes.clear();
		highlightLinks.clear();
		if (node) {
			highlightNodes.add(node);
			node.neighbors && node.neighbors.forEach(neighbor => highlightNodes.add(neighbor));
			node.links && node.links.forEach(link => highlightLinks.add(link));
		}

		setHoverNode(node || null);
		// fgRef.current.refresh()
		setHighlightNodes(highlightNodes);
		setHighlightLinks(highlightLinks);

		highlightLinks.forEach(link => {
			// console.log(link.target)
			// console.log(node)
			if (link.target === node) {
				const tmp = link.target
				link.target = link.source
				link.source = tmp
			}
			// fgRef.current.emitParticle(link)
		})
	};

	React.useEffect(() => {
		// add collision force
		fgRef.current.d3Force('centerX', forceX(0));
		fgRef.current.d3Force('centerY', forceY(0));
		fgRef.current.d3Force('centerZ', forceZ(0));
		// fgRef.current.d3Force('link').strength(2);
		// fgRef.current.d3Force('link').distance(link => 100 / link.rtas.length);
		fgRef.current.d3Force('charge').strength(-200);
		// fgRef.current.d3Force('collision', forceCollide(80))
	}, [graphLoaded]);

	function inverseSphereVolume(vol) {
		// v = 4/3 pi r^3 => r = (3/4pi v)^(1/3)
		return Math.pow(3 / (4*Math.PI) * vol, 1/3)
	}

	function getColorFromSubregion(subregion) {
		switch(subregion) {
			case 'Northern America': return 0xFFCC00
			case 'Latin America and the Caribbean': return 0xF6B40E

			case 'Western Europe': return 0x003399
			case 'Southern Europe': return 0x003399
			case 'Northern Europe': return 0x4c70b7
			case 'Eastern Europe': return 0xDA291C

			case 'Northern Africa': return 0xc2b280
			case 'Sub-Saharan Africa': return 0x01853F

			case 'Western Asia': return 0x9cbf5a
			case 'Southern Asia': return 0xFF9933
			case 'Central Asia': return 0x8d4eba
			case 'Eastern Asia': return 0xAA381E
			case 'South-eastern Asia': return 0x8b30bf

			case 'Australia and New Zealand': return 0x48D1CC
			case 'Polynesia': return 0x48D1CC
			case 'Melanesia': return 0x48D1CC
			case 'Micronesia': return 0x48D1CC
			case 'Antarctica': return 0x48D1CC
			default: return 0x666666
		}
	}

	function getLinkColor(link) {
		if (hoverNode !== null) {
			if (highlightLinks.has(link)) {
				// if (link.source.subregion === link.target.subregion)
				// 	return 0xffffff
				return getColorFromSubregion(link.target.subregion)
				// return `rgba(255, 255, 255, 0.8)`
			}
			else {
				return `rgba(180, 180, 180, 0.1)`
			}
		}
		return `rgba(255, 255, 255, 0.1)`
	}

	function drawNode(node) {
		let color = getColorFromSubregion(node.subregion)
		let opacity = 0.75
		if (hoverNode !== null) {
			if (hoverNode === node) {
				color = 0xffffff
				opacity = 1
			}
			else if (highlightNodes.has(node)) {
				opacity = 0.9
			}
			else {
				opacity = 0.4
			}
		}
		return new THREE.Mesh(
			new THREE.SphereGeometry(inverseSphereVolume(node.gdp*1e-9) * 1.5, 16, 16),
			new THREE.MeshStandardMaterial( {color: color, opacity: opacity, transparent: true} )
		)
	}

	function clearSelection() {
		setHoverNode(null)
		highlightNodes.clear()
		highlightLinks.clear()
	}

	console.log(hoverNode)

	return(
		<div id="canvas">
			{!graphLoaded && <div className="center full">Loading RTAs...</div>}
			<ForceGraph3D
				ref={fgRef}
				width={size.width}
				height={size.height}
				graphData={{nodes: Object.values(data.nodes), links: Object.values(data.links)}}
				nodeVal={node => inverseSphereVolume(node.gdp*1e-9)}
				enableNodeDrag={false}
				// nodeColor={getNodeColor}
				nodeThreeObject={drawNode}
				linkColor={getLinkColor}
				// linkWidth={link => highlightLinks.has(link) ? 2 : 0}
				linkOpacity={1}
				nodeOpacity={1}
				onNodeClick={handleNodeClick}
				onEngineTick={() => setGraphLoaded(true)}
				linkDirectionalParticleWidth={2}
				linkDirectionalParticles={link => highlightLinks.has(link) ? 3 : 0}
				// linkDirectionalParticleColor={link => getColorFromSubregion(link.source.subregion)}
			/>
			{graphLoaded && hoverNode &&
				<div className="control-panel">
					<div>{hoverNode.alpha2.toUpperCase().replace(/./g, char => String.fromCodePoint(char.charCodeAt(0)+127397))} {hoverNode.name}</div>
					<div>Neighbors: {hoverNode.neighbors
						? <React.Fragment>{hoverNode.neighbors.size} (combined GDP = {((Array.from(hoverNode.neighbors).map(country => country.gdp).reduce((a, b) => a + b, 0)) * 1e-12).toFixed(2)} trillion GK$)</React.Fragment>
						: 0}	
					</div>
					<div onClick={clearSelection}>Clear Selection</div>
				</div>
			}
		</div>
	)
}

export default withSize({ monitorHeight: true })(Graph)