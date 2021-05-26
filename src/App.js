import React from "react";
import XLSX from "xlsx";
import Button from "@material-ui/core/Button";
import { red } from "@material-ui/core/colors";

import "./App.css";

function App() {
  const [data, setData] = React.useState([]);
  const [cols, setCols] = React.useState([]);

  const handleFile = (file) => {
    const reader = new FileReader();
    const rABS = !!reader.readAsBinaryString;
    reader.onload = (e) => {
      /* Parse data */
      const bstr = e.target.result;
      const wb = XLSX.read(bstr, { type: rABS ? "binary" : "array" });
      /* Get first worksheet */
      const wsname = wb.SheetNames[0];
      const ws = wb.Sheets[wsname];
      /* Convert array of arrays */
      const data = XLSX.utils.sheet_to_json(ws, { header: 1 });
      console.log(data);
      /* Update state */
      setData(data);
      setCols(make_cols(ws["!ref"]));
    };
    if (rABS) reader.readAsBinaryString(file);
    else reader.readAsArrayBuffer(file);
  };

  return (
    <DragDropFile className="App" handleFile={handleFile}>
      <div className="row">
        <div className="col-xs-12">
          <DataInput handleFile={handleFile} />
        </div>
      </div>
      <div className="row">
        <div className="col-xs-12">
          <OutTable data={data} cols={cols} />
        </div>
      </div>
    </DragDropFile>
  );
}

export default App;

/* -------------------------------------------------------------------------- */

function DragDropFile({ handleFile, children }) {
  const suppress = (e) => {
    e.stopPropagation();
    e.preventDefault();
  };
  const handleDrop = (e) => {
    e.stopPropagation();
    e.preventDefault();
    const files = e.dataTransfer.files;
    if (files && files[0]) handleFile(files[0]);
  };

  return (
    <div onDrop={handleDrop} onDragEnter={suppress} onDragOver={suppress}>
      {children}
    </div>
  );
}

function DataInput({ handleFile }) {
  const handleChange = (e) => {
    const files = e.target.files;
    if (files && files[0]) handleFile(files[0]);
  };

  return (
    <div className="form-group">
      <h1 className="title">Accept or Reject</h1>
      <label className="label">Choose a spreadsheet file</label>
      <br />
      <br />
      <input
        type="file"
        className="upload"
        accept={SheetJSFT}
        onChange={handleChange}
      />
    </div>
  );
}

function OutTable({ data, cols }) {
  const res = {
    none: data,
    accepted: [],
    rejected: [],
  };

  const handleAccept = (i) => {
    var action = "approved";
    console.log({ ...data[i], action });
    // setData({ ...data[i], action });
  };

  const handleReject = (i) => {
    var action = "rejected";
    var remark = prompt("Give remark for the rejection");
    console.log({ ...data[i], action, remark });
    // setData({ ...data[i], action, remark });
  };

  const handleCheckBox = (i) => {
    var action = "approved";
  };

  return (
    <div className="table-group">
      <table id="table">
        <thead>
          <tr>
            {cols.map((c) => (
              <th key={c.key}>{c.name}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {/* <input type="checkbox" onClick={() => handleCheckBox()} /> */}
          {data.map((r, i) => (
            <tr key={i}>
              {cols.map((c) => (
                <td key={c.key}>{r[c.key]}</td>
              ))}
              <div className="actions">
                <Button
                  variant="outlined"
                  color="primary"
                  className="btn"
                  onClick={() => handleAccept(i)}
                >
                  Accept
                </Button>
                <Button
                  variant="outlined"
                  color="secondary"
                  className="btn"
                  onClick={() => handleReject(i)}
                >
                  Reject
                </Button>
              </div>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

const SheetJSFT = ["xlsx", "xlsb", "xlsm", "xls", "xml", "csv"]
  .map((x) => `.${x}`)
  .join(",");

const make_cols = (refstr) => {
  let o = [],
    C = XLSX.utils.decode_range(refstr).e.c + 1;
  for (var i = 0; i < C; ++i) o[i] = { name: XLSX.utils.encode_col(i), key: i };
  return o;
};
