const mysql = require("mysql");
const fs = require("fs");
const targetFolder = "./convertedTables";

const con = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "",
  database: "",
});

con.connect((err) => {
  if (err) throw err;
  console.log("Connected");
  getTableNames();
});

const getTableNames = () => {
  if (!fs.existsSync(targetFolder)) fs.mkdirSync(targetFolder);
  con.query("SELECT table_name FROM information_schema.tables", async (
    err,
    result,
    fields
  ) => {
    if (err) throw err;
    for (let i = 0; i < result.length; i++) {
      const numTable = await getTableData(result[i]);
      const isLast = Boolean(i === result.length - 1);
      mkFileFromObj(numTable, result[i].table_name, isLast);
    }
  });
};

const getTableData = (data) => {
  const req = "SELECT * FROM " + data.table_name;
  const tableData = new Promise((resolve) => {
    con.query(req, (err, result, fields) => {
      resolve(result);
    });
  });
  return tableData;
};

const mkFileFromObj = (tableData, tableName, isLast) => {
  if (isLast && tableData === undefined) {con.end(); return;}
  fs.appendFile(
    `./${targetFolder}/${tableName}.json`,
    JSON.stringify(tableData, null, 4),
    (err) => {
      if (err) throw err;
      console.log(`Saved ${tableName}`);
      if (isLast) con.end();
    }
  );
}
