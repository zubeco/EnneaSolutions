import { useState } from "react";
import {
  Box,
  Input,
  Table,
  TableContainer,
  Tbody,
  Td,
  Text,
  Th,
  Thead,
  Tr,
} from "@chakra-ui/react";
import "./App.css";
import ReactPaginate from "react-paginate";

function App() {
  const [csv, setCsv] = useState([{ name: "" }]);
  const [q, setQ] = useState("");
  const [searchParam] = useState(["name"]);
  const [pageNumber, setPageNumber] = useState(0);
  const [aggregatedData, setAggregatedData] = useState([{ name: "" }]);
  const usersPerPage = 10;
  const pagesVisited = pageNumber * usersPerPage;

  //PARSING THE CSV DATA FILE
  const reader = new FileReader();
  function read(input) {
    const csv = input[0];
    reader.readAsText(csv);
    reader.onload = function (e) {
      let csvText = e.target.result;
      const array = csvText.toString().split("\n");
      let csvToJsonResult = [];
      let headers = array[0].split(", ");
      headers = headers[0];
      let headerArray = headers.split(",");
      for (let i = 1; i < array.length - 1; i++) {
        let data = array[i].split(",");
        let dataMap = {};
        for (let i = 0; i < data.length - 1; i++) {
          let value = data[i];
          value.replace("'/'", " ");
          value = value.slice(1, value.length - 1);
          let key = headerArray[i];
          key = key.slice(1, key.length - 1);
          dataMap[key] = value;
        }
        csvToJsonResult.push(dataMap);
      }

      setCsv(csvToJsonResult);
      let copy = JSON.parse(JSON.stringify(csvToJsonResult));
      let aggregatedResult = aggregateData(copy);
      setAggregatedData(aggregatedResult);

      return csvToJsonResult;
    };
  }

  //AGGREGATED FUNCTION
  function aggregateData(jsonData) {
    let jsonResult = [];
    let aggregatedData = {};
    jsonData.forEach((product) => {
      let productName = product["name"];
      if (aggregatedData[productName] !== undefined) {
        let normalizedStock = product["stock"];
        normalizedStock = parseInt(normalizedStock);
        aggregatedData[productName]["stock"] =
          normalizedStock + aggregatedData[productName]["stock"];
        aggregatedData[productName]["mrp"] =
          product["mrp"] > aggregatedData[productName]["mrp"]
            ? product["mrp"]
            : aggregatedData[productName]["mrp"];

        aggregatedData[productName]["rate"] =
          product["rate"] > aggregatedData[productName]["rate"]
            ? product["rate"]
            : aggregatedData[productName]["rate"];

        let normalizedExp = new Date(product["exp"]);

        aggregatedData[productName]["exp"] =
          normalizedExp.getTime() < aggregatedData[productName]["exp"].getTime()
            ? normalizedExp
            : aggregatedData[productName]["exp"];
      } else {
        //normalize values
        let normalizedExp = new Date(product["exp"]);
        product["stock"] = parseInt(product["stock"]);
        product["mrp"] = parseInt(product["mrp"]);
        product["rate"] = parseInt(product["rate"]);
        product["exp"] = normalizedExp;
        aggregatedData[product["name"]] = product;
      }
    });
    Object.entries(aggregatedData).forEach(([key, value]) => {
      jsonResult.push(value);
    });
    return jsonResult;
  }

  //SEARCH FILTER FUNCTION
  const searched = (users) => {
    return users.filter((item) => {
      return searchParam.some((newItem) => {
        return (
          item[newItem]?.toString().toLowerCase().indexOf(q.toLowerCase()) > -1
        );
      });
    });
  };

  const uniqueData = [...new Set(csv)];

  //PAGINATION FUNCTION
  const displayCsv = searched(uniqueData)
    .slice(pagesVisited, pagesVisited + usersPerPage)
    .map((each, index) => {
      return (
        <Tbody key={index}>
          <Tr>
            <Td>{each?.name}</Td>
            <Td>{each?.batch}</Td>
            <Td>{each?.stock}</Td>
            <Td>{each?.deal}</Td>
            <Td>{each?.free}</Td>
            <Td>{each?.mrp}</Td>
            <Td>{each?.rate}</Td>
            <Td>{each?.exp?.toString()}</Td>
          </Tr>
        </Tbody>
      );
    });

  const displayAggregatedData = aggregatedData
    .slice(pagesVisited, pagesVisited + usersPerPage)
    .map((each, index) => {
      return (
        <Tbody key={index}>
          <Tr>
            <Td>{each?.name}</Td>
            <Td>{each?.batch}</Td>
            <Td>{each?.stock}</Td>
            <Td>{each?.deal}</Td>
            <Td>{each?.free}</Td>
            <Td>{each?.mrp}</Td>
            <Td>{each?.rate}</Td>
            <Td>{each?.exp?.toLocaleDateString()}</Td>
          </Tr>
        </Tbody>
      );
    });

  const pageCount = Math.ceil(csv.length / usersPerPage);
  const changePage = ({ selected }) => {
    setPageNumber(selected);
  };

  return (
    <Box
      bg="#F5F5F5"
      width="100%"
      minHeight="120vh"
      display="flex"
      justifyContent="center"
      alignItems="center"
      flexDirection="column"
      paddingBottom="40px"
    >
      <Box
        height="20px"
        borderRadius="8px"
        display="flex"
        alignItems="center"
        justifyContent="center"
        marginTop="50px"
      >
        <input
          type="file"
          id="file"
          name="filename"
          onChange={(e) => read(e.target.files)}
        />
        <label className="label" htmlFor="file">
          Upload CSV File
        </label>
      </Box>
      <Box
        height="100px"
        mb="10px"
        borderRadius="8px"
        display="flex"
        alignItems="center"
        justifyContent="center"
      >
        <Input
          type="text"
          placeholder="Search by name"
          onChange={(e) => setQ(e.target.value)}
        />
      </Box>

      <Box>
        <Box
          width="1200px"
          minHeight="50vh"
          bg="#FFFFFF"
          borderRadius="8px"
          padding="20px"
          marginBottom="50px"
        >
          <TableContainer>
            <Table variant="simple">
              <Thead>
                <Tr>
                  <Th>Name</Th>
                  <Th>Batch</Th>
                  <Th>Stock</Th>
                  <Th>Deal</Th>
                  <Th>Free</Th>
                  <Th>MRP</Th>
                  <Th>Rate</Th>
                  <Th>EXP</Th>
                </Tr>
              </Thead>
              {displayCsv}
            </Table>
          </TableContainer>
        </Box>

        <ReactPaginate
          previousLabel={"Previous"}
          nextLabel={"Next"}
          pageCount={pageCount}
          onPageChange={changePage}
          containerClassName={"paginationBttns"}
          previousLinkClassName={"previousBttn"}
          nextLinkClassName={"nextBttn"}
          disabledClassName={"paginationDisabled"}
          activeClassName={"paginationActive"}
        />
      </Box>

      <Box>
        <Text
          textAlign="center"
          fontWeight={700}
          fontSize="30px"
          padding="30px 0"
        >
          AGGREGATED DATA
        </Text>
        <Box
          width="1200px"
          minHeight="50vh"
          bg="#FFFFFF"
          borderRadius="8px"
          padding="20px"
          marginBottom="50px"
          marginTop="30px"
        >
          <TableContainer>
            <Table variant="simple">
              <Thead>
                <Tr>
                  <Th>Name</Th>
                  <Th>Batch</Th>
                  <Th>Stock</Th>
                  <Th>Deal</Th>
                  <Th>Free</Th>
                  <Th>MRP</Th>
                  <Th>Rate</Th>
                  <Th>EXP</Th>
                </Tr>
              </Thead>
              {displayAggregatedData}
            </Table>
          </TableContainer>
        </Box>
      </Box>
    </Box>
  );
}

export default App;
