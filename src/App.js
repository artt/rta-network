import './App.css';
import Graph from './Graph'
import GithubCorner from 'react-github-corner';

function App() {
  return (
    <div className="App">
      <Graph />
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
