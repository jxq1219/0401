import { Leva } from 'leva';
import { Scene } from './components/Scene';

function App() {
  return (
    <>
      <Leva collapsed={false} theme={{ sizes: { rootWidth: '300px' } }} />
      <Scene />
    </>
  );
}

export default App;
