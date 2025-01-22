import React from 'react';
import { PieChart, Pie, Cell, Legend, Tooltip, ResponsiveContainer } from 'recharts';
import { Box, Card, CardContent, Typography, Grid } from '@mui/material';

// Helper function to aggregate the answers into a format for pie chart
const aggregateData = (data, question) => {
  const counts = {};

  data.forEach((entry) => {
    const answer = entry[question]?.toString() || 'No Answer'; // Convert to string for display
    counts[answer] = (counts[answer] || 0) + 1;
  });

  // Prepare data for the pie chart
  return Object.keys(counts).map((key) => ({
    name: key,
    value: counts[key],
  }));
};

// Main component
const PieCharts = ({ fileData }) => {
  if (!fileData || fileData.length === 0) {
    return <Typography>No Data Available</Typography>;
  }

  const questions = Object.keys(fileData[0]).filter(
    (key) => key !== 'DayCount' && key !== 'Timestamp'
  );

  return (
    <Box sx={{ padding: 2 }}>
      {questions.map((question, index) => {
        const chartData = aggregateData(fileData, question);

        return (
          <Card key={index} sx={{ marginBottom: 2 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                {question}
              </Typography>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={chartData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={120}
                    fill="#8884d8"
                    label={({ name, value }) => `${name}: ${value}`}
                  >
                    {chartData.map((entry, idx) => (
                      <Cell key={`cell-${idx}`} fill={idx % 2 === 0 ? '#0088FE' : '#00C49F'} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        );
      })}
    </Box>
  );
};

export default PieCharts;
