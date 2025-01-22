import React, { useEffect, useState } from "react";
import QuestionPieChart from "./QuestionPieChart";
import axios from "axios";
import { Box, Typography } from "@mui/material";

const PieChartContainer = () => {
  const [fileData, setFileData] = useState([]);

  let day = 1;

  useEffect(() => {
    // Fetch the data from JSON (you can replace this with your actual API)
    const fetchData = async () => {
      try {
        const response = await axios.get("http://localhost:3002/fileData"); // Adjust URL as necessary

        // Merge all dayCount1 arrays from the response data
        const mergedData = response.data
          .map((item) => item.dayCount) // Extract each dayCount array
          .flat(); // Flatten the array of arrays into a single array

        // Filter to keep only those objects where the key is 1
        const filteredData = mergedData
          .filter((item) => item.hasOwnProperty(day)) // Keep only items where the key is 1
          .map((item) => item[1]) // Extract the array from the key 1
          .flat(); // Flatten the resulting array of arrays into a single array

        const jsonData = filteredData; // Assuming the data is returned as JSON
        setFileData(jsonData); // Set the merged and filtered data to state
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, []);

  const processAnswers = (questionKey) => {
    // Create an object to hold the counts for each possible answer
    const answerCounts = {};

    // Iterate over all responses in fileData
    fileData.forEach((response) => {
      const answer = response[questionKey]; // Get the answer for the specific question
      if (answer !== null && answer !== undefined) {
        // If the answer exists, increment its count
        answerCounts[answer] = (answerCounts[answer] || 0) + 1;
      }
    });

    // Convert the answerCounts object into an array of [answer, count] pairs
    return Object.entries(answerCounts).map(([answer, count]) => ({
      answer,
      count,
    }));
  };

  const renderCharts = () => {
    if (fileData.length === 0) return null;

    // Extract question keys from the first entry's 'dayCount' (or the first response)
    const questionKeys = Object.keys(fileData[0] || {});
    if (questionKeys.length === 0) return null;

    return questionKeys.map((key, index) => {
      // Skip non-question keys (e.g., Timestamp, id)
      if (key === "Timestamp" || key === "id") return null;

      // Process answers for the current question and count frequencies
      const answerCounts = processAnswers(key);

      return (
        <QuestionPieChart
          key={index}
          questionData={answerCounts}
          questionTitle={key}
        />
      );
    });
  };

  return (
    <Box sx={{ maxWidth: 800, margin: "auto", padding: 3 }}>
      <Typography variant="h5" gutterBottom>
        Pie Charts for Each Question
      </Typography>
      {fileData.length > 0 ? (
        renderCharts()
      ) : (
        <Typography variant="body1">Loading data...</Typography>
      )}
    </Box>
  );
};

export default PieChartContainer;
