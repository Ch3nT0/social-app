import AllRouter from "./components/AllRoute/index";
import './App.css';
import { SocketProvider } from './context/SocketContext';

function App() {
  return (
    <SocketProvider>
      <AllRouter />
    </SocketProvider>
  );
}

export default App;