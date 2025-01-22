import React, { useState, useRef } from "react";
import * as XLSX from "xlsx";
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Button } from "@mui/material";
import axios from "axios";
import "./../style/UploadExcel.css";

const UploadExcelWithSentiment = () => {
  const [fileData, setFileData] = useState([]);
  const [dayCount, setDayCount] = useState("");
  const [analyzedData, setAnalyzedData] = useState([]);
  const fileInputRef = useRef(null);

  const handleDayCountChange = (e) => {
    setDayCount(e.target.value);
  };

  const ratingMap = {
    1: "Poorly",
    2: "Somewhat Poorly",
    3: "Moderately",
    4: "Effectively",
    5: "Very Effectively",
  };

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
        setFileData(jsonData);
        setAnalyzedData([]);
      };
      reader.readAsBinaryString(file);
    }
  };

  const performSentimentAnalysis = async (text) => {
    if (!text || text.trim() === "" || ["Yes", "No", "N/A"].includes(text.trim())) {
      return null;
    }
    const score = text.length % 3;
    return score === 0 ? "Negative" : score === 1 ? "Neutral" : "Positive";
  };

  const convertRatingToText = (rating) => {
    const numericRating = Number(rating);
    return ratingMap[numericRating] || rating;
  };

  const detectTextColumns = (data) => {
    const textColumns = [];
    const header = data[0];
    for (let colIndex = 1; colIndex < header.length; colIndex++) {
      const isTextColumn = data.slice(1).some(row => typeof row[colIndex] === "string");
      if (isTextColumn) {
        textColumns.push(colIndex);
      }
    }
    return textColumns;
  };

  const handlePerformAnalysis = async () => {
    if (fileData.length === 0) {
      alert("Please upload a file first.");
      return;
    }

    const headers = [...fileData[0], "Sentiment"];
    const rows = fileData.slice(1);

    const textColumns = detectTextColumns(fileData);

    const updatedRows = await Promise.all(
      rows.map(async (row) => {
        const updatedRow = [...row];
        for (let colIndex of textColumns) {
          const text = updatedRow[colIndex] || "";
          const sentiment = await performSentimentAnalysis(text);
          if (sentiment) {
            updatedRow[colIndex] = sentiment;
          }
        }

        updatedRow.forEach((cell, index) => {
          if (index !== 0) {
            updatedRow[index] = convertRatingToText(cell);
          }
        });

        return updatedRow;
      })
    );

    const filteredRows = updatedRows.filter((row) =>
      row.some((cell) => cell !== undefined && cell !== "undefined")
    );

    setAnalyzedData([headers, ...filteredRows]);
  };

  const mapRatingsInData = (data) => {
    return data.map((row) =>
      row.map((cell) => {
        const numericCell = Number(cell);
        return ratingMap[numericCell] || cell;
      })
    );
  };

  const handleSaveToJSON = async () => {
    if (analyzedData.length === 0) {
      alert("No analyzed data to save.");
      return;
    }
    if (!dayCount) {
      alert("Please enter a Day Count.");
      return;
    }

    // Use the analyzedData (which already contains the transformed data)
    const headers = analyzedData[0]; // Header row
    const rows = analyzedData.slice(1); // Data rows

    const formattedData = {
      dayCount: {
        [dayCount]: rows.map((row, rowIndex) => {
          const entry = { id: `${rowIndex}` };
          headers.forEach((key, index) => {
            entry[key] = row[index] || null;
          });
          return entry;
        }),
      },
    };

    try {
      await axios.post("http://localhost:3002/fileData", formattedData);
      alert("Analyzed data saved successfully!");
      if (fileInputRef.current) fileInputRef.current.value = "";
      setFileData([]);
      setAnalyzedData([]); // Reset analyzed data after saving
      setDayCount("");
    } catch (error) {
      console.error("Error saving data:", error);
      alert("Failed to save data.");
    }
  };

  // const handleSaveToJSON = async () => {
  //   if (fileData.length === 0) {
  //     alert("No file data to save.");
  //     return;
  //   }
  //   if (!dayCount) {
  //     alert("Please enter a Day Count.");
  //     return;
  //   }

  //   // Map the ratings before processing the data
  //   const headers = fileData[0]; // Header row
  //   const rows = mapRatingsInData(fileData.slice(1)); // Apply transformation to data rows

  //   const formattedData = {
  //     dayCount: {
  //       [dayCount]: rows.map((row, rowIndex) => {
  //         const entry = { id: `${rowIndex}` };
  //         headers.forEach((key, index) => {
  //           entry[key] = row[index] || null;
  //         });
  //         return entry;
  //       }),
  //     },
  //   };

  //   try {
  //     await axios.post("http://localhost:3002/fileData", formattedData);
  //     alert("File data saved successfully!");
  //     if (fileInputRef.current) fileInputRef.current.value = "";
  //     setFileData([]);
  //     setDayCount("");
  //   } catch (error) {
  //     console.error("Error saving data:", error);
  //     alert("Failed to save data.");
  //   }
  // };

  return (
    <div className="upload-excel-container">
      <div
        className="upload-excel-wrapper"
        style={{
          width: fileInputRef ? "700px" : "300px",
          height: fileInputRef ? "600px" : "300px",
        }}
      >
        <div style={{ marginBottom: "20px", textAlign: "right" }}>
          <Button variant="contained" components="a" href="/view-chart">View Chart</Button>
        </div>
        <div className="from-control">
          <label>
            Enter the day of excel <span>*</span>
          </label>
          <input
            type="number"
            placeholder="Enter the day"
            value={dayCount}
            onChange={handleDayCountChange}
            required
          />
        </div>
        <div className="form-control">
          <label>Upload Excel File:</label>
          <input
            type="file"
            accept=".csv, .xlsx, .xls"
            onChange={handleFileChange}
            ref={fileInputRef}
          />
        </div>

        <Button
          variant="contained"
          color="primary"
          onClick={handlePerformAnalysis}
          disabled={fileData.length === 0}
        >
          Perform Sentiment Analysis
        </Button>

        <Button
          variant="contained"
          color="secondary"
          onClick={handleSaveToJSON}
          disabled={analyzedData.length === 0}
        >
          Save as JSON
        </Button>

        {analyzedData.length > 0 && (
          <TableContainer component={Paper} sx={{ marginTop: 2 }}>
            <Table>
              <TableHead>
                <TableRow>
                  {analyzedData[0].map((header, index) => (
                    <TableCell key={index}>{header}</TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {analyzedData.slice(1).map((row, rowIndex) => (
                  <TableRow key={rowIndex}>
                    {row.map((cell, cellIndex) => (
                      <TableCell key={cellIndex}>{cell}</TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </div>
    </div>
  );
};

export default UploadExcelWithSentiment;
