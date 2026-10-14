import "./App.css";
import Header from "./components/Header";
import Story from "./components/Story";
import React from "react";
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
import Papa from "papaparse";

function App() {
  const [data, setData] = React.useState<any[]>([]);

  React.useEffect(() => {
    Papa.parse(
      "https://docs.google.com/spreadsheets/d/e/2PACX-1vQQJLPXhEJET1OlE43zGWYDhdls6PTuifpXT4nQSTpxRNv0dw8GYcX7ercDpNTVOM8P0vbyM-sRNuDI/pub?output=csv",
      {
        download: true,
        header: true,
        complete: (results) => {
          setData(results.data);
        },
      },
    );
  }, []); // Empty array = runs once on mount
  React.useEffect(() => {
    console.log(data);
  }, [data]);

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
