import React, { useEffect, useState } from "react";
import axios from "axios";
import { Box, Card, CardContent, Container, Typography, Grid, Divider } from "@mui/material";
import QuestionPieChart from "../components/QuestionPieChart";
import CustomBreadcrumb from "../components/CustomBreadcrumb";

const DayChart = () => {
  const [day1Data, setDay1Data] = useState([]);
  const [day2Data, setDay2Data] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Get raw data from localStorage
        const rawData = localStorage.getItem("uploadedData");
    
        // Ensure rawData is not null or empty
        if (!rawData) {
          throw new Error("No data found in localStorage.");
        }
    
        // Parse the data
        const response = JSON.parse(rawData);
    
        // Check if response has the expected structure
        if (!Array.isArray(response) || !response.every(item => item.day && item.data)) {
          throw new Error("Invalid data format. Expected an array of objects with 'day' and 'data'.");
        }
    
        // Separate Day 1 and Day 2 data based on the 'day' field
        const day1Filtered = response.filter(item => item.day === '1').flatMap(item => item.data);
        const day2Filtered = response.filter(item => item.day === '2').flatMap(item => item.data);
    
        // Set the state for Day 1 and Day 2
        setDay1Data(day1Filtered);
        setDay2Data(day2Filtered);
      } catch (error) {
        console.error("Error fetching data:", error.message);
      }
    };
  
    fetchData();
  }, []);

  const processAnswers = (data, questionKey) => {
    const sentimentCounts = {
      Positive: { count: 0, feedback: [] },
      Negative: { count: 0, feedback: [] },
      Neutral: { count: 0, feedback: [] },
    };
    const nonSentimentCounts = {};

    data.forEach(response => {
      const answer = response[questionKey];

      // Check if the answer has 'sentiment'
      if (answer && answer.hasOwnProperty('sentiment')) {
        const sentiment = answer.sentiment;
        if (sentimentCounts[sentiment]) {
          sentimentCounts[sentiment].count += 1;
          sentimentCounts[sentiment].feedback.push(answer.text);
        }
      } else if (answer !== null && answer !== undefined) {
        // Non-sentiment answers
        if (nonSentimentCounts[answer]) {
          nonSentimentCounts[answer] += 1;
        } else {
          nonSentimentCounts[answer] = 1;
        }
      }
    });

    return { sentimentCounts, nonSentimentCounts };
  };


  const renderCharts = (data, dayLabel) => {
    if (data.length === 0) return null;
    const questionKeys = Object.keys(data[0] || {}).filter(
      key => key !== "Timestamp" && key !== "id"
    );

    console.log(questionKeys, "questionKeys")

    return questionKeys.map((key, index) => (
      key !== "Name" &&
      <Card key={`${dayLabel}-${index}`} sx={{ marginBottom: 2 }}>
        <CardContent>
          {/* Pass the sentiment data to the PieChart */}
          <QuestionPieChart
            sentimentData={processAnswers(data, key)} // Pass the processed sentiment data
            questionTitle={key}
          />
        </CardContent>
      </Card>
    ));
  };

  return (
    <>
      <CustomBreadcrumb currentPage="Day Chart" />
      <Container maxWidth="lg">
        <Typography variant="h5" gutterBottom>
          Pie Charts for Each Question (Day 1 and Day 2)
        </Typography>
        <Grid container spacing={4}>
          <Grid item xs={12} md={6}>
            <Typography variant="h6" sx={{ marginBottom: 2 }}>
              Day 1
            </Typography>
            <Divider sx={{ marginBottom: 2 }} />
            {day1Data.length > 0 ? renderCharts(day1Data, "Day 1") : (
              <Typography variant="body1">No data available</Typography>
            )}
          </Grid>
          <Grid item xs={12} md={6}>
            <Typography variant="h6" sx={{ marginBottom: 2 }}>
              Day 2
            </Typography>
            <Divider sx={{ marginBottom: 2 }} />
            {day2Data.length > 0 ? renderCharts(day2Data, "Day 2") : (
              <Typography variant="body1">No data available</Typography>
            )}
          </Grid>
        </Grid>
      </Container>
    </>
  );
};

export default DayChart;
