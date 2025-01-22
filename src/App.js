import React from "react";
import { BrowserRouter as Router, Route, Routes, Link } from "react-router-dom";
import UploadExcel from "./pages/UploadExcel";
import DayChart from "./pages/DayChart";
import "./App.css";

const App = () => {
  // const [fileData, setFileData] = useState(null);

  // useEffect(() => {
  //   // Fetch data from local JSON file or API
  //   const fetchData = async () => {
  //     try {
  //       // If you are using a local JSON file, use something like this:
  //       const response = await fetch("http://localhost:3002/fileData");

  //       // If you're using an API, make sure to replace the URL with your actual API endpoint.
  //       // const response = await fetch('https://yourapi.com/data');

  //       const data = await response.json();
  //       setFileData(data); // assuming the data is inside "fileData"
  //     } catch (error) {
  //       console.error("Error fetching data:", error);
  //     }
  //   };

  //   fetchData();
  // }, []);

  // console.log(fileData);

  // if (!fileData) {
  //   return <div>Loading...</div>; // Show a loading message while fetching the data
  // }
  return (
    <Router>
      <Routes>
        <Route path="/" element={<UploadExcel />} />
        <Route path="/view-chart" element={<DayChart />} />
        <Route path="/contact" element={<h4>contact</h4>} />
      </Routes>
    </Router>
    // <div>
    //   <FileUploader />
    //   <PieChartContainer />
    //   {/* <PieCharts fileData={fileData} /> */}
    // </div>
  );
};

export default App;
