import React from "react"
import ForceGraph3D from "react-force-graph-3d"
import { use100vh } from "react-div-100vh"
import { forceX, forceY, forceZ } from 'd3-force-3d'
import * as THREE from 'three'
import { withSize } from 'react-sizeme'

function inverseSphereVolume(vol) {
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
		case 'Central Asia': return 0xd92e72
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

function Graph({ data, rtas, selection, setSelection, highlightNodes, setHighlightNodes, highlightLinks, setHighlightLinks, size, fgRef }) {

  const fullHeight = use100vh() || size.height

	const [hoverNode, setHoverNode] = React.useState(null);
	// const [highlightNodes, setHighlightNodes] = React.useState(new Set());
	// const [highlightLinks, setHighlightLinks] = React.useState(new Set());
	const [graphLoaded, setGraphLoaded] = React.useState(false);

	function drawNode(node) {
		let color = getColorFromSubregion(node.subregion)
		let opacity = 0.75
		if (selection) {
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
			new THREE.SphereGeometry(Math.max(inverseSphereVolume(node.gdp*1e-9), 1) * 1.5, 16, 16),
			new THREE.MeshStandardMaterial( {color: color, opacity: opacity, transparent: true} )
		)
	}

	function getLinkColor(link) {
		if (selection) {
			if (highlightLinks.has(link)) {
				return selection.length > 2 ? 0xffffff : getColorFromSubregion(link.target.subregion)
			}
			else {
				return `rgba(180, 180, 180, 0.1)`
			}
		}
		return `rgba(255, 255, 255, 0.15)`
	}

	React.useEffect(() => {
		
		if (selection.length > 2) {
			// select RTA
			handleRTASelect(parseInt(selection.slice(4)))
		}
		else {
			const node = data.nodes[selection]
			handleNodeClick(node)
		}
	}, [selection])

	function handleRTASelect(rtaID) {
		setHoverNode(null)
		highlightNodes.clear();
		highlightLinks.clear();
		const countries = rtas[rtaID].countries
		for (let i = 0; i < countries.length; i ++) {
			highlightNodes.add(data.nodes[countries[i]])
			for (let j = i + 1; j < countries.length; j ++) {
				highlightLinks.add(data.links[countries[i] + '-' + countries[j]])
			}
		}
		setHighlightNodes(highlightNodes);
		setHighlightLinks(highlightLinks);
	}

	function handleNodeClick(node) {

		// console.log(node)
		highlightNodes.clear();
		highlightLinks.clear();
		if (node) {
			highlightNodes.add(node);
			node.neighbors && node.neighbors.forEach(neighbor => highlightNodes.add(neighbor));
			node.links && node.links.forEach(link => highlightLinks.add(link));
			setSelection(node.id)
		}

		setHoverNode(node);
		setHighlightNodes(highlightNodes);
		setHighlightLinks(highlightLinks);

		highlightLinks.forEach(link => {
			if (link.target === node) {
				const tmp = link.target
				link.target = link.source
				link.source = tmp
			}
			// fgRef.current.emitParticle(link)
		})

	}

	React.useEffect(() => {
		fgRef.current.d3Force('centerX', forceX(0));
		fgRef.current.d3Force('centerY', forceY(0));
		fgRef.current.d3Force('centerZ', forceZ(0));
		fgRef.current.d3Force('charge').strength(-150);
	}, [graphLoaded]);

	return(
		<div id="canvas">
			{!graphLoaded && <div className="center full">Loading stuff...</div>}
			<ForceGraph3D
				ref={fgRef}
				width={size.width}
				height={fullHeight}
				graphData={{nodes: Object.values(data.nodes), links: Object.values(data.links)}}
				nodeVal={node => inverseSphereVolume(node.gdp*1e-9)}
				enableNodeDrag={false}
				nodeThreeObject={drawNode}
				linkColor={getLinkColor}
				linkOpacity={1}
				nodeOpacity={1}
				onNodeClick={handleNodeClick}
				onEngineTick={() => setGraphLoaded(true)}
				linkDirectionalParticleWidth={2}
				linkDirectionalParticles={link => highlightLinks.has(link) ? 3 : 0}
			/>
		</div>
	)
}

export default withSize({ monitorHeight: true })(Graph)