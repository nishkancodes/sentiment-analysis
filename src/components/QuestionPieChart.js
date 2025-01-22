import React, { useEffect, useState } from "react";
import { PieChart, Pie, Cell, Tooltip, Legend } from "recharts";
import { Box, Typography } from "@mui/material";

// Function to generate a random color
const generateRandomColor = () => {
  const letters = "0123456789ABCDEF";
  let color = "#";
  for (let i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 16)];
  }
  return color;
};

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#A28BFE"];

const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    return (
      <Box
        sx={{
          backgroundColor: "white",
          padding: "8px",
          border: "1px solid #ccc",
          borderRadius: "4px",
        }}
      >
        <Typography variant="body2">
          <strong>Answer:</strong> {payload[0].payload.answer}
        </Typography>
        <Typography variant="body2">
          <strong>Total :</strong> {payload[0].value}
        </Typography>
      </Box>
    );
  }
  return null;
};

const QuestionPieChart = ({ sentimentData, questionTitle }) => {
  const [chartData, setChartData] = useState([]);
  const { sentimentCounts, nonSentimentCounts } = sentimentData;

  // useEffect hook is always called
  useEffect(() => {
    const chartData = [];

    // Add sentiment data to chart only if sentiment exists
    Object.keys(sentimentCounts).forEach((key) => {
      if (sentimentCounts[key].count > 0) {
        chartData.push({
          answer: key,
          count: sentimentCounts[key].count,
        });
      }
    });

    // Add non-sentiment data to chart
    Object.keys(nonSentimentCounts).forEach((key) => {
      chartData.push({
        answer: key,
        count: nonSentimentCounts[key],
      });
    });

    setChartData(chartData);
  }, [sentimentData, sentimentCounts, nonSentimentCounts]);

  // Skip rendering if the question title is "name"
  if (questionTitle.toLowerCase() === "name") {
    return null;
  }

  // Dynamically generate colors based on the data size
  const getColor = (index) => {
    if (index < COLORS.length) {
      return COLORS[index];
    }
    // Generate a random color if we exceed the predefined COLORS
    return generateRandomColor();
  };

  return (
    <Box sx={{ marginBottom: 4 }}>
      <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: "bold" }}>
        {questionTitle}
      </Typography>
      <PieChart width={300} height={300}>
        <Pie
          data={chartData}
          cx="50%"
          cy="50%"
          outerRadius={120}
          innerRadius={80}
          dataKey="count"
          nameKey="answer"
          label={false}
          labelLine={false}
        >
          {chartData.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={getColor(index)} />
          ))}
        </Pie>
        <Tooltip content={<CustomTooltip />} />
      </PieChart>

      {/* Display the legend below the pie chart */}
      {questionTitle.toLowerCase() !== "school name" && (
        <Box sx={{ display: "flex", justifyContent: "center", marginTop: 2 }}>
          {chartData.map((entry, index) => (
            <Box
              key={index}
              sx={{ display: "flex", alignItems: "center", marginRight: 2 }}
            >
              <Box
                sx={{
                  width: "20px",
                  height: "20px",
                  backgroundColor: getColor(index),
                  marginRight: "8px",
                }}
              />
              <Typography variant="body2">{entry.answer}</Typography>
            </Box>
          ))}
        </Box>
      )}

      {/* Display sentiment feedback list if sentiment data exists */}
      {Object.keys(sentimentCounts).length > 0 && (
        <>
          {Object.keys(sentimentCounts).map((sentiment) => {
            // Only show sentiment if there is data for it
            if (sentimentCounts[sentiment].count > 0) {
              return (
                <Box key={sentiment} sx={{ marginBottom: 2 }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: "bold" }}>
                    {sentiment} Feedback ({sentimentCounts[sentiment].count})
                  </Typography>
                  <ul>
                    {sentimentCounts[sentiment].feedback.map(
                      (feedback, index) => (
                        <li key={index}>{feedback}</li>
                      )
                    )}
                  </ul>
                </Box>
              );
            }
            return null;
          })}
        </>
      )}
      {Object.keys(nonSentimentCounts).length > 0 && (
        <Box sx={{ marginBottom: 2 }}>
          {questionTitle.toLowerCase() === "school name" ? (
            <table className="pie-table">
              <thead>
                <tr>
                  <th>school name</th>
                  <th>Count</th>
                </tr>
              </thead>
              {Object.entries(nonSentimentCounts).map(
                ([answer, count], index) => (
                  <tr key={index}>
                    <td>{answer}</td>
                    <td>{count}</td>
                  </tr>
                )
              )}
            </table>
          ) : null}
        </Box>
      )}
    </Box>
  );
};

export default QuestionPieChart;
