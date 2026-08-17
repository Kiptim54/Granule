import "./App.css";
import Header from "./components/Header";
import Scrolly from "./components/Scrolly";
import VatTrap from "./components/VatTrap";
import Intro from "./components/Intro";
import HiddenCharges from "./components/HiddenCharges";
import HiddenCostScrolly from "./components/HiddenCostScrolly";
import Recommendation from "./components/Recommendation";
import Footer from "./components/Footer";

function App() {
  return (
    <>
      <Header />
      <Intro />
      <Scrolly />
      <VatTrap />
      <HiddenCharges />
      <HiddenCostScrolly />
      <Recommendation />
      <Footer />
    </>
  );
}

export default App;
