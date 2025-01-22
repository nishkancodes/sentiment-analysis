import React, { useState, useRef } from "react";
import * as XLSX from "xlsx";
import axios from "axios";
import {
  Box,
  Card,
  CardContent,
  Button,
  Typography,
  TextField,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Grid,
  Divider,
} from "@mui/material";
import { CloudUpload } from "@mui/icons-material";

const ratingMap = {
  1: "Poorly",
  2: "Somewhat Poorly",
  3: "Moderately",
  4: "Effectively",
  5: "Very Effectively",
};

const FileUploader = () => {
  const [fileData, setFileData] = useState([]);
  const [dayCount, setDayCount] = useState("");
  const fileInputRef = useRef(null);

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
      };
      reader.readAsBinaryString(file);
    }
  };

  const mapRatingsInData = (data) => {
    return data.map((row) => {
      return row.map((cell) => {
        if (typeof cell === "number") {
          console.log(`Mapping value: ${cell} to ${ratingMap[cell] || cell}`);
          return ratingMap[cell] || cell; // Map number to description or leave as is if no match
        }
        return cell; // Keep non-numeric data as it is
      });
    });
  };

  const handleDayCountChange = (e) => {
    setDayCount(e.target.value);
  };

  const handleSaveToJSON = async () => {
    if (fileData.length === 0) {
      alert("No file data to save.");
      return;
    }
    if (!dayCount) {
      alert("Please enter a Day Count.");
      return;
    }

    const headers = fileData[0]; // Header row
    const rows = mapRatingsInData(fileData.slice(1)); // Data rows mapped to ratings
    console.log("Mapped rows:", rows); // Debug log to see the transformed rows

    const formattedData = {
      id: "0334", // This can be dynamically set or passed
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

    // try {
    //   await axios.post("http://localhost:3002/fileData", formattedData, {
    //     headers: { "Content-Type": "application/json" },
    //   });
    //   alert("File data saved successfully!");
    //   if (fileInputRef.current) fileInputRef.current.value = "";
    //   setFileData([]);
    //   setDayCount("");
    // } catch (error) {
    //   console.error("Error saving data:", error);
    //   alert("Failed to save data.");
    // }
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

  //   const headers = fileData[0]; // Header row
  //   const rows = mapRatingsInData(fileData.slice(1)); // Data rows mapped to ratings

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
  //     await axios.post("http://localhost:3002/fileData", formattedData, {
  //       headers: { "Content-Type": "application/json" },
  //     });
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
    <Box sx={{ maxWidth: 800, margin: "auto", padding: 3 }}>
      <Card elevation={4}>
        <CardContent>
          <Typography variant="h5" gutterBottom>
            Upload and Manage File Data
          </Typography>

          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} sm={6}>
              <Button
                variant="contained"
                component="label"
                startIcon={<CloudUpload />}
                fullWidth
              >
                Upload File
                <input
                  type="file"
                  accept=".csv, .xlsx, .xls"
                  hidden
                  onChange={handleFileChange}
                  ref={fileInputRef}
                />
              </Button>
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                label="Day Count"
                type="number"
                value={dayCount}
                onChange={handleDayCountChange}
                fullWidth
              />
            </Grid>
          </Grid>

          <Divider sx={{ marginY: 2 }} />

          {fileData.length > 0 && (
            <>
              <Typography variant="h6">File Preview</Typography>
              <TableContainer component={Paper} sx={{ marginTop: 2 }}>
                <Table>
                  <TableHead>
                    <TableRow>
                      {fileData[0].map((header, index) => (
                        <TableCell key={index}>{header}</TableCell>
                      ))}
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {mapRatingsInData(fileData.slice(1)).map(
                      (row, rowIndex) => (
                        <TableRow key={rowIndex}>
                          {row.map((cell, cellIndex) => (
                            <TableCell key={cellIndex}>{cell}</TableCell>
                          ))}
                        </TableRow>
                      )
                    )}
                  </TableBody>
                </Table>
              </TableContainer>

              <Button
                variant="contained"
                color="primary"
                onClick={handleSaveToJSON}
                sx={{ marginTop: 2 }}
              >
                Save to JSON
              </Button>
            </>
          )}
        </CardContent>
      </Card>
    </Box>
  );
};

export default FileUploader;
