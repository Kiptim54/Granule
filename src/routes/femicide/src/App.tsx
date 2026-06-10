import "./App.css";
import Header from "./components/Header";
import Story from "./components/Story";
// import Women from "./components/Women";
// import Scrolly from "./components/Scrolly/Scrolly";
// import LineChartScrolly from "./components/Scrolly/LineChartScrolly";
// import Temporal from "./components/Temporal";
// import StackedScrolly from "./components/Scrolly/StackedScrolly";
// import TemporalScrolly from "./components/Scrolly/TemporalScrolly";
// import HeatmapScrolly from "./components/Scrolly/HeatMapScrolly";
// import Conclusion from "./components/Conclusion";
import Nav from "./components/Nav";
import Footer from "./components/Footer";
import Methodology from "./components/Methodology";

function App() {
  return (
    <div>
      <Nav />

      <section className='py-10 text-lg'>
        <Header />

        <div className='container mx-auto'>
          <Story />
          {/* <LineChartScrolly /> */}
          {/* <Women /> */}
          {/* 

          <Scrolly />
          <StackedScrolly />
          <Temporal />
          <TemporalScrolly />
          <HeatmapScrolly />
          <Conclusion /> */}
          <Methodology />
        </div>
      </section>
      <Footer />
    </div>
  );
}
export default App;
