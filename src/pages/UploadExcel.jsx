import React, { useState, useRef } from "react";
import * as XLSX from "xlsx";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  TextField,
  Box,
  Container,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import axios from "axios";
import CustomBreadcrumb from "../components/CustomBreadcrumb";

const UploadExcelWithSentiment = () => {
  const [fileData, setFileData] = useState([]);
  const [processedColumns, setProcessedColumns] = useState([]);
  const [ratingAppliedColumns, setRatingAppliedColumns] = useState([]);
  const [day, setDay] = useState("");
  const fileInputRef = useRef(null);

  const ratingMap = {
    1: "Poorly",
    2: "Somewhat Poorly",
    3: "Moderately",
    4: "Effectively",
    5: "Very Effectively",
  };

  const StyledTableContainer = styled(TableContainer)(({ theme }) => ({
    marginTop: theme.spacing(3),
    borderRadius: theme.shape.borderRadius,
    boxShadow: theme.shadows[4],
  }));

  const StyledTableCell = styled(TableCell)(({ theme }) => ({
    backgroundColor: theme.palette.grey[200],
    fontWeight: "bold",
    textAlign: "center",
    whiteSpace: "nowrap", // Prevents text from wrapping
    overflow: "hidden",   // Ensures content doesn't overflow the cell
    textOverflow: "ellipsis", // Adds ellipsis when text overflows
  }));

  const StyledTableRow = styled(TableRow)(({ theme }) => ({
    "&:nth-of-type(odd)": {
      backgroundColor: theme.palette.action.hover,
    },
    "&:hover": {
      backgroundColor: theme.palette.action.selected,
    },
  }));

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const data = e.target.result;
        const workbook = XLSX.read(data, { type: "binary" });
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(sheet, { header: 1 });

        const processedData = jsonData.map((row, rowIndex) =>
          row.map((cell) =>
            rowIndex > 0 && !isNaN(cell) && ratingMap[cell] ? ratingMap[cell] : cell
          )
        );

        setFileData(processedData);

        if (jsonData.length > 0) {
          const numericColumns = jsonData[0].map((_, colIndex) =>
            jsonData.some((row, rowIndex) => rowIndex > 0 && !isNaN(row[colIndex]))
          );
          const ratingColumns = numericColumns
            .map((isNumeric, colIndex) => (isNumeric ? colIndex : -1))
            .filter((colIndex) => colIndex !== -1);
          setRatingAppliedColumns(ratingColumns);
        }

        setProcessedColumns([]);
      };
      reader.readAsBinaryString(file);
    }
  };

  const applySentimentToColumn = (colIndex) => {
    const updatedData = fileData.map((row, rowIndex) => {
      if (rowIndex === 0) return row; // Skip header row

      const cellValue = row[colIndex];
      if (cellValue === undefined || cellValue === null) return row;

      const sentiment = performSentimentAnalysis(cellValue);

      // Store both the text and sentiment in an object
      row[colIndex] = {
        text: cellValue,
        sentiment: sentiment,
      };
      return row;
    });

    setFileData(updatedData);
    setProcessedColumns((prev) => [...prev, colIndex]);
  };


  const performSentimentAnalysis = (text) => {
    if (!text || text.trim() === "" || ["Yes", "No", "N/A"].includes(text.trim())) {
      return "Neutral";
    }
    const score = text.length % 3;
    return score === 0 ? "Negative" : score === 1 ? "Neutral" : "Positive";
  };

  // Function to save data in db.json (JSON Server)
  // const saveDataToJsonServer = async () => {
  //   try {
  //     // Transform the file data into an object format with headers as keys
  //     const transformedData = fileData.slice(1).map((row) => {
  //       return row.reduce((acc, cell, index) => {
  //         const header = fileData[0][index]; // Get the column header
  //         if (typeof cell === 'object' && cell.text && cell.sentiment) {
  //           // For columns with sentiment analysis applied, store as an object
  //           acc[header] = { text: cell.text, sentiment: cell.sentiment };
  //         } else {
  //           // For regular columns, store only the text
  //           acc[header] = cell;
  //         }
  //         return acc;
  //       }, {});
  //     });

  //     // Send the transformed data to the JSON server
  //     const response = await axios.post("http://localhost:3002/data", {
  //       day,
  //       data: transformedData,
  //     });

  //     if (response.status === 201) {
  //       alert("Data saved successfully!");
  //     }
  //   } catch (error) {
  //     console.error("Error saving data:", error);
  //     alert("Error saving data. Please try again.");
  //   }
  // };

  const saveDataToJsonServer = () => {
    try {
      // Transform the data as needed
      const transformedData = fileData.slice(1).map((row) => {
        return row.reduce((acc, cell, index) => {
          const header = fileData[0][index];
          if (typeof cell === "object" && cell.text && cell.sentiment) {
            acc[header] = { text: cell.text, sentiment: cell.sentiment };
          } else {
            acc[header] = cell;
          }
          return acc;
        }, {});
      });
      const rawData = localStorage.getItem("uploadedData");
      // Check if there is existing data in localStorage
      let existingData = []; // Default to an empty array

      // Parse raw data if it exists
      if (rawData) {
        existingData = JSON.parse(rawData);

        // Ensure existingData is an array
        if (!Array.isArray(existingData)) {
          throw new Error("Existing data is not an array.");
        }
      }

      // Combine the new data with existing data
      const combinedData = [...existingData, { day, data: transformedData }];

      // Store the combined data in localStorage
      localStorage.setItem("uploadedData", JSON.stringify(combinedData));

      alert("Data saved locally!");
      window.location.reload();
    } catch (error) {
      console.error("Error saving data locally:", error);
      alert("Error saving data locally. Please try again.");
    }
  };


  return (
    <Container maxWidth="lg">
      <CustomBreadcrumb currentPage="Upload and Analyze Data" />
      {/* <Typography variant="h5" gutterBottom>
        Upload and Analyze Data
      </Typography>
      <Button
        variant="contained"
        component={Link}
        to={"/view-chart"}
      >
        View Chart
      </Button> */}
      <Box display="flex" alignItems="center" marginBottom="20px">
        <TextField
          label="Day"
          variant="outlined"
          value={day}
          onChange={(e) => setDay(e.target.value)}
          style={{ marginRight: "20px", width: "200px" }}
        />
        <input
          type="file"
          accept=".csv, .xlsx, .xls"
          onChange={handleFileChange}
          ref={fileInputRef}
          style={{
            padding: "8px",
            border: "1px solid #ccc",
            borderRadius: "4px",
          }}
        />
      </Box>

      {fileData.length > 0 && (
        <StyledTableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                {fileData[0].map((header, index) => (
                  <StyledTableCell key={index} style={{ maxWidth: "200px" }}>
                    {header}
                  </StyledTableCell>
                ))}
              </TableRow>
              <TableRow>
                {fileData[0].map((_, index) => (
                  <TableCell key={index} align="center" style={{ paddingTop: "0px", paddingBottom: "0px" }}>
                    {!processedColumns.includes(index) && (
                      // !ratingAppliedColumns.includes(index) && (
                      <Button
                        variant="contained"
                        size="small"
                        color="primary"
                        onClick={() => applySentimentToColumn(index)}
                      >
                        Apply Sentiment
                      </Button>
                    )}
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {fileData.slice(1).map((row, rowIndex) => (
                <StyledTableRow key={rowIndex}>
                  {row.map((cell, cellIndex) => {
                    const header = fileData[0][cellIndex]; // Get the column header
                    return (
                      <TableCell key={cellIndex} align="center" style={{ maxWidth: "200px" }}>
                        {typeof cell === "object" && cell.text && cell.sentiment ? (
                          // If the cell is an object (has both text and sentiment), display both
                          <>
                            <div>{cell.text}</div>
                            <div style={{ fontSize: "0.9rem", color: "#666" }}>
                              Sentiment: {cell.sentiment}
                            </div>
                          </>
                        ) : (
                          // Otherwise, just display the cell's text value
                          cell
                        )}
                      </TableCell>
                    );
                  })}
                </StyledTableRow>
              ))}
            </TableBody>
          </Table>
        </StyledTableContainer>
      )}

      <Box marginTop="20px">
        <Button variant="contained" color="secondary" onClick={saveDataToJsonServer}>
          Save Data
        </Button>
      </Box>
    </Container>
  );
};

export default UploadExcelWithSentiment;
